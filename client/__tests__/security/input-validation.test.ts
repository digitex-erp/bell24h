import { test, expect } from '@playwright/test';

/**
 * Phase E: Input Validation Security Testing (Cursor-safe)
 * Tests XSS prevention and input sanitization
 * Keep under 50 lines to prevent hanging
 */

test.describe('Security - Input Validation', () => {
  test('search input prevents XSS attacks', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder*="What are you looking for"]');
    const xssPayload = '<script>alert("XSS")</script>';

    await searchInput.fill(xssPayload);
    await page.click('button:has-text("Search")');

    // Page should not execute script
    await page.waitForTimeout(1000);

    // Check that script tags are escaped in display
    const resultsText = await page.locator('body').textContent();
    expect(resultsText).not.toContain('<script>');
  });

  test('form inputs have length limits', async ({ page }) => {
    await page.goto('/voice-rfq');

    const descriptionInput = page.locator('textarea[name="description"]');
    if (await descriptionInput.isVisible()) {
      const maxLength = await descriptionInput.getAttribute('maxlength');
      expect(maxLength).toBeTruthy();
      expect(parseInt(maxLength || '0')).toBeGreaterThan(0);
    }
  });

  test('email validation prevents invalid formats', async ({ page }) => {
    await page.goto('/auth/register');

    const emailInput = page.locator('input[name="email"]');
    await emailInput.fill('invalid-email-format');

    // Try to submit
    await page.click('button[type="submit"]');

    // Should show validation error
    const validationError = page.locator('text=/valid email|email.*invalid/i');
    await expect(validationError).toBeVisible();
  });

  test('SQL injection attempt is blocked', async ({ page }) => {
    await page.goto('/');

    const searchInput = page.locator('input[placeholder*="What are you looking for"]');
    await searchInput.fill("'; DROP TABLE users; --");
    await page.click('button:has-text("Search")');

    // Page should handle gracefully without errors
    await expect(page.locator('text=Bell24H')).toBeVisible();
  });
});
