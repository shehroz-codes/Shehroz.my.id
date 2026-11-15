import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

// Compare browser-decoded pixels, including alpha and browser color handling.
// Originals remain in the repository as the source artwork.
const pairs = [
  ['public/images/lanyard/card-front.png', 'public/images/lanyard/card-front.webp'],
  ['public/images/lanyard/card-back.png', 'public/images/lanyard/card-back.webp'],
  ['public/sections/about/profile.png', 'public/sections/about/profile-optimized.png'],
  ['src/sections/assets/portraits/anime-portrait.png', 'src/sections/assets/portraits/anime-portrait-optimized.png'],
  ['src/sections/components/contact/assets/profile.png', 'src/sections/components/contact/assets/profile.webp'],
];
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] });
const page = await browser.newPage();
const results = [];
for (const [original, optimized] of pairs) {
  const before = await readFile(original), after = await readFile(optimized);
  const comparison = await page.evaluate(async ({ a, b }) => {
    async function decode(data) {
      const image = new Image(); image.src = data; await image.decode();
      const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true }); ctx.drawImage(image, 0, 0);
      return { width: canvas.width, height: canvas.height, pixels: ctx.getImageData(0, 0, canvas.width, canvas.height).data };
    }
    const aImage = await decode(a), bImage = await decode(b);
    let differentChannels = 0, maxDifference = 0;
    for (let i = 0; i < aImage.pixels.length; i++) {
      const difference = Math.abs(aImage.pixels[i] - bImage.pixels[i]);
      if (difference) differentChannels++;
      maxDifference = Math.max(maxDifference, difference);
    }
    return { width: aImage.width, height: aImage.height, dimensionsMatch: aImage.width === bImage.width && aImage.height === bImage.height, differentChannels, maxDifference };
  }, { a: `data:image/png;base64,${before.toString('base64')}`, b: `data:image/${optimized.endsWith('.png') ? 'png' : 'webp'};base64,${after.toString('base64')}` });
  results.push({ original, optimized, beforeBytes: before.length, afterBytes: after.length, ...comparison });
}
await browser.close();
const output = JSON.stringify({ browser: 'Real Chromium, canvas 2D RGBA comparison', results }, null, 2);
console.log(output);
if (process.argv[2]) await writeFile(process.argv[2], output);
if (results.some(r => !r.dimensionsMatch || r.differentChannels)) process.exitCode = 1;
