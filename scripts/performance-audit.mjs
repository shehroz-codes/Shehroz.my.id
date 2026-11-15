import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

// Production lab measurements; component timings are custom, never field INP.
const [label = 'baseline', destination = 'artifacts/performance', baseURL = 'http://127.0.0.1:4180/Shehroz.my.id/'] = process.argv.slice(2);
await mkdir(destination, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] });
const profiles = [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  { name: 'mobile', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { name: 'low-end', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, throttle: true },
];
const results = [];
for (const profile of profiles) {
  for (let repetition = 1; repetition <= Number(process.env.PERF_RUNS || 2); repetition++) {
    const { name, throttle, ...options } = profile;
    const context = await browser.newContext(options);
    const page = await context.newPage();
    const session = await context.newCDPSession(page);
    await session.send('Network.enable');
    await session.send('Performance.enable');
    if (throttle) {
      await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await session.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 93750, connectionType: 'cellular3g' });
    }
    await page.addInitScript(() => {
      const lab = window.__perf = { lcp: null, cls: 0, longTasks: [], heroReady: null, aboutMounted: null, aboutRevealed: null, resources: [] };
      new PerformanceObserver(list => { for (const e of list.getEntries()) lab.lcp = { startTime: e.startTime, size: e.size, element: e.element?.className }; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) lab.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
      new PerformanceObserver(list => { for (const e of list.getEntries()) lab.longTasks.push({ startTime: e.startTime, duration: e.duration }); }).observe({ type: 'longtask', buffered: true });
      const observer = new MutationObserver(() => {
        if (!lab.heroReady && document.querySelector('.lanyard[data-ready="true"]')) lab.heroReady = performance.now();
        if (!lab.aboutMounted && document.querySelector('.about-card')) lab.aboutMounted = performance.now();
        if (!lab.aboutRevealed && document.querySelector('.about-card.is-visible')) lab.aboutRevealed = performance.now();
      });
      observer.observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'data-ready'] });
    });
    for (const cache of ['cold', 'warm']) {
      const errors = [], failures = [], consoleErrors = [];
      const requests = new Set();
      const onRequest = request => requests.add(request);
      const onError = error => errors.push(error.message);
      // A warm navigation can cancel an offscreen request from the preceding
      // document. Attribute failures only to requests started in this sample.
      const onFailure = request => { if (requests.has(request)) failures.push({ url: request.url(), error: request.failure()?.errorText }); };
      const onConsole = message => { if (message.type() === 'error') consoleErrors.push(message.text()); };
      page.on('request', onRequest); page.on('pageerror', onError); page.on('requestfailed', onFailure); page.on('console', onConsole);
      await page.goto(baseURL, { waitUntil: 'domcontentloaded', timeout: 120000 });
      let heroTimedOut = false;
      try { await page.waitForSelector('.lanyard[data-ready="true"]', { timeout: 75000 }); } catch { heroTimedOut = true; }
      await page.waitForTimeout(2000);
      const initial = await page.evaluate(() => ({ ...window.__perf, paints: performance.getEntriesByType('paint').map(e => ({ name: e.name, startTime: e.startTime })), resources: performance.getEntriesByType('resource').map(e => ({ name: e.name, initiatorType: e.initiatorType, startTime: e.startTime, responseEnd: e.responseEnd, duration: e.duration, transferSize: e.transferSize, encodedBodySize: e.encodedBodySize })), elapsed: performance.now(), memory: performance.memory?.usedJSHeapSize, heroMode: document.querySelector('.lanyard')?.getAttribute('data-mode') }));
      if (repetition === 1 && cache === 'cold') await page.screenshot({ path: path.join(destination, `${label}-${name}-hero.png`) });
      const scrollStart = await page.evaluate(() => { const now = performance.now(); document.getElementById('about').scrollIntoView({ behavior: 'instant', block: 'start' }); return now; });
      await page.waitForFunction(() => document.querySelector('.about-card.is-visible'), undefined, { timeout: 15000 });
      await page.locator('.profile-card__photo').evaluate(image => image.decode());
      const portraitReady = await page.evaluate(() => performance.now());
      await page.waitForFunction(() => { const el = document.querySelector('.about-card__actions'); return el && getComputedStyle(el).opacity === '1'; }, undefined, { timeout: 15000 });
      const about = await page.evaluate(() => ({ ...window.__perf, complete: performance.now(), overflow: document.documentElement.scrollWidth > innerWidth, portrait: { width: document.querySelector('.profile-card__photo').naturalWidth, height: document.querySelector('.profile-card__photo').naturalHeight } }));
      if (repetition === 1 && cache === 'cold') {
        // Freeze CSS effects at identical frames for repeatable About snapshots.
        await page.evaluate(() => { for (const a of document.getAnimations()) if (a.effect?.target instanceof Element && a.effect.target.closest('#about')) { a.pause(); a.currentTime = 5000; } });
        await page.locator('#about').screenshot({ path: path.join(destination, `${label}-${name}-about.png`) });
      }
      const fcp = initial.paints.find(e => e.name === 'first-contentful-paint')?.startTime ?? null;
      const scriptResources = initial.resources.filter(e => /\.js(?:\?|$)/.test(e.name));
      const cssResources = initial.resources.filter(e => /\.css(?:\?|$)/.test(e.name));
      const row = { label, profile: name, repetition, cache, browser: browser.version(), conditions: throttle ? '4x CPU, 1.6 Mbps down, 750 kbps up, 150 ms latency' : 'unthrottled localhost', fcp, lcp: initial.lcp, cls: initial.cls, blockingTime: initial.longTasks.filter(t => t.startTime >= (fcp || 0)).reduce((sum, t) => sum + Math.max(0, t.duration - 50), 0), blockingWindowEnd: initial.elapsed, heroReady: initial.heroReady, heroTimedOut, aboutMount: initial.aboutMounted, aboutRevealAfterScroll: about.aboutRevealed - scrollStart, aboutPortraitAfterScroll: portraitReady - scrollStart, aboutCompleteAfterScroll: about.complete - scrollStart, jsTransfer: scriptResources.reduce((sum, r) => sum + r.transferSize, 0), jsBody: scriptResources.reduce((sum, r) => sum + r.encodedBodySize, 0), cssTransfer: cssResources.reduce((sum, r) => sum + r.transferSize, 0), heapBytes: initial.memory, overflow: about.overflow, errors, consoleErrors, failures, initial };
      results.push(row);
      await writeFile(path.join(destination, `${label}-measurements.json`), JSON.stringify(results, null, 2));
      console.log(JSON.stringify({ profile: name, repetition, cache, fcp, lcp: initial.lcp?.startTime, hero: row.heroReady, aboutMount: row.aboutMount, about: row.aboutCompleteAfterScroll, js: row.jsTransfer, errors, failures }));
      page.off('request', onRequest); page.off('pageerror', onError); page.off('requestfailed', onFailure); page.off('console', onConsole);
    }
    await context.close();
  }
}
await browser.close();
