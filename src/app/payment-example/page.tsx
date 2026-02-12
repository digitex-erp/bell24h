'use client';

import { useState } from 'react';
import RazorpayCheckout from '@/components/payments/RazorpayCheckout';

export default function PaymentExamplePage() {
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handlePaymentSuccess = (paymentId: string, orderId: string) => {
    console.log('Payment successful:', paymentId, orderId);
    setPaymentStatus(`✅ Payment successful! Payment ID: ${paymentId}`);
  };

  const handlePaymentFailure = (error: string) => {
    console.error('Payment failed:', error);
    setPaymentStatus(`❌ Payment failed: ${error}`);
  };

  const handlePaymentClose = () => {
    console.log('Payment modal closed');
    setPaymentStatus('Payment cancelled');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Bell24h Payment Integration Example</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">RFQ Listing Payment</h2>
        <p className="text-gray-600 mb-6">
          Pay to unlock your RFQ and make it visible to suppliers.
        </p>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Standard RFQ Listing</h3>
            <p className="text-sm text-gray-600 mb-4">
              • Visible to all suppliers<br/>
              • 30-day listing duration<br/>
              • Priority support
            </p>
            
            <RazorpayCheckout
              amount={500} // ₹500
              rfqId={123} // Example RFQ ID
              userId={1} // Example user ID
              onSuccess={handlePaymentSuccess}
              onFailure={handlePaymentFailure}
              onClose={handlePaymentClose}
              buttonText="Pay ₹500 - Standard Listing"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 w-full"
            />
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">Premium RFQ Listing</h3>
            <p className="text-sm text-gray-600 mb-4">
              • Featured placement<br/>
              • 60-day listing duration<br/>
              • Dedicated account manager<br/>
              • Analytics dashboard
            </p>
            
            <RazorpayCheckout
              amount={1500} // ₹1500
              rfqId={456} // Example RFQ ID
              userId={1} // Example user ID
              onSuccess={handlePaymentSuccess}
              onFailure={handlePaymentFailure}
              onClose={handlePaymentClose}
              buttonText="Pay ₹1500 - Premium Listing"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 w-full"
            />
          </div>
        </div>
        
        {paymentStatus && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium">Payment Status:</p>
            <p className="text-sm text-gray-700">{paymentStatus}</p>
          </div>
        )}
      </div>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Integration Code</h2>
        <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`<RazorpayCheckout
  amount={500} // Amount in INR
  rfqId={123} // RFQ ID (optional)
  userId={1} // User ID
  onSuccess={(paymentId, orderId) => {
    console.log('Payment successful!', paymentId);
    // Handle success - update UI, redirect, etc.
  }}
  onFailure={(error) => {
    console.error('Payment failed:', error);
    // Handle failure - show error message
  }}
  onClose={() => {
    console.log('Payment cancelled');
    // Handle cancellation
  }}
  buttonText="Pay ₹500"
  className="bg-blue-600 text-white px-6 py-3 rounded-lg"
/>`}
        </pre>
      </div>
    </div>
  );
}