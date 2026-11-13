import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import VisitorWall from '../src/sections/components/contact/VisitorWall';
import type { Backend } from '../src/sections/components/contact/types';
afterEach(cleanup);
it('shows a service loading failure instead of an endless loading state', () => {
  render(<VisitorWall backend={null} cooling={false} unavailable />);
  expect(screen.getByText('Wall unavailable')).toBeTruthy();
  expect(screen.queryByText('Loading messages…')).toBeNull();
});
it('retries a failed feed and removes stale pagination', async () => {
  const stop = vi.fn();
  const subscribe = vi.fn<Backend['subscribe']>()
    .mockImplementationOnce((_, update, error) => {
      update({ messages: [], hasMore: true }); error('Read temporarily failed'); return stop;
    }).mockImplementation((_, update) => { update({ messages: [], hasMore: false }); return stop; });
  const backend = { mode: 'live', subscribe } as Backend;
  render(<VisitorWall backend={backend} cooling={false} />);
  expect(screen.getByText('Read temporarily failed')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Load more messages' })).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Retry messages' }));
  await waitFor(() => expect(screen.getByText('No messages yet')).toBeTruthy());
  expect(subscribe).toHaveBeenCalledTimes(2); expect(stop).toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: 'Retry messages' })).toBeNull();
});
