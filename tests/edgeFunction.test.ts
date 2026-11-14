// @vitest-environment node
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { exportJWK, generateKeyPair, SignJWT } from 'jose';
import { readFile } from 'node:fs/promises';
import { ImageMagick, initializeImageMagick, MagickFormat } from '@imagemagick/magick-wasm';
vi.mock('../supabase/functions/_shared/photo.ts', async () => import('../supabase/functions/_shared/decode-photo'));
import edge from '../supabase/functions/submit-visitor-message/index';

// Real @supabase/server + real asymmetric JWT verification; only remote services
// are replaced. This is NOT a deployed gateway, Auth, Cloudflare or database test.
const userId = '00000000-0000-0000-0000-000000000001';
const projectUrl = 'https://lctzkigzaudjiotopzye.supabase.co';
const origin = 'https://shehroz-codes.github.io';
let photoBytes: Uint8Array;
let token: string;
let expired: string;
let tampered: string;
const env: Record<string, string> = {};
let remote: ReturnType<typeof vi.fn>;
beforeAll(async () => {
  await initializeImageMagick(await readFile(new URL('../node_modules/@imagemagick/magick-wasm/dist/magick.wasm', import.meta.url)));
  photoBytes = ImageMagick.read(await readFile(new URL('../src/sections/components/showcase/assets/project-1.webp', import.meta.url)), image => { image.resize(160,160); image.extent(160,160); return image.write(MagickFormat.WebP, bytes => new Uint8Array(bytes)); });
  const pair = await generateKeyPair('ES256');
  const jwk = { ...await exportJWK(pair.publicKey), kid: 'audit-test-key', alg: 'ES256' };
  env.SUPABASE_JWKS = JSON.stringify({ keys: [jwk] });
  const sign = (expiration: number) => new SignJWT({ sub: userId, role: 'authenticated', is_anonymous: true })
    .setProtectedHeader({ alg: 'ES256', kid: jwk.kid }).setAudience('authenticated')
    .setIssuer(`${projectUrl}/auth/v1`).setExpirationTime(expiration).sign(pair.privateKey);
  token = await sign(Math.floor(Date.now() / 1000) + 3600);
  expired = await sign(1);
  const other = await generateKeyPair('ES256');
  tampered = await new SignJWT({ sub: userId }).setProtectedHeader({ alg: 'ES256', kid: jwk.kid }).sign(other.privateKey);
});
beforeEach(() => {
  Object.assign(env, { SUPABASE_URL: projectUrl,
    SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: 'sb_publishable_audit_only' }),
    SUPABASE_SECRET_KEYS: JSON.stringify({ default: 'sb_secret_audit_only' }),
    TURNSTILE_SECRET_KEY: 'audit-only-captcha', VISITOR_SUBMISSIONS_ENABLED: 'false' });
  vi.stubGlobal('Deno', { env: { get: (name: string) => env[name] } });
  remote = vi.fn(async (url: string | URL | Request) => {
    const path = String(url);
    if (path === 'https://challenges.cloudflare.com/turnstile/v0/siteverify') return Response.json({ success: true, hostname: 'shehroz-codes.github.io', action: 'visitor-message' });
    if (path.endsWith('/rest/v1/rpc/publish_visitor_message')) return Response.json(userId, { status: 200 });
    throw new Error('Unexpected external request in isolated test');
  });
  vi.stubGlobal('fetch', remote);
});
afterEach(() => { vi.unstubAllGlobals(); });
function request(bearer: string | null = token, fields: Record<string, string> = {}) {
  const body = new FormData();
  for (const [key, value] of Object.entries({ name: 'Visitor', text: 'Hello', turnstile_token: 'fresh-token', ...fields })) body.append(key, value);
  return new Request(`${projectUrl}/functions/v1/submit-visitor-message`, { method: 'POST',
    headers: { Origin: origin, apikey: 'sb_publishable_audit_only', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) }, body });
}
describe('Edge handler and actual SDK authentication (isolated)', () => {
  it('answers Pages preflight without authentication and with an exact origin', async () => {
    const response = await edge.fetch(new Request(`${projectUrl}/functions/v1/submit-visitor-message`, { method: 'OPTIONS', headers: { Origin: origin } }));
    expect(response.status).toBe(204); expect(response.headers.get('access-control-allow-origin')).toBe(origin);
    expect(remote).not.toHaveBeenCalled();
  });
  it.each([null, 'sb_publishable_audit_only', 'invalid-token'])('rejects missing/API-key/malformed bearer %s', async (bearer) => {
    const response = await edge.fetch(request(bearer)); expect(response.status).toBe(401);
    expect(remote).not.toHaveBeenCalled();
  });
  it('rejects expired or incorrectly signed JWTs before the business handler', async () => {
    for (const bad of [expired, tampered]) expect((await edge.fetch(request(bad))).status).toBe(401);
    expect(remote).not.toHaveBeenCalled();
  });
  it('accepts a valid anonymous user JWT but enforces the independent server switch', async () => {
    const response = await edge.fetch(request()); expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: 'Submissions not enabled yet' }); expect(remote).not.toHaveBeenCalled();
  });
  it('fails closed without the CAPTCHA secret', async () => {
    env.VISITOR_SUBMISSIONS_ENABLED = 'true'; delete env.TURNSTILE_SECRET_KEY;
    expect((await edge.fetch(request())).status).toBe(503); expect(remote).not.toHaveBeenCalled();
  });
  it.each([{ name: '' }, { name: 'x'.repeat(81) }, { text: 'x'.repeat(301) }, { name: 'a\u0000b' }, { extra: 'unknown' }])('rejects invalid multipart %j before remote requests', async (fields) => {
    env.VISITOR_SUBMISSIONS_ENABLED = 'true';
    expect((await edge.fetch(request(token, fields))).status).toBe(400); expect(remote).not.toHaveBeenCalled();
  });
  it('rejects missing/invalid CAPTCHA without calling the publishing RPC', async () => {
    env.VISITOR_SUBMISSIONS_ENABLED = 'true';
    expect((await edge.fetch(request(token, { turnstile_token: '' }))).status).toBe(403);
    remote.mockResolvedValue(Response.json({ success: false, 'error-codes': ['timeout-or-duplicate'] }));
    expect((await edge.fetch(request())).status).toBe(403); expect(remote).toHaveBeenCalledTimes(1);
  });
  it('bounds streamed request bodies', async () => {
    env.VISITOR_SUBMISSIONS_ENABLED = 'true';
    expect((await edge.fetch(request(token, { text: 'x'.repeat(110_000) }))).status).toBe(413);
    expect(remote).not.toHaveBeenCalled();
  });
  it('verifies CAPTCHA before invoking exactly one atomic publishing RPC', async () => {
    env.VISITOR_SUBMISSIONS_ENABLED = 'true';
    const response = await edge.fetch(request()); expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ success: true, message_id: userId });
    expect(remote).toHaveBeenCalledTimes(2);
    expect(String(remote.mock.calls[0][0])).toContain('siteverify');
    expect(String(remote.mock.calls[1][0])).toContain('publish_visitor_message');
  });
  it('maps RPC cooldown without leaking database details', async () => {
    env.VISITOR_SUBMISSIONS_ENABLED = 'true';
    remote.mockImplementation(async (url) => String(url).includes('siteverify') ? Response.json({ success: true, hostname: 'shehroz-codes.github.io', action: 'visitor-message' })
      : Response.json({ message: 'COOLDOWN private database detail', code: 'P0001' }, { status: 400 }));
    const response = await edge.fetch(request()); expect(response.status).toBe(429);
    expect(await response.json()).toEqual({ error: 'Please wait 10 minutes', code: 'COOLDOWN' });
  });
  it.each([
    { success: true, hostname: 'unrelated.example', action: 'visitor-message' },
    { success: true, hostname: 'shehroz-codes.github.io', action: 'unrelated' },
  ])('rejects CAPTCHA with mismatched hostname/action', async (result) => {
    env.VISITOR_SUBMISSIONS_ENABLED = 'true'; remote.mockResolvedValue(Response.json(result));
    expect((await edge.fetch(request())).status).toBe(403); expect(remote).toHaveBeenCalledTimes(1);
  });
  it('rejects legacy JWTs without a signing-key ID using the actual SDK', async () => {
    const legacy = await new SignJWT({ sub: userId, role: 'authenticated' })
      .setProtectedHeader({ alg: 'HS256' }).setExpirationTime('1h').sign(new Uint8Array(32).fill(1));
    expect((await edge.fetch(request(legacy))).status).toBe(401); expect(remote).not.toHaveBeenCalled();
  });
  it('enforces the server photo gate even if browser controls are bypassed', async () => {
    env.VISITOR_SUBMISSIONS_ENABLED = 'true';
    const req = request(); const form = await req.formData();
    form.append('photo', new File(['invalid'], 'test.webp', { type: 'image/webp' }));
    const headers = new Headers(req.headers); headers.delete('content-type');
    expect((await edge.fetch(new Request(req.url, { method: 'POST', headers, body: form }))).status).toBe(400);
    expect(remote).not.toHaveBeenCalled();
  });
  it('rejects duplicate multipart fields', async () => {
    env.VISITOR_SUBMISSIONS_ENABLED = 'true';
    const req = request(); const form = await req.formData(); form.append('name', 'duplicate');
    const headers = new Headers(req.headers); headers.delete('content-type');
    expect((await edge.fetch(new Request(req.url, { method: 'POST', headers, body: form }))).status).toBe(400);
    expect(remote).not.toHaveBeenCalled();
  });
});

