# Payment System Integration

This document provides an overview of the payment system integration in the Bell24H platform, including setup instructions, API endpoints, and implementation details.

## Table of Contents

1. [Supported Payment Providers](#supported-payment-providers)
2. [Setup Instructions](#setup-instructions)
3. [API Endpoints](#api-endpoints)
4. [Webhook Integration](#webhook-integration)
5. [Payment Flow](#payment-flow)
6. [Testing](#testing)
7. [Security Considerations](#security-considerations)
8. [Troubleshooting](#troubleshooting)

## Supported Payment Providers

The system currently supports the following payment providers:

1. **Stripe** - Credit/Debit cards, SEPA, and other payment methods
2. **PayPal** - PayPal accounts and credit cards
3. **Razorpay** - Popular in India with support for local payment methods

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```env
# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# Email (for payment notifications)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_email_password
EMAIL_FROM=noreply@bell24h.com
```

### 2. Database Migrations

Run the database migrations to create the required tables:

```bash
npx prisma migrate dev --name init_payment_schema
```

### 3. Webhook Configuration

Set up webhooks with each payment provider to receive payment events:

#### Stripe
1. Go to Developers > Webhooks in Stripe Dashboard
2. Add endpoint: `https://your-domain.com/api/payments/webhook/stripe`
3. Select events to listen to (recommended: `payment_intent.succeeded`, `payment_intent.payment_failed`)
4. Copy the signing secret to your `.env` file

#### PayPal
1. Go to Account Settings > Webhooks in PayPal Developer Dashboard
2. Add webhook URL: `https://your-domain.com/api/payments/webhook/paypal`
3. Select events (recommended: `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.DENIED`)
4. Copy the webhook ID to your `.env` file

#### Razorpay
1. Go to Settings > Webhooks in Razorpay Dashboard
2. Add webhook URL: `https://your-domain.com/api/payments/webhook/razorpay`
3. Select events (recommended: `payment.captured`, `payment.failed`)
4. Copy the webhook secret to your `.env` file

## API Endpoints

### Create Payment Intent

```http
POST /api/payments/create
Content-Type: application/json
Authorization: Bearer <token>

{
  "amount": 1000, // Amount in smallest currency unit (e.g., cents)
  "currency": "usd",
  "provider": "stripe", // 'stripe', 'paypal', or 'razorpay'
  "orderId": "order_123",
  "metadata": {
    "userId": "user_123",
    "plan": "premium"
  }
}
```

### Process Payment

```http
POST /api/payments/process
Content-Type: application/json
Authorization: Bearer <token>

{
  "paymentId": "pi_123456789",
  "paymentMethod": {
    "type": "card",
    "card": {
      "number": "4242424242424242",
      "expMonth": 12,
      "expYear": 2025,
      "cvc": "123"
    },
    "billingDetails": {
      "name": "John Doe",
      "email": "john@example.com",
      "address": {
        "line1": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "postalCode": "94107",
        "country": "US"
      }
    }
  }
}
```

### Get Payment Details

```http
GET /api/payments/:paymentId
Authorization: Bearer <token>
```

### Refund Payment

```http
POST /api/payments/refund/:paymentId
Content-Type: application/json
Authorization: Bearer <token>

{
  "amount": 500, // Optional: partial refund amount
  "reason": "Customer request" // Optional
}
```

### List Payments

```http
GET /api/payments?limit=10&offset=0&status=succeeded
Authorization: Bearer <token>
```

## Webhook Integration

The system supports webhooks from all payment providers. Webhook handlers are automatically registered when the server starts.

### Webhook Endpoints

- Stripe: `POST /api/payments/webhook/stripe`
- PayPal: `POST /api/payments/webhook/paypal`
- Razorpay: `POST /api/payments/webhook/razorpay`

### Webhook Events

Webhook events are processed asynchronously and update the payment status in the database. The system handles the following events:

- Payment succeeded
- Payment failed
- Payment refunded
- Dispute created

## Payment Flow

1. **Client-Side**
   - Create a payment intent on your server
   - Collect payment method details using the provider's SDK
   - Confirm the payment on the server

2. **Server-Side**
   - Validate the payment method
   - Process the payment with the provider
   - Update the payment status in the database
   - Send email notifications
   - Trigger any post-payment actions

3. **Webhook Handling**
   - Receive payment events from the provider
   - Update the payment status accordingly
   - Trigger any necessary business logic

## Testing

### Unit Tests

Run the test suite:

```bash
npm test
```

### Integration Tests

To run integration tests, set up a test environment with the following:

1. Test API keys for each payment provider
2. A test database
3. Mock webhook server

```bash
NODE_ENV=test npm test
```

### Manual Testing

1. **Test Cards**
   - Use test card numbers from the payment provider's documentation
   - Simulate different scenarios (success, failure, 3D Secure, etc.)

2. **Webhook Testing**
   - Use the provider's test webhook endpoints
   - Simulate different payment events

## Security Considerations

1. **PCI Compliance**
   - Never store full card details on your servers
   - Use payment provider's tokenization or elements for collecting card data
   - Ensure your application is PCI DSS compliant

2. **API Security**
   - Always use HTTPS
   - Implement rate limiting
   - Validate all input data
   - Use secure headers (helmet.js)

3. **Data Protection**
   - Encrypt sensitive data at rest
   - Implement proper access controls
   - Log and monitor all payment operations

## Troubleshooting

### Common Issues

1. **Webhook Verification Failed**
   - Verify the webhook secret in your environment variables
   - Check the request headers for the correct signature
   - Ensure the raw request body is being passed to the verification function

2. **Payment Processing Failed**
   - Check the error message from the payment provider
   - Verify your API keys and account status
   - Ensure you have sufficient funds (for payouts)

3. **Database Connection Issues**
   - Verify your database connection string
   - Check if the database is running and accessible
   - Ensure all migrations have been applied

### Getting Help

For additional support, please contact the development team or refer to the provider's documentation:

- [Stripe Documentation](https://stripe.com/docs)
- [PayPal Developer](https://developer.paypal.com/)
- [Razorpay Docs](https://razorpay.com/docs/)

---

*Last updated: May 2025*
