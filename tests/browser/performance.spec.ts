import { expect, test } from '@playwright/test';

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`production Hero drag and flip at ${viewport.width}px`, async ({ browser }) => {
    const mobile = viewport.width === 390;
    const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
    const page = await context.newPage();
    const errors: string[] = [], failures: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('requestfailed', request => {
      // The environment's proxy cannot reach Spotify artwork. The existing
      // image onError handles that failure; no external link is opened here.
      if (!request.url().includes('spotifycdn.com')) failures.push(`${request.url()}: ${request.failure()?.errorText}`);
    });
    await page.goto('./');
    await expect(page.locator('#hero-title')).toBeVisible();
    const lanyard = page.locator('.lanyard');
    await expect(lanyard).toHaveAttribute('data-mode', 'webgl', { timeout: 75_000 });
    await expect(lanyard.locator('canvas')).toBeVisible();

    // Locate the moving card through its real raycast hover cursor, rather
    // than dispatching synthetic events or assuming a fixed simulation pose.
    async function findCard() {
      const region = mobile ? { x: 80, y: 170, w: 230, h: 230 } : { x: 740, y: 220, w: 300, h: 300 };
      // Try interior points first: the badge keeps moving between protocol
      // calls, so a silhouette-edge hit can disappear before pointerdown.
      for (const point of mobile ? [{ x: 195, y: 300 }, { x: 195, y: 250 }] : [{ x: 870, y: 350 }, { x: 900, y: 400 }]) {
        await page.mouse.move(point.x, point.y);
        if (await lanyard.locator('canvas').evaluate(canvas => canvas.style.cursor === 'grab')) return point;
      }
      for (let y = region.y; y <= region.y + region.h; y += 40) {
        for (let x = region.x; x <= region.x + region.w; x += 40) {
          await page.mouse.move(x, y);
          if (await lanyard.locator('canvas').evaluate(canvas => canvas.style.cursor === 'grab')) return { x, y };
        }
      }
      throw new Error('The real lanyard raycast did not find a draggable card');
    }
    const point = await findCard();
    await page.mouse.down();
    await expect(lanyard.locator('canvas')).toHaveCSS('cursor', 'grabbing');
    await page.mouse.move(point.x + 35, point.y + 25, { steps: 5 });
    await page.mouse.up();
    // Reacquire after release: inertia can move the simulated card between
    // hit testing and a protocol click, especially with software WebGL.
    for (let attempt = 0; attempt < 5 && await lanyard.getAttribute('data-side') !== 'back'; attempt++) {
      const next = await findCard();
      await page.mouse.click(next.x, next.y);
    }
    await expect(lanyard).toHaveAttribute('data-side', 'back');

    if (mobile) {
      const touchPoint = await findCard();
      const input = await context.newCDPSession(page);
      await input.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: touchPoint.x, y: touchPoint.y, id: 1 }] });
      await expect(lanyard.locator('canvas')).toHaveCSS('cursor', 'grabbing');
      await input.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: touchPoint.x + 30, y: touchPoint.y + 20, id: 1 }] });
      await input.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      for (let attempt = 0; attempt < 5 && await lanyard.getAttribute('data-side') !== 'front'; attempt++) {
        const next = await findCard();
        await page.touchscreen.tap(next.x, next.y);
      }
      await expect(lanyard).toHaveAttribute('data-side', 'front');
    }

    // This existing informational button intentionally has aria-disabled but
    // still handles clicks to explain that no CV has been published.
    await page.getByRole('button', { name: /Download CV/ }).click({ force: true });
    await expect(page.getByRole('status').filter({ hasText: 'The CV has not been published yet.' })).toBeVisible();
    expect(errors).toEqual([]);
    expect(failures).toEqual([]);
    await context.close();
  });

  test(`production About, navigation and section interactions at ${viewport.width}px`, async ({ browser }) => {
    const mobile = viewport.width === 390;
    const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('./');
    // Keyboard activation hits the actual controls while their approved intro
    // and floating animations are running; no animation is disabled for tests.
    if (mobile) {
      await page.getByRole('button', { name: 'Open menu' }).focus();
      await page.keyboard.press('Enter');
    }
    await page.getByRole('link', { name: 'About', exact: true }).filter({ visible: true }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#about$/);
    await expect(page.locator('.about-card')).toHaveClass(/is-visible/);
    await expect(page.locator('.about-card__actions')).toHaveCSS('opacity', '1');
    const portrait = page.locator('.profile-card__photo');
    await portrait.evaluate(image => (image as HTMLImageElement).decode());
    expect(await portrait.evaluate(image => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const contact = page.getByRole('button', { name: 'Contact Muhammad Shehroz' });
    await expect(contact).toBeEnabled();
    const aboutBox = await page.locator('.profile-card').boundingBox();
    if (!mobile && aboutBox) {
      await page.mouse.move(aboutBox.x + aboutBox.width * 0.8, aboutBox.y + aboutBox.height * 0.3);
      await expect.poll(() => page.locator('.profile-card').evaluate(el => Number(el.style.getPropertyValue('--pc-active')))).toBeGreaterThan(0.1);
    }
    // Check both published About destinations without navigating externally.
    expect(await page.locator('.about-card__btn--primary').getAttribute('href')).toBe('https://github.com/shehroz-codes');
    await page.route('https://github.com/shehroz-codes', route => route.fulfill({ contentType: 'text/plain', body: 'Local navigation verification' }));
    await contact.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('https://github.com/shehroz-codes');
    await page.goBack();

    const interestPortrait = page.getByRole('img', { name: 'Shehroz — hover to reveal the anime ninja version of my portrait' });
    await interestPortrait.evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await page.waitForFunction(() => (document.querySelector('.hp-canvas') as HTMLCanvasElement)?.width > 300);
    await interestPortrait.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Favorites', exact: true }).click();
    await expect(page.getByText('Your personal Hindi, Urdu, English, Anime and Lo-Fi favorites belong here.')).toBeVisible();
    await page.getByRole('tab', { name: 'Certificates', exact: true }).click();
    await expect(page.getByRole('tab', { name: 'Certificates', exact: true })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('tab', { name: 'Experience', exact: true })).toBeFocused();
    await page.getByRole('tab', { name: 'Tech Stack', exact: true }).click();
    await expect(page.getByRole('tab', { name: 'Tech Stack', exact: true })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('tab', { name: 'Projects', exact: true }).click();
    const details = page.getByRole('button', { name: /View details for/ });
    if (await details.count()) {
      await details.first().click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
    }
    expect(await page.locator('.hero-social-row a').count()).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
    await context.close();
  });
}

test('reduced motion keeps the existing static badge and skips Three.js', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('./');
  await expect(page.locator('.hero-lanyard-static img')).toBeVisible();
  await page.locator('.hero-lanyard-static img').evaluate(image => (image as HTMLImageElement).decode());
  await expect(page.locator('.lanyard-canvas')).toHaveCount(0);
  await page.locator('#about').evaluate(el => el.scrollIntoView({ behavior: 'instant', block: 'start' }));
  await expect(page.locator('.about-card__actions')).toHaveCSS('opacity', '1');
  await page.locator('.profile-card__photo').evaluate(image => (image as HTMLImageElement).decode());
  const card = page.locator('.profile-card');
  const box = await card.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box!.x + box!.width * 0.8, box!.y + box!.height * 0.3);
  // Existing lighting may respond, but reduced motion must keep tilt/parallax off.
  await expect.poll(() => card.evaluate(el => Number(el.style.getPropertyValue('--pc-active')))).toBeGreaterThan(0.1);
  const motion = await card.evaluate(el => ['--pc-rotate-x', '--pc-rotate-y', '--pc-shift-x', '--pc-shift-y'].map(name => parseFloat(el.style.getPropertyValue(name))));
  expect(motion.every(value => value === 0)).toBe(true);
  expect(requests.some(url => /Lanyard-.*\.js/.test(url))).toBe(false);
});
