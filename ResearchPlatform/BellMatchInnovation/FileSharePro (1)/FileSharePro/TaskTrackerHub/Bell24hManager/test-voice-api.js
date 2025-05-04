/**
 * Test script for Bell24h Voice Assistant API
 * 
 * This script tests the voice API endpoints to ensure they are working correctly.
 */

const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// Configuration
const API_BASE_URL = 'http://localhost:3000';
const VOICE_API_ENDPOINT = '/api/voice';
const WHISPER_ENDPOINT = '/api/whisper/transcribe';
const STATUS_ENDPOINT = '/api/voice/status';
const ENHANCE_ENDPOINT = '/api/voice/enhance';

// Log formatting
function logTestResult(name, passed, data = null, error = null) {
  const status = passed ? '✅ PASSED' : '❌ FAILED';
  console.log(`\n${status} - ${name}`);
  
  if (data) {
    console.log('  Response:', typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  }
  
  if (error) {
    console.log('  Error:', error.message || error);
    if (error.response && error.response.data) {
      console.log('  Error details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// API request helper
async function apiRequest(endpoint, method = 'get', data = null, headers = {}) {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = { headers };
    
    if (method.toLowerCase() === 'get') {
      return await axios.get(url, config);
    } else if (method.toLowerCase() === 'post') {
      return await axios.post(url, data, config);
    }
  } catch (error) {
    console.error(`API Request Error: ${error.message}`);
    throw error;
  }
}

// Test functions
async function testVoiceApiStatus() {
  try {
    const response = await apiRequest(STATUS_ENDPOINT);
    logTestResult('Voice API Status Check', response.status === 200, response.data);
    return response.data;
  } catch (error) {
    logTestResult('Voice API Status Check', false, null, error);
    return null;
  }
}

async function testVoiceEnhancement() {
  try {
    const testTexts = [
      'show me my RFQs',
      'create new Request for Quotation for chemical supplies',
      'find suppliers in automotive industry',
      'compare top suppliers for last RFQ',
      'what can this voice assistant do'
    ];
    
    let allPassed = true;
    
    for (const text of testTexts) {
      const response = await apiRequest(ENHANCE_ENDPOINT, 'post', { text });
      
      const passed = 
        response.status === 200 && 
        response.data.command && 
        response.data.intent && 
        typeof response.data.confidence === 'number';
      
      if (!passed) allPassed = false;
      
      logTestResult(`Voice Enhancement Test: "${text}"`, passed, response.data);
    }
    
    return allPassed;
  } catch (error) {
    logTestResult('Voice Enhancement Tests', false, null, error);
    return false;
  }
}

async function checkEnvVars() {
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️ Warning: OPENAI_API_KEY environment variable is not set');
    console.log('Some tests may fail or fall back to simpler functionality');
    return false;
  }
  return true;
}

// Main test runner
async function runTests() {
  console.log('🧪 Starting Bell24h Voice API Tests 🧪');
  console.log('=======================================');
  
  await checkEnvVars();
  
  let success = true;
  
  try {
    // Test API status
    const statusResult = await testVoiceApiStatus();
    if (!statusResult) success = false;
    
    // Test voice command enhancement
    const enhancementResult = await testVoiceEnhancement();
    if (!enhancementResult) success = false;
    
    // Summarize results
    console.log('\n=======================================');
    if (success) {
      console.log('🎉 All voice API tests completed successfully!');
    } else {
      console.log('⚠️ Some voice API tests failed. See details above.');
    }
    
  } catch (error) {
    console.error('\n❌ Test suite error:', error.message);
    success = false;
  }
  
  return success;
}

// Run the tests
runTests().catch(err => {
  console.error('Error running tests:', err);
  process.exit(1);
});