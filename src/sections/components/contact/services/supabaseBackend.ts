import type { SupabaseClient } from '@supabase/supabase-js';
import { createVisitorSession, getSupabase } from '../../../../lib/supabase';
import { visitorSubmissionsEnabled, wallSettings } from '../config';
import { ContactError } from '../types';
import type { Backend } from '../types';

// Explicit columns match live column grants. Never select photo_path or visitor_id.
export const publicColumns = 'id,name,text,country_code,country_name,created_at';
export function createSupabaseBackend(client: SupabaseClient, enabled = false): Backend {
  const session = createVisitorSession(client);
  const listeners = new Set<() => void>();
  let submitting = false;
  return {
    mode: 'live', requiresCaptcha: true, submissionsEnabled: enabled,
    // No trusted photo delivery endpoint exists yet. Do not accept invisible photos.
    photosEnabled: false, countryAvailable: false,
    subscribe(limit, update, error) {
      let active = true;
      let loading = false;
      const refresh = async () => {
        if (loading || !active) return;
        loading = true;
        try {
          const result = await client.from('visitor_messages').select(publicColumns)
            .eq('status', 'published').eq('is_demo', false)
            .order('created_at', { ascending: false }).order('id', { ascending: false }).limit(limit + 1);
          if (result.error) throw result.error;
          if (!active) return;
          const rows = result.data ?? [];
          update({ hasMore: rows.length > limit, messages: rows.slice(0, limit).map((row) => ({
            id: row.id, name: row.name, text: row.text, photoUrl: null,
            countryCode: row.country_code, countryName: row.country_name,
            createdAt: new Date(row.created_at).getTime(), isDemo: false,
          })) });
        } catch { if (active) error('Visitor messages could not be loaded. Please try again later.'); }
        finally { loading = false; }
      };
      void refresh();
      // Polling avoids requiring unverified Realtime publication configuration.
      const timer = window.setInterval(() => { void refresh(); }, 30_000);
      listeners.add(refresh);
      return () => { active = false; clearInterval(timer); listeners.delete(refresh); };
    },
    async submitPublic(input) {
      if (!enabled) throw new ContactError('Public submissions are not enabled yet.');
      if (submitting) throw new ContactError('A message is already being submitted.');
      const name = input.name.trim().normalize('NFC');
      const text = input.text.trim().normalize('NFC');
      if (input.honeypot || !name || name.length > 80 || !text || text.length > 300 ||
          /[\u0000-\u001f\u007f]/u.test(name) || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(text)) {
        throw new ContactError('Enter a name of 1–80 characters and a message of 1–300 characters.');
      }
      if (input.photo) throw new ContactError('Visitor photos are unavailable until secure photo delivery is connected.');
      const token = input.turnstileToken;
      if (!token || token.length > 4096) throw new ContactError('Please complete the security check again.');
      submitting = true;
      try {
        const auth = await session(token);
        if (auth.captchaConsumed) {
          throw new ContactError('Your visitor session is ready. Please complete the security check again, then post your message.');
        }
        const form = new FormData();
        form.append('name', name); form.append('text', text); form.append('turnstile_token', token);
        // Never retry a write automatically: a lost response can follow a committed post.
        const { data, error } = await client.functions.invoke('submit-visitor-message', {
          body: form, headers: { Authorization: `Bearer ${auth.accessToken}` }, timeout: 15_000,
        });
        if (error) {
          const response = error.context instanceof Response ? error.context : null;
          if (response?.status === 429) {
            let detail: { code?: string } = {};
            try { detail = await response.clone().json(); } catch { /* Unknown 429 stays generic. */ }
            if (detail.code === 'COOLDOWN') throw new ContactError('Please wait 10 minutes before posting again.', Date.now() + wallSettings.cooldownMs);
          }
          if (response?.status === 403) throw new ContactError('Security verification failed or expired. Please complete it again.');
          if (response?.status === 401) throw new ContactError('Your session was rejected. Please reload and try again.');
          if (response?.status === 503) throw new ContactError('Public submissions are not available yet. Please try later.');
          throw new ContactError('Submission is unconfirmed. Check the wall before trying again.');
        }
        if (data?.success !== true || typeof data.message_id !== 'string' ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.message_id)) {
          throw new ContactError('Submission is unconfirmed. Check the wall before trying again.');
        }
        listeners.forEach((refresh) => refresh());
        return { status: 'published', cooldownUntil: Date.now() + wallSettings.cooldownMs };
      } catch (error) {
        if (error instanceof ContactError) throw error;
        throw new ContactError('Submission is unconfirmed. Check the wall before trying again.');
      } finally { submitting = false; }
    },
    // Private correspondence continues through the existing Firebase service only.
    async submitPrivate(input) { return (await import('./firebaseBackend')).firebaseBackend.submitPrivate(input); },
    async detectCountry() { return { code: null, name: null }; },
  };
}

// SDK initialization remains lazy; missing configuration fails visibly on reads/submits.
let adapter: Backend | undefined;
function live() { return adapter ??= createSupabaseBackend(getSupabase(), visitorSubmissionsEnabled); }
export const supabaseBackend: Backend = {
  mode: 'live', requiresCaptcha: true, submissionsEnabled: visitorSubmissionsEnabled,
  photosEnabled: false, countryAvailable: false,
  subscribe(limit, update, error) {
    try { return live().subscribe(limit, update, error); }
    catch { error('The visitor wall is not configured.'); return () => {}; }
  },
  async submitPublic(input) { return live().submitPublic(input); },
  async submitPrivate(input) { return (await import('./firebaseBackend')).firebaseBackend.submitPrivate(input); },
  async detectCountry() { return { code: null, name: null }; },
};
