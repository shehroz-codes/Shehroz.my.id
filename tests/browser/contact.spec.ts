import { expect, test } from '@playwright/test';
for (const width of [390, 1440]) {
  test(`preview Contact remains usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    const cloudCalls: string[] = [];
    page.on('request', (r) => { if (/supabase\.co|firestore\.googleapis|challenges\.cloudflare/.test(r.url())) cloudCalls.push(r.url()); });
    await page.goto('./');
    const form = page.getByRole('form', { name: 'Write a public message' });
    await form.scrollIntoViewIfNeeded();
    await expect(page.getByText(/Local preview — wall messages stay in this browser/)).toBeVisible();
    await form.getByRole('textbox', { name: 'Your name' }).fill('Browser Visitor');
    await form.getByRole('textbox', { name: /Your message/ }).fill('Hello from a local preview');
    await form.getByRole('button', { name: 'Preview Message' }).click();
    await expect(page.getByText('Preview saved in this browser only. It is not published to the public wall.')).toBeVisible();
    await expect(page.getByRole('list', { name: 'Visitor messages' }).getByText('Browser Visitor', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('list', { name: 'Visitor messages' }).getByText('Browser Visitor', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Preview Message' })).toBeDisabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const privateForm = page.getByRole('form', { name: 'Send a private message' });
    await privateForm.getByRole('button', { name: 'Send Message' }).click();
    await expect(privateForm.getByRole('textbox', { name: 'Full name' })).toHaveAttribute('aria-invalid', 'true');
    await expect(privateForm.getByRole('textbox', { name: 'Full name' })).toBeFocused();
    for (const [name, value] of [['Full name', 'Test Visitor'], ['Email address', 'visitor@example.test'], ['Subject', 'Project inquiry'], ['Message', 'Private draft, never public']]) {
      await privateForm.getByRole('textbox', { name }).fill(value);
    }
    await privateForm.getByRole('button', { name: 'Send Message' }).click();
    await expect(privateForm.getByText('Private message delivery is not connected yet. Your message has not been sent.')).toBeVisible();
    await expect(privateForm.getByRole('textbox', { name: 'Message' })).toHaveValue('Private draft, never public');
    expect(await page.evaluate(() => Object.values(localStorage).some((value) => value.includes('Private draft, never public')))).toBe(false);
    expect(cloudCalls).toEqual([]); expect(errors).toEqual([]);
    await page.locator('.contact-section').screenshot({ path: `/tmp/shehroz-contact-${width}.png` });
  });
}

test('photo selection uses the real browser decoder and WebP encoder, rejects invalid files, and preserves a draft', async ({ page }) => {
  await page.goto('./');
  const form = page.getByRole('form', { name: 'Write a public message' });
  await form.scrollIntoViewIfNeeded();
  await form.getByRole('textbox', { name: 'Your name' }).fill('Photo visitor');
  await form.getByRole('textbox', { name: /Your message/ }).fill('A draft with a photo');
  await page.locator('#contact-photo').setInputFiles('src/sections/components/showcase/assets/project-1.webp');
  const preview = page.getByRole('img', { name: 'Selected photo preview' });
  await expect(preview).toBeVisible();
  const dimensions = await preview.evaluate(async (element) => {
    const img = element as HTMLImageElement; await img.decode();
    return { width: img.naturalWidth, height: img.naturalHeight, source: img.src };
  });
  expect(dimensions.width).toBe(160); expect(dimensions.height).toBe(160);
  expect(dimensions.source.startsWith('data:image/webp;base64,')).toBe(true);
  expect(Buffer.from(dimensions.source.split(',')[1], 'base64').length).toBeLessThanOrEqual(61440);
  await form.getByRole('button', { name: 'Remove photo' }).click();
  await page.locator('#contact-photo').setInputFiles({ name: 'spoof.png', mimeType: 'image/png', buffer: Buffer.from('not an image') });
  await expect(page.getByText('This photo could not be read. Please choose another image.')).toBeVisible();
  await page.reload();
  await expect(form.getByRole('textbox', { name: 'Your name' })).toHaveValue('Photo visitor');
  await expect(form.getByRole('textbox', { name: /Your message/ })).toHaveValue('A draft with a photo');
});
