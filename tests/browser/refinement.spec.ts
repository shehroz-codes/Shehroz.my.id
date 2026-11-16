import {test,expect} from '@playwright/test';
for(const width of [320,390,768,1440]) test(`refinement navigation and layout ${width}`,async({browser})=>{
 const context=await browser.newContext({viewport:{width,height:900},isMobile:width<850,hasTouch:width<850,reducedMotion:'reduce'});const page=await context.newPage();
 await page.goto('./');
 expect(await page.locator('.hero-actions a').filter({hasText:'Contact Me'}).getAttribute('href')).toBe('#contact');
 await page.getByRole('link',{name:'View Projects'}).focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(/#projects$/);
 expect(await page.evaluate(()=>['about','projects','interests','contact'].map(id=>document.getElementById(id)!.getBoundingClientRect().top))).toEqual(expect.arrayContaining([expect.any(Number)]));
 const order=await page.locator('.portfolio-sections > .portfolio-section-anchor').evaluateAll(nodes=>nodes.map(n=>n.id));expect(order).toEqual(['about','projects','interests','contact']);
 for(const id of ['home','about','projects','interests','skills','contact']) {
  await page.goto(`./#${id}`);await expect(page.locator(`#${id}`)).toBeAttached();
  if(id==='skills')await expect(page.getByRole('tab',{name:'Tech Stack',exact:true})).toHaveAttribute('aria-selected','true');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 const top=page.getByRole('link',{name:'Back to top'});await top.focus();await page.keyboard.press('Enter');await expect(page.locator('#home')).toBeFocused();await expect(page).toHaveURL(/#home$/);
 await page.goto('./#projects');const details=page.getByRole('button',{name:/View details for/}).first();await details.click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(details).toBeFocused();
 expect(await page.locator('.ps-card-description').first().evaluate(e=>parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(14);
 await context.close();
});
