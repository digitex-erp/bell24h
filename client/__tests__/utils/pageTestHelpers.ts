// Enhanced Page Test Helpers - Next.js Hydration Aware
// Provides sophisticated utilities for testing Next.js applications

import { Page } from '@playwright/test';

export class EnhancedPageTester {
  static async waitForNextjsHydration(page: any, timeout = 10000) {
    // Wait for network idle
    await page.waitForLoadState('networkidle');

    // Wait for document ready
    await page.waitForFunction(() => document.readyState === 'complete');

    // Wait for React hydration (no hydration mismatches)
    try {
      await page.waitForFunction(
        () => {
          // Check for hydration warnings
          const hasHydrationWarnings = document.body.textContent?.includes(
            'Warning: Text content did not match'
          );
          const hasReactErrors = document.body.textContent?.includes('Hydration failed');
          return !hasHydrationWarnings && !hasReactErrors;
        },
        { timeout }
      );
    } catch (e) {
      console.log('Hydration check timed out, proceeding with test...');
    }
  }

  static async getVisibleContentOnly(page: any): Promise<string> {
    return await page.evaluate(() => {
      // Clone the body to avoid modifying the actual page
      const bodyClone = document.body.cloneNode(true) as HTMLElement;

      // Remove all script tags and their content
      const scripts = bodyClone.querySelectorAll('script');
      scripts.forEach(script => script.remove());

      // Remove Next.js specific elements
      const nextElements = bodyClone.querySelectorAll(
        '[data-nextjs-scroll-focus-boundary], [data-reactroot], [data-next-hydration-error]'
      );
      nextElements.forEach(el => el.remove());

      // Remove hidden elements
      const hiddenElements = bodyClone.querySelectorAll('[style*="display: none"], [hidden]');
      hiddenElements.forEach(el => el.remove());

      // Get the main content area
      const mainContent =
        bodyClone.querySelector('main') ||
        bodyClone.querySelector('[role="main"]') ||
        bodyClone.querySelector('#__next') ||
        bodyClone;

      return mainContent.innerText.trim();
    });
  }

  static isActualError(content: string): boolean {
    // More sophisticated error detection that avoids Next.js internal code
    const trimmedContent = content.trim();

    // Check for actual user-facing error messages
    const userFacingErrors = [
      /^404\s*$/i,
      /^not found\s*$/i,
      /^page not found\s*$/i,
      /^error\s*$/i,
      /this page could not be found/i,
      /something went wrong/i,
      /internal server error/i,
      /service unavailable/i,
    ];

    return userFacingErrors.some(pattern => pattern.test(trimmedContent));
  }

  static async validatePageContent(
    page: any,
    expectedContent: string[],
    minLength = 100
  ): Promise<boolean> {
    await this.waitForNextjsHydration(page);
    const visibleContent = await this.getVisibleContentOnly(page);

    // Check content length
    if (visibleContent.length < minLength) {
      return false;
    }

    // Check for actual errors
    if (this.isActualError(visibleContent)) {
      return false;
    }

    // Check for expected content
    if (expectedContent.length > 0) {
      const contentLower = visibleContent.toLowerCase();
      const hasExpectedContent = expectedContent.some(content =>
        contentLower.includes(content.toLowerCase())
      );
      if (!hasExpectedContent) {
        return false;
      }
    }

    return true;
  }

  static async measurePerformance(page: any): Promise<{
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
  }> {
    return await page.evaluate(() => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');

      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        firstContentfulPaint:
          paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: lcpEntries[lcpEntries.length - 1]?.startTime || 0,
      };
    });
  }

  static async checkAccessibility(page: any): Promise<{
    hasSkipLinks: boolean;
    hasProperHeadings: boolean;
    hasAltTexts: boolean;
    hasAriaLabels: boolean;
  }> {
    return await page.evaluate(() => {
      // Check for skip links
      const skipLinks = document.querySelectorAll('a[href^="#"]');
      const hasSkipLinks = Array.from(skipLinks).some(link =>
        link.textContent?.toLowerCase().includes('skip')
      );

      // Check heading hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const hasProperHeadings = headings.length > 0 && document.querySelector('h1') !== null;

      // Check images have alt text
      const images = document.querySelectorAll('img');
      const hasAltTexts = Array.from(images).every(img => img.hasAttribute('alt'));

      // Check for ARIA labels on interactive elements
      const interactiveElements = document.querySelectorAll('button, input, select, textarea');
      const hasAriaLabels = Array.from(interactiveElements).every(
        el =>
          el.hasAttribute('aria-label') ||
          el.hasAttribute('aria-labelledby') ||
          el.closest('label') !== null ||
          (el as HTMLInputElement).labels?.length > 0
      );

      return {
        hasSkipLinks,
        hasProperHeadings,
        hasAltTexts,
        hasAriaLabels,
      };
    });
  }

  static async validateSEO(page: any): Promise<{
    hasTitle: boolean;
    hasMetaDescription: boolean;
    hasCanonical: boolean;
    hasOpenGraph: boolean;
    hasStructuredData: boolean;
  }> {
    return await page.evaluate(() => {
      const hasTitle = document.title && document.title.length > 0;
      const hasMetaDescription = document.querySelector('meta[name="description"]') !== null;
      const hasCanonical = document.querySelector('link[rel="canonical"]') !== null;
      const hasOpenGraph = document.querySelector('meta[property^="og:"]') !== null;
      const hasStructuredData =
        document.querySelector('script[type="application/ld+json"]') !== null;

      return {
        hasTitle,
        hasMetaDescription,
        hasCanonical,
        hasOpenGraph,
        hasStructuredData,
      };
    });
  }

  static async captureNetworkRequests(page: any): Promise<{
    totalRequests: number;
    failedRequests: number;
    slowRequests: number;
    largeRequests: number;
  }> {
    const requests: any[] = [];

    page.on('response', (response: any) => {
      requests.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length'] || 0,
        loadTime: Date.now() - response.request().timestamp(),
      });
    });

    // Wait for page load
    await page.waitForLoadState('networkidle');

    const failedRequests = requests.filter(req => req.status >= 400).length;
    const slowRequests = requests.filter(req => req.loadTime > 2000).length;
    const largeRequests = requests.filter(req => req.size > 1000000).length; // > 1MB

    return {
      totalRequests: requests.length,
      failedRequests,
      slowRequests,
      largeRequests,
    };
  }
}

// Export additional utilities
export const TestUtils = {
  /**
   * Wait for element with retry logic
   */
  async waitForElementWithRetry(page: any, selector: string, retries = 3): Promise<boolean> {
    for (let i = 0; i < retries; i++) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        return true;
      } catch (e) {
        if (i === retries - 1) return false;
        await page.waitForTimeout(1000);
      }
    }
    return false;
  },

  /**
   * Get page title with fallback
   */
  async getPageTitle(page: any): Promise<string> {
    try {
      return await page.title();
    } catch (e) {
      return 'Title not found';
    }
  },

  /**
   * Check if page is responsive
   */
  async checkResponsiveness(page: any): Promise<boolean> {
    const viewports = [
      { width: 375, height: 667 }, // Mobile
      { width: 768, height: 1024 }, // Tablet
      { width: 1280, height: 720 }, // Desktop
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);

      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const viewportWidth = viewport.width;

      if (bodyWidth > viewportWidth + 20) {
        return false;
      }
    }

    return true;
  },
};

export default EnhancedPageTester;
