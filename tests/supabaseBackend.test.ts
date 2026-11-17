import { afterEach, describe, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseBackend, publicColumns } from '../src/sections/components/contact/services/supabaseBackend';
import { createVisitorSession } from '../src/lib/supabase';

const input = { name: 'Visitor', text: 'Hello!', photo: null, photoDataUrl: null,
  country: { code: null, name: null }, honeypot: '' };
const session = { access_token: 'visitor-jwt', expires_at: Date.now() / 1000 + 3600 };
function fixture() {
  const query = { select: vi.fn(), eq: vi.fn(), order: vi.fn(), limit: vi.fn(), abortSignal: vi.fn() };
  query.select.mockReturnValue(query); query.eq.mockReturnValue(query); query.order.mockReturnValue(query); query.limit.mockReturnValue(query);
  query.abortSignal.mockResolvedValue({ data: [{ id: 'm1', name: 'Test', text: '<script>plain text</script>', created_at: '2026-11-13T00:00:00Z', country_code: null, country_name: null }], error: null });
  const auth = { getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
    refreshSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
    signInAnonymously: vi.fn().mockResolvedValue({ data: { session }, error: null }) };
  const invoke = vi.fn().mockResolvedValue({ data: { success: true, message_id: '00000000-0000-0000-0000-000000000001' }, error: null });
  const from = vi.fn().mockReturnValue(query);
  const client = { auth, from, functions: { invoke } } as unknown as SupabaseClient;
  return { client, auth, invoke, from, query };
}
afterEach(() => { vi.useRealTimers(); });
describe('Supabase visitor sessions (mocked)', () => {
  it('reuses existing sessions without creating identities', async () => {
    const f = fixture();
    expect(await createVisitorSession(f.client)('token')).toEqual({ accessToken: 'visitor-jwt', captchaConsumed: false });
    expect(f.auth.signInAnonymously).not.toHaveBeenCalled();
  });
  it('refreshes expired sessions and fails closed on refresh failure', async () => {
    const f = fixture(); f.auth.getSession.mockResolvedValue({ data: { session: { ...session, expires_at: 1 } }, error: null });
    const ensure = createVisitorSession(f.client);
    await expect(ensure('token')).resolves.toHaveProperty('accessToken', 'visitor-jwt');
    f.auth.refreshSession.mockResolvedValue({ data: { session: null }, error: { message: 'expired' } });
    await expect(ensure('token')).rejects.toThrow('could not be renewed');
    expect(f.auth.signInAnonymously).not.toHaveBeenCalled();
  });
  it('deduplicates anonymous sign-in and marks the CAPTCHA consumed', async () => {
    const f = fixture(); f.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    const ensure = createVisitorSession(f.client);
    const [a, b] = await Promise.all([ensure('token'), ensure('token')]);
    expect(a).toEqual(b); expect(a.captchaConsumed).toBe(true);
    expect(f.auth.signInAnonymously).toHaveBeenCalledExactlyOnceWith({ options: { captchaToken: 'token' } });
  });
  it('reports anonymous auth failure', async () => {
    const f = fixture(); f.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    f.auth.signInAnonymously.mockResolvedValue({ data: { session: null }, error: { message: 'disabled' } });
    await expect(createVisitorSession(f.client)('token')).rejects.toThrow('could not be started');
  });
});
describe('Supabase adapter (mocked)', () => {
  it('keeps the safety switch disabled by default', async () => {
    const f = fixture(); await expect(createSupabaseBackend(f.client).submitPublic(input)).rejects.toThrow('not enabled');
    expect(f.invoke).not.toHaveBeenCalled();
  });
  it.each([{ name: '' }, { name: 'x'.repeat(81) }, { text: 'x'.repeat(301) }, { text: '' }, { honeypot: 'spam' }, { name: 'a\u0000b' }])('rejects invalid input %j', async (patch) => {
    const f = fixture(); await expect(createSupabaseBackend(f.client, true).submitPublic({ ...input, ...patch })).rejects.toThrow();
    expect(f.invoke).not.toHaveBeenCalled(); expect(f.auth.getSession).not.toHaveBeenCalled();
  });
  it('rejects uncompressed photos', async () => {
    const f = fixture(); await expect(createSupabaseBackend(f.client, true).submitPublic({ ...input, photo: new File(['x'], 'a.png', { type: 'image/png' }) })).rejects.toThrow('compressed WebP');
    expect(f.invoke).not.toHaveBeenCalled();
  });
  it('sends the public multipart contract without Auth, CAPTCHA or client country', async () => {
    const f = fixture(); await createSupabaseBackend(f.client, true).submitPublic({ ...input, name: '  Visitor  ' });
    const [slug, options] = f.invoke.mock.calls[0];
    expect(slug).toBe('submit-visitor-message'); expect(options.headers).toBeUndefined();
    expect(options.body.get('visitor_id')).toMatch(/^[0-9a-f-]{36}$/);
    expect(options.body.get('turnstile_token')).toBeNull(); expect(options.body.get('country_code')).toBeNull();
    expect(options.body.get('name')).toBe('Visitor'); expect(f.auth.getSession).not.toHaveBeenCalled();
    expect(f.from).not.toHaveBeenCalled();
  });
  it('posts even when anonymous Auth is unavailable, without invoking it', async () => {
    const f = fixture(); f.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    await expect(createSupabaseBackend(f.client, true).submitPublic(input)).resolves.toHaveProperty('status', 'published');
    expect(f.invoke).toHaveBeenCalledTimes(1); expect(f.auth.signInAnonymously).not.toHaveBeenCalled();
  });
  it('prevents concurrent duplicate writes', async () => {
    const f = fixture(); const backend = createSupabaseBackend(f.client, true);
    const first = backend.submitPublic(input);
    await expect(backend.submitPublic(input)).rejects.toThrow('already'); await first;
    expect(f.invoke).toHaveBeenCalledTimes(1);
  });
  it.each([401, 403, 503])('reports HTTP %i without retry', async (status) => {
    const f = fixture(); f.invoke.mockResolvedValue({ data: null, error: { context: new Response('{}', { status }) } });
    await expect(createSupabaseBackend(f.client, true).submitPublic(input)).rejects.toThrow(); expect(f.invoke).toHaveBeenCalledTimes(1);
  });
  it('maps only the server cooldown code to a ten-minute expiry', async () => {
    const f = fixture(); f.invoke.mockResolvedValue({ data: null, error: { context: new Response('{"code":"COOLDOWN"}', { status: 429 }) } });
    const now = Date.now();
    await expect(createSupabaseBackend(f.client, true).submitPublic(input)).rejects.toMatchObject({ cooldownUntil: expect.any(Number) });
    try { await createSupabaseBackend(f.client, true).submitPublic(input); } catch (e) {
      expect((e as { cooldownUntil: number }).cooldownUntil).toBeGreaterThanOrEqual(now + 600_000);
    }
  });
  it('treats incomplete or lost responses as unconfirmed', async () => {
    const f = fixture(); const b = createSupabaseBackend(f.client, true);
    f.invoke.mockResolvedValue({ data: { success: true }, error: null }); await expect(b.submitPublic(input)).rejects.toThrow('unconfirmed');
    f.invoke.mockRejectedValue(new Error('timeout')); await expect(b.submitPublic(input)).rejects.toThrow('unconfirmed');
    expect(f.invoke).toHaveBeenCalledTimes(2);
  });
  it('reads safe columns, filters published records, refreshes after writes and cleans up', async () => {
    vi.useFakeTimers(); const f = fixture(); const backend = createSupabaseBackend(f.client, true);
    const update = vi.fn(); const fail = vi.fn(); const stop = backend.subscribe(5, update, fail);
    await vi.waitFor(() => expect(update).toHaveBeenCalled());
    expect(publicColumns).not.toMatch(/photo_path|visitor_id/); expect(f.query.select).toHaveBeenCalledWith(publicColumns);
    expect(f.query.eq).toHaveBeenCalledWith('status', 'published'); expect(f.query.eq).toHaveBeenCalledWith('is_demo', false);
    expect(update.mock.calls[0][0].messages[0].photoUrl).toBeNull();
    await backend.submitPublic(input); await vi.waitFor(() => expect(update).toHaveBeenCalledTimes(2));
    stop(); await vi.advanceTimersByTimeAsync(60_000); expect(update).toHaveBeenCalledTimes(2);
  });
  it('turns a stalled public read into an error after 15 seconds', async () => {
    vi.useFakeTimers(); const f = fixture();
    f.query.abortSignal.mockImplementation((signal: AbortSignal) => new Promise((resolve) => {
      signal.addEventListener('abort', () => resolve({ data: null, error: { message: 'aborted' } }));
    }));
    const update = vi.fn(); const fail = vi.fn();
    const stop = createSupabaseBackend(f.client).subscribe(5, update, fail);
    await vi.advanceTimersByTimeAsync(14_999); expect(fail).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1); expect(fail).toHaveBeenCalledTimes(1);
    expect(update).not.toHaveBeenCalled(); stop();
  });
  it('aborts an unfinished read on unsubscribe without a stale error', async () => {
    const f = fixture(); let requestSignal: AbortSignal | undefined;
    f.query.abortSignal.mockImplementation((signal: AbortSignal) => new Promise((resolve) => {
      requestSignal = signal;
      signal.addEventListener('abort', () => resolve({ data: null, error: { message: 'aborted' } }));
    }));
    const update = vi.fn(); const fail = vi.fn();
    const stop = createSupabaseBackend(f.client).subscribe(5, update, fail);
    stop(); await Promise.resolve(); await Promise.resolve();
    expect(requestSignal?.aborted).toBe(true); expect(update).not.toHaveBeenCalled(); expect(fail).not.toHaveBeenCalled();
  });
  it('reports live read failure without preview fallback', async () => {
    const f = fixture(); f.query.abortSignal.mockResolvedValue({ data: null, error: { message: 'denied' } });
    const update = vi.fn(); const fail = vi.fn(); const stop = createSupabaseBackend(f.client).subscribe(5, update, fail);
    await vi.waitFor(() => expect(fail).toHaveBeenCalled()); expect(update).not.toHaveBeenCalled(); stop();
  });
});

