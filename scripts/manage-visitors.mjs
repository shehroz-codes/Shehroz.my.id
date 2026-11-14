// Owner-only command-line client. Credentials stay in this process; no stored session.
import { createClient } from '@supabase/supabase-js';
const url = 'https://lctzkigzaudjiotopzye.supabase.co';
const key = process.env.SUPABASE_PUBLISHABLE_KEY;
const email = process.env.SUPABASE_OWNER_EMAIL;
const password = process.env.SUPABASE_OWNER_PASSWORD;
const ownerToken = process.env.SUPABASE_OWNER_ACCESS_TOKEN;
const [command = 'list', value] = process.argv.slice(2);
if (!['list', 'delete', 'cleanup'].includes(command) || !key || (!ownerToken && (!email || !password))) {
  console.error('Set SUPABASE_PUBLISHABLE_KEY and SUPABASE_OWNER_ACCESS_TOKEN (or SUPABASE_OWNER_EMAIL and SUPABASE_OWNER_PASSWORD). Usage: node scripts/manage-visitors.mjs list [page] | delete <message UUID> | cleanup');
  process.exit(1);
}
if (command === 'delete' && !/^[0-9a-f-]{36}$/i.test(value ?? '')) {
  console.error('A valid message UUID is required.'); process.exit(1);
}
const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
let accessToken = ownerToken;
if (!accessToken) {
  const auth = await client.auth.signInWithPassword({ email, password });
  if (auth.error || !auth.data.session) { console.error('Owner sign-in failed.'); process.exit(1); }
  accessToken = auth.data.session.access_token;
}
try {
  const endpoint = new URL(`${url}/functions/v1/manage-visitor-messages`);
  if (command === 'delete') endpoint.searchParams.set('id', value);
  if (command === 'list') endpoint.searchParams.set('page', String(Math.max(0, parseInt(value ?? '0', 10) || 0)));
  const response = await fetch(endpoint, { method: command === 'list' ? 'GET' : command === 'delete' ? 'DELETE' : 'POST',
    headers: { apikey: key, Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) { console.error(`Owner operation failed (${response.status}).`); process.exitCode = 1; }
  else console.log(JSON.stringify(await response.json(), null, 2));
} finally { if (!ownerToken) await client.auth.signOut({ scope: 'local' }); }
