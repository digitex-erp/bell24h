import { test, expect } from '@playwright/test';

test.describe('Safe Integration - No Disruption Test', () => {
  // Test existing categories functionality is preserved
  test('Original categories page still works', async ({ page }) => {
    await page.goto('/categories');
    await expect(page).toHaveURL('/categories');
    await expect(page.locator('h1, h2')).toBeVisible();
    // Verify categories content loads
    const content = await page.textContent('body');
    expect(content.toLowerCase()).toContain('categor');
  });

  // Test homepage integration is preserved
  test('Homepage categories integration preserved', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/');
    // Check if categories are accessible from homepage
    const categoryLinks = page.locator('a[href*="categor"]');
    expect(await categoryLinks.count()).toBeGreaterThan(0);
  });

  // Test new dashboard features work
  const newDashboardPages = [
    '/dashboard',
    '/dashboard/wallet',
    '/dashboard/rfq',
    '/dashboard/ai-matching',
    '/dashboard/voice-rfq'
  ];

  newDashboardPages.forEach(path => {
    test(`New dashboard page ${path} works`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(path);
      await expect(page.locator('h1, h2')).toBeVisible();
      // Verify dashboard layout is applied
      await expect(page.locator('nav')).toBeVisible();
    });
  });

  // Test navigation between old and new
  test('Navigation between categories and dashboard works', async ({ page }) => {
    // Start at categories
    await page.goto('/categories');
    await expect(page).toHaveURL('/categories');
    // Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');
    // Navigate back to categories from dashboard
    if (await page.locator('a[href="/categories"]').isVisible()) {
      await page.click('a[href="/categories"]');
      await expect(page).toHaveURL('/categories');
    }
  });

  // Test no conflicts exist
  test('No route conflicts between old and new', async ({ page }) => {
    const allRoutes = [
      '/',
      '/categories', 
      '/dashboard',
      '/dashboard/wallet',
      '/dashboard/rfq'
    ];
    for (const route of allRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(route);
      // Verify no error messages
      const errors = await page.locator('text=404').count();
      expect(errors).toBe(0);
      const errorText = await page.locator('text=Error').count();
      expect(errorText).toBe(0);
    }
  });
}); 