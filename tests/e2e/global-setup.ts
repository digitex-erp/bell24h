import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;

  console.log('🚀 Setting up E2E test environment...');

  // Launch browser for setup tasks
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Wait for the application to be ready
    console.log('⏳ Waiting for application to be ready...');
    await page.goto(baseURL!);
    await page.waitForLoadState('networkidle');

    // Verify the application is running
    const title = await page.title();
    console.log(`✅ Application loaded: ${title}`);

    // Check if we need to seed test data
    console.log('📊 Checking test data setup...');

    // You can add database seeding here if needed
    // For now, we'll just verify the app is accessible
  } catch (error) {
    console.error('❌ Setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }

  console.log('✅ Global setup completed successfully');
}

export default globalSetup;
