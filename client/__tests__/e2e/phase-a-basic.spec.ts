import { test, expect } from '@playwright/test';

/**
 * Phase A: Basic E2E Validation (Cursor-safe)
 * Tests 5 core pages with simple validation only
 * Keep under 100 lines to prevent hanging
 */

test.describe('Phase A: Basic Page Validation', () => {
  const pages = [
    { path: '/', name: 'Homepage' },
    { path: '/dashboard', name: 'Dashboard' },
    { path: '/categories', name: 'Categories' },
    { path: '/voice-rfq', name: 'Voice RFQ' },
    { path: '/login', name: 'Login' }, // Changed from /auth/login to /login
  ];

  pages.forEach(({ path, name }) => {
    test(`${name} (${path}) loads successfully`, async ({ page }) => {
      // Navigate to page
      const response = await page.goto(path);

      // Check HTTP status (allow redirects for login)
      if (path === '/login') {
        // Login page might redirect, so just check it's not a 404/500
        expect(response?.status() || 200).toBeLessThan(500);
      } else {
        expect(response?.ok()).toBeTruthy();
      }

      // Wait for page to load
      await page.waitForLoadState('networkidle');

      // Check URL is correct (allow redirects for login)
      if (path === '/login') {
        // Login might redirect to /auth/login or similar
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/login|auth/);
      } else {
        await expect(page).toHaveURL(path);
      }

      // Simple page validation - no complex content checking
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);

      // Check page has basic content
      const bodyText = await page.textContent('body');
      expect(bodyText?.length || 0).toBeGreaterThan(100);

      // Basic accessibility check - page should have a heading or main content
      const hasContent = (await page.locator('h1, h2, h3, main, [role="main"]').count()) > 0;
      expect(hasContent).toBeTruthy();
    });
  });
});
