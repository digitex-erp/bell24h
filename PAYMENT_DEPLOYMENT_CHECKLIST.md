# 🚀 Bell24h Payment Gateway - Deployment Checklist

## ✅ Pre-Deployment Configuration

### 1. Environment Variables Setup
```bash
# Add these to your .env.local and .env.production files

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_live_your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here

# Platform Configuration
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_your_key_id_here
NEXT_PUBLIC_API_URL=https://bell24h.com
```

### 2. Database Migration
```bash
# Run this on your production database
npx prisma migrate deploy

# Or generate the migration manually:
npx prisma migrate dev --name add-payment-model
```

### 3. Razorpay Dashboard Configuration

#### API Keys
- [ ] Generate LIVE API keys (not test keys)
- [ ] Copy Key ID and Key Secret to environment variables
- [ ] Verify keys start with `rzp_live_`

#### Webhook Setup
- [ ] Go to Razorpay Dashboard → Settings → Webhooks
- [ ] Add new webhook: `https://bell24h.com/api/payments/webhook`
- [ ] Select events:
  - `payment.captured`
  - `payment.failed`
  - `refund.created`
  - `refund.processed`
- [ ] Generate webhook secret and add to environment variables
- [ ] Test webhook endpoint

#### Payment Methods
- [ ] Enable required payment methods:
  - Credit/Debit Cards
  - UPI
  - Net Banking
  - Wallets
- [ ] Configure 2FA settings
- [ ] Set up settlement preferences

## 🚀 Deployment Steps

### 1. Build Application
```bash
npm run build
# or
yarn build
```

### 2. Deploy to Production
```bash
# Vercel deployment
vercel --prod

# Or your preferred deployment method
```

### 3. Post-Deployment Verification

#### API Endpoint Tests
```bash
# Test payment creation
curl -X POST https://bell24h.com/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "userId": "1", "rfqId": 1}'

# Test payment status
curl https://bell24h.com/api/payments/status?orderId=test-order-id
```

#### Webhook Test
- [ ] Make a test payment (use ₹1 amount)
- [ ] Verify webhook is received and processed
- [ ] Check database for payment record updates

#### n8n Integration Test
- [ ] Verify n8n webhook receives payment success notifications
- [ ] Check email notifications are sent
- [ ] Confirm marketing automation triggers

## 🔍 Production Monitoring

### 1. Payment Success Rate Monitoring
```typescript
// Add this to your monitoring dashboard
const paymentMetrics = {
  successRate: (successfulPayments / totalPayments) * 100,
  averageProcessingTime: averageTimeFromCreationToCompletion,
  webhookDeliveryRate: (webhooksReceived / webhooksSent) * 100,
  refundRate: (refundedPayments / totalPayments) * 100
};
```

### 2. Error Monitoring
- [ ] Set up Sentry or similar for error tracking
- [ ] Monitor Razorpay API errors
- [ ] Track webhook failures
- [ ] Alert on payment processing delays

### 3. Database Monitoring
- [ ] Monitor payment table growth
- [ ] Set up alerts for failed payments
- [ ] Track orphaned payment records
- [ ] Monitor webhook retry attempts

## 🛡️ Security Checklist

### 1. API Security
- [ ] Rate limiting on payment endpoints
- [ ] Input validation and sanitization
- [ ] SQL injection prevention (Prisma ORM)
- [ ] XSS protection headers

### 2. Razorpay Security
- [ ] Webhook signature verification enabled
- [ ] API keys stored securely (not in code)
- [ ] Test keys removed from production
- [ ] Webhook secret rotated regularly

### 3. Data Protection
- [ ] Payment data encryption at rest
- [ ] Sensitive data not logged
- [ ] PCI DSS compliance (handled by Razorpay)
- [ ] GDPR compliance for user data

## 📊 Business Metrics to Track

### 1. Revenue Metrics
- [ ] Total payment volume
- [ ] Average transaction value
- [ ] Revenue per RFQ listing
- [ ] Payment conversion rate

### 2. User Experience Metrics
- [ ] Payment completion rate
- [ ] Average payment time
- [ ] Payment method preferences
- [ ] Refund request rate

### 3. Operational Metrics
- [ ] Webhook processing time
- [ ] Database query performance
- [ ] API response times
- [ ] Error rates by endpoint

## 🚨 Emergency Procedures

### 1. Razorpay Service Down
```bash
# Immediate actions:
1. Check Razorpay status page
2. Switch to backup payment method if available
3. Notify users of payment delays
4. Monitor for service restoration
```

### 2. Webhook Failures
```bash
# Debug steps:
1. Check webhook endpoint logs
2. Verify webhook secret configuration
3. Test webhook manually via Razorpay dashboard
4. Check server firewall settings
```

### 3. Payment Processing Errors
```bash
# Investigation steps:
1. Check application logs
2. Verify Razorpay API credentials
3. Test with small amount payment
4. Check database connection
```

## 📞 Support Contacts

### Razorpay Support
- Dashboard: https://dashboard.razorpay.com
- Support Email: support@razorpay.com
- Phone: +91-124-4343-000
- Status Page: https://status.razorpay.com

### Technical Team
- Primary: Your technical contact
- Backup: Secondary technical contact
- Escalation: Management contact

---

## 🎉 Deployment Complete!

Once you've completed all items in this checklist, your payment gateway will be fully operational and ready to process real payments from users.

**Next Steps:**
1. Monitor payment metrics closely for first 24 hours
2. Test with small amounts before full launch
3. Set up automated alerts for payment failures
4. Train support team on payment-related issues

**Revenue Impact:** Your B2B marketplace is now ready to monetize RFQ listings through secure payment processing! 🚀