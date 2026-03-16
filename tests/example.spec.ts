import { test, expect } from '@playwright/test';

/**
 * Smoke test: app is running and main entry point loads.
 */
test('app loads and home page is reachable', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL('/');
  await expect(page.locator('body')).toBeVisible();
  await expect(page.getByText(/Pre-Delivery|Pre Delivery/i).first()).toBeVisible({ timeout: 10000 });
});
