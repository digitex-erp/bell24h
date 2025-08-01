// Global setup for Bell24H testing environment
import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Bell24H Global Test Setup - Starting...');

  // Browser setup for headless testing
  const browser = await chromium.launch();

  // Create a new context and page for initial setup
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test server connectivity
    console.log('🔍 Checking server connectivity...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    console.log('✅ Server is responsive');

    // Clear any existing state
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    console.log('🧹 Cleared browser state');
  } catch (error) {
    console.warn('⚠️ Server not running - tests may need local dev server');
  } finally {
    await context.close();
    await browser.close();
  }

  console.log('✨ Bell24H Global Test Setup - Complete!');
}

export default globalSetup;
