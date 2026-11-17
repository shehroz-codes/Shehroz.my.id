import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import type { Backend } from '../src/sections/components/contact/types';

vi.mock('@marsidev/react-turnstile', () => ({ Turnstile: () => { throw new Error('Public form must not mount CAPTCHA'); } }));
import VisitorComposer from '../src/sections/components/contact/VisitorComposer';
function backend(): Backend {
  return { mode: 'live', requiresCaptcha: true, submissionsEnabled: true, photosEnabled: false,
    subscribe: () => () => {}, submitPublic: vi.fn().mockResolvedValue({ status: 'published', cooldownUntil: Date.now() + 600_000 }),
    submitPrivate: vi.fn(), detectCountry: async () => ({ code: null, name: null }) };
}
afterEach(() => { cleanup(); vi.clearAllMocks(); localStorage.clear(); sessionStorage.clear(); });
it('posts without verification and preserves a draft after a failed submission', async () => {
  const b = backend(); vi.mocked(b.submitPublic).mockRejectedValue(new Error('Please try later'));
  render(<VisitorComposer backend={b} remaining={0} cooldownLabel="" />);
  const post = screen.getByRole('button', { name: 'Post Message' }) as HTMLButtonElement;
  expect(post.disabled).toBe(false); expect(screen.queryByText('Verify')).toBeNull();
  fireEvent.change(screen.getByRole('textbox', { name: 'Your name' }), { target: { value: 'Visitor' } });
  fireEvent.change(screen.getByLabelText(/Your message/), { target: { value: 'Hello there' } });
  fireEvent.click(post);
  await waitFor(() => expect(screen.getByText('Please try later')).toBeTruthy());
  expect((screen.getByLabelText(/Your message/) as HTMLTextAreaElement).value).toBe('Hello there');
  expect(b.submitPublic).toHaveBeenCalledTimes(1);
  expect(vi.mocked(b.submitPublic).mock.calls[0][0]).not.toHaveProperty('turnstileToken');
});
it('leaves submissions and photos disabled at the safety gate', () => {
  render(<VisitorComposer backend={{ ...backend(), submissionsEnabled: false }} remaining={0} cooldownLabel="" />);
  expect((screen.getByRole('button', { name: 'Post Message' }) as HTMLButtonElement).disabled).toBe(true);
  expect(screen.queryByText('Verify')).toBeNull(); expect(screen.getByText(/Public submissions are not enabled yet/)).toBeTruthy();
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

it('keeps drafts editable at the publishing gate and restores them after remount', () => {
  const b = { ...backend(), submissionsEnabled: false, photosEnabled: true };
  const view = render(<VisitorComposer backend={b} remaining={60000} cooldownLabel="1:00" />);
  const name = screen.getByRole('textbox', { name: 'Your name' }) as HTMLInputElement;
  const text = screen.getByRole('textbox', { name: /Your message/ }) as HTMLTextAreaElement;
  expect(name.disabled).toBe(false); expect(text.disabled).toBe(false);
  fireEvent.change(name, { target: { value: 'Draft visitor' } });
  fireEvent.change(text, { target: { value: 'My draft' } });
  expect(screen.getByText('8 / 300')).toBeTruthy();
  expect((screen.getByRole('button', { name: 'Choose photo' }) as HTMLButtonElement).disabled).toBe(false);
  view.unmount(); render(<VisitorComposer backend={b} remaining={0} cooldownLabel="" />);
  expect((screen.getByRole('textbox', { name: 'Your name' }) as HTMLInputElement).value).toBe('Draft visitor');
  expect((screen.getByRole('textbox', { name: /Your message/ }) as HTMLTextAreaElement).value).toBe('My draft');
  expect(b.submitPublic).not.toHaveBeenCalled();
});
it('country failure does not block posting and never offers manual location controls', async () => {
  const b = { ...backend(), detectCountry: vi.fn().mockRejectedValue(new Error('offline')) };
  render(<VisitorComposer backend={b} remaining={0} cooldownLabel="" />);
  await waitFor(() => expect(screen.getByText('Country unavailable')).toBeTruthy());
  expect(screen.queryByRole('combobox')).toBeNull();
  expect((screen.getByRole('button', { name: 'Post Message' }) as HTMLButtonElement).disabled).toBe(false);
});
it('shows the server country without a verification wait', async () => {
  const b = { ...backend(), detectCountry: async () => ({ code: 'NL', name: 'Netherlands' }) };
  render(<VisitorComposer backend={b} remaining={0} cooldownLabel="" />);
  await waitFor(() => expect(screen.getByText('Netherlands · Approximate network location')).toBeTruthy());
  expect(screen.queryByText('Verify')).toBeNull();
});
