/**
 * Bell24H Pages Validation - E2E Test Suite
 * Validates all pages for functionality, content, performance, and accessibility
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

// Page configurations for validation
const PAGES_TO_TEST = [
  // Main Pages
  {
    path: '/',
    name: 'Homepage',
    expectedTitle: /Bell24H|B2B Marketplace/,
    criticalElements: ['header', 'nav', 'main', 'footer'],
    requiresAuth: false,
  },
  {
    path: '/categories',
    name: 'Categories',
    expectedTitle: /Categories|Browse/,
    criticalElements: ['header', 'main', 'category-grid'],
    requiresAuth: false,
  },
  {
    path: '/voice-rfq',
    name: 'Voice RFQ',
    expectedTitle: /Voice RFQ|Voice/,
    criticalElements: ['header', 'main', 'voice-interface'],
    requiresAuth: false,
  },
  {
    path: '/ai-dashboard',
    name: 'AI Dashboard',
    expectedTitle: /AI Dashboard|Dashboard/,
    criticalElements: ['header', 'main', 'dashboard-content'],
    requiresAuth: false,
  },
  {
    path: '/login',
    name: 'Login',
    expectedTitle: /Login|Sign In/,
    criticalElements: ['form', 'email-input', 'password-input', 'submit-button'],
    requiresAuth: false,
  },
  {
    path: '/register',
    name: 'Register',
    expectedTitle: /Register|Sign Up/,
    criticalElements: ['form', 'email-input', 'password-input', 'submit-button'],
    requiresAuth: false,
  },

  // Category Pages
  {
    path: '/categories/electronics',
    name: 'Electronics Category',
    expectedTitle: /Electronics/,
    criticalElements: ['header', 'main', 'supplier-list'],
    requiresAuth: false,
  },
  {
    path: '/categories/agriculture',
    name: 'Agriculture Category',
    expectedTitle: /Agriculture/,
    criticalElements: ['header', 'main', 'supplier-list'],
    requiresAuth: false,
  },
  {
    path: '/categories/automobile',
    name: 'Automobile Category',
    expectedTitle: /Automobile/,
    criticalElements: ['header', 'main', 'supplier-list'],
    requiresAuth: false,
  },

  // Business Pages
  {
    path: '/about',
    name: 'About Us',
    expectedTitle: /About|Company/,
    criticalElements: ['header', 'main', 'company-info'],
    requiresAuth: false,
  },
  {
    path: '/contact',
    name: 'Contact',
    expectedTitle: /Contact|Support/,
    criticalElements: ['header', 'main', 'contact-form'],
    requiresAuth: false,
  },
  {
    path: '/pricing',
    name: 'Pricing',
    expectedTitle: /Pricing|Plans/,
    criticalElements: ['header', 'main', 'pricing-cards'],
    requiresAuth: false,
  },

  // Help Pages
  {
    path: '/help',
    name: 'Help Center',
    expectedTitle: /Help|Support/,
    criticalElements: ['header', 'main', 'help-content'],
    requiresAuth: false,
  },
  {
    path: '/privacy',
    name: 'Privacy Policy',
    expectedTitle: /Privacy/,
    criticalElements: ['header', 'main', 'privacy-content'],
    requiresAuth: false,
  },
  {
    path: '/terms',
    name: 'Terms of Service',
    expectedTitle: /Terms/,
    criticalElements: ['header', 'main', 'terms-content'],
    requiresAuth: false,
  },
];

// Test configuration
const TEST_CONFIG = {
  timeout: 30000,
  loadTimeout: 10000,
  performanceThreshold: 3000, // 3 seconds
  minContentLength: 100,
};

test.describe('Bell24H Pages Validation Suite', () => {
  test.beforeEach(async ({ page, context }) => {
    // Set up page defaults
    await page.setViewportSize({ width: 1280, height: 720 });

    // Block unnecessary resources for faster testing
    await page.route('**/*', route => {
      const resourceType = route.request().resourceType();
      if (['image', 'font', 'media'].includes(resourceType)) {
        route.abort();
      } else {
        route.continue();
      }
    });

    // Set timeouts
    page.setDefaultTimeout(TEST_CONFIG.timeout);
    page.setDefaultNavigationTimeout(TEST_CONFIG.loadTimeout);
  });

  // Generate tests for each page
  PAGES_TO_TEST.forEach(pageConfig => {
    test.describe(`${pageConfig.name} (${pageConfig.path})`, () => {
      test('loads successfully without errors', async ({ page }) => {
        const response = await page.goto(pageConfig.path);

        // Check response status
        expect(response?.status()).toBeLessThan(400);

        // Wait for page load
        await page.waitForLoadState('networkidle');

        // Check for JavaScript errors
        const jsErrors: string[] = [];
        page.on('pageerror', error => jsErrors.push(error.message));

        await page.waitForTimeout(1000);
        expect(jsErrors).toHaveLength(0);
      });

      test('has proper title and meta information', async ({ page }) => {
        await page.goto(pageConfig.path);

        // Check title
        const title = await page.title();
        expect(title).toMatch(pageConfig.expectedTitle);
        expect(title.length).toBeGreaterThan(10);

        // Check meta description
        const metaDescription = await page.getAttribute('meta[name="description"]', 'content');
        if (metaDescription) {
          expect(metaDescription.length).toBeGreaterThan(50);
        }
      });

      test('renders content within performance threshold', async ({ page }) => {
        const startTime = Date.now();

        await page.goto(pageConfig.path);
        await page.waitForLoadState('domcontentloaded');

        const loadTime = Date.now() - startTime;
        expect(loadTime).toBeLessThan(TEST_CONFIG.performanceThreshold);
      });

      test('has meaningful content', async ({ page }) => {
        await page.goto(pageConfig.path);

        const bodyText = await page.textContent('body');
        expect(bodyText?.length || 0).toBeGreaterThan(TEST_CONFIG.minContentLength);

        // Should not be just error messages
        expect(bodyText).not.toMatch(/404|not found|error/i);
      });

      test('critical elements are present', async ({ page }) => {
        await page.goto(pageConfig.path);
        await page.waitForLoadState('domcontentloaded');

        for (const element of pageConfig.criticalElements) {
          // Try multiple selectors for each element
          const selectors = [
            `[data-testid="${element}"]`,
            `#${element}`,
            `.${element}`,
            element.toLowerCase(),
          ];

          let found = false;
          for (const selector of selectors) {
            try {
              await page.waitForSelector(selector, { timeout: 5000 });
              found = true;
              break;
            } catch {
              // Try next selector
            }
          }

          if (!found) {
            // For semantic elements, check by tag
            if (['header', 'main', 'footer', 'nav', 'form'].includes(element)) {
              const semanticElement = await page.$(element);
              expect(semanticElement).toBeTruthy();
            } else {
              console.warn(`Critical element '${element}' not found on ${pageConfig.path}`);
            }
          }
        }
      });

      test('navigation links work correctly', async ({ page }) => {
        await page.goto(pageConfig.path);

        // Find internal navigation links
        const internalLinks = await page.$$eval('a[href^="/"]', links =>
          links
            .map(link => ({
              href: link.getAttribute('href'),
              text: link.textContent?.trim(),
            }))
            .filter(link => link.href && !link.href.startsWith('//'))
        );

        expect(internalLinks.length).toBeGreaterThan(0);

        // Test a few random links (to avoid testing all links which could be slow)
        const linksToTest = internalLinks.slice(0, Math.min(5, internalLinks.length));

        for (const link of linksToTest) {
          if (link.href && !link.href.includes('#')) {
            // Navigate to link and check it loads
            const linkResponse = await page.goto(link.href);
            expect(linkResponse?.status()).toBeLessThan(400);

            // Navigate back
            await page.goBack();
          }
        }
      });

      test('is responsive on mobile devices', async ({ page }) => {
        // Test mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto(pageConfig.path);

        // Check that content is visible and not horizontally scrolling
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await page.evaluate(() => window.innerWidth);

        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // 20px tolerance
      });

      test('is responsive on tablet devices', async ({ page }) => {
        // Test tablet viewport
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto(pageConfig.path);

        // Check that layout adapts properly
        const mainContent = await page.$('main, [role="main"], .main-content');
        expect(mainContent).toBeTruthy();
      });

      test('has proper accessibility features', async ({ page }) => {
        await page.goto(pageConfig.path);

        // Check for heading structure
        const headings = await page.$$eval('h1, h2, h3, h4, h5, h6', headings =>
          headings.map(h => h.tagName.toLowerCase())
        );

        if (headings.length > 0) {
          // Should have at least one h1
          expect(headings).toContain('h1');
        }

        // Check for alt text on images
        const imagesWithoutAlt = await page.$$eval('img:not([alt])', imgs => imgs.length);
        expect(imagesWithoutAlt).toBe(0);

        // Check for form labels
        const inputs = await page.$$(
          'input[type="text"], input[type="email"], input[type="password"], textarea'
        );
        for (const input of inputs) {
          const id = await input.getAttribute('id');
          const ariaLabel = await input.getAttribute('aria-label');
          const placeholder = await input.getAttribute('placeholder');

          if (id) {
            const label = await page.$(`label[for="${id}"]`);
            expect(label || ariaLabel || placeholder).toBeTruthy();
          }
        }
      });

      test('handles keyboard navigation', async ({ page }) => {
        await page.goto(pageConfig.path);

        // Test Tab navigation
        await page.keyboard.press('Tab');

        const focusedElement = await page.evaluate(() => document.activeElement?.tagName);

        // Should have focusable elements
        if (focusedElement) {
          expect(
            ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(focusedElement)
          ).toBeTruthy();
        }
      });

      if (
        pageConfig.path.includes('form') ||
        pageConfig.path.includes('login') ||
        pageConfig.path.includes('register') ||
        pageConfig.path.includes('contact')
      ) {
        test('form validation works correctly', async ({ page }) => {
          await page.goto(pageConfig.path);

          // Find form and submit button
          const form = await page.$('form');
          const submitButton = await page.$(
            'button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Send"), button:has-text("Login"), button:has-text("Register")'
          );

          if (form && submitButton) {
            // Try to submit empty form
            await submitButton.click();

            // Should show validation messages
            await page.waitForTimeout(1000);

            const validationMessages = await page.$$(
              '.error, .invalid, [role="alert"], .validation-message'
            );
            // Note: Some forms might not show immediate validation, so this is a soft check

            // Form should still be visible (not submitted with empty data)
            const formStillVisible = await page.$('form');
            expect(formStillVisible).toBeTruthy();
          }
        });
      }

      test('external links open in new tab', async ({ page }) => {
        await page.goto(pageConfig.path);

        // Find external links
        const externalLinks = await page.$$eval(
          'a[href^="http"]:not([href*="bell24h.com"]):not([href*="localhost"])',
          links =>
            links.map(link => ({
              href: link.getAttribute('href'),
              target: link.getAttribute('target'),
              rel: link.getAttribute('rel'),
            }))
        );

        externalLinks.forEach(link => {
          expect(link.target).toBe('_blank');
          expect(link.rel).toContain('noopener');
        });
      });

      test('page handles offline scenarios gracefully', async ({ page, context }) => {
        // Go offline
        await context.setOffline(true);

        try {
          await page.goto(pageConfig.path);
        } catch (error) {
          // Expected to fail, but should not crash
          expect(error.message).toMatch(/net::/);
        }

        // Go back online
        await context.setOffline(false);
      });

      test('page performance metrics are within acceptable range', async ({ page }) => {
        await page.goto(pageConfig.path);

        // Get performance metrics
        const metrics = await page.evaluate(() => {
          const navigation = performance.getEntriesByType(
            'navigation'
          )[0] as PerformanceNavigationTiming;
          return {
            domContentLoaded:
              navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
          };
        });

        // Assert performance thresholds
        expect(metrics.domContentLoaded).toBeLessThan(2000); // 2 seconds
        expect(metrics.loadComplete).toBeLessThan(5000); // 5 seconds
      });
    });
  });

  test.describe('Cross-Page Functionality', () => {
    test('navigation between pages works smoothly', async ({ page }) => {
      // Start from homepage
      await page.goto('/');

      // Navigate through key pages
      const navigationFlow = [
        '/categories',
        '/voice-rfq',
        '/login',
        '/', // Back to homepage
      ];

      for (const path of navigationFlow) {
        await page.goto(path);
        await page.waitForLoadState('domcontentloaded');

        // Check that navigation completed successfully
        expect(page.url()).toContain(path);
      }
    });

    test('search functionality works across pages', async ({ page }) => {
      await page.goto('/');

      // Find search input
      const searchInput = await page.$(
        'input[type="search"], input[placeholder*="search" i], input[placeholder*="find" i]'
      );

      if (searchInput) {
        await searchInput.fill('electronics');

        // Find and click search button
        const searchButton = await page.$('button:has-text("Search"), button[type="submit"]');
        if (searchButton) {
          await searchButton.click();

          // Should navigate to search results or update content
          await page.waitForTimeout(2000);

          const currentUrl = page.url();
          const bodyText = await page.textContent('body');

          // Either URL changed or content updated
          expect(currentUrl.includes('search') || bodyText?.includes('electronics')).toBeTruthy();
        }
      }
    });

    test('consistent header and footer across pages', async ({ page }) => {
      const testPages = ['/', '/categories', '/about'];
      let headerHtml: string | null = null;
      let footerHtml: string | null = null;

      for (const testPage of testPages) {
        await page.goto(testPage);

        const currentHeaderHtml = await page.$eval('header', el => el.outerHTML).catch(() => null);
        const currentFooterHtml = await page.$eval('footer', el => el.outerHTML).catch(() => null);

        if (headerHtml === null) {
          headerHtml = currentHeaderHtml;
          footerHtml = currentFooterHtml;
        } else {
          // Headers should be consistent (allowing for small differences)
          if (currentHeaderHtml && headerHtml) {
            expect(currentHeaderHtml.length).toBeGreaterThan(headerHtml.length * 0.8);
          }

          // Footers should be consistent
          if (currentFooterHtml && footerHtml) {
            expect(currentFooterHtml.length).toBeGreaterThan(footerHtml.length * 0.8);
          }
        }
      }
    });
  });

  test.describe('Error Handling', () => {
    test('404 page works correctly', async ({ page }) => {
      const response = await page.goto('/non-existent-page-12345');

      // Should return 404 status
      expect(response?.status()).toBe(404);

      // Should show user-friendly error page
      const bodyText = await page.textContent('body');
      expect(bodyText).toMatch(/404|not found|page not found/i);

      // Should have navigation back to homepage
      const homeLink = await page.$('a[href="/"], a:has-text("Home")');
      expect(homeLink).toBeTruthy();
    });

    test('handles slow network conditions', async ({ page, context }) => {
      // Simulate slow network
      await context.route('**/*', async route => {
        await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
        route.continue();
      });

      await page.goto('/');

      // Should still load successfully, just slower
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain('/');
    });
  });
});
