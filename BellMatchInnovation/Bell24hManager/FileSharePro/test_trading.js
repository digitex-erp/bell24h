// Test script for Bell24h trading features
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Helper function to log test results
function logTestResult(name, passed, data = null, error = null) {
  const status = passed ? `${colors.green}✓ PASSED${colors.reset}` : `${colors.red}✗ FAILED${colors.reset}`;
  console.log(`${colors.bright}[TEST]${colors.reset} ${name}: ${status}`);
  
  if (data) {
    console.log(`${colors.dim}Response data:${colors.reset}`, typeof data === 'string' ? data : JSON.stringify(data, null, 2));
  }
  
  if (error) {
    console.log(`${colors.red}Error:${colors.reset}`, error);
  }
  
  console.log(''); // Empty line for readability
}

// Test health endpoint
async function testHealth() {
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();
    
    const passed = response.status === 200 && data.status === 'success';
    logTestResult('Health Check', passed, data);
    return passed;
  } catch (error) {
    logTestResult('Health Check', false, null, error.message);
    return false;
  }
}

// Test getting RFQs
async function testGetRfqs() {
  try {
    const response = await fetch(`${BASE_URL}/api/rfqs`);
    const data = await response.json();
    
    const passed = response.status === 200 && data.status === 'success' && Array.isArray(data.data);
    logTestResult('Get RFQs', passed, data);
    return passed ? data.data : null;
  } catch (error) {
    logTestResult('Get RFQs', false, null, error.message);
    return null;
  }
}

// Test RFQ matching
async function testRfqMatching(rfqId) {
  if (!rfqId) {
    logTestResult('RFQ Matching', false, null, 'No RFQ ID provided');
    return false;
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/rfqs/${rfqId}/matches`);
    const data = await response.json();
    
    const passed = response.status === 200 && data.status === 'success' && data.data && data.data.matches;
    logTestResult('RFQ Matching', passed, {
      rfqId,
      matchCount: data.data?.matches?.length || 0,
      topMatchScore: data.data?.matches?.[0]?.matchScore
    });
    return passed ? data.data.matches : null;
  } catch (error) {
    logTestResult('RFQ Matching', false, null, error.message);
    return null;
  }
}

// Test WebSocket info
async function testWebSocketInfo() {
  try {
    const response = await fetch(`${BASE_URL}/ws-info`);
    const data = await response.json();
    
    const passed = response.status === 200 && data.status === 'success' && data.endpoint;
    logTestResult('WebSocket Info', passed, data);
    return passed ? data : null;
  } catch (error) {
    logTestResult('WebSocket Info', false, null, error.message);
    return null;
  }
}

// Test trading analytics
async function testTradingAnalytics() {
  try {
    const response = await fetch(`${BASE_URL}/api/analytics/trading`);
    const data = await response.json();
    
    const passed = response.status === 200 && data.status === 'success' && data.data;
    logTestResult('Trading Analytics', passed, data);
    return passed ? data.data : null;
  } catch (error) {
    logTestResult('Trading Analytics', false, null, error.message);
    return null;
  }
}

// Run all tests
async function runTests() {
  console.log(`${colors.bright}${colors.blue}Bell24h Trading Features Test${colors.reset}`);
  console.log(`${colors.dim}Running tests against ${BASE_URL}${colors.reset}`);
  console.log('');
  
  // Run basic health check first
  const healthOk = await testHealth();
  
  if (!healthOk) {
    console.log(`${colors.red}Health check failed. Aborting tests.${colors.reset}`);
    return;
  }
  
  // Get RFQs and run tests with the first one
  const rfqs = await testGetRfqs();
  
  if (rfqs && rfqs.length > 0) {
    const rfqId = rfqs[0].id;
    console.log(`${colors.cyan}Using RFQ ID ${rfqId} for testing${colors.reset}`);
    console.log('');
    
    await testRfqMatching(rfqId);
  } else {
    console.log(`${colors.yellow}No RFQs found. Skipping RFQ-specific tests.${colors.reset}`);
  }
  
  // Test WebSocket functionality
  await testWebSocketInfo();
  
  // Test trading analytics
  await testTradingAnalytics();
  
  console.log(`${colors.bright}${colors.blue}Testing complete${colors.reset}`);
}

// Execute the tests
runTests().catch(error => {
  console.error(`${colors.red}Unhandled error:${colors.reset}`, error);
});