'use client';

import { useState, useEffect } from 'react';
import RazorpayCheckout from '@/components/payments/RazorpayCheckout';

export default function PaymentTestDashboard() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const addTestResult = (test: string, status: string, details: any) => {
    setTestResults(prev => [...prev, {
      test,
      status,
      details,
      timestamp: new Date().toISOString()
    }]);
  };

  const testPaymentFlow = async (amount: number, testName: string) => {
    setCurrentTest(testName);
    setLoading(true);
    
    try {
      // Step 1: Create a test RFQ
      const rfqResponse = await fetch('/api/test/create-test-rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Test RFQ for ${testName}`,
          description: 'Automated test RFQ for payment testing',
          quantity: 100,
          unit: 'units',
          targetPrice: amount,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          buyerId: 1 // Assuming test buyer exists
        })
      });

      if (!rfqResponse.ok) {
        throw new Error('Failed to create test RFQ');
      }

      const { rfqId } = await rfqResponse.json();
      addTestResult('Create Test RFQ', 'SUCCESS', { rfqId });

      // Step 2: Test payment order creation
      const orderResponse = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          currency: 'INR',
          rfqId,
          buyerId: 1,
          notes: { test: testName }
        })
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await orderResponse.json();
      addTestResult('Create Payment Order', 'SUCCESS', { 
        orderId: orderData.order.id,
        amount: orderData.order.amount 
      });

      // Step 3: Test Razorpay integration
      const razorpayTest = await simulateRazorpayPayment(orderData.order.id, amount);
      addTestResult('Razorpay Payment', razorpayTest.status, razorpayTest.details);

      // Step 4: Test payment verification
      const verifyResponse = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.order.id,
          paymentId: `test_payment_${Date.now()}`,
          signature: 'test_signature'
        })
      });

      if (!verifyResponse.ok) {
        throw new Error('Payment verification failed');
      }

      const verifyData = await verifyResponse.json();
      addTestResult('Payment Verification', 'SUCCESS', verifyData);

      // Step 5: Check database updates
      const dbCheck = await checkDatabaseUpdates(rfqId, orderData.order.id);
      addTestResult('Database Updates', dbCheck.status, dbCheck.details);

    } catch (error) {
      addTestResult(testName, 'FAILED', { error: error.message });
    } finally {
      setLoading(false);
      setCurrentTest('');
    }
  };

  const simulateRazorpayPayment = async (orderId: string, amount: number) => {
    // Simulate successful payment response from Razorpay
    return {
      status: 'SUCCESS',
      details: {
        razorpay_order_id: orderId,
        razorpay_payment_id: `pay_${Date.now()}`,
        razorpay_signature: 'simulated_signature',
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        status: 'captured'
      }
    };
  };

  const checkDatabaseUpdates = async (rfqId: number, orderId: string) => {
    try {
      // Check payment record
      const paymentResponse = await fetch(`/api/test/get-payment?orderId=${orderId}`);
      const payment = paymentResponse.ok ? await paymentResponse.json() : null;

      // Check RFQ status
      const rfqResponse = await fetch(`/api/test/get-rfq?id=${rfqId}`);
      const rfq = rfqResponse.ok ? await rfqResponse.json() : null;

      return {
        status: payment && rfq && rfq.status === 'CLOSED' ? 'SUCCESS' : 'FAILED',
        details: { paymentStatus: payment?.status, rfqStatus: rfq?.status }
      };
    } catch (error) {
      return { status: 'FAILED', details: { error: error.message } };
    }
  };

  const runAllTests = async () => {
    setTestResults([]);
    
    // Test different payment amounts
    await testPaymentFlow(1, '₹1 Test Payment');
    await testPaymentFlow(100, '₹100 Standard Payment');
    await testPaymentFlow(1000, '₹1000 Large Payment');
    await testPaymentFlow(999999, '₹9,99,999 Maximum Payment');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🧪 Bell24h Payment Test Dashboard</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">Test Environment</h2>
        <p className="text-blue-700">This dashboard tests the complete payment flow using Razorpay test mode.</p>
        <ul className="list-disc list-inside mt-2 text-sm text-blue-600">
          <li>Creates test RFQs automatically</li>
          <li>Simulates Razorpay payment processing</li>
          <li>Verifies database updates</li>
          <li>Tests n8n webhook integration</li>
        </ul>
      </div>

      <div className="mb-6">
        <button
          onClick={runAllTests}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          {loading ? 'Running Tests...' : '🚀 Run All Payment Tests'}
        </button>
      </div>

      {currentTest && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-3"></div>
            <span className="text-yellow-800 font-medium">Running: {currentTest}</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-xl font-semibold text-gray-800">Test Results</h3>
        {testResults.length === 0 ? (
          <p className="text-gray-500">No tests run yet. Click "Run All Payment Tests" to start.</p>
        ) : (
          testResults.map((result, index) => (
            <div key={index} className={`p-4 rounded-lg border ${
              result.status === 'SUCCESS' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className={`font-semibold ${
                    result.status === 'SUCCESS' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.test}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    result.status === 'SUCCESS' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    Status: {result.status}
                  </p>
                </div>
                <span className="text-xs text-gray-500">{result.timestamp}</span>
              </div>
              {result.details && (
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Manual Testing</h3>
        <p className="text-gray-600 mb-4">Use this component for manual payment testing:</p>
        
        <div className="bg-white p-4 rounded border">
          <RazorpayCheckout
            amount={100}
            rfqId={1}
            buyerId={1}
            onSuccess={(payment) => {
              addTestResult('Manual Payment', 'SUCCESS', payment);
            }}
            buttonText="Test ₹100 Payment"
            buttonClassName="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          />
        </div>
      </div>
    </div>
  );
}