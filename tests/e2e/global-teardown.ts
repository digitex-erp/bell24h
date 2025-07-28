import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up E2E test environment...');

  try {
    // Clean up any test data created during tests
    console.log('🗑️ Cleaning up test data...');

    // You can add database cleanup here if needed
    // For now, we'll just log the cleanup

    console.log('✅ Global teardown completed successfully');
  } catch (error) {
    console.error('❌ Teardown failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
}

export default globalTeardown;
