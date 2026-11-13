import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
vi.mock('../src/sections/components/contact/services/backend', () => ({ loadBackend: vi.fn() }));
import { loadBackend } from '../src/sections/components/contact/services/backend';
import ContactSection from '../src/sections/components/contact/ContactSection';
import type { Backend } from '../src/sections/components/contact/types';
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it('recovers from an SDK chunk/load failure without changing the backend mode', async () => {
  const backend: Backend = { mode: 'live', submissionsEnabled: false, photosEnabled: false,
    subscribe: (_, update) => { update({ messages: [], hasMore: false }); return () => {}; },
    submitPublic: vi.fn(), submitPrivate: vi.fn(), detectCountry: async () => ({ code: null, name: null }) };
  vi.mocked(loadBackend).mockRejectedValueOnce(new Error('chunk unavailable')).mockResolvedValueOnce(backend);
  render(<ContactSection />);
  await waitFor(() => expect(screen.getByText('Wall unavailable')).toBeTruthy());
  expect(screen.queryByText('Loading messages…')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Retry contact service' }));
  await waitFor(() => expect(screen.getByText('No messages yet')).toBeTruthy());
  expect(loadBackend).toHaveBeenCalledTimes(2);
  expect((screen.getByRole('button', { name: 'Post Message' }) as HTMLButtonElement).disabled).toBe(true);
});
