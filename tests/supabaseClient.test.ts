// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { createVisitorSession } from '../src/lib/supabase';
import { generateKeyPair, SignJWT } from 'jose';
afterEach(() => vi.unstubAllEnvs());
it('uses the actual SDK anonymous Auth API, persists identity, and never reuses a consumed token', async () => {
  const pair = await generateKeyPair('ES256');
  const id = '00000000-0000-0000-0000-000000000001';
  const jwt = await new SignJWT({ sub: id, role: 'authenticated', is_anonymous: true })
    .setProtectedHeader({ alg: 'ES256', kid: 'local-test' }).setExpirationTime('1h').sign(pair.privateKey);
  const storage = new Map<string, string>();
  const remote = vi.fn(async () => Response.json({ access_token: jwt, refresh_token: 'audit-refresh',
    expires_in: 3600, token_type: 'bearer', user: { id, aud: 'authenticated', role: 'authenticated',
      app_metadata: { provider: 'anonymous' }, user_metadata: {}, is_anonymous: true, created_at: new Date().toISOString() } }));
  const options = { auth: { persistSession: true, autoRefreshToken: false, detectSessionInUrl: false,
    storageKey: 'audit-session', storage: { getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => { storage.set(k, v); }, removeItem: (k: string) => { storage.delete(k); } } }, global: { fetch: remote } };
  const client = createClient('https://example.supabase.co', 'sb_publishable_audit_only', options);
  const ensure = createVisitorSession(client);
  expect((await ensure('single-use-token')).captchaConsumed).toBe(true);
  expect(String(remote.mock.calls[0][0])).toContain('/auth/v1/signup');
  expect(JSON.parse(remote.mock.calls[0][1].body)).toMatchObject({ gotrue_meta_security: { captcha_token: 'single-use-token' } });
  expect(storage.has('audit-session')).toBe(true);
  expect((await ensure('another-token')).captchaConsumed).toBe(false);
  // A new SDK client simulates a reload with the same persisted browser session.
  const reloaded = createClient('https://example.supabase.co', 'sb_publishable_audit_only', options);
  expect((await createVisitorSession(reloaded)('unused-token')).accessToken).toBe(jwt);
  expect(remote).toHaveBeenCalledTimes(1);
});
it.each(['sb_secret_private', 'legacy-jwt', ''])('rejects non-publishable frontend configuration %s', async (key) => {
  vi.resetModules(); vi.stubEnv('VITE_SUPABASE_URL', 'https://lctzkigzaudjiotopzye.supabase.co');
  vi.stubEnv('VITE_SUPABASE_PUBLISHABLE_KEY', key);
  const { getSupabase } = await import('../src/lib/supabase'); expect(() => getSupabase()).toThrow('not configured');
});
