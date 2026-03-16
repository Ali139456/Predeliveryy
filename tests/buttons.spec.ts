import { test, expect } from '@playwright/test';

test.describe('Buttons', () => {
  test('home page Book a demo button is clickable', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: 'Book a demo' });
    await link.waitFor({ state: 'visible', timeout: 15000 });
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await expect(page).toHaveURL(/\/contact/, { timeout: 10000 });
  });

  test('home page Talk to sales button is clickable', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: 'Talk to sales' });
    await link.waitFor({ state: 'visible', timeout: 15000 });
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await expect(page).toHaveURL(/\/contact/, { timeout: 10000 });
  });

  test('login page submit button is present and enabled when form empty', async ({ page }) => {
    await page.goto('/login');
    const submit = page.getByRole('button', { name: 'Sign In' });
    await expect(submit).toBeVisible();
    await expect(submit).toBeEnabled();
  });

  test('contact page Send/Submit button is present', async ({ page }) => {
    await page.goto('/contact');
    const submit = page.getByRole('button', { name: /Send|Submit/i });
    await expect(submit).toBeVisible();
  });

  test('login page has Home link in header or content', async ({ page }) => {
    await page.goto('/login');
    // Nav: logo (/) and Home button; on mobile "Home" text is hidden so match by href
    const homeLink = page.locator('nav a[href="/"]');
    await expect(homeLink.first()).toBeVisible();
  });
});
