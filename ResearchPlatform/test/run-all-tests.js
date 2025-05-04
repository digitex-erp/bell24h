const { execSync } = require('child_process');

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m", 
  yellow: "\x1b[33m",
  blue: "\x1b[34m"
};

const testSuites = [
  { name: 'API Health', command: 'node test/api-health.test.js' },
  { name: 'Perplexity Integration', command: 'node test/perplexity-integration.test.js' },
  { name: 'Perplexity Fallback', command: 'node test/perplexity-fallback.test.js' }
];

function logSection(sectionTitle) {
  console.log(`\n${colors.yellow}${sectionTitle}:${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}${message}${colors.reset}`);
}


async function runTests() {
  console.log(`${colors.blue}Starting comprehensive test suite...${colors.reset}\n`);
  const startTime = Date.now();

  try {
    // API Health Check
    logSection('API Health Check & Endpoints');
    execSync('node test/api-health.test.js', { stdio: 'inherit' });
    logSuccess('API health checks passed');

    // Integration Tests
    logSection('Integration Tests');
    execSync('node test/perplexity-integration.test.js', { stdio: 'inherit' });
    execSync('node test/perplexity-fallback.test.js', { stdio: 'inherit' });
    logSuccess('Integration tests passed');

    // Preview Verification
    logSection('Preview Verification');
    execSync('node start-preview.js', { stdio: 'inherit' });
    logSuccess('Preview verification passed');

    // Service Tests
    logSection('Service Tests');
    execSync('node test/test-global-trade-insights.js', { stdio: 'inherit' });
    execSync('node test/test-industry-trends.ts', { stdio: 'inherit' });
    execSync('node test/test-stock-analysis.js', { stdio: 'inherit' });
    logSuccess('Service tests passed');

    //Additional Tests (GST and other)
    logSection('Additional Tests');
    execSync('node test/test-gst-validation.js', { stdio: 'inherit' });
    logSuccess('GST Validation Tests Passed');


    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`\n${colors.green}All test suites completed successfully in ${duration}s!${colors.reset}`);
  } catch (error) {
    console.error(`\n${colors.red}Test suite failed:${colors.reset}`, error.message);
    process.exit(1);
  }
}

runTests().catch(console.error);