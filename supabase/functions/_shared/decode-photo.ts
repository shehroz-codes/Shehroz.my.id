import { ImageMagick, MagickFormat } from 'npm:@imagemagick/magick-wasm@0.0.30';
export function decodeThumbnail(bytes: Uint8Array): Uint8Array {
  return ImageMagick.read(bytes, image => {
    if (image.format !== MagickFormat.WebP || image.width !== 160 || image.height !== 160) throw new Error('Invalid thumbnail');
    image.strip(); image.quality = 82;
    return image.write(MagickFormat.WebP, data => {
      if (data.length > 60 * 1024) throw new Error('Photo too large');
      return new Uint8Array(data);
    });
  });
}
