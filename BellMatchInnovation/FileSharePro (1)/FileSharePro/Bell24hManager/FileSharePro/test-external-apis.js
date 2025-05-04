/**
 * Test script for Bell24h External API integration
 *
 * This script tests the standalone external API server to ensure
 * that the API integration is working correctly.
 */

const fetch = require('node-fetch');

// Configuration
const SERVER_URL = 'http://localhost:3030';

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
};

// Format success or error messages
function formatResult(success, message) {
  const prefix = success 
    ? `${colors.green}✓${colors.reset}` 
    : `${colors.red}✗${colors.reset}`;
  return `${prefix} ${message}`;
}

// Log test results
function logTestResult(name, passed, data = null, error = null) {
  console.log('---------------------------------------------------');
  console.log(`Test: ${colors.blue}${name}${colors.reset}`);
  console.log(formatResult(passed, passed ? 'Passed' : 'Failed'));
  
  if (data) {
    console.log(`${colors.yellow}Response:${colors.reset}`);
    console.log(typeof data === 'string' ? data : JSON.stringify(data, null, 2));
  }
  
  if (error) {
    console.log(`${colors.red}Error:${colors.reset}`);
    console.log(error);
  }
  
  console.log('---------------------------------------------------\n');
  
  return passed;
}

// Helper to make API requests
async function apiRequest(endpoint) {
  try {
    console.log(`Fetching: ${SERVER_URL}${endpoint}`);
    const response = await fetch(`${SERVER_URL}${endpoint}`);
    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Test suite
async function runTests() {
  console.log(`${colors.blue}======================================${colors.reset}`);
  console.log(`${colors.blue}   Bell24h External API Test Suite    ${colors.reset}`);
  console.log(`${colors.blue}======================================${colors.reset}\n`);
  
  // Store test results
  let results = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  // Helper to run a test and track results
  async function runTest(testFunction) {
    results.total++;
    try {
      const passed = await testFunction();
      passed ? results.passed++ : results.failed++;
      return passed;
    } catch (error) {
      console.error('Test execution error:', error);
      results.failed++;
      return false;
    }
  }
  
  // Test health endpoint
  await runTest(async () => {
    const { success, data, error } = await apiRequest('/health');
    return logTestResult('Health Check', success, data, error);
  });
  
  // Test API status endpoint
  await runTest(async () => {
    const { success, data, error } = await apiRequest('/status');
    return logTestResult('API Status', success, data, error);
  });
  
  // Test FSAT services endpoint
  await runTest(async () => {
    const { success, data, error } = await apiRequest('/api/fsat/services');
    return logTestResult('FSAT Services', success, data, error);
  });
  
  // Test Kotak market data endpoint
  await runTest(async () => {
    const { success, data, error } = await apiRequest('/api/kotak/market-data');
    return logTestResult('Kotak Market Data', success, data, error);
  });
  
  // Test RazorpayX contacts endpoint
  await runTest(async () => {
    const { success, data, error } = await apiRequest('/api/razorpayx/contacts');
    return logTestResult('RazorpayX Contacts', success, data, error);
  });
  
  // Test KredX invoices endpoint
  await runTest(async () => {
    const { success, data, error } = await apiRequest('/api/kredx/invoices');
    return logTestResult('KredX Invoices', success, data, error);
  });
  
  // Print summary
  console.log(`${colors.blue}======================================${colors.reset}`);
  console.log(`${colors.blue}             Test Summary             ${colors.reset}`);
  console.log(`${colors.blue}======================================${colors.reset}`);
  console.log(`Total Tests: ${results.total}`);
  console.log(`Passed: ${colors.green}${results.passed}${colors.reset}`);
  console.log(`Failed: ${colors.red}${results.failed}${colors.reset}`);
  console.log(`${colors.blue}======================================${colors.reset}`);
}

// Start the tests
runTests().catch(error => {
  console.error('Test execution error:', error);
  process.exit(1);
});