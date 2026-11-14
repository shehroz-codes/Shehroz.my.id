import { initializeImageMagick } from 'npm:@imagemagick/magick-wasm@0.0.30';
// Initialization at module load: Supabase bundles the pinned npm WASM asset.
const wasm = await Deno.readFile(new URL('magick.wasm', import.meta.resolve('npm:@imagemagick/magick-wasm@0.0.30')));
await initializeImageMagick(wasm);
export { decodeThumbnail } from './decode-photo.ts';
