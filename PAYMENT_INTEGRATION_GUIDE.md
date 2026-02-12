# 🚀 Bell24h Payment Integration Guide

## Quick Start

### 1. Basic Integration

```tsx
import RazorpayCheckout from '@/components/payments/RazorpayCheckout';

function MyComponent() {
  const handleSuccess = (paymentId: string, orderId: string) => {
    console.log('Payment successful:', paymentId);
    // Update your UI, redirect, etc.
  };

  const handleFailure = (error: string) => {
    console.error('Payment failed:', error);
    // Show error message to user
  };

  return (
    <RazorpayCheckout
      amount={500} // ₹500
      rfqId={123} // Optional: link to RFQ
      userId={1} // User ID
      onSuccess={handleSuccess}
      onFailure={handleFailure}
      buttonText="Pay ₹500"
    />
  );
}
```

### 2. Advanced Integration with Custom Styling

```tsx
import RazorpayCheckout from '@/components/payments/RazorpayCheckout';

function PremiumComponent() {
  return (
    <RazorpayCheckout
      amount={1500}
      rfqId={456}
      userId={currentUser.id}
      onSuccess={(paymentId, orderId) => {
        // Handle success
        router.push('/payment-success');
      }}
      onFailure={(error) => {
        // Handle failure
        setError(error);
      }}
      onClose={() => {
        // Handle user closing payment modal
        console.log('Payment cancelled');
      }}
      buttonText="Unlock Premium Features - ₹1500"
      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
    />
  );
}
```

## API Reference

### RazorpayCheckout Component Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `amount` | `number` | ✅ | Payment amount in INR (e.g., 500 for ₹500) |
| `userId` | `number` | ✅ | User ID from your database |
| `rfqId` | `number` | ❌ | RFQ ID to link payment to specific RFQ |
| `onSuccess` | `(paymentId: string, orderId: string) => void` | ✅ | Callback when payment succeeds |
| `onFailure` | `(error: string) => void` | ✅ | Callback when payment fails |
| `onClose` | `() => void` | ❌ | Callback when user closes payment modal |
| `buttonText` | `string` | ❌ | Custom button text (default: "Pay ₹{amount}") |
| `className` | `string` | ❌ | Custom CSS classes for button styling |

## Payment Flow

### 1. User Clicks Pay Button
```
User → RazorpayCheckout Component → Create Order API → Razorpay Order Created
```

### 2. Razorpay Checkout Opens
```
Razorpay Checkout → User Completes Payment → Payment Success/Failure
```

### 3. Payment Verification
```
Payment Success → Verify Payment API → Update Database → Trigger n8n Webhook
```

### 4. Post-Payment Actions
```
Database Updated → RFQ Status Changed → Email Notification Sent → User Redirected
```

## Common Use Cases

### 1. RFQ Listing Payment
```tsx
// For making RFQ visible to suppliers
<RazorpayCheckout
  amount={500}
  rfqId={rfq.id}
  userId={user.id}
  onSuccess={(paymentId) => {
    // RFQ is now visible to suppliers
    toast.success('RFQ listing activated!');
    router.push('/rfqs');
  }}
  onFailure={(error) => {
    toast.error('Payment failed: ' + error);
  }}
/>
```

### 2. Subscription Payment
```tsx
// For premium membership
<RazorpayCheckout
  amount={2999} // ₹2999 for annual subscription
  userId={user.id}
  onSuccess={(paymentId) => {
    // Upgrade user to premium
    upgradeUserToPremium(user.id);
    toast.success('Welcome to Premium!');
  }}
  onFailure={(error) => {
    toast.error('Subscription payment failed');
  }}
  buttonText="Upgrade to Premium - ₹2999/year"
/>
```

### 3. Escrow Payment
```tsx
// For secure transactions
<RazorpayCheckout
  amount={10000} // ₹10,000 held in escrow
  rfqId={rfq.id}
  userId={user.id}
  onSuccess={(paymentId) => {
    // Payment held in escrow
    toast.success('Payment secured in escrow');
    // Notify supplier
    notifySupplier(rfq.id);
  }}
  onFailure={(error) => {
    toast.error('Escrow payment failed');
  }}
  buttonText="Secure Payment in Escrow - ₹10,000"
/>
```

## Error Handling

### Common Errors and Solutions

```tsx
<RazorpayCheckout
  amount={amount}
  userId={userId}
  onFailure={(error) => {
    switch (error) {
      case 'Payment verification failed':
        toast.error('Payment could not be verified. Please contact support.');
        break;
      case 'Payment initiation failed':
        toast.error('Could not initiate payment. Please try again.');
        break;
      case 'Payment system not ready':
        toast.error('Payment system is loading. Please wait a moment.');
        break;
      default:
        toast.error('Payment failed. Please try again.');
    }
  }}
/>
```

## Styling Examples

### 1. Primary Button
```tsx
className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
```

### 2. Success Button
```tsx
className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
```

### 3. Premium Button
```tsx
className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg"
```

### 4. Minimal Button
```tsx
className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 disabled:opacity-50"
```

## Testing

### Test Mode
```tsx
// Use test credentials in development
// Amount: 1 (₹1) for testing
<RazorpayCheckout
  amount={1}
  userId={1}
  onSuccess={(paymentId) => {
    console.log('Test payment successful:', paymentId);
  }}
  buttonText="Test Payment - ₹1"
/>
```

### Test Cards
- **Success**: 4111111111111111 (any future date, any CVV)
- **Failure**: 4000000000000002
- **Insufficient Funds**: 4000000000009995

## Security Best Practices

### 1. Always Verify Payments
```tsx
// The component automatically verifies payments
// But you should also implement server-side verification
const verifyPayment = async (paymentId: string) => {
  const response = await fetch(`/api/payments/status?paymentId=${paymentId}`);
  const data = await response.json();
  return data.payment.status === 'completed';
};
```

### 2. Handle Webhooks
```tsx
// Webhooks are handled automatically in:
// src/app/api/payments/webhook/route.ts
// This ensures payment status is always up-to-date
```

### 3. Validate Amounts
```tsx
// Always validate amounts on your server
const validateAmount = (amount: number) => {
  return amount >= 1 && amount <= 100000; // ₹1 to ₹1 lakh
};
```

## Troubleshooting

### Common Issues

1. **Payment modal not opening**
   - Check if Razorpay script is loaded
   - Verify API keys are correct
   - Check browser console for errors

2. **Payment failing immediately**
   - Verify amount is valid (≥ ₹1)
   - Check network connectivity
   - Test with different payment method

3. **Webhook not receiving**
   - Check webhook URL is accessible
   - Verify webhook secret is configured
   - Test webhook manually from Razorpay dashboard

### Debug Mode
```tsx
// Enable debug logging
const paymentClient = new PaymentClient();
paymentClient.setDebugMode(true);
```

## Support

For issues with:
- **Component Integration**: Check this guide and examples
- **API Issues**: Review API endpoints in `src/app/api/payments/`
- **Razorpay Issues**: Check Razorpay dashboard and logs
- **Database Issues**: Verify Prisma schema and migrations

---

**🎉 Your payment system is ready! Start integrating Razorpay payments into your B2B marketplace.**