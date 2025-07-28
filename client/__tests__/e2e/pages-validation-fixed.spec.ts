// Bell24H Enhanced Page Validation - Next.js Hydration Aware Testing
// Fixed: Eliminates false positives from Next.js internal framework code

import { test, expect } from '@playwright/test';

const TEST_CONFIG = {
  timeout: 30000,
  minContentLength: 100,
  maxLoadTime: 5000,
  retries: 3,
};

const PAGES_TO_TEST = [
  {
    path: '/',
    name: 'Homepage',
    critical: true,
    expectedContent: ['Bell24H', 'marketplace', 'suppliers'],
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    critical: true,
    expectedContent: ['dashboard', 'analytics'],
  },
  {
    path: '/categories',
    name: 'Categories',
    critical: true,
    expectedContent: ['categories', 'browse'],
  },
  {
    path: '/voice-rfq',
    name: 'Voice RFQ',
    critical: true,
    expectedContent: ['voice', 'rfq', 'recording'],
  },
  {
    path: '/auth/login',
    name: 'Login',
    critical: true,
    expectedContent: ['login', 'email', 'password'],
  },
  {
    path: '/pricing',
    name: 'Pricing',
    critical: false,
    expectedContent: ['pricing', 'plans', 'subscription'],
  },
];

// Enhanced page validation with Next.js hydration handling
PAGES_TO_TEST.forEach(pageConfig => {
  test.describe(`Page Validation: ${pageConfig.name}`, () => {
    test('loads successfully without errors', async ({ page }) => {
      const startTime = Date.now();

      // Navigate with network idle wait
      await page.goto(pageConfig.path, {
        waitUntil: 'networkidle',
        timeout: TEST_CONFIG.timeout,
      });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(TEST_CONFIG.maxLoadTime);

      // Verify HTTP 200 response
      const response = await page.waitForResponse(
        response => response.url().includes(pageConfig.path) && response.status() === 200
      );
      expect(response.ok()).toBeTruthy();
    });

    test('has meaningful content (Next.js hydration aware)', async ({ page }) => {
      await page.goto(pageConfig.path);

      // CRITICAL FIX: Wait for Next.js hydration to complete
      await page.waitForLoadState('networkidle');
      await page.waitForFunction(() => document.readyState === 'complete');

      // Additional wait for React hydration
      await page
        .waitForFunction(
          () => {
            // Check if React has hydrated (no hydration warnings)
            const hasReactWarnings = Array.from(document.querySelectorAll('*')).some(el =>
              el.textContent?.includes('Warning: Text content did not match')
            );
            return !hasReactWarnings;
          },
          { timeout: 10000 }
        )
        .catch(() => {
          // Continue if hydration check times out
          console.log('Hydration check timed out, proceeding...');
        });

      // ENHANCED CONTENT EXTRACTION: Get visible content only, excluding Next.js internal data
      const visibleContent = await page.evaluate(() => {
        // Remove script tags and their content (contains Next.js internal code)
        const scripts = document.querySelectorAll('script');
        scripts.forEach(script => script.remove());

        // Remove Next.js specific elements that might contain error templates
        const nextElements = document.querySelectorAll('[data-nextjs-scroll-focus-boundary]');
        nextElements.forEach(el => el.remove());

        // Get main content areas (avoid framework internals)
        const mainContent =
          document.querySelector('main') ||
          document.querySelector('[role="main"]') ||
          document.querySelector('.main-content') ||
          document.body;

        // Use innerText to get only visible text (excludes hidden elements and scripts)
        return mainContent.innerText.trim();
      });

      // Content length validation
      expect(visibleContent?.length || 0).toBeGreaterThan(TEST_CONFIG.minContentLength);

      // IMPROVED ERROR DETECTION: More specific pattern matching to avoid false positives
      const hasActualErrors =
        visibleContent &&
        // Check for user-facing error messages (not Next.js internal)
        (/^404\s*$|^not found\s*$|^error\s*$/i.test(visibleContent.trim()) ||
          visibleContent.includes('Page not found') ||
          visibleContent.includes('This page could not be found') ||
          visibleContent.includes('Something went wrong') ||
          visibleContent.includes('Internal Server Error'));

      expect(hasActualErrors).toBeFalsy();

      // POSITIVE CONTENT VALIDATION: Ensure meaningful content is present
      if (pageConfig.expectedContent) {
        const contentLower = visibleContent.toLowerCase();
        const hasExpectedContent = pageConfig.expectedContent.some(content =>
          contentLower.includes(content.toLowerCase())
        );
        expect(hasExpectedContent).toBeTruthy();
      }
    });

    test('has proper page structure', async ({ page }) => {
      await page.goto(pageConfig.path);
      await page.waitForLoadState('networkidle');

      // Check for essential page elements
      const hasHtml = (await page.locator('html').count()) > 0;
      const hasHead = (await page.locator('head').count()) > 0;
      const hasBody = (await page.locator('body').count()) > 0;

      expect(hasHtml).toBeTruthy();
      expect(hasHead).toBeTruthy();
      expect(hasBody).toBeTruthy();

      // Check for Next.js specific elements (confirms proper framework loading)
      const hasNextScript = (await page.locator('script[src*="_next"]').count()) > 0;
      expect(hasNextScript).toBeTruthy();
    });

    test('renders without console errors', async ({ page }) => {
      const errors: string[] = [];

      // Capture console errors (excluding known Next.js development warnings)
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Filter out Next.js development warnings and hydration notices
          if (
            !text.includes('Warning: Text content did not match') &&
            !text.includes('hydration') &&
            !text.includes('_next/static')
          ) {
            errors.push(text);
          }
        }
      });

      await page.goto(pageConfig.path);
      await page.waitForLoadState('networkidle');

      // Allow some time for any delayed errors
      await page.waitForTimeout(2000);

      expect(errors).toHaveLength(0);
    });

    if (pageConfig.critical) {
      test('meets performance requirements (critical page)', async ({ page }) => {
        await page.goto(pageConfig.path);

        // Measure performance metrics
        const performanceMetrics = await page.evaluate(() => {
          const navigation = performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming;
          return {
            loadTime: navigation.loadEventEnd - navigation.loadEventStart,
            domContentLoaded:
              navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            firstContentfulPaint:
              performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
          };
        });

        // Performance thresholds for critical pages
        expect(performanceMetrics.loadTime).toBeLessThan(3000); // 3 seconds
        expect(performanceMetrics.domContentLoaded).toBeLessThan(2000); // 2 seconds
      });
    }
  });
});
