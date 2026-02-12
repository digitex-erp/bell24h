'use client';

import { useState, useEffect } from 'react';

interface RazorpayCheckoutProps {
  amount: number;
  currency?: string;
  rfqId: number;
  buyerId: number;
  supplierId?: number;
  onSuccess?: (payment: any) => void;
  onFailure?: (error: any) => void;
  onClose?: () => void;
  buttonText?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, callback: (response: any) => void) => void;
    };
  }
}

export default function RazorpayCheckout({
  amount,
  currency = 'INR',
  rfqId,
  buyerId,
  supplierId,
  onSuccess,
  onFailure,
  onClose,
  buttonText = 'Pay Now',
  buttonClassName = 'px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors',
  disabled = false
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      setRazorpayLoaded(false);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const createOrder = async () => {
    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          rfqId,
          buyerId,
          supplierId,
          notes: {
            rfqId: rfqId.toString(),
            buyerId: buyerId.toString(),
            supplierId: supplierId?.toString(),
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment order');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      alert('Payment system is still loading. Please try again in a moment.');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderData = await createOrder();
      const { order, payment } = orderData;

      // Get buyer details (you might want to fetch this from your API)
      const buyerResponse = await fetch(`/api/users/${buyerId}`);
      const buyer = buyerResponse.ok ? await buyerResponse.json() : null;

      // Razorpay options
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: order.amount,
        currency: order.currency,
        name: 'Bell24h',
        description: `Payment for RFQ #${rfqId}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            });

            if (verifyResponse.ok) {
              const verifyData = await verifyResponse.json();
              onSuccess?.(verifyData);
            } else {
              const errorData = await verifyResponse.json();
              onFailure?.(errorData);
            }
          } catch (error) {
            console.error('Error verifying payment:', error);
            onFailure?.({ error: 'Payment verification failed' });
          }
        },
        prefill: {
          name: buyer?.name || 'Bell24h User',
          email: buyer?.email || 'user@bell24h.com',
          contact: buyer?.phone || '9999999999',
        },
        theme: {
          color: '#3399cc',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            onClose?.();
          },
        },
      };

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment initialization failed:', error);
      onFailure?.({ error: 'Payment initialization failed' });
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || loading || !razorpayLoaded}
      className={buttonClassName}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </div>
      ) : (
        buttonText
      )}
    </button>
  );
}