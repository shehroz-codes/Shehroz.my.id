import { withSupabase } from 'npm:@supabase/server@1.9.2';
import { authOptions, bucket, json, origin } from '../_shared/contact.ts';
export default { fetch: withSupabase(authOptions, async (req, ctx) => {
  if (req.headers.get('origin') && req.headers.get('origin') !== origin) return json({ error: 'Forbidden' }, 403);
  const id = ctx.userClaims?.id;
  if (!id || ctx.jwtClaims?.is_anonymous === true) return json({ error: 'Forbidden' }, 403);
  const admin = ctx.supabaseAdmin;
  const membership = await admin.from('portfolio_admins').select('user_id').eq('user_id', id).maybeSingle();
  if (membership.error || !membership.data) return json({ error: 'Forbidden' }, 403);
  if (req.method === 'GET') {
    const url = new URL(req.url); const page = Math.max(0, Math.min(10000, Number(url.searchParams.get('page')) || 0));
    const result = await admin.from('visitor_messages').select('id,name,text,created_at,status,has_photo')
      .order('created_at', { ascending: false }).order('id', { ascending: false }).range(page * 50, page * 50 + 49);
    return result.error ? json({ error: 'Unable to load messages' }, 500) : json({ messages: result.data });
  }
  let pending = 0;
  if (req.method === 'DELETE') {
    const messageId = new URL(req.url).searchParams.get('id');
    if (!messageId || !/^[0-9a-f-]{36}$/i.test(messageId)) return json({ error: 'Invalid message' }, 400);
    // Trigger queues its path in the same transaction. Access stops before object removal.
    const result = await admin.from('visitor_messages').delete().eq('id', messageId).select('photo_path');
    if (result.error) return json({ error: 'Unable to delete message' }, 500);
    for (const row of result.data ?? []) {
      if (!row.photo_path) continue;
      const removed = await admin.storage.from(bucket).remove([row.photo_path]);
      if (!removed.error) await admin.from('visitor_photo_cleanup').delete().eq('path', row.photo_path);
      else pending++;
    }
  } else if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  // Owner POST retries queued failures and abandoned uploads; never removes a referenced object.
  const queued = await admin.from('visitor_photo_cleanup').select('path').order('created_at', { ascending: true }).lt('created_at', new Date(Date.now() - 3600000).toISOString()).limit(100);
  for (const item of queued.data ?? []) {
    const linked = await admin.from('visitor_messages').select('id').eq('photo_path', item.path).limit(1);
    if (linked.error) { pending++; continue; }
    if (linked.data?.length) {
      await admin.from('visitor_photo_cleanup').delete().eq('path', item.path);
      continue;
    }
    const removed = await admin.storage.from(bucket).remove([item.path]);
    if (removed.error) { pending++; continue; }
    await admin.from('visitor_photo_cleanup').delete().eq('path', item.path);
  }
  return json({ success: true, cleanup_pending: pending, cleanup_error: Boolean(queued.error) });
}) };
