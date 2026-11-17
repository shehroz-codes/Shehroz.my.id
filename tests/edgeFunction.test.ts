// @vitest-environment node
import { afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { ImageMagick, initializeImageMagick, MagickFormat } from '@imagemagick/magick-wasm';
vi.mock('../supabase/functions/_shared/photo.ts', async () => import('../supabase/functions/_shared/decode-photo'));
import edge from '../supabase/functions/submit-visitor-message/index';
import location from '../supabase/functions/visitor-country/index';
// Actual SDK publishable-key gate, HMAC and image decoder; remote services mocked.
const id='00000000-0000-4000-8000-000000000001', origin='https://shehroz-codes.github.io', ip='203.0.113.5';
let env:Record<string,string>,remote:ReturnType<typeof vi.fn>,photo:Uint8Array,salt=0;
let quota:boolean,geoFails:boolean,publishFails:boolean;
beforeAll(async()=>{
 await initializeImageMagick(await readFile(new URL('../node_modules/@imagemagick/magick-wasm/dist/magick.wasm',import.meta.url)));
 photo=ImageMagick.read(await readFile(new URL('../src/sections/components/showcase/assets/project-1.webp',import.meta.url)),image=>{image.resize(160,160);image.extent(160,160);return image.write(MagickFormat.WebP,bytes=>new Uint8Array(bytes));});
});
beforeEach(()=>{
 env={SUPABASE_URL:'https://lctzkigzaudjiotopzye.supabase.co',SUPABASE_PUBLISHABLE_KEYS:'{"default":"sb_publishable_test"}',SUPABASE_SECRET_KEYS:JSON.stringify({default:`sb_secret_test_only_long_hash_key_${++salt}`}),VISITOR_SUBMISSIONS_ENABLED:'true'};
 vi.stubGlobal('Deno',{env:{get:(name:string)=>env[name]}});quota=true;geoFails=false;publishFails=false;
 remote=vi.fn(async(url:string|URL|Request)=>{
  const path=String(url);
  if(path.includes('consume_public_visitor_request'))return Response.json(quota);
  if(path.includes('publish_public_visitor_message'))return publishFails?Response.json({message:'COOLDOWN',code:'P0001'},{status:400}):Response.json(id);
  if(path.startsWith('https://ipapi.co/'))return geoFails?new Response('',{status:503}):Response.json({ip,country_code:'PK',country_name:'Ignored provider name'});
  if(path.includes('visitor_photo_cleanup'))return new Response(null,{status:204});
  if(path.includes('/storage/v1/object/'))return Response.json({Key:'test'});
  if(path.includes('api.telegram.org'))throw new Error('offline');
  throw new Error('Unexpected external request');
 });vi.stubGlobal('fetch',remote);
});
afterEach(()=>vi.unstubAllGlobals());
function request(fields:Record<string,string>={},headers:Record<string,string>={}){
 const body=new FormData();for(const [key,value]of Object.entries({name:'Visitor',text:'Hello',visitor_id:id,website:'',...fields}))body.append(key,value);
 return new Request('https://example.test/functions/v1/submit-visitor-message',{method:'POST',headers:{Origin:origin,apikey:'sb_publishable_test','cf-connecting-ip':ip,...headers},body});
}
it('publishes without JWT, CAPTCHA secret/token or anonymous Auth',async()=>{
 const response=await edge.fetch(request());expect(response.status).toBe(201);expect((await response.json()).message_id).toBe(id);
 expect(remote.mock.calls.some(([url])=>/turnstile|siteverify|\/auth\//.test(String(url)))).toBe(false);
 const body=JSON.parse(remote.mock.calls.find(([url])=>String(url).includes('publish_public_visitor_message'))![1].body);
 expect(body).toMatchObject({p_name:'Visitor',p_text:'Hello',p_country_code:'PK',p_country_name:'Pakistan'});
 expect(body.p_visitor_hash).toMatch(/^[a-f0-9]{64}$/);expect(JSON.stringify(body)).not.toContain(ip);
});
it('rejects invalid keys and forbidden origins before remote calls',async()=>{
 expect((await edge.fetch(request({},{apikey:'wrong'}))).status).toBe(401);
 expect((await edge.fetch(request({},{Origin:'https://attacker.test'}))).status).toBe(403);expect(remote).not.toHaveBeenCalled();
});
it('requires platform IP metadata and ignores forwarded IP fallback',async()=>{
 expect((await edge.fetch(request({},{'cf-connecting-ip':'','x-forwarded-for':ip,'cf-ipcountry':'PK'}))).status).toBe(503);expect(remote).not.toHaveBeenCalled();
});
it.each([{name:''},{name:'x'.repeat(81)},{text:'x'.repeat(301)},{text:'a\u0000b'},{website:'spam'},{visitor_id:'fake'},{country_code:'US'},{turnstile_token:'obsolete'}])('rejects invalid/client-controlled fields %j',async fields=>{
 expect((await edge.fetch(request(fields))).status).toBe(400);expect(remote.mock.calls.some(([url])=>String(url).includes('publish_public_visitor_message'))).toBe(false);
});
it('preserves write gate and applies quota before expensive work',async()=>{
 env.VISITOR_SUBMISSIONS_ENABLED='false';expect((await edge.fetch(request())).status).toBe(503);expect(remote).not.toHaveBeenCalled();
 env.VISITOR_SUBMISSIONS_ENABLED='true';quota=false;const response=await edge.fetch(request());expect(response.status).toBe(429);expect((await response.json()).code).toBe('RATE_LIMIT');expect(remote).toHaveBeenCalledTimes(1);
});
it('publishes when lookup fails and preserves atomic cooldown rejection',async()=>{
 geoFails=true;expect((await edge.fetch(request())).status).toBe(201);
 const body=JSON.parse(remote.mock.calls.find(([url])=>String(url).includes('publish_public_visitor_message'))![1].body);expect(body.p_country_code).toBeNull();expect(body.p_country_name).toBeNull();
 publishFails=true;expect((await edge.fetch(request())).status).toBe(429);
});
it('ignores forged country and forwarding headers without leaking server keys to lookup',async()=>{
 expect((await edge.fetch(request({},{'cf-ipcountry':'US','x-country-code':'US','x-forwarded-for':'8.8.8.8'}))).status).toBe(201);
 const geo=remote.mock.calls.find(([url])=>String(url).includes('ipapi.co'))!;expect(geo[0]).toBe(`https://ipapi.co/${ip}/json/`);expect(geo[1].headers).toEqual({Accept:'application/json'});
});
it('country endpoint returns canonical country without a raw IP',async()=>{
 const response=await location.fetch(new Request('https://example.test/functions/v1/visitor-country',{headers:{Origin:origin,apikey:'sb_publishable_test','cf-connecting-ip':ip,'cf-ipcountry':'US'}}));expect(await response.json()).toEqual({code:'PK',name:'Pakistan'});
});
it('uses a changed observed VPN exit IP country at submission, not a prior client country',async()=>{
 const original=remote.getMockImplementation()!;
 remote.mockImplementation(async(url,options)=>String(url).startsWith('https://ipapi.co/')?Response.json({ip:'203.0.113.6',country_code:'NL'}):original(url,options));
 expect((await edge.fetch(request({},{'cf-connecting-ip':'203.0.113.6','cf-ipcountry':'US'}))).status).toBe(201);
 const body=JSON.parse(remote.mock.calls.find(([url])=>String(url).includes('publish_public_visitor_message'))![1].body);expect(body.p_country_code).toBe('NL');expect(body.p_country_name).toBe('Netherlands');
});
it('enforces streamed body bounds',async()=>{
 const req=request();const headers=new Headers(req.headers);headers.set('content-type','multipart/form-data; boundary=x');expect((await edge.fetch(new Request(req.url,{method:'POST',headers,body:new Uint8Array(110*1024)}))).status).toBe(413);
});
it('decodes photos, queues cleanup before upload and cleans up failed publication',async()=>{
 async function withPhoto(){const req=request(),body=await req.formData();body.append('photo',new File([photo],'photo.webp',{type:'image/webp'}));const headers=new Headers(req.headers);headers.delete('content-type');return new Request(req.url,{method:'POST',headers,body});}
 expect((await edge.fetch(await withPhoto())).status).toBe(201);const paths=remote.mock.calls.map(([url])=>String(url));expect(paths.findIndex(p=>p.includes('visitor_photo_cleanup'))).toBeLessThan(paths.findIndex(p=>p.includes('/storage/')));
 publishFails=true;expect((await edge.fetch(await withPhoto())).status).toBe(429);expect(remote.mock.calls.some(([url,options])=>String(url).includes('/storage/')&&options.method==='DELETE')).toBe(true);
});
it('rejects malformed photo content',async()=>{
 const req=request(),body=await req.formData();body.append('photo',new File(['invalid'],'photo.webp',{type:'image/webp'}));const headers=new Headers(req.headers);headers.delete('content-type');expect((await edge.fetch(new Request(req.url,{method:'POST',headers,body}))).status).toBe(400);
});
it('notification transport cannot reverse committed publication',async()=>{
 env.TELEGRAM_BOT_TOKEN='test-only';env.TELEGRAM_CHAT_ID='test-only';expect((await edge.fetch(request())).status).toBe(201);
});
