/** Decode actual content, square crop, remove metadata and upload only the thumbnail. */
export async function thumbnail(file: File): Promise<{ file: File; dataUrl: string }> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024 || !file.size) throw new Error('Invalid photo');
  const signature = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const ascii = (start: number, end: number) => String.fromCharCode(...signature.slice(start, end));
  const valid = file.type === 'image/jpeg' ? signature[0] === 255 && signature[1] === 216 && signature[2] === 255
    : file.type === 'image/png' ? signature.slice(0, 8).join(',') === '137,80,78,71,13,10,26,10'
    : ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP';
  if (!valid) throw new Error('Invalid image content');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image(); image.src = url; await image.decode();
    if (!image.width || !image.height || image.width * image.height > 20_000_000) throw new Error('Invalid image dimensions');
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 160;
    const context = canvas.getContext('2d'); if (!context) throw new Error('Image processing unavailable');
    const edge = Math.min(image.width, image.height);
    context.drawImage(image, (image.width - edge) / 2, (image.height - edge) / 2, edge, edge, 0, 0, 160, 160);
    for (const quality of [0.82, 0.65, 0.45]) {
      const dataUrl = canvas.toDataURL('image/webp', quality);
      if (!dataUrl.startsWith('data:image/webp;base64,')) throw new Error('WebP encoding unavailable');
      const bytes = Uint8Array.from(atob(dataUrl.split(',')[1]), c => c.charCodeAt(0));
      if (bytes.length <= 60 * 1024) return { file: new File([bytes], 'visitor.webp', { type: 'image/webp' }), dataUrl };
    }
    throw new Error('Photo could not be compressed');
  } finally { URL.revokeObjectURL(url); }
}
