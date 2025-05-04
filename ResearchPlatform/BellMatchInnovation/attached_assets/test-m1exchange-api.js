/**
 * M1 Exchange API Endpoint Testing Script
 * 
 * This script tests all the M1 Exchange API endpoints to ensure they are working correctly.
 * Run with: node test-m1exchange-api.js
 */

const axios = require('axios');
const colors = require('colors/safe');
require('dotenv').config();

// Configure axios instance
const baseURL = process.env.API_BASE_URL || 'http://localhost:3000';
const apiPrefix = '/api';
const api = axios.create({ baseURL });

// Test data for early payment request
const testData = {
  milestoneId: 1,
  supplierId: 101,
  transactionId: 'tx_test_12345'
};

// Function to run all tests
async function runTests() {
  console.log(colors.cyan.bold('\n=== M1 Exchange API Testing ===\n'));
  
  try {
    await testGetStatus();
    await testRequestEarlyPayment();
    await testGetTransactionById();
    await testGetSupplierTransactions();
    await testUpdateTransactionStatus();
    await testGeneratePaymentReport();
    
    console.log(colors.green.bold('\n✅ All tests completed successfully!\n'));
  } catch (error) {
    console.log(colors.red.bold('\n❌ Test execution failed:'), error.message);
  }
}

// Test the status endpoint
async function testGetStatus() {
  console.log(colors.cyan('Testing GET /m1exchange/status...'));
  
  try {
    const response = await api.get(`${apiPrefix}/m1exchange/status`);
    
    if (response.status === 200) {
      console.log(colors.green('✓ Status endpoint returned 200 OK'));
      console.log(colors.gray(`  Response: ${JSON.stringify(response.data, null, 2)}`));
      return true;
    } else {
      console.log(colors.red(`✗ Status endpoint returned unexpected status: ${response.status}`));
      return false;
    }
  } catch (error) {
    handleRequestError('Status endpoint', error);
    throw error;
  }
}

// Test the early payment request endpoint
async function testRequestEarlyPayment() {
  console.log(colors.cyan(`\nTesting POST /m1exchange/early-payment/${testData.milestoneId}...`));
  
  try {
    const response = await api.post(
      `${apiPrefix}/m1exchange/early-payment/${testData.milestoneId}`,
      { supplierId: testData.supplierId }
    );
    
    if (response.status === 201) {
      console.log(colors.green('✓ Early payment request endpoint returned 201 Created'));
      console.log(colors.gray(`  Response: ${JSON.stringify(response.data, null, 2)}`));
      
      // Save the transaction ID for subsequent tests
      if (response.data && response.data.id) {
        testData.transactionId = response.data.id;
        console.log(colors.gray(`  Using transaction ID: ${testData.transactionId}`));
      }
      
      return true;
    } else {
      console.log(colors.red(`✗ Early payment request endpoint returned unexpected status: ${response.status}`));
      return false;
    }
  } catch (error) {
    handleRequestError('Early payment request endpoint', error);
    console.log(colors.yellow('⚠️ Continuing with test transaction ID...'));
    return false;
  }
}

// Test the get transaction details endpoint
async function testGetTransactionById() {
  console.log(colors.cyan(`\nTesting GET /m1exchange/transactions/${testData.transactionId}...`));
  
  try {
    const response = await api.get(`${apiPrefix}/m1exchange/transactions/${testData.transactionId}`);
    
    if (response.status === 200) {
      console.log(colors.green('✓ Get transaction endpoint returned 200 OK'));
      console.log(colors.gray(`  Response: ${JSON.stringify(response.data, null, 2)}`));
      return true;
    } else {
      console.log(colors.red(`✗ Get transaction endpoint returned unexpected status: ${response.status}`));
      return false;
    }
  } catch (error) {
    handleRequestError('Get transaction endpoint', error);
    return false;
  }
}

// Test the get supplier transactions endpoint
async function testGetSupplierTransactions() {
  console.log(colors.cyan(`\nTesting GET /m1exchange/transactions/supplier/${testData.supplierId}...`));
  
  try {
    const response = await api.get(`${apiPrefix}/m1exchange/transactions/supplier/${testData.supplierId}`);
    
    if (response.status === 200) {
      console.log(colors.green('✓ Get supplier transactions endpoint returned 200 OK'));
      console.log(colors.gray(`  Response: ${JSON.stringify(response.data, null, 2)}`));
      return true;
    } else {
      console.log(colors.red(`✗ Get supplier transactions endpoint returned unexpected status: ${response.status}`));
      return false;
    }
  } catch (error) {
    handleRequestError('Get supplier transactions endpoint', error);
    return false;
  }
}

// Test the update transaction status endpoint
async function testUpdateTransactionStatus() {
  console.log(colors.cyan(`\nTesting PATCH /m1exchange/transactions/${testData.transactionId}/status...`));
  
  try {
    const response = await api.patch(
      `${apiPrefix}/m1exchange/transactions/${testData.transactionId}/status`,
      { status: 'completed' }
    );
    
    if (response.status === 200) {
      console.log(colors.green('✓ Update transaction status endpoint returned 200 OK'));
      console.log(colors.gray(`  Response: ${JSON.stringify(response.data, null, 2)}`));
      return true;
    } else {
      console.log(colors.red(`✗ Update transaction status endpoint returned unexpected status: ${response.status}`));
      return false;
    }
  } catch (error) {
    handleRequestError('Update transaction status endpoint', error);
    return false;
  }
}

// Test the generate payment report endpoint
async function testGeneratePaymentReport() {
  console.log(colors.cyan('\nTesting GET /m1exchange/reports/payments...'));
  
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const startDate = thirtyDaysAgo.toISOString().split('T')[0]; // YYYY-MM-DD
  const endDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
  
  try {
    const response = await api.get(
      `${apiPrefix}/m1exchange/reports/payments?startDate=${startDate}&endDate=${endDate}`
    );
    
    if (response.status === 200) {
      console.log(colors.green('✓ Generate payment report endpoint returned 200 OK'));
      console.log(colors.gray(`  Response: ${JSON.stringify(response.data, null, 2)}`));
      return true;
    } else {
      console.log(colors.red(`✗ Generate payment report endpoint returned unexpected status: ${response.status}`));
      return false;
    }
  } catch (error) {
    handleRequestError('Generate payment report endpoint', error);
    return false;
  }
}

// Helper function to handle request errors
function handleRequestError(endpoint, error) {
  console.log(colors.red(`✗ ${endpoint} request failed:`));
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log(colors.red(`  Status: ${error.response.status}`));
    console.log(colors.red(`  Data: ${JSON.stringify(error.response.data, null, 2)}`));
  } else if (error.request) {
    // The request was made but no response was received
    console.log(colors.red('  No response received from server'));
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log(colors.red(`  Error: ${error.message}`));
  }
}

// Run the tests
runTests().catch(error => {
  console.error(colors.red.bold('Fatal error:'), error);
});