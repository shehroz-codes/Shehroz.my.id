// @vitest-environment node
import { beforeAll,beforeEach,afterEach,expect,it,vi } from 'vitest';
import { exportJWK,generateKeyPair,SignJWT } from 'jose';
import contact from '../supabase/functions/submit-private-message/index';
const project='https://lctzkigzaudjiotopzye.supabase.co';
const id='00000000-0000-4000-8000-000000000001';
let valid:string,expired:string,tampered:string,jwks:string,remote:ReturnType<typeof vi.fn>,captcha=true;
beforeAll(async()=>{
 const pair=await generateKeyPair('ES256');const jwk={...await exportJWK(pair.publicKey),kid:'contact-test',alg:'ES256'};jwks=JSON.stringify({keys:[jwk]});
 const sign=(expiry:number,key=pair.privateKey)=>new SignJWT({sub:id,role:'authenticated',is_anonymous:true}).setProtectedHeader({alg:'ES256',kid:jwk.kid}).setAudience('authenticated').setIssuer(`${project}/auth/v1`).setExpirationTime(expiry).sign(key);
 valid=await sign(Math.floor(Date.now()/1000)+3600);expired=await sign(1);tampered=await sign(Math.floor(Date.now()/1000)+3600,(await generateKeyPair('ES256')).privateKey);
});
beforeEach(()=>{
 const env:Record<string,string>={SUPABASE_URL:project,SUPABASE_JWKS:jwks,SUPABASE_PUBLISHABLE_KEYS:'{"default":"sb_publishable_test"}',SUPABASE_SECRET_KEYS:'{"default":"sb_secret_test"}',PRIVATE_CONTACT_ENABLED:'true',TURNSTILE_SECRET_KEY:'test-only'};
 vi.stubGlobal('Deno',{env:{get:(key:string)=>env[key]}});captcha=true;
 remote=vi.fn(async(url:string)=>url.includes('siteverify')?Response.json({success:captcha,hostname:'shehroz-codes.github.io',action:'private-message'}):Response.json(id));vi.stubGlobal('fetch',remote);
});
afterEach(()=>vi.unstubAllGlobals());
function request(token:string|null=valid,withCaptcha=true){return new Request(`${project}/functions/v1/submit-private-message`,{method:'POST',headers:{Origin:'https://shehroz-codes.github.io','Content-Type':'application/json',apikey:'sb_publishable_test',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify({name:'Private Visitor',email:'review@example.test',subject:'Private message',message:'A secure private contact test',honeypot:'',...(withCaptcha?{turnstileToken:'private-token'}:{})})});}
it('private endpoint still requires a real signed, unexpired user JWT',async()=>{
 for(const token of [null,'sb_publishable_test','invalid',expired,tampered])expect((await contact.fetch(request(token))).status).toBe(401);
 expect(remote).not.toHaveBeenCalled();
});
it('private endpoint still rejects missing or invalid CAPTCHA before delivery',async()=>{
 expect((await contact.fetch(request(valid,false))).status).toBe(403);captcha=false;expect((await contact.fetch(request())).status).toBe(403);expect(remote.mock.calls.some(([url])=>String(url).includes('receive_private_message'))).toBe(false);
});
it('private endpoint retains CAPTCHA verification and authenticated delivery',async()=>{
 expect((await contact.fetch(request())).status).toBe(201);expect(remote.mock.calls.some(([url])=>String(url).includes('siteverify'))).toBe(true);expect(remote.mock.calls.some(([url])=>String(url).includes('receive_private_message'))).toBe(true);
});
