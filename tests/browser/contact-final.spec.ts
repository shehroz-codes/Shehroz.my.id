import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';

const id = '00000000-0000-4000-8000-000000000001';
const text = 'A readable visitor message with enough detail to exercise wrapping and internal scrolling. '.repeat(4).slice(0,300);
async function fixtures(page: Page, count = 0, unavailableCountry = false) {
  const calls: { url: string; method: string; body: string | null }[] = [];
  let rows = Array.from({length: count},(_,i)=>({id:`00000000-0000-4000-8000-${String(i+2).padStart(12,'0')}`,name:`Visitor ${i+1}`,text,country_code:'NL',country_name:'Netherlands',created_at:'2026-11-17T00:00:00Z',has_photo:false}));
  const expires = Math.floor(Date.now()/1000)+3600;
  const jwt = [Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url'),Buffer.from(JSON.stringify({sub:id,exp:expires,aud:'authenticated',role:'authenticated'})).toString('base64url'),'test-signature'].join('.');
  await page.route('https://lctzkigzaudjiotopzye.supabase.co/**',async route=>{
    const req=route.request();calls.push({url:req.url(),method:req.method(),body:req.postData()});
    if(req.url().includes('/rest/v1/visitor_messages'))return route.fulfill({json:rows.slice(0,Number(new URL(req.url()).searchParams.get('limit')||6))});
    if(req.url().includes('/visitor-country'))return route.fulfill({json:unavailableCountry?{code:null,name:null}:{code:'NL',name:'Netherlands'}});
    if(req.url().includes('/submit-visitor-message')){
      rows.unshift({id,name:'New Visitor',text:'Public posting without a challenge',country_code:unavailableCountry?'': 'NL',country_name:unavailableCountry?'':'Netherlands',created_at:new Date().toISOString(),has_photo:false});
      return route.fulfill({json:{success:true,message_id:id}});
    }
    if(req.url().includes('/auth/v1/signup'))return route.fulfill({json:{access_token:jwt,refresh_token:'mock-refresh',token_type:'bearer',expires_in:3600,expires_at:expires,user:{id,aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{},is_anonymous:true,created_at:new Date().toISOString()}}});
    if(req.url().includes('/submit-private-message'))return route.fulfill({json:{success:true}});
    throw new Error(`Unmocked request ${req.method()} ${req.url()}`);
  });
  // Simulate only the existing private CAPTCHA. No public widget is supplied.
  await page.route('https://challenges.cloudflare.com/**',route=>route.fulfill({contentType:'application/javascript',body:`
    (() => { let next=0; const nodes=new Map(); window.turnstile={
      render(node,options){const id=String(++next),button=document.createElement('button');button.type='button';button.textContent='Verify '+options.action;button.onclick=()=>options.callback('private-test-token-'+Date.now());node.append(button);nodes.set(id,node);return id;},
      reset(){},remove(id){nodes.get(id)?.replaceChildren();nodes.delete(id);},getResponse(){return 'private-test-token';},isExpired(){return false;}
    };window[new URL(document.currentScript.src).searchParams.get('onload')]?.();})();` }));
  return calls;
}

for (const width of [320,390,768,1440]) {
  test(`two columns, compact public form and bounded message list at ${width}px (services mocked)`,async({page})=>{
    await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:'reduce'});
    const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    await fixtures(page,40);await page.goto('./#contact');await page.evaluate(()=>document.fonts.ready);
    await expect(page.locator('.msg')).toHaveCount(5);
    await page.locator('.contact-section .profile img').evaluate(i=>(i as HTMLImageElement).decode());
    const composer=page.getByRole('form',{name:'Write a public message'});
    await expect(composer.getByRole('button',{name:'Post Message'})).toBeEnabled();
    await expect(composer.getByRole('combobox')).toHaveCount(0);
    await expect(composer.locator('[id^="cf-turnstile"]')).toHaveCount(0);
    await expect(composer.getByText('Netherlands · Approximate network location')).toBeVisible();
    const before=await page.locator('.contact__columns').boundingBox();
    await page.getByRole('button',{name:'Load more messages'}).click();
    await expect(page.locator('.msg')).toHaveCount(10);
    const after=await page.locator('.contact__columns').boundingBox();
    if(width>=768){
      const left=(await page.locator('.contact__grid-row--top').boundingBox())!,right=(await page.locator('.contact__grid-row--bottom').boundingBox())!;
      expect(Math.abs(left.y+left.height-right.y-right.height)).toBeLessThanOrEqual(1);
      expect(Math.abs(before!.height-after!.height)).toBeLessThanOrEqual(2);
      expect(left.x+left.width).toBeLessThan(right.x);
    } else {
      const left=(await page.locator('.contact__grid-row--top').boundingBox())!,right=(await page.locator('.contact__grid-row--bottom').boundingBox())!;
      expect(left.y+left.height).toBeLessThan(right.y);
    }
    const list=page.getByRole('region',{name:'Visitor message list'});
    expect(await list.evaluate(el=>el.scrollHeight>el.clientHeight)).toBe(true);
    await expect(page.locator('.msg__text').first()).toHaveText(text);
    const flag=page.locator('.msg').first().locator('.msg__country');
    await expect(flag).toHaveText('🇳🇱Netherlands');
    expect(await flag.evaluate(el=>el.previousElementSibling?.classList.contains('msg__text'))).toBe(true);
    await list.focus();await page.keyboard.press('End');
    await expect.poll(()=>list.evaluate(el=>el.scrollTop)).toBeGreaterThan(0);
    const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,items:[...document.querySelectorAll('.contact-section *')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1);}).map(el=>({tag:el.tagName,class:el.className,id:el.id,width:el.getBoundingClientRect().width,right:el.getBoundingClientRect().right})).slice(0,12)}));
    expect(overflow.scroll<=overflow.width,JSON.stringify(overflow)).toBe(true);
    expect((await new AxeBuilder({page}).include('.contact-section').analyze()).violations).toEqual([]);
    await mkdir('artifacts/contact-final',{recursive:true});
    // Frame the component without a fixed navbar overlay in a stitched capture.
    await list.evaluate(el=>{el.scrollTop=0;(document.activeElement as HTMLElement)?.blur();});
    await page.mouse.move(0,0);await page.waitForTimeout(800);
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    const clip=(await page.locator('.contact-section').boundingBox())!;
    await page.screenshot({path:`artifacts/contact-final/contact-${width}.png`,clip,fullPage:true});
    expect(errors).toEqual([]);
  });
}

