import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';

// Visual-only harness. Never use these controlled clocks for timing metrics.
// Capture the real WebGL drawing buffer after the same simulation callbacks,
// without unrelated rotating text, cursor effects, or wall-clock differences.
const destination = process.argv[2] || 'artifacts/performance';
await mkdir(destination, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] });
const results = [];
for (const [name, viewport, mobile] of [['desktop', { width: 1440, height: 900 }, false], ['mobile', { width: 390, height: 844 }, true]]) {
  for (const [label, port] of [['baseline', 4181], ['optimized', 4180]]) {
    const context = await browser.newContext({ viewport, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
    const page = await context.newPage();
    await page.addInitScript(() => {
      const clock = window.__visual = { time: 0, callbacks: 0, png: null, width: null, height: null };
      const now = performance.now.bind(performance);
      const raf = requestAnimationFrame.bind(window);
      const fromLanyard = () => /\/Lanyard-[^/]+\.js/.test(new Error().stack || '');
      performance.now = () => fromLanyard() ? clock.time : now();
      window.requestAnimationFrame = callback => {
        if (!fromLanyard()) return raf(callback);
        return raf(() => {
          if (clock.callbacks >= 60) return;
          clock.time += 1000 / 60;
          clock.callbacks++;
          callback(clock.time);
          if (clock.callbacks !== 60) return;
          const source = document.querySelector('.lanyard-canvas');
          const gl = source.getContext('webgl2');
          const { width, height } = source;
          const pixels = new Uint8Array(width * height * 4);
          gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
          const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d'); const frame = ctx.createImageData(width, height);
          for (let y = 0; y < height; y++) frame.data.set(pixels.subarray((height - y - 1) * width * 4, (height - y) * width * 4), y * width * 4);
          ctx.putImageData(frame, 0, 0);
          clock.width = width; clock.height = height; clock.png = canvas.toDataURL('image/png');
        });
      };
    });
    await page.goto(`http://127.0.0.1:${port}/Shehroz.my.id/`);
    await page.waitForFunction(() => window.__visual?.png, undefined, { timeout: 90000 });
    const snapshot = await page.evaluate(() => window.__visual);
    await writeFile(`${destination}/${label}-${name}-lanyard-matched.png`, Buffer.from(snapshot.png.split(',')[1], 'base64'));
    const row = { label, name, callbacks: snapshot.callbacks, simulationClock: snapshot.time, width: snapshot.width, height: snapshot.height };
    results.push(row); console.log(JSON.stringify(row));
    await context.close();
  }
}
await browser.close();
await writeFile(`${destination}/lanyard-matched-frames.json`, JSON.stringify(results, null, 2));
