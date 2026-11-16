// @vitest-environment node
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {withProductionCors} from '../supabase/functions/_shared/origins';
import {verifyCaptcha} from '../supabase/functions/_shared/contact';
const origins=['https://shehroz-codes.github.io','https://shehroz.my.id'];
beforeEach(()=>vi.stubGlobal('Deno',{env:{get:()=> 'isolated-test-secret'}}));
afterEach(()=>vi.unstubAllGlobals());
it.each(origins)('answers preflight for exact allowed origin %s without invoking auth/business code',async origin=>{
 const handler=vi.fn();const response=await withProductionCors(handler)(new Request('https://api.example.test',{method:'OPTIONS',headers:{Origin:origin}}));
 expect(response.status).toBe(204);expect(response.headers.get('access-control-allow-origin')).toBe(origin);expect(response.headers.get('vary')).toContain('Origin');expect(handler).not.toHaveBeenCalled();
});
it.each([undefined,'null','http://shehroz.my.id','https://shehroz.my.id:444','https://shehroz.my.id.attacker.test','https://attacker.test'])('fails closed for unsupported submission origin %s',async origin=>{
 const handler=vi.fn();const response=await withProductionCors(handler)(new Request('https://api.example.test',{method:'POST',headers:origin?{Origin:origin}:{}}));
 expect(response.status).toBe(403);expect(response.headers.get('access-control-allow-origin')).toBeNull();expect(handler).not.toHaveBeenCalled();
});
it.each(origins)('adds CORS to authentication errors without changing status for %s',async origin=>{
 const response=await withProductionCors(()=>Response.json({error:'Unauthorized'},{status:401,headers:{Vary:'Accept-Encoding'}}))(new Request('https://api.example.test',{headers:{Origin:origin}}));
 expect(response.status).toBe(401);expect(response.headers.get('access-control-allow-origin')).toBe(origin);expect(response.headers.get('vary')).toContain('Accept-Encoding');
});
it('preserves missing-Origin CLI/image requests without bypassing the underlying handler',async()=>{
 const handler=vi.fn(()=>new Response('denied',{status:401}));const response=await withProductionCors(handler,{allowMissingOrigin:true})(new Request('https://api.example.test'));
 expect(handler).toHaveBeenCalledTimes(1);expect(response.status).toBe(401);expect(response.headers.get('access-control-allow-origin')).toBeNull();
});
it('sanitizes exceptions while retaining correct CORS and no-store',async()=>{
 const response=await withProductionCors(()=>{throw new Error('sensitive server details')})(new Request('https://api.example.test',{headers:{Origin:origins[1]}}));
 expect(response.status).toBe(500);expect(await response.text()).not.toContain('sensitive');expect(response.headers.get('access-control-allow-origin')).toBe(origins[1]);expect(response.headers.get('cache-control')).toBe('no-store');
});
it.each(origins)('binds CAPTCHA to the request hostname and required action for %s',async origin=>{
 const remote=vi.fn(async()=>Response.json({success:true,hostname:new URL(origin).hostname,action:'private-message'}));vi.stubGlobal('fetch',remote);
 expect(await verifyCaptcha('fresh-token','private-message',origin)).toBe(true);
 remote.mockResolvedValue(Response.json({success:true,hostname:'attacker.test',action:'private-message'}));expect(await verifyCaptcha('fresh-token','private-message',origin)).toBe(false);
 remote.mockResolvedValue(Response.json({success:true,hostname:new URL(origin).hostname,action:'visitor-message'}));expect(await verifyCaptcha('fresh-token','private-message',origin)).toBe(false);
});
it('does not contact CAPTCHA provider for an unapproved origin',async()=>{
 const remote=vi.fn();vi.stubGlobal('fetch',remote);expect(await verifyCaptcha('fresh-token','private-message','https://attacker.test')).toBe(false);expect(remote).not.toHaveBeenCalled();
});
