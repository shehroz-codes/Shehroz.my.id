// Exact production origins only; never reflect arbitrary Origin headers.
export const origin = 'https://shehroz-codes.github.io';
export const productionOrigins = new Set([origin, 'https://shehroz.my.id']);
export function isProductionOrigin(value: string | null): value is string {
  return value !== null && productionOrigins.has(value);
}
export function corsHeaders(value: string | null) {
  return {
    ...(isProductionOrigin(value) ? { 'Access-Control-Allow-Origin': value } : {}),
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-retry-count, traceparent, tracestate, baggage',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    Vary: 'Origin',
  };
}
export function withProductionCors(
  handler: (req: Request) => Response | Promise<Response>,
  { allowMissingOrigin = false }: { allowMissingOrigin?: boolean } = {},
) {
  return async (req: Request): Promise<Response> => {
    const value = req.headers.get('origin');
    const headers = corsHeaders(value);
    if (!isProductionOrigin(value) && !(allowMissingOrigin && value === null)) {
      return Response.json({ error: 'Origin not allowed' }, {
        status: 403, headers: { ...headers, 'Cache-Control': 'no-store' },
      });
    }
    // Preflight has no visitor JWT. Actual requests still run the original auth gate.
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    let response: Response;
    try { response = await handler(req); }
    catch { response = Response.json({ error: 'Service unavailable' }, { status: 500, headers: { 'Cache-Control': 'no-store' } }); }
    const output = new Headers(response.headers);
    output.delete('Access-Control-Allow-Origin');
    for (const [name, value] of Object.entries(headers)) {
      if (name !== 'Vary') output.set(name, value);
    }
    const vary = output.get('Vary')?.split(',').map(v => v.trim()).filter(Boolean) ?? [];
    if (!vary.some(v => v.toLowerCase() === 'origin')) vary.push('Origin');
    output.set('Vary', vary.join(', '));
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers: output });
  };
}
