import { createClient } from 'npm:@supabase/supabase-js@2.119.0';
import { bucket, cors, json, origin } from '../_shared/contact.ts';
// Public image endpoint: UUID identifies a message, never a storage object or visitor.
// No bearer needed by <img>. Every request rechecks current publication state.
export default { async fetch(req: Request): Promise<Response> {
  if (req.headers.get('origin') && req.headers.get('origin') !== origin) return json({ error: 'Forbidden' }, 403);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  if (req.method !== 'GET') return json({ error: 'Method not allowed' }, 405);
  const id = new URL(req.url).searchParams.get('id');
  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return json({ error: 'Not found' }, 404);
  try {
    const keys = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}');
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, keys.default, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await admin.from('visitor_messages').select('photo_path').eq('id', id)
      .eq('status', 'published').eq('is_demo', false).maybeSingle();
    if (error || !data?.photo_path) return json({ error: 'Not found' }, 404);
    const photo = await admin.storage.from(bucket).download(data.photo_path);
    if (photo.error || !photo.data) return json({ error: 'Not found' }, 404);
    return new Response(photo.data, { headers: { ...cors, 'Content-Type': 'image/webp',
      'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return json({ error: 'Image unavailable' }, 503); }
} };
