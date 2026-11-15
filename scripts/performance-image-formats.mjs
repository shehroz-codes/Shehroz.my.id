import { chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

// Isolate decode and canvas drawing from network transfer. Page-level transfer
// and readiness measurements remain in the production audit, not this test.
const experiments = '/workspace/work/portfolio-performance';
const groups = [
  ['front', 'public/images/lanyard/card-front.png', 'public/images/lanyard/card-front.webp'],
  ['back', 'public/images/lanyard/card-back.png', 'public/images/lanyard/card-back.webp'],
  ['about', 'public/sections/about/profile.png', 'public/sections/about/profile-optimized.png', `${experiments}/profile.webp`],
  ['anime', 'src/sections/assets/portraits/anime-portrait.png', 'src/sections/assets/portraits/anime-portrait-optimized.png', `${experiments}/anime-portrait.webp`],
  ['contact', 'src/sections/components/contact/assets/profile.png', 'src/sections/components/contact/assets/profile.webp'],
];
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined), args: ['--no-sandbox'] });
const results = [];
try {
  for (const [asset, ...paths] of groups) {
    const inputs = await Promise.all(paths.map(async path => {
      const bytes = await readFile(path);
      return { path, bytes: bytes.length, base64: bytes.toString('base64'), type: path.endsWith('.png') ? 'image/png' : 'image/webp' };
    }));
    for (let repetition = 0; repetition < 5; repetition++) {
      // A fresh context removes the prior repetition's decoded image cache.
      const context = await browser.newContext();
      const page = await context.newPage();
      const rows = await page.evaluate(async ({ inputs, repetition }) => {
        const output = [], decoded = new Map();
        for (let offset = 0; offset < inputs.length; offset++) {
          const index = (offset + repetition) % inputs.length, input = inputs[index];
          const bytes = Uint8Array.from(atob(input.base64), c => c.charCodeAt(0));
          const url = URL.createObjectURL(new Blob([bytes], { type: input.type }));
          const image = new Image();
          const start = performance.now();
          image.src = url;
          await image.decode();
          const decodeMs = performance.now() - start;
          const canvas = document.createElement('canvas');
          canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          const drawStart = performance.now();
          ctx.drawImage(image, 0, 0);
          const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          const drawAndReadbackMs = performance.now() - drawStart;
          decoded.set(index, pixels);
          output.push({ path: input.path, bytes: input.bytes, width: canvas.width, height: canvas.height, decodeMs, drawAndReadbackMs, index });
          URL.revokeObjectURL(url);
        }
        const original = decoded.get(0);
        return output.map(row => {
          const pixels = decoded.get(row.index);
          let differentChannels = 0, maxDifference = 0;
          for (let i = 0; i < original.length; i++) {
            const difference = Math.abs(original[i] - pixels[i]);
            if (difference) differentChannels++;
            maxDifference = Math.max(maxDifference, difference);
          }
          return { ...row, differentChannels, maxDifference };
        });
      }, { inputs, repetition });
      results.push(...rows.map(row => ({ asset, repetition: repetition + 1, ...row })));
      await context.close();
    }
  }
} finally { await browser.close(); }
const output = { browser: browser.version(), conditions: 'Unthrottled isolated Blob decode; five fresh contexts per asset; rotating candidate order; excludes transfer and base64 conversion; canvas draw includes readback', results };
await writeFile(process.argv[2] || 'artifacts/performance/phase2-image-formats.json', JSON.stringify(output, null, 2) + '\n');
console.log(`Recorded ${results.length} decode/pixel samples; experimental WebPs retained for comparison.`);
