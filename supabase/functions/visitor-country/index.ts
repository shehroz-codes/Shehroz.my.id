import { withSupabase } from 'npm:@supabase/server@1.9.2';
import { withProductionCors } from '../_shared/origins.ts';
import { observedIp, visitorHash, lookupCountry } from '../_shared/public-visitor.ts';

export default { fetch: withProductionCors(withSupabase(
  { auth: 'publishable', errors: { detailed: false }, cors: 'disabled' },
  async (req, ctx) => {
    const headers = { 'Cache-Control': 'no-store' };
    if (req.method !== 'GET') return Response.json({ error: 'Method not allowed' }, { status: 405, headers });
    try {
      const ip = observedIp(req);
      if (!ip) return Response.json({ code: null, name: null }, { headers });
      const networkHash = await visitorHash('network', ip);
      const permit = await ctx.supabaseAdmin.rpc('consume_public_visitor_request', { p_network_hash: networkHash, p_purpose: 'country' });
      if (permit.error || permit.data !== true) return Response.json({ code: null, name: null }, { headers });
      return Response.json(await lookupCountry(ip, networkHash), { headers });
    } catch { return Response.json({ code: null, name: null }, { headers }); }
  },
)) };
