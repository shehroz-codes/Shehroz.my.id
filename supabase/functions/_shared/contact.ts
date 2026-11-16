import { origin, isProductionOrigin, corsHeaders } from './origins.ts';
export { origin, withProductionCors } from './origins.ts';
export const cors = corsHeaders(origin);
export const authOptions = { auth: 'user' as const, errors: { detailed: false }, audience: 'authenticated',
  issuer: 'https://lctzkigzaudjiotopzye.supabase.co/auth/v1', cors: 'disabled' as const };
export const bucket = 'visitor-photos-private';
export function json(data: Record<string, unknown>, status = 200) {
  return Response.json(data, { status, headers: { ...cors, 'Cache-Control': 'no-store' } });
}
export async function notifyTelegram(text: string): Promise<void> {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN'); const chat = Deno.env.get('TELEGRAM_CHAT_ID');
  if (!token || !chat) { console.warn('Telegram notification not configured'); return; }
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text, link_preview_options: { is_disabled: true } }),
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok || (await response.json()).ok !== true) console.warn('Telegram notification failed');
  } catch { console.warn('Telegram notification failed'); }
}
export async function verifyCaptcha(token: string, action: string, requestOrigin: string = origin): Promise<boolean> {
  if (!isProductionOrigin(requestOrigin)) return false;
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY'); if (!secret || !token || token.length > 4096) return false;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST', body: new URLSearchParams({ secret, response: token }), signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.success === true && result.hostname === new URL(requestOrigin).hostname && result.action === action;
  } catch { return false; }
}
