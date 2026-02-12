// Manual API Testing for Payment Endpoints
// Run this to test the payment API endpoints

const API_BASE_URL = 'http://localhost:3000';

interface TestResult {
  endpoint: string;
  success: boolean;
  status: number;
  message: string;
  data?: any;
  error?: string;
}

async function testEndpoint(endpoint: string, options: RequestInit = {}): Promise<TestResult> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json().catch(() => null);
    
    return {
      endpoint,
      success: response.ok,
      status: response.status,
      message: response.ok ? 'Success' : 'Failed',
      data: data,
      error: !response.ok ? data?.error || 'Unknown error' : undefined
    };
  } catch (error) {
    return {
      endpoint,
      success: false,
      status: 0,
      message: 'Network error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function runPaymentAPITests() {
  console.log('🧪 Testing Payment API Endpoints...\n');
  
  const results: TestResult[] = [];
  
  // Test 1: Create Payment Order
  console.log('1️⃣ Testing Create Payment Order...');
  const createOrderResult = await testEndpoint('/api/payments/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: 100, // ₹100
      userId: '1', // Test user ID
      rfqId: 1,    // Test RFQ ID
      planId: 'pro',
      planName: 'Pro Plan'
    })
  });
  results.push(createOrderResult);
  console.log(`   Status: ${createOrderResult.status} - ${createOrderResult.message}`);
  if (createOrderResult.success) {
    console.log(`   Order ID: ${createOrderResult.data?.order?.id}`);
    console.log(`   Payment ID: ${createOrderResult.data?.payment?.id}`);
  } else {
    console.log(`   Error: ${createOrderResult.error}`);
  }
  console.log('');
  
  // Test 2: Get Payment Status (if order was created)
  if (createOrderResult.success && createOrderResult.data?.payment?.orderId) {
    console.log('2️⃣ Testing Get Payment Status...');
    const orderId = createOrderResult.data.payment.orderId;
    const statusResult = await testEndpoint(`/api/payments/status?orderId=${orderId}`);
    results.push(statusResult);
    console.log(`   Status: ${statusResult.status} - ${statusResult.message}`);
    if (statusResult.success) {
      console.log(`   Payment Status: ${statusResult.data?.payment?.status}`);
      console.log(`   Amount: ₹${statusResult.data?.payment?.amount}`);
    } else {
      console.log(`   Error: ${statusResult.error}`);
    }
    console.log('');
  }
  
  // Test 3: Test Webhook Endpoint (with test payload)
  console.log('3️⃣ Testing Webhook Endpoint...');
  const webhookResult = await testEndpoint('/api/payments/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-razorpay-signature': 'test-signature'
    },
    body: JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: {
          id: 'pay_test123',
          order_id: 'order_test123',
          amount: 10000,
          method: 'card'
        }
      }
    })
  });
  results.push(webhookResult);
  console.log(`   Status: ${webhookResult.status} - ${webhookResult.message}`);
  if (!webhookResult.success) {
    console.log(`   Error: ${webhookResult.error}`);
  }
  console.log('');
  
  // Test 4: Test Invalid Request (validation)
  console.log('4️⃣ Testing Invalid Request Validation...');
  const invalidResult = await testEndpoint('/api/payments/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Missing required fields
      amount: 0, // Invalid amount
    })
  });
  results.push(invalidResult);
  console.log(`   Status: ${invalidResult.status} - ${invalidResult.message}`);
  console.log(`   Expected Error: ${invalidResult.error}`);
  console.log('');
  
  // Summary
  console.log('📊 API Test Results:');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} Test ${index + 1}: ${result.endpoint} - ${result.message}`);
  });
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  console.log(`\n🎯 Overall: ${passed}/${total} tests passed`);
  
  return results;
}

// Export for use in other files
export { runPaymentAPITests, testEndpoint };

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // This is running in Node.js
  runPaymentAPITests().catch(console.error);
}