describe('Private delivery responses (mocked)', () => {
  const correspondence = { name: 'Audit Visitor', email: 'audit@example.test', subject: 'Test subject',
    message: 'Isolated test correspondence', honeypot: '', turnstileToken: 'fresh-token' };
  it.each([
    [401, 'session was rejected'], [403, 'Security verification failed'],
    [429, 'wait 10 minutes'], [503, 'Private contact is not available'],
  ] as const)('reports private HTTP %i without exposing server details or retrying', async (status, message) => {
    const f = fixture(); f.invoke.mockResolvedValue({ data: null, error: { context: new Response('private server detail', {status}) } });
    await expect(createSupabaseBackend(f.client).submitPrivate(correspondence)).rejects.toThrow(message);
    expect(f.invoke).toHaveBeenCalledTimes(1);
  });
  it('uses the visitor JWT and acknowledges only explicit backend success', async () => {
    const f = fixture(); await createSupabaseBackend(f.client).submitPrivate(correspondence);
    expect(f.invoke).toHaveBeenCalledWith('submit-private-message', { body: correspondence,
      headers: { Authorization: 'Bearer visitor-jwt' }, timeout: 15_000 });
    expect(f.from).not.toHaveBeenCalled();
  });
  it('treats transport errors and missing acknowledgements as unconfirmed without retry', async () => {
    const f = fixture(); f.invoke.mockRejectedValueOnce(new Error('sensitive transport detail'));
    await expect(createSupabaseBackend(f.client).submitPrivate(correspondence)).rejects.toThrow('Private delivery is unconfirmed');
    f.invoke.mockResolvedValueOnce({data: {}, error: null});
    await expect(createSupabaseBackend(f.client).submitPrivate(correspondence)).rejects.toThrow('Private delivery is unconfirmed');
    expect(f.invoke).toHaveBeenCalledTimes(2);
  });
  it('does not reuse a CAPTCHA consumed by a new visitor session', async () => {
    const f = fixture(); f.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    await expect(createSupabaseBackend(f.client).submitPrivate(correspondence)).rejects.toThrow('verify again');
    expect(f.invoke).not.toHaveBeenCalled();
  });
});
