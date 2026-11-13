// @vitest-environment node
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({ ctx: {} as any }));
vi.mock('npm:@supabase/server@1.9.2', () => ({ withSupabase: (_: unknown, handler: any) => (req: Request) => handler(req, state.ctx) }));
vi.mock('npm:@supabase/supabase-js@2.119.0', () => ({ createClient: () => state.ctx.supabaseAdmin }));
import manage from '../supabase/functions/manage-visitor-messages/index';
import photo from '../supabase/functions/visitor-photo/index';
import privateContact from '../supabase/functions/submit-private-message/index';
import { notifyTelegram } from '../supabase/functions/_shared/contact';
const id = '00000000-0000-0000-0000-000000000001';
const origin = 'https://shehroz-codes.github.io';
let tables: Record<string, any>;
let storage: any;
let env: Record<string, string>;
function query(data: any) {
  const q: any = { data, error: null };
  for (const method of ['select','eq','order','range','delete','lt','limit','insert']) q[method] = vi.fn(() => q);
  q.maybeSingle = vi.fn(async () => ({ data: Array.isArray(q.data) ? q.data[0] : q.data, error: q.error }));
  q.then = (resolve: any, reject: any) => Promise.resolve({ data: q.data, error: q.error }).then(resolve, reject);
  return q;
}
beforeEach(() => {
  env = { SUPABASE_SECRET_KEYS: '{"default":"sb_secret_test"}', PRIVATE_CONTACT_ENABLED: 'true', TURNSTILE_SECRET_KEY: 'test' };
  vi.stubGlobal('Deno', { env: { get: (key: string) => env[key] } });
  tables = { portfolio_admins: query([{ user_id: id }]), visitor_messages: query([{ photo_path: 'private/path.webp' }]), visitor_photo_cleanup: query([]) };
  storage = { download: vi.fn(async () => ({ data: new Blob(['photo']), error: null })), remove: vi.fn(async () => ({ error: null })) };
  state.ctx = { userClaims: { id, role: 'authenticated' }, jwtClaims: { is_anonymous: false }, supabaseAdmin: {
    from: vi.fn((name: string) => tables[name]), storage: { from: vi.fn(() => storage) }, rpc: vi.fn(async () => ({ data: id, error: null })),
  } };
});
afterEach(() => vi.unstubAllGlobals());
const request = (method = 'GET', path = '', body?: unknown) => new Request(`https://example.test/functions/v1/manage-visitor-messages${path}`, {
  method, headers: { Origin: origin }, ...(body ? { body: JSON.stringify(body) } : {}),
});
it('denies anonymous and authenticated non-owner moderation', async () => {
  state.ctx.jwtClaims.is_anonymous = true;
  expect((await manage.fetch(request())).status).toBe(403);
  state.ctx.jwtClaims.is_anonymous = false; tables.portfolio_admins.data = [];
  expect((await manage.fetch(request('DELETE', `?id=${id}`))).status).toBe(403);
  expect(tables.visitor_messages.delete).not.toHaveBeenCalled();
});
it('allows owner listing and removes message before cleaning its private photo', async () => {
  expect((await manage.fetch(request())).status).toBe(200);
  expect((await manage.fetch(request('DELETE', `?id=${id}`))).status).toBe(200);
  expect(tables.visitor_messages.delete).toHaveBeenCalled();
  expect(storage.remove).toHaveBeenCalledWith(['private/path.webp']);
  expect(tables.visitor_photo_cleanup.delete).toHaveBeenCalled();
});
it('keeps cleanup intent on removal failure and retries unreferenced orphan uploads', async () => {
  storage.remove.mockResolvedValueOnce({ error: 'failure' });
  expect((await manage.fetch(request('DELETE', `?id=${id}`))).status).toBe(200);
  expect(tables.visitor_photo_cleanup.delete).not.toHaveBeenCalled();
  tables.visitor_photo_cleanup.data = [{ path: 'orphan.webp' }]; tables.visitor_messages.data = [];
  expect((await manage.fetch(request('POST'))).status).toBe(200);
  expect(storage.remove).toHaveBeenLastCalledWith(['orphan.webp']);
});
it('never removes referenced photos during cleanup recovery', async () => {
  tables.visitor_photo_cleanup.data = [{ path: 'still-linked.webp' }];
  await manage.fetch(request('POST')); expect(storage.remove).not.toHaveBeenCalled();
});
it('serves only published non-demo photo bytes without returning the private path', async () => {
  const response = await photo.fetch(request('GET', `?id=${id}`));
  expect(response.status).toBe(200); expect(response.headers.get('cache-control')).toBe('no-store');
  expect(response.headers.get('content-type')).toBe('image/webp'); expect(await response.text()).toBe('photo');
  expect(tables.visitor_messages.eq).toHaveBeenCalledWith('status', 'published');
  expect(tables.visitor_messages.eq).toHaveBeenCalledWith('is_demo', false);
  tables.visitor_messages.data = []; expect((await photo.fetch(request('GET', `?id=${id}`))).status).toBe(404);
  expect(storage.download).toHaveBeenCalledTimes(1);
});
it('rejects private correspondence with a honeypot or failed CAPTCHA before storage', async () => {
  const fields = { name: 'Visitor', email: 'a@example.com', subject: 'Hello', message: 'A private message', honeypot: '', turnstileToken: 'token' };
  expect((await privateContact.fetch(request('POST', '', { ...fields, honeypot: 'spam' }))).status).toBe(400);
  vi.stubGlobal('fetch', vi.fn(async () => Response.json({ success: false })));
  expect((await privateContact.fetch(request('POST', '', fields))).status).toBe(403);
  expect(state.ctx.supabaseAdmin.rpc).not.toHaveBeenCalled();
});
it('stores private correspondence through a separate RPC and survives notification failure', async () => {
  env.TELEGRAM_BOT_TOKEN = 'fake-test'; env.TELEGRAM_CHAT_ID = 'fake-test';
  const remote = vi.fn(async (url: string) => url.includes('siteverify')
    ? Response.json({ success: true, hostname: 'shehroz-codes.github.io', action: 'private-message' }) : new Response('', { status: 500 }));
  vi.stubGlobal('fetch', remote);
  const response = await privateContact.fetch(request('POST', '', { name: 'Visitor', email: 'a@example.com', subject: 'Hello', message: 'A private message', honeypot: '', turnstileToken: 'token' }));
  expect(response.status).toBe(201);
  expect(state.ctx.supabaseAdmin.rpc).toHaveBeenCalledWith('receive_private_message', expect.objectContaining({ p_message: 'A private message' }));
  expect(state.ctx.supabaseAdmin.from).not.toHaveBeenCalled();
});
it('notification transport failure resolves without leaking tokens', async () => {
  env.TELEGRAM_BOT_TOKEN = 'fake'; env.TELEGRAM_CHAT_ID = 'fake';
  vi.stubGlobal('fetch', vi.fn(async () => { throw new Error('transport failure'); }));
  await expect(notifyTelegram('A published message')).resolves.toBeUndefined();
});
it('blocks cross-origin owner requests', async () => {
  expect((await manage.fetch(new Request('https://example.test', { headers: { Origin: 'https://attacker.test' } }))).status).toBe(403);
  expect(state.ctx.supabaseAdmin.from).not.toHaveBeenCalled();
});
