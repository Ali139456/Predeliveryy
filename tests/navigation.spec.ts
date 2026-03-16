import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('home page loads and shows hero', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Pre-Delivery Inspections/i })).toBeVisible();
    await expect(page.getByText(/Digitised/i)).toBeVisible();
  });

  test('navigate to login from home', async ({ page }) => {
    await page.goto('/');
    const loginLink = page.getByRole('link', { name: 'Login' }).first();
    await loginLink.waitFor({ state: 'visible', timeout: 15000 });
    await loginLink.click();
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('navigate to contact from home', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Contact' }).first().waitFor({ state: 'visible', timeout: 15000 });
    await page.getByRole('link', { name: 'Contact' }).first().click();
    await expect(page).toHaveURL(/\/contact/, { timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
  });

  test('navigate to contact via Book a demo', async ({ page }) => {
    await page.goto('/');
    const link = page.getByRole('link', { name: 'Book a demo' });
    await link.waitFor({ state: 'visible', timeout: 15000 });
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await expect(page).toHaveURL(/\/contact/, { timeout: 10000 });
  });

  test('login page has link back to home', async ({ page }) => {
    await page.goto('/login');
    // Nav has logo link and Home button; on mobile "Home" text is hidden (sm:inline)
    const homeLink = page.locator('nav a[href="/"]').last();
    await homeLink.waitFor({ state: 'visible', timeout: 10000 });
    await homeLink.click();
    await expect(page).toHaveURL('/');
  });

  test('contact page has Contact Us heading and form', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /name|Name/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /email|Email/i }).first()).toBeVisible();
  });

  test('inspections page loads (shows list or auth prompt)', async ({ page }) => {
    await page.goto('/inspections');
    await expect(page).toHaveURL(/\/inspections/);
    await expect(page.getByText(/Inspection History|Back to Home/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('unauthenticated user visiting /admin is redirected to login', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });

  test('privacy page is reachable', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByText(/Privacy|privacy/i).first()).toBeVisible();
  });
});
