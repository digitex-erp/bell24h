// Global teardown for Bell24H testing environment
import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Bell24H Global Test Teardown - Starting...');

  // Clean up any test artifacts
  try {
    // Clear test databases, temporary files, etc.
    console.log('🗑️ Cleaning up test artifacts...');

    // Reset any global state
    console.log('🔄 Resetting global state...');

    // Log final test summary
    console.log('📊 Test execution completed');
  } catch (error) {
    console.warn('⚠️ Warning during teardown:', error);
  }

  console.log('✨ Bell24H Global Test Teardown - Complete!');
}

export default globalTeardown;
