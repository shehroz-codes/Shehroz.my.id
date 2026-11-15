import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname } from 'node:path';

const [destination = 'artifacts/performance/about-immediate.json'] = process.argv.slice(2);
await mkdir(dirname(destination), { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] });
const results = [];
// Resume an interrupted task without repeating completed baseline measurements.
const builds = [['baseline', 4181], ['optimized', 4180]].filter(([label]) => !process.env.PERF_BUILDS || process.env.PERF_BUILDS.split(',').includes(label));
if (!builds.length) throw new Error('PERF_BUILDS must include baseline or optimized');
for (const profile of ['desktop', 'low-end']) {
  for (let repetition = 1; repetition <= 2; repetition++) {
    for (const [label, port] of builds) {
      const context = await browser.newContext({ viewport: profile === 'desktop' ? { width: 1440, height: 900 } : { width: 390, height: 844 }, isMobile: profile !== 'desktop', hasTouch: profile !== 'desktop', deviceScaleFactor: profile === 'desktop' ? 1 : 2 });
      const page = await context.newPage();
      const session = await context.newCDPSession(page);
      await session.send('Network.enable');
      if (profile === 'low-end') {
        await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
        await session.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 93750, connectionType: 'cellular3g' });
      }
      await page.goto(`http://127.0.0.1:${port}/Shehroz.my.id/`, { waitUntil: 'domcontentloaded' });
      const scroll = await page.locator('#about').evaluate(el => { const now = performance.now(); el.scrollIntoView({ behavior: 'instant', block: 'start' }); return now; });
      await page.waitForFunction(() => document.querySelector('.about-card.is-visible'));
      const reveal = await page.evaluate(() => performance.now());
      await page.locator('.profile-card__photo').evaluate(image => image.decode());
      const image = await page.evaluate(() => performance.now());
      await page.waitForFunction(() => getComputedStyle(document.querySelector('.about-card__actions')).opacity === '1');
      const complete = await page.evaluate(() => performance.now());
      const row = { label, profile, repetition, scroll, revealAfterScroll: reveal - scroll, portraitAfterScroll: image - scroll, completeAfterScroll: complete - scroll, completeFromNavigation: complete };
      console.log(JSON.stringify(row)); results.push(row);
      await writeFile(destination, JSON.stringify(results, null, 2));
      await context.close();
    }
  }
}
await browser.close();
