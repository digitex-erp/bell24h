import fetch from 'node-fetch';

// Helper function to log test results
function logTestResult(name, passed, data = null, error = null) {
  if (passed) {
    console.log(`✅ ${name}: Passed`);
    if (data) {
      console.log(`   Response:`, data);
    }
  } else {
    console.log(`❌ ${name}: Failed`);
    if (error) {
      console.log(`   Error:`, error.message);
    }
  }
}

// Test health endpoint
async function testHealth() {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    
    // Validate response format
    const valid = 
      response.status === 200 && 
      data.status === 'success' &&
      data.message === 'Bell24h API is operational' &&
      data.timestamp;
    
    logTestResult('Health Check', valid, data);
    return { valid, data };
  } catch (error) {
    logTestResult('Health Check', false, null, error);
    throw error;
  }
}

// Test RFQs GET endpoint
async function testGetRfqs() {
  try {
    const response = await fetch('http://localhost:5000/api/rfqs');
    const data = await response.json();
    
    // Validate response format
    const valid = 
      response.status === 200 && 
      data.status === 'success' &&
      Array.isArray(data.data);
    
    logTestResult('Get RFQs', valid, { status: data.status, count: data.data?.length || 0 });
    return { valid, data };
  } catch (error) {
    logTestResult('Get RFQs', false, null, error);
    throw error;
  }
}

// Test industries GET endpoint
async function testGetIndustries() {
  try {
    const response = await fetch('http://localhost:5000/api/industries');
    const data = await response.json();
    
    // Validate response format
    const valid = 
      response.status === 200 && 
      data.status === 'success' &&
      Array.isArray(data.data);
    
    logTestResult('Get Industries', valid, { status: data.status, count: data.data?.length || 0 });
    return { valid, data };
  } catch (error) {
    logTestResult('Get Industries', false, null, error);
    throw error;
  }
}

// Test setup status endpoint
async function testSetupStatus() {
  try {
    const response = await fetch('http://localhost:5000/api/setup/status');
    const data = await response.json();
    
    // Validate response format
    const valid = 
      response.status === 200 && 
      data.status === 'success' &&
      Array.isArray(data.steps);
    
    logTestResult('Setup Status', valid, { status: data.status, steps: data.steps?.length || 0 });
    return { valid, data };
  } catch (error) {
    logTestResult('Setup Status', false, null, error);
    throw error;
  }
}

// Run all tests
async function runTests() {
  console.log('🔍 Starting Bell24h API tests...\n');
  
  try {
    // Test health endpoint
    await testHealth();
    
    // Test RFQs endpoint
    await testGetRfqs();
    
    // Test industries endpoint
    await testGetIndustries();
    
    // Test setup status endpoint
    await testSetupStatus();
    
    console.log('\n✨ All tests completed!\n');
  } catch (error) {
    console.error('\n❌ Tests failed with error:', error.message);
  }
}

runTests();