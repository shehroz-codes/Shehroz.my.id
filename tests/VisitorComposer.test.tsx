import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Backend } from '../src/sections/components/contact/types';

const captcha = vi.hoisted(() => ({ reset: vi.fn() }));
vi.mock('../src/sections/components/contact/config', async (original) => ({
  ...await original<typeof import('../src/sections/components/contact/config')>(), turnstileSiteKey: 'test-site-key',
}));
vi.mock('@marsidev/react-turnstile', async () => {
  const { useImperativeHandle } = await import('react');
  return { Turnstile: ({ ref, onSuccess, onExpire, onError }: {
    ref: import('react').Ref<unknown>; onSuccess: (token: string) => void; onExpire: () => void; onError: () => void;
  }) => {
    useImperativeHandle(ref, () => ({ reset: captcha.reset }));
    return <div><button type="button" onClick={() => onSuccess('fresh-token')}>Verify</button>
      <button type="button" onClick={onExpire}>Expire</button><button type="button" onClick={onError}>CAPTCHA error</button></div>;
  } };
});
import VisitorComposer from '../src/sections/components/contact/VisitorComposer';
function backend(): Backend {
  return { mode: 'live', requiresCaptcha: true, submissionsEnabled: true, photosEnabled: false,
    subscribe: () => () => {}, submitPublic: vi.fn().mockResolvedValue({ status: 'published', cooldownUntil: Date.now() + 600_000 }),
    submitPrivate: vi.fn(), detectCountry: async () => ({ code: null, name: null }) };
}
afterEach(() => { cleanup(); vi.clearAllMocks(); localStorage.clear(); });
it('requires verification, handles expiry/errors, resets after attempts and preserves failed drafts', async () => {
  const b = backend(); vi.mocked(b.submitPublic).mockRejectedValue(new Error('Security verification failed'));
  render(<VisitorComposer backend={b} remaining={0} cooldownLabel="" />);
  const post = screen.getByRole('button', { name: 'Post Message' }) as HTMLButtonElement;
  expect(post.disabled).toBe(true);
  fireEvent.change(screen.getByRole('textbox', { name: 'Your name' }), { target: { value: 'Visitor' } });
  fireEvent.change(screen.getByLabelText(/Your message/), { target: { value: 'Hello there' } });
  fireEvent.click(screen.getByText('Verify')); expect(post.disabled).toBe(false);
  fireEvent.click(screen.getByText('Expire')); expect(post.disabled).toBe(true);
  fireEvent.click(screen.getByText('Verify')); fireEvent.click(screen.getByText('CAPTCHA error')); expect(post.disabled).toBe(true);
  fireEvent.click(screen.getByText('Verify')); fireEvent.click(post);
  await waitFor(() => expect(screen.getByText('Security verification failed')).toBeTruthy());
  expect(captcha.reset).toHaveBeenCalledTimes(2);
  expect((screen.getByLabelText(/Your message/) as HTMLTextAreaElement).value).toBe('Hello there');
  expect(post.disabled).toBe(true);
  expect(b.submitPublic).toHaveBeenCalledWith(expect.objectContaining({ turnstileToken: 'fresh-token' }));
});
it('leaves submissions and photos disabled at the safety gate', () => {
  render(<VisitorComposer backend={{ ...backend(), submissionsEnabled: false }} remaining={0} cooldownLabel="" />);
  expect((screen.getByRole('button', { name: 'Post Message' }) as HTMLButtonElement).disabled).toBe(true);
  expect(screen.queryByText('Verify')).toBeNull(); expect(screen.getByText('Public submissions are not enabled yet.')).toBeTruthy();
  expect((screen.getByRole('button', { name: 'Choose photo' }) as HTMLButtonElement).disabled).toBe(true);
});
it('preview accepts an 80-character name without requiring CAPTCHA', async () => {
  const b = { ...backend(), mode: 'preview' as const, requiresCaptcha: false, photosEnabled: true };
  render(<VisitorComposer backend={b} remaining={0} cooldownLabel="" />);
  fireEvent.change(screen.getByRole('textbox', { name: 'Your name' }), { target: { value: 'a'.repeat(80) } });
  fireEvent.change(screen.getByLabelText(/Your message/), { target: { value: 'Hello there' } });
  fireEvent.click(screen.getByRole('button', { name: 'Preview Message' }));
  await waitFor(() => expect(b.submitPublic).toHaveBeenCalledTimes(1));
  expect(screen.queryByText('Verify')).toBeNull();
});
it('counts emoji with the same length units enforced by the server', () => {
  render(<VisitorComposer backend={{ ...backend(), mode: 'preview', requiresCaptcha: false }} remaining={0} cooldownLabel="" />);
  const text = screen.getByRole('textbox', { name: /Your message/ });
  fireEvent.change(text, { target: { value: '😀'.repeat(150) } });
  expect(screen.getByText('300 / 300')).toBeTruthy();
  expect((text as HTMLTextAreaElement).maxLength).toBe(300);
});
