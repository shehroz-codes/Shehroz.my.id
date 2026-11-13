import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for (const width of [320, 390, 768, 1440]) {
  test(`live reads with disabled writes and Contact accessibility at ${width}px (API mocked)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const requests: string[] = [];
    await page.route('https://lctzkigzaudjiotopzye.supabase.co/**', async (route) => {
      requests.push(route.request().url());
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: [{ id: '00000000-0000-0000-0000-000000000001', name: 'Visible Visitor',
        text: '<img src=x onerror=alert(1)>', country_code: null, country_name: null, created_at: '2026-11-13T00:00:00Z' }] });
    });
    const response = page.waitForResponse((r) => r.url().includes('/rest/v1/visitor_messages'));
    await page.goto('./');
    await response;
    await page.locator('.contact-section').scrollIntoViewIfNeeded();
    await expect(page.getByText('Visible Visitor', { exact: true })).toBeVisible();
    await expect(page.getByText('<img src=x onerror=alert(1)>', { exact: true })).toBeVisible();
    await expect(page.locator('.msg__text img')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Post Message' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Choose photo' })).toBeDisabled();
    await expect(page.locator('iframe[src*="turnstile"]')).toHaveCount(0);
    // Removing DOM disabled attributes cannot turn on the adapter or server gates.
    await page.getByRole('form', { name: 'Write a public message' }).evaluate((form) => {
      const disabled = form.querySelectorAll('[disabled]');
      disabled.forEach((node) => node.removeAttribute('disabled'));
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      disabled.forEach((node) => node.setAttribute('disabled', ''));
    });
    await expect(page.getByRole('button', { name: 'Post Message' })).toBeDisabled();
    expect(requests.every((url) => url.includes('/rest/v1/visitor_messages'))).toBe(true);
    expect(requests[0]).not.toMatch(/photo_path|visitor_id/);
    const audit = await new AxeBuilder({ page }).include('.contact-section').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(audit.violations).toEqual([]);
    // Check overflow at the decorative portrait halo's widest pulse, not a random frame.
    await page.locator('.hp-halo').evaluate((element) => {
      element.getAnimations().forEach((animation) => { animation.pause(); animation.currentTime = 5000; });
    });
    const layout = await page.evaluate(() => ({
      viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      overflowing: [...document.querySelectorAll('body *')].flatMap((element) => {
        const box = element.getBoundingClientRect();
        return box.width > 0 && (box.right > innerWidth + 1 || box.left < -1)
          ? [{ tag: element.tagName, className: element.getAttribute('class'), left: box.left, right: box.right, width: box.width }] : [];
      }).slice(0, 20),
    }));
    expect(layout.scrollWidth <= layout.viewport, JSON.stringify(layout)).toBe(true);
    await page.locator('.contact-section').screenshot({ path: `/tmp/shehroz-live-disabled-${width}.png` });
  });
}
test('live API failure stays an error without switching to local preview', async ({ page }) => {
  let healthy = false;
  await page.route('https://lctzkigzaudjiotopzye.supabase.co/**', (route) => route.fulfill(healthy ? { json: [] } : { status: 403, json: { message: 'denied' } }));
  const response = page.waitForResponse((r) => r.url().includes('/rest/v1/visitor_messages'));
  await page.goto('./');
  await response;
  await page.locator('.contact-section').scrollIntoViewIfNeeded();
  await expect(page.getByText('Wall unavailable', { exact: true })).toBeVisible();
  await expect(page.getByText('Visitor messages could not be loaded. Please try again later.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Post Message' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Preview Message' })).toHaveCount(0);
  healthy = true;
  await page.getByRole('button', { name: 'Retry messages' }).click();
  await expect(page.getByText('No messages yet', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Retry messages' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Post Message' })).toBeDisabled();
});
