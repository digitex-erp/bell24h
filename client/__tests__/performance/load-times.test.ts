import { chromium, Browser, Page } from '@playwright/test';

/**
 * Phase E: Basic Performance Testing (Cursor-safe)
 * Measures page load times for critical pages
 * Keep under 50 lines to prevent hanging
 */

describe('Performance - Page Load Times', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
  });

  afterEach(async () => {
    await page.close();
  });

  const measureLoadTime = async (url: string): Promise<number> => {
    const startTime = Date.now();
    await page.goto(url, { waitUntil: 'networkidle' });
    return Date.now() - startTime;
  };

  test('homepage loads within acceptable time', async () => {
    const loadTime = await measureLoadTime('http://localhost:3000/');
    expect(loadTime).toBeLessThan(3000); // 3 seconds max
    console.log(`Homepage load time: ${loadTime}ms`);
  });

  test('dashboard loads within acceptable time', async () => {
    const loadTime = await measureLoadTime('http://localhost:3000/dashboard');
    expect(loadTime).toBeLessThan(4000); // 4 seconds max
    console.log(`Dashboard load time: ${loadTime}ms`);
  });

  test('categories page loads within acceptable time', async () => {
    const loadTime = await measureLoadTime('http://localhost:3000/categories');
    expect(loadTime).toBeLessThan(3500); // 3.5 seconds max
    console.log(`Categories load time: ${loadTime}ms`);
  });
});
