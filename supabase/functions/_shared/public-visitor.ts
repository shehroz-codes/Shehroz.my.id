import { isIP } from 'node:net';

export interface Country { code: string | null; name: string | null }
const unknown: Country = { code: null, name: null };

// Hosted Supabase's Cloudflare ingress overwrites this header. Never use a
// client-supplied X-Forwarded-For, country header, body IP or browser location.
// Self-hosted gateways must provide the same overwrite guarantee before use.
export function observedIp(req: Request): string | null {
  const ip = req.headers.get('cf-connecting-ip')?.trim() ?? '';
  if (!isIP(ip)) return null;
  return isIP(ip) === 6 ? new URL(`http://[${ip}]/`).hostname.slice(1, -1) : ip;
}

// Domain separation keeps device/network identities distinct. Only an HMAC is
// persisted, never the raw network address. The existing server key stays secret.
export async function visitorHash(kind: 'network' | 'visitor', value: string): Promise<string> {
  const secret = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}').default;
  if (typeof secret !== 'string' || secret.length < 32) throw new Error('Public visitor configuration missing');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`public-visitor:v1:${kind}:${value}`));
  return [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export function country(code: unknown): Country {
  if (typeof code !== 'string' || !/^[A-Z]{2}$/.test(code) || ['XX', 'ZZ', 'A1', 'A2'].includes(code)) return unknown;
  const name = new Intl.DisplayNames(['en'], { type: 'region' }).of(code);
  return name && name !== code ? { code, name } : unknown;
}

// Cache only pseudonymous keys and country, with a small bounded lifetime.
const cache = new Map<string, { value: Country; until: number }>();
export async function lookupCountry(ip: string, networkHash: string): Promise<Country> {
  const cached = cache.get(networkHash);
  if (cached && cached.until > Date.now()) return cached.value;
  let value = unknown;
  try {
    const response = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: AbortSignal.timeout(2000), redirect: 'error', headers: { Accept: 'application/json' },
    });
    if (response.ok) {
      const data = await response.json();
      // An explicit IP lookup must describe the observed visitor, not the server.
      if (!data.error && isIP(data.ip ?? '') && observedIp(new Request('https://local.invalid', { headers: { 'cf-connecting-ip': data.ip } })) === ip) value = country(data.country_code);
    }
  } catch { /* Country lookup is optional; publication must still work. */ }
  if (cache.size >= 256) cache.delete(cache.keys().next().value!);
  cache.set(networkHash, { value, until: Date.now() + (value.code ? 300000 : 30000) });
  return value;
}
