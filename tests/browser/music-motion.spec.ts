import {test, expect} from '@playwright/test';
for(const width of [320,390,768,1440]) {
  test(`music selection, entrances and stable layout ${width}`,async({browser})=>{
    const context=await browser.newContext({viewport:{width,height:900},hasTouch:width<850,isMobile:width<850});
    const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
    let embeds=0;await page.route('https://open.spotify.com/embed/**',async route=>{embeds++;await route.fulfill({contentType:'text/html',body:'<html lang="en"><title>Provider test response</title></html>'});});
    await page.goto('./#projects');
    const heading=page.locator('.ps-intro');await expect(heading).toHaveAttribute('data-reveal-state','visible');
    const card=page.locator('.ps-project-card').first();await expect(card).toHaveAttribute('data-reveal-state','visible');
    const initial=await card.boundingBox();
    await page.locator('#about').evaluate(e=>e.scrollIntoView({behavior:'instant'}));
    await card.scrollIntoViewIfNeeded();await expect(card).toHaveAttribute('data-reveal-state','visible');
    expect(await card.evaluate(e=>e.getAnimations().length)).toBe(0);
    expect(Math.abs((await card.boundingBox())!.width-initial!.width)).toBeLessThan(1);
    for(const name of ['Certificates','Experience','Tech Stack','Projects']){
      await page.getByRole('tab',{name,exact:true}).click();
      await expect(page.getByRole('tab',{name,exact:true})).toHaveAttribute('aria-selected','true');
      const item=page.locator(name==='Certificates'?'.ps-document-card':name==='Experience'?'.ps-timeline-item':name==='Tech Stack'?'.ps-stack-group':'.ps-project-card').first();
      await item.scrollIntoViewIfNeeded();await expect(item).toHaveAttribute('data-reveal-state','visible');
    }
    await page.locator('.mi-player').scrollIntoViewIfNeeded();await expect(page.locator('.mi-player')).toHaveAttribute('data-reveal-state','visible');
    expect(embeds).toBe(0);await expect(page.locator('.mi-player iframe')).toHaveCount(0);
    await expect(page.locator('.mi-card-badge')).toHaveCount(0);
    const library=await page.locator('.mi-player-library').boundingBox();const panel=await page.locator('.mi-player-center').boundingBox();
    if(width===1440)expect(panel!.x).toBeGreaterThan(library!.x+library!.width);
    else expect(panel!.y).toBeGreaterThan(library!.y);
    await page.getByRole('button',{name:'Affection Jinsang',exact:true}).focus();await page.keyboard.press('Enter');
    await expect(page.locator('.mi-player iframe')).toHaveAttribute('src',/3ukklzkdKjDzqkroiXTvf4\?theme=0$/);
    await expect(page.getByRole('button',{name:'Affection Jinsang',exact:true})).toHaveAttribute('aria-pressed','true');
    expect(await page.locator('.mi-player iframe').getAttribute('allow')).not.toContain('autoplay');expect(embeds).toBe(1);
    await expect(page.locator('.mi-player-note a')).toHaveAttribute('href','https://open.spotify.com/track/3ukklzkdKjDzqkroiXTvf4');
    await page.getByRole('button',{name:'Anime OST',exact:true}).click();await expect(page.locator('.mi-player iframe')).toHaveCount(0);
    await page.getByRole('button',{name:'Favorites',exact:true}).click();await expect(page.getByText('Personal favorites will appear here once selected.')).toBeVisible();
    await page.locator('#contact').evaluate(e=>e.scrollIntoView({behavior:'instant'}));await expect(page.locator('.contact__head')).toHaveAttribute('data-reveal-state','visible');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    expect(errors).toEqual([]);await context.close();
  });
}
test('direct hash refresh and animation fallbacks leave content readable',async({browser})=>{
  for(const mode of ['reduced','reveal-observer-failure','reveal-animation-failure']){
    const context=await browser.newContext({viewport:{width:390,height:900},reducedMotion:mode==='reduced'?'reduce':'no-preference'});
    await context.addInitScript(mode=>{
      if(mode==='reveal-observer-failure') {
        const NativeObserver=window.IntersectionObserver;
        window.IntersectionObserver=class extends NativeObserver {
          constructor(callback:IntersectionObserverCallback,options?:IntersectionObserverInit){
            if(options?.rootMargin==='0px 0px -24px 0px'||options?.threshold===0.15)throw new Error('Reveal observer unavailable');
            super(callback,options);
          }
        };
      }
      if(mode==='reveal-animation-failure') {
        const nativeAnimate=Element.prototype.animate;
        Element.prototype.animate=function(...args:Parameters<Element['animate']>){
          if(this.matches('.mi-header, .mi-card, .mi-player, .mi-portrait-wrap, .ps-intro, .ps-project-card, .contact__head'))throw new Error('Entrance animation unavailable');
          return nativeAnimate.apply(this,args);
        };
      }
    },mode);
    const page=await context.newPage();await page.goto('./#interests');await page.reload();
    await expect(page.locator('.mi-header')).toHaveAttribute('data-reveal-state','visible');
    expect(await page.locator('.mi-header').evaluate(e=>getComputedStyle(e).opacity)).toBe('1');
    await page.goto('./#about');await expect(page.locator('.about-card')).toHaveClass(/is-visible/);
    await expect(page.locator('.about-card__actions')).toHaveCSS('opacity','1');
    await page.locator('.about-card__btn--primary').focus();
    await page.locator('.about-card__btn--primary').evaluate(e=>(e as HTMLElement).blur());
    expect(await page.locator('.about-card__actions').evaluate(e=>getComputedStyle(e).animationName)).toBe('none');
    if(mode==='reduced')expect(await page.locator('.about-card__actions').evaluate(e=>getComputedStyle(e).animationName)).toBe('none');
    await context.close();
  }
});
