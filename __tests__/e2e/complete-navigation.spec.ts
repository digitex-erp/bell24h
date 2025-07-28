import { test, expect } from '@playwright/test';

const allFeaturePages = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Wallet', path: '/dashboard/wallet' },
  { name: 'RFQ Management', path: '/dashboard/rfq' },
  { name: 'AI Matching', path: '/dashboard/ai-matching' },
  { name: 'Voice RFQ', path: '/dashboard/voice-rfq' },
  { name: 'Video RFQ', path: '/dashboard/video-rfq' },
  { name: 'Predictive Analytics', path: '/dashboard/predictive-analytics' },
  { name: 'Supplier Risk', path: '/dashboard/supplier-risk' },
  { name: 'Logistics', path: '/dashboard/logistics' },
  { name: 'Showcase', path: '/dashboard/showcase' },
  { name: 'Reports', path: '/dashboard/reports' },
  { name: 'Planning', path: '/dashboard/planning' },
  { name: 'Chatbot', path: '/dashboard/chatbot' },
  { name: 'Settings', path: '/dashboard/settings' },
  { name: 'Help', path: '/dashboard/help' },
];

test.describe('Complete Navigation Testing', () => {
  allFeaturePages.forEach(({ name, path }) => {
    test(`${name} page loads successfully`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL(path);
      
      // Check page loads without errors
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      
      // Verify no JavaScript errors
      const errors = [];
      page.on('pageerror', error => errors.push(error));
      await page.waitForLoadState('networkidle');
      expect(errors).toHaveLength(0);
      
      // Check essential elements are present
      await expect(page.locator('h1, h2')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
    });
  });

  test('Navigation sidebar works on all pages', async ({ page }) => {
    for (const { name, path } of allFeaturePages) {
      await page.goto(path);
      
      // Check sidebar is visible
      await expect(page.locator('nav')).toBeVisible();
      
      // Test navigation to different page
      const nextPage = allFeaturePages[(allFeaturePages.findIndex(p => p.path === path) + 1) % allFeaturePages.length];
      await page.click(`text=${nextPage.name}`);
      await expect(page).toHaveURL(nextPage.path);
    }
  });
}); 