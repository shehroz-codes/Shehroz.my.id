// @vitest-environment node
import { beforeAll, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { ImageMagick, initializeImageMagick, MagickFormat } from '@imagemagick/magick-wasm';
import { decodeThumbnail } from '../supabase/functions/_shared/decode-photo';
beforeAll(async () => { await initializeImageMagick(await readFile(new URL('../node_modules/@imagemagick/magick-wasm/dist/magick.wasm', import.meta.url))); });
it('actually decodes, bounds and re-encodes WebP rather than trusting its header', async () => {
  const original = await readFile(new URL('../src/sections/components/showcase/assets/project-1.webp', import.meta.url));
  const thumbnail = ImageMagick.read(original, image => { image.resize(160, 160); image.extent(160, 160); return image.write(MagickFormat.WebP, data => new Uint8Array(data)); });
  const decoded = decodeThumbnail(thumbnail);
  expect(decoded.length).toBeLessThanOrEqual(60 * 1024);
  ImageMagick.read(decoded, image => { expect(image.width).toBe(160); expect(image.height).toBe(160); expect(image.format).toBe(MagickFormat.WebP); });
  expect(() => decodeThumbnail(new Uint8Array(40))).toThrow();
  expect(() => decodeThumbnail(original)).toThrow();
});
