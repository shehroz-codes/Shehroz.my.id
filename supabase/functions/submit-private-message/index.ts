import { withSupabase } from 'npm:@supabase/server@1.9.2';
import { authOptions, json, notifyTelegram, origin, verifyCaptcha } from '../_shared/contact.ts';
export default { fetch: withSupabase(authOptions, async (req, ctx) => {
  if (req.headers.get('origin') !== origin) return json({ error: 'Forbidden' }, 403);
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (Deno.env.get('PRIVATE_CONTACT_ENABLED') !== 'true' || !Deno.env.get('TURNSTILE_SECRET_KEY')) return json({ error: 'Private contact unavailable' }, 503);
  const userId = ctx.userClaims?.id;
  if (!userId || ctx.userClaims?.role !== 'authenticated') return json({ error: 'Invalid user' }, 401);
  try {
    const reader = req.body?.getReader(); if (!reader) return json({ error: 'Invalid request' }, 400);
    let size = 0; const chunks: Uint8Array[] = [];
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      size += value.length; if (size > 16000) { await reader.cancel(); return json({ error: 'Request too large' }, 413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const input = JSON.parse(new TextDecoder().decode(bytes));
    if (!input || Object.keys(input).some(k => !['name','email','subject','message','honeypot','turnstileToken'].includes(k))) return json({ error: 'Invalid fields' }, 400);
    for (const [key, min, max] of [['name',2,80],['email',3,120],['subject',3,100],['message',10,2000]] as const) {
      if (typeof input[key] !== 'string') return json({ error: 'Invalid fields' }, 400);
      input[key] = input[key].trim().normalize('NFC');
      if (input[key].length < min || input[key].length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(input[key])) return json({ error: 'Invalid fields' }, 400);
    }
    if (input.honeypot || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.email)) return json({ error: 'Invalid fields' }, 400);
    if (typeof input.turnstileToken !== 'string' || !await verifyCaptcha(input.turnstileToken, 'private-message')) return json({ error: 'Security check failed' }, 403);
    const result = await ctx.supabaseAdmin.rpc('receive_private_message', { p_user_id: userId,
      p_name: input.name, p_email: input.email, p_subject: input.subject, p_message: input.message });
    if (result.error) return json({ error: 'Unable to receive message' }, result.error.message.includes('COOLDOWN') ? 429 : 500);
    await notifyTelegram(`Private contact: ${input.name}\nSubject: ${input.subject}\nReceived: ${new Date().toISOString()}\nManage: https://supabase.com/dashboard/project/lctzkigzaudjiotopzye/editor`);
    return json({ success: true }, 201);
  } catch { return json({ error: 'Unable to receive message' }, 400); }
}) };
