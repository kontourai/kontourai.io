import { expect, test } from '@playwright/test';
import { unzipSync } from 'fflate';

for (const width of [360, 1280]) {
  test(`keyboard entry bypasses navigation and navigation text is readable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
    for (const menu of ['Products', 'Developers']) {
      const summary = page.locator('summary').filter({ hasText: menu });
      await summary.click();
      const ratios = await summary.locator('..').evaluate(element => {
        const luminance = value => {
          const rgb = value.match(/[\d.]+/g).slice(0, 3).map(Number).map(v => {
            const x = v / 255;
            return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
          });
          return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
        };
        const canvas = luminance(getComputedStyle(document.documentElement).backgroundColor);
        return [...element.querySelectorAll('summary, a')].map(node => {
          const ink = luminance(getComputedStyle(node).color);
          return { text: node.textContent.trim(), ratio: (Math.max(ink, canvas) + 0.05) / (Math.min(ink, canvas) + 0.05) };
        });
      });
      for (const result of ratios) expect(result.ratio, result.text).toBeGreaterThanOrEqual(4.5);
      await summary.click();
    }
  });
}

test('brand downloads serve real SVGs, transparent PNGs, and the same files in the complete ZIP', async ({ page, request }) => {
  await page.goto('/brand/');
  await expect(page.getByRole('heading', { name: 'Kontour, ready to share.' })).toBeVisible();
  const bundle = await request.get('/brand-assets/kontour-brand-assets.zip');
  expect(bundle.ok()).toBe(true);
  const zipped = unzipSync(await bundle.body());
  const links = await page.locator('a[download][href$=".svg"], a[download][href$=".png"]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
  expect(links.length).toBeGreaterThan(0);
  for (const link of links) {
    const response = await request.get(link);
    expect(response.ok(), link).toBe(true);
    const bytes = await response.body();
    expect(Buffer.from(zipped[link.split('/').at(-1)]), link).toEqual(bytes);
    if (link.endsWith('.svg')) {
      expect(bytes.toString()).toContain('<svg');
      expect(bytes.toString()).toContain('viewBox=');
    } else {
      expect([...bytes.subarray(0, 8)]).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
      expect(bytes[25], `${link} must support transparency`).toBe(6);
    }
  }
  await page.goto('/');
  await page.getByRole('contentinfo').getByRole('link', { name: 'Brand assets' }).click();
  await expect(page).toHaveURL(/\/brand\/$/);
});
