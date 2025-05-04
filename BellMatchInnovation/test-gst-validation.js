/**
 * Test script for GST Validation API
 * 
 * This script tests the GST validation endpoints to ensure they are working correctly.
 */

const axios = require('axios');

// Constants
const BASE_URL = 'http://localhost:3000/api';
const TEST_GSTIN = '27AADCB2230M1ZT'; // Example GSTIN

// Test functions
async function testGSTValidation() {
  try {
    console.log('Testing GST validation endpoint...');
    const response = await axios.post(`${BASE_URL}/gst/validate`, {
      gstin: TEST_GSTIN
    });
    console.log('GST Validation Response:', response.data);
    return true;
  } catch (error) {
    console.error('GST validation test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testBusinessDetails() {
  try {
    console.log('Testing GST business details endpoint...');
    const response = await axios.get(`${BASE_URL}/gst/business-details/${TEST_GSTIN}`);
    console.log('Business Details Response:', response.data);
    return true;
  } catch (error) {
    console.error('Business details test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testInvoiceVerification() {
  try {
    console.log('Testing invoice verification endpoint...');
    const response = await axios.post(`${BASE_URL}/gst/verify-invoice`, {
      gstin: TEST_GSTIN,
      invoiceNumber: 'INV-001',
      invoiceDate: '2023-01-01'
    });
    console.log('Invoice Verification Response:', response.data);
    return true;
  } catch (error) {
    console.error('Invoice verification test failed:', error.response?.data || error.message);
    return false;
  }
}

async function testBulkValidation() {
  try {
    console.log('Testing bulk GST validation endpoint...');
    const response = await axios.post(`${BASE_URL}/gst/bulk-validate`, {
      gstinList: [TEST_GSTIN, '29AAFCD5862R1ZR']
    });
    console.log('Bulk Validation Response:', response.data);
    return true;
  } catch (error) {
    console.error('Bulk validation test failed:', error.response?.data || error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('Starting GST Validation API tests...\n');
  
  const testResults = {
    validation: await testGSTValidation(),
    businessDetails: await testBusinessDetails(),
    invoiceVerification: await testInvoiceVerification(),
    bulkValidation: await testBulkValidation(),
  };
  
  console.log('\nTest Results Summary:');
  for (const [test, passed] of Object.entries(testResults)) {
    console.log(`- ${test}: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  }
  
  const allPassed = Object.values(testResults).every(result => result);
  console.log(`\nOverall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (!allPassed) {
    console.log('\nPossible issues:');
    console.log('1. Make sure the server is running');
    console.log('2. Check if GST_API_KEY environment variable is set');
    console.log('3. Verify the GST API base URL is correct');
    console.log('4. Ensure the test GSTIN values are valid');
  }
}

// Check if being run directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testGSTValidation,
  testBusinessDetails,
  testInvoiceVerification,
  testBulkValidation,
  runTests
};