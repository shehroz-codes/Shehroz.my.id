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
    expect(cloudCalls).toEqual([]); expect(errors).toEqual([]);
    await page.locator('.contact-section').screenshot({ path: `/tmp/shehroz-contact-${width}.png` });
  });
}
