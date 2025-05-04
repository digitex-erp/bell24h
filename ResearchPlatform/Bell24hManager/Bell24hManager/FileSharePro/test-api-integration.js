/**
 * API Integration Test Script for Bell24h
 * 
 * This script checks if the external API integration endpoints
 * are working correctly. It tests both configured and unconfigured APIs.
 */

import fetch from 'node-fetch';

// Configuration
const API_BASE_URL = 'http://localhost:5000';
const EXTERNAL_API_BASE = `${API_BASE_URL}/api/external`;

// Helper to make API requests
async function apiRequest(endpoint) {
  try {
    console.log(`Testing endpoint: ${endpoint}`);
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    const data = await response.json();
    return { success: response.ok, data };
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

// Run test suite
async function runTests() {
  console.log('Starting Bell24h API integration tests...');
  console.log('======================================');
  
  // Test health endpoint
  const healthCheck = await apiRequest('/api/health');
  console.log('Health check result:', healthCheck.success ? 'Success ✓' : 'Failed ✗');
  if (healthCheck.data) {
    console.log('Response:', JSON.stringify(healthCheck.data, null, 2));
  }
  console.log('======================================');
  
  // Test external API status
  const externalStatus = await apiRequest('/api/external/status');
  console.log('External API status result:', externalStatus.success ? 'Success ✓' : 'Failed ✗');
  if (externalStatus.data) {
    console.log('Response:', JSON.stringify(externalStatus.data, null, 2));
  }
  console.log('======================================');
  
  // Test FSAT endpoint
  const fsatTest = await apiRequest('/api/external/fsat/services');
  console.log('FSAT API test result:', fsatTest.success ? 'Success ✓' : 'Failed ✗');
  if (fsatTest.data) {
    console.log('Response:', JSON.stringify(fsatTest.data, null, 2));
  }
  console.log('======================================');
  
  console.log('All tests completed!');
}

// Check if environment variables are set
function checkEnvVars() {
  const required = ['FSAT_API_KEY', 'FSAT_API_SECRET', 'FSAT_BASE_URL'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.log('Warning: Some environment variables are missing:');
    missing.forEach(key => console.log(`  - ${key}`));
    console.log('API endpoints requiring these variables may return configuration errors.');
  } else {
    console.log('All required environment variables are set.');
  }
  console.log('======================================');
}

// Run the tests
checkEnvVars();
runTests().catch(error => {
  console.error('Test execution error:', error.message);
  process.exit(1);
});