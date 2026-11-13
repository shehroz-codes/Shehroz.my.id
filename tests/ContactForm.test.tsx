import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import ContactForm from '../src/sections/components/contact/ContactForm';
import type { Backend } from '../src/sections/components/contact/types';
const backend = (submitPrivate = vi.fn()): Backend => ({ mode: 'live', submitPrivate,
  subscribe: () => () => {}, submitPublic: vi.fn(), detectCountry: vi.fn() });
afterEach(cleanup);
it('rejects invalid correspondence without sending it to any backend', () => {
  const b = backend(); render(<ContactForm backend={b} />);
  fireEvent.click(screen.getByRole('button', { name: 'Send Message' }));
  expect(b.submitPrivate).not.toHaveBeenCalled();
  expect(screen.getAllByRole('alert').filter((node) => node.textContent)).toHaveLength(4);
});
it('deduplicates events before React rerenders and preserves private drafts after errors', async () => {
  let reject!: (error: Error) => void;
  const submitPrivate = vi.fn(() => new Promise<void>((_, r) => { reject = r; }));
  render(<ContactForm backend={backend(submitPrivate)} />);
  for (const [name, value] of [['Full name', 'Test Visitor'], ['Email address', 'visitor@example.test'], ['Subject', 'Project inquiry'], ['Message', 'Private draft, never public']]) {
    fireEvent.change(screen.getByRole('textbox', { name }), { target: { value } });
  }
  const form = screen.getByRole('form', { name: 'Send a private message' });
  fireEvent.submit(form); fireEvent.submit(form); expect(submitPrivate).toHaveBeenCalledTimes(1);
  reject(new Error('The private service is unavailable'));
  await waitFor(() => expect(screen.getByText('The private service is unavailable')).toBeTruthy());
  expect((screen.getByRole('textbox', { name: 'Message' }) as HTMLTextAreaElement).value).toBe('Private draft, never public');
});