test('public post and refresh work without Auth or verification; private CAPTCHA remains mandatory (mocked)',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});const calls=await fixtures(page);
  await page.goto('./#contact');
  const form=page.getByRole('form',{name:'Write a public message'}),post=form.getByRole('button',{name:'Post Message'});
  await form.getByRole('textbox',{name:'Your name'}).fill('New Visitor');
  await form.getByRole('textbox',{name:/Your message/}).fill('Public posting without a challenge');
  await expect(post).toBeEnabled();await post.click();
  await expect(page.getByText('Your message is live on the visitor wall.')).toBeVisible();
  expect(calls.some(c=>c.url.includes('/auth/'))).toBe(false);
  const body=calls.find(c=>c.url.includes('/submit-visitor-message'))!.body!;
  expect(body).toContain('visitor_id');expect(body).not.toContain('turnstile');expect(body).not.toContain('country');
  await page.reload();await expect(page.getByText('New Visitor',{exact:true})).toBeVisible();
  await expect(page.locator('.msg__country')).toHaveText('🇳🇱Netherlands');await expect(post).toBeDisabled();
  const privateForm=page.getByRole('form',{name:'Send a private message'}),send=privateForm.getByRole('button',{name:'Send Message'});
  await privateForm.getByRole('textbox',{name:'Full name'}).fill('Private Visitor');
  await privateForm.getByRole('textbox',{name:'Email address'}).fill('review@example.test');
  await privateForm.getByRole('textbox',{name:'Subject'}).fill('Private contact test');
  await privateForm.getByRole('textbox',{name:'Message',exact:true}).fill('Private contact retains its verification.');
  await expect(send).toBeDisabled();
  await privateForm.getByRole('button',{name:'Verify private-message'}).click();await send.click();
  await expect(page.getByText('Your visitor session is ready. Please verify again to send your private message.')).toBeVisible();
  expect(calls.some(c=>c.url.includes('/submit-private-message'))).toBe(false);
  await privateForm.getByRole('button',{name:'Verify private-message'}).click();await send.click();
  await expect(page.getByText('Your private message was received securely.')).toBeVisible();
  expect(calls.filter(c=>c.url.includes('/submit-private-message'))).toHaveLength(1);
});
test('country failure never prevents a public post (mocked)',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await fixtures(page,0,true);await page.goto('./#contact');
  const form=page.getByRole('form',{name:'Write a public message'});
  await expect(form.getByText('Country unavailable')).toBeVisible();
  await form.getByRole('textbox',{name:'Your name'}).fill('New Visitor');await form.getByRole('textbox',{name:/Your message/}).fill('Public posting without a challenge');
  await form.getByRole('button',{name:'Post Message'}).click();await expect(page.getByText('Your message is live on the visitor wall.')).toBeVisible();
});
