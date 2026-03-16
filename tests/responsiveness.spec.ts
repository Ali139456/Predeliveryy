import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'wide', width: 1920, height: 1080 },
] as const;

test.describe('Responsiveness', () => {
  for (const { name, width, height } of VIEWPORTS) {
    test(`home page renders correctly at ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await expect(page.getByRole('heading', { name: /Pre-Delivery Inspections/i })).toBeVisible();
      await expect(page.locator('body')).toBeVisible();
    });

    test(`login page renders correctly at ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/login');
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
      await expect(page.getByPlaceholder('your@email.com').or(page.getByPlaceholder('+1234567890'))).toBeVisible();
    });

    test(`contact page renders correctly at ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/contact');
      await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
      await expect(page.getByRole('textbox', { name: /name|Name/i })).toBeVisible();
    });
  }

  test('home hero CTA buttons are visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    const bookDemo = page.getByRole('link', { name: /Book a demo/i });
    await expect(bookDemo).toBeVisible();
  });

  test('key content visible on mobile without layout break', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Pre-Delivery/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Book a demo/i })).toBeVisible();
  });
});
