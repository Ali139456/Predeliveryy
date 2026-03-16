import { test, expect } from '@playwright/test';

test.describe('Forms', () => {
  test.describe('Login form', () => {
    test('login page has email and password inputs', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByPlaceholder('your@email.com')).toBeVisible();
      await expect(page.getByPlaceholder('••••••••')).toBeVisible();
    });

    test('login form shows error on invalid credentials', async ({ page }) => {
      await page.goto('/login');
      await page.getByPlaceholder('your@email.com').fill('invalid@example.com');
      await page.getByPlaceholder('••••••••').fill('wrongpassword');
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
    });

    test('login form can switch to phone number', async ({ page }) => {
      await page.goto('/login');
      const usePhoneLink = page.getByRole('button', { name: /phone|Phone/i }).or(
        page.getByText(/Use phone|Log in with phone/i)
      ).first();
      if (await usePhoneLink.isVisible()) {
        await usePhoneLink.click();
        await expect(page.getByPlaceholder('+1234567890')).toBeVisible();
      }
    });
  });

  test.describe('Contact form', () => {
    test('contact form has required fields', async ({ page }) => {
      await page.goto('/contact');
      await expect(page.getByLabel(/Name/i).or(page.getByPlaceholder('Your name'))).toBeVisible();
      await expect(page.getByLabel(/Email/i).or(page.getByPlaceholder('your.email@example.com'))).toBeVisible();
      await expect(page.getByLabel(/Subject/i)).toBeVisible();
      await expect(page.getByLabel(/How can we help/i).or(page.getByPlaceholder('Tell us how we can help you...'))).toBeVisible();
    });

    test('contact form can be filled and submit button is present', async ({ page }) => {
      await page.goto('/contact');
      await page.getByPlaceholder('Your name').fill('Test User');
      await page.getByPlaceholder('your.email@example.com').fill('test@example.com');
      await page.getByLabel(/How can we help/i).or(page.getByPlaceholder('Tell us how we can help you...')).fill('Hello, this is a test message.');
      await expect(page.getByRole('button', { name: 'Send Message' })).toBeVisible();
    });
  });
});
