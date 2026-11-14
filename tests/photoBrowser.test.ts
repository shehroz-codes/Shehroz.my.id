import { afterEach, expect, it, vi } from 'vitest';
import { thumbnail } from '../src/sections/components/contact/services/photo';
afterEach(() => vi.restoreAllMocks());
function file(bytes: number[], type: string) {
  const value = new File([new Uint8Array(bytes)], 'photo', { type });
  Object.defineProperty(value, 'slice', { value: () => ({ arrayBuffer: async () => new Uint8Array(bytes).buffer }) });
  return value;
}
it('rejects MIME spoofing, unsupported formats and oversized inputs before decoding', async () => {
  await expect(thumbnail(file([1,2,3], 'image/jpeg'))).rejects.toThrow('content');
  await expect(thumbnail(file([1], 'image/svg+xml'))).rejects.toThrow('Invalid photo');
  await expect(thumbnail(new File([new Uint8Array(2 * 1024 * 1024 + 1)], 'large.jpg', { type: 'image/jpeg' }))).rejects.toThrow();
});
it('crops real decoded dimensions and emits only WebP bytes, revoking the source URL', async () => {
  Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:source') });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
  const drawImage = vi.fn();
  vi.stubGlobal('Image', class { width = 400; height = 200; decode = async () => {}; });
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage } as unknown as CanvasRenderingContext2D);
  vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/webp;base64,UklGRg==');
  const result = await thumbnail(file([255,216,255], 'image/jpeg'));
  expect(result.file.type).toBe('image/webp'); expect(result.file.size).toBe(4);
  expect(drawImage.mock.calls[0].slice(1)).toEqual([100,0,200,200,0,0,160,160]);
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:source'); vi.unstubAllGlobals();
});
