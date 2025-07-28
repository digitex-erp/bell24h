# Stripe Integration Guide

This document provides a comprehensive guide to integrating Stripe payment processing into the Bell24HDashboard application.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [API Endpoints](#api-endpoints)
- [Webhook Setup](#webhook-setup)
- [Testing](#testing)
- [Error Handling](#error-handling)
- [Security Considerations](#security-considerations)

## Prerequisites

1. Stripe Account: Sign up at [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Node.js v14+ and npm/yarn
3. Environment variables set up (see [Environment Variables](#environment-variables))

## Setup

### 1. Install Dependencies

```bash
npm install stripe @types/stripe
```

### 2. Environment Variables

Add the following to your `.env` file:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_your_test_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# Optional: For production
# STRIPE_SECRET_KEY=sk_live_your_live_secret_key
# STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
```

### 3. Initialize Stripe

Import and initialize Stripe in your server code:

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
});
```

## API Endpoints

### 1. Create a Payment Intent

**Endpoint:** `POST /api/payments/create-payment-intent`

Create a PaymentIntent to collect payment details from your customer.

**Request Body:**
```json
{
  "amount": 1000, // Amount in cents
  "currency": "usd",
  "paymentMethodId": "pm_card_visa", // Optional
  "metadata": {
    "orderId": "12345"
  }
}
```

**Response:**
```json
{
  "clientSecret": "pi_3NxXKj2eZvKYlo2C0HrQ6Xr7_secret_...",
  "paymentIntentId": "pi_3NxXKj2eZvKYlo2C0HrQ6Xr7",
  "status": "requires_payment_method",
  "requiresAction": false,
  "paymentMethodTypes": ["card"]
}
```

### 2. Create a Setup Intent

**Endpoint:** `POST /api/payments/create-setup-intent`

Create a SetupIntent to save a payment method for future use.

**Response:**
```json
{
  "clientSecret": "seti_1NxXKj2eZvKYlo2C0HrQ6Xr7_secret_...",
  "setupIntentId": "seti_1NxXKj2eZvKYlo2C0HrQ6Xr7",
  "status": "requires_payment_method"
}
```

### 3. List Payment Methods

**Endpoint:** `GET /api/payments/payment-methods`

List all saved payment methods for the current user.

**Response:**
```json
{
  "paymentMethods": [
    {
      "id": "pm_1NxXKj2eZvKYlo2C0HrQ6Xr7",
      "type": "card",
      "card": {
        "brand": "visa",
        "last4": "4242",
        "expMonth": 12,
        "expYear": 2025
      },
      "billingDetails": {
        "email": "customer@example.com",
        "name": "John Doe"
      },
      "created": 1612345678
    }
  ]
}
```

### 4. Attach a Payment Method

**Endpoint:** `POST /api/payments/payment-methods/attach`

Attach a payment method to a customer.

**Request Body:**
```json
{
  "paymentMethodId": "pm_card_visa"
}
```

### 5. Detach a Payment Method

**Endpoint:** `DELETE /api/payments/payment-methods/:paymentMethodId`

Detach a payment method from a customer.

### 6. Create a Subscription

**Endpoint:** `POST /api/payments/subscriptions`

Create a new subscription for a customer.

**Request Body:**
```json
{
  "priceId": "price_abc123",
  "paymentMethodId": "pm_card_visa",
  "trialPeriodDays": 14
}
```

### 7. Cancel a Subscription

**Endpoint:** `DELETE /api/payments/subscriptions/:subscriptionId`

Cancel a subscription.

**Request Body (optional):**
```json
{
  "cancelAtPeriodEnd": true
}
```

### 8. Create a Checkout Session

**Endpoint:** `POST /api/payments/create-checkout-session`

Create a Stripe Checkout session.

**Request Body:**
```json
{
  "priceId": "price_abc123",
  "successUrl": "https://your-website.com/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "https://your-website.com/canceled",
  "mode": "subscription"
}
```

## Webhook Setup

1. Set up a Stripe webhook in the [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Add the following events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

3. Set the webhook URL to:
   - Development: `https://your-dev-url.com/api/payments/webhook/stripe`
   - Production: `https://your-prod-url.com/api/payments/webhook/stripe`

## Testing

### Test Cards

| Card Number      | Description |
|------------------|-------------|
| 4242 4242 4242 4242 | Succeeds and immediately processes the payment |
| 4000 0000 0000 3220 | Requires 3D Secure authentication |
| 4000 0000 0000 9995 | Always fails with a decline code of `card_declined` |
| 4000 0027 6000 3184 | Requires authentication |

### Testing Subscriptions

1. Use the `create-checkout-session` endpoint with a test price ID
2. Use the test card number `4242 4242 4242 4242`
3. The subscription will be created immediately

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication
- `402 Request Failed`: Payment failed
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Security Considerations

1. **Never expose your secret keys** in client-side code
2. Use environment variables for sensitive data
3. Implement proper CORS policies
4. Use HTTPS in production
5. Regularly update Stripe SDK to the latest version
6. Monitor your Stripe Dashboard for suspicious activity

## Support

For support, please contact [support@example.com](mailto:support@example.com) or visit our [developer portal](https://developer.example.com).