function photoRequest() {
  const req = request();
  return req.formData().then(form => {
    form.append('photo', new File([photoBytes], 'visitor.webp', { type: 'image/webp' }));
    const headers = new Headers(req.headers); headers.delete('content-type');
    return new Request(req.url, { method: 'POST', headers, body: form });
  });
}
it('uploads only a decoded thumbnail, queues recovery before upload and publishes immediately', async () => {
  env.VISITOR_SUBMISSIONS_ENABLED = 'true';
  remote.mockImplementation(async (url) => {
    const path = String(url);
    if (path.includes('siteverify')) return Response.json({ success: true, hostname: 'shehroz-codes.github.io', action: 'visitor-message' });
    if (path.includes('publish_visitor_message')) return Response.json(userId);
    if (path.includes('/storage/v1/object/')) return Response.json({ Key: 'test' });
    if (path.includes('visitor_photo_cleanup')) return new Response(null, { status: 204 });
    throw new Error('Unexpected request');
  });
  expect((await edge.fetch(await photoRequest())).status).toBe(201);
  const paths = remote.mock.calls.map(call => String(call[0]));
  expect(paths.findIndex(p => p.includes('visitor_photo_cleanup'))).toBeLessThan(paths.findIndex(p => p.includes('/storage/')));
  expect(paths.some(p => p.includes('publish_visitor_message'))).toBe(true);
});
it('removes an uploaded thumbnail when atomic publication fails', async () => {
  env.VISITOR_SUBMISSIONS_ENABLED = 'true';
  remote.mockImplementation(async (url) => {
    const path = String(url);
    if (path.includes('siteverify')) return Response.json({ success: true, hostname: 'shehroz-codes.github.io', action: 'visitor-message' });
    if (path.includes('publish_visitor_message')) return Response.json({ message: 'COOLDOWN', code: 'P0001' }, { status: 400 });
    if (path.includes('/storage/v1/object/')) return Response.json({ Key: 'test' });
    if (path.includes('visitor_photo_cleanup')) return new Response(null, { status: 204 });
    throw new Error('Unexpected request');
  });
  expect((await edge.fetch(await photoRequest())).status).toBe(429);
  expect(remote.mock.calls.filter(call => String(call[0]).includes('/storage/v1/object/')).length).toBe(2);
});
it('keeps a successful public publication successful when Telegram transport fails', async () => {
  env.VISITOR_SUBMISSIONS_ENABLED = 'true'; env.TELEGRAM_BOT_TOKEN = 'fake-token'; env.TELEGRAM_CHAT_ID = 'fake-chat';
  const implementation = remote.getMockImplementation()!;
  remote.mockImplementation(async (url) => {
    if (String(url).includes('api.telegram.org')) throw new Error('offline');
    return implementation(url);
  });
  expect((await edge.fetch(request())).status).toBe(201);
  delete env.TELEGRAM_BOT_TOKEN; delete env.TELEGRAM_CHAT_ID;
});
it('rejects a forged Origin before external calls', async () => {
  env.VISITOR_SUBMISSIONS_ENABLED = 'true';
  const req = request(); const headers = new Headers(req.headers); headers.set('origin', 'https://attacker.test');
  expect((await edge.fetch(new Request(req, { headers }))).status).toBe(403);
  expect(remote).not.toHaveBeenCalled();
});
