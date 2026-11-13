import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ContactError } from '../sections/components/contact/types';

let client: SupabaseClient | undefined;
export function getSupabase(): SupabaseClient {
  if (client) return client;
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  // Reject private/legacy keys and accidental connections to another project.
  if (url !== 'https://lctzkigzaudjiotopzye.supabase.co' || !key?.startsWith('sb_publishable_')) {
    throw new ContactError('The visitor wall is not configured. Nothing has been sent.');
  }
  client = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false,
      storageKey: 'shehroz.visitor.supabase.session' },
  });
  return client;
}

export function createVisitorSession(client: SupabaseClient) {
  let pending: Promise<{ accessToken: string; captchaConsumed: boolean }> | undefined;
  return function ensureSession(captchaToken: string) {
    if (pending) return pending;
    pending = (async () => {
      const { data, error } = await client.auth.getSession();
      if (error) throw new ContactError('Your visitor session could not be read. Please reload and try again.');
      if (data.session) {
        if ((data.session.expires_at ?? 0) * 1000 > Date.now() + 60_000) {
          return { accessToken: data.session.access_token, captchaConsumed: false };
        }
        const refreshed = await client.auth.refreshSession();
        if (refreshed.error || !refreshed.data.session) {
          // Do not create another identity to bypass the server cooldown.
          throw new ContactError('Your visitor session expired and could not be renewed. Please reload and try again.');
        }
        return { accessToken: refreshed.data.session.access_token, captchaConsumed: false };
      }
      const signed = await client.auth.signInAnonymously({ options: { captchaToken } });
      if (signed.error || !signed.data.session) {
        throw new ContactError('A visitor session could not be started. Please complete verification again or try later.');
      }
      // Auth may consume this single-use token. Never reuse it at the Edge Function.
      return { accessToken: signed.data.session.access_token, captchaConsumed: true };
    })().finally(() => { pending = undefined; });
    return pending;
  };
}
