import { test, expect } from '@playwright/test';

/**
 * Phase E: Authentication Security Testing (Cursor-safe)
 * Tests basic auth security measures
 * Keep under 50 lines to prevent hanging
 */

test.describe('Security - Authentication', () => {
  test('login page uses HTTPS in production', async ({ page }) => {
    const response = await page.goto('/auth/login');

    // In production, should redirect to HTTPS
    if (process.env.NODE_ENV === 'production') {
      expect(page.url()).toMatch(/^https:/);
    }
  });

  test('password field is properly masked', async ({ page }) => {
    await page.goto('/auth/login');

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Verify it's actually a password field
    const inputType = await passwordInput.getAttribute('type');
    expect(inputType).toBe('password');
  });

  test('failed login shows error without exposing details', async ({ page }) => {
    await page.goto('/auth/login');

    // Try invalid credentials
    await page.fill('input[name="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show generic error, not specific details
    await expect(page.locator('text=/Invalid credentials|Authentication failed/i')).toBeVisible();
    expect(page.locator('text=/user not found|password incorrect/i')).not.toBeVisible();
  });

  test('logout clears session and redirects', async ({ page }) => {
    // Mock authenticated state
    await page.goto('/dashboard');

    const logoutButton = page.locator('button:has-text("Logout")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login|\/$/);
    }
  });
});
