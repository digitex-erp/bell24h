# 🚀 **PRODUCTION SETUP GUIDE - BELL24H**

## **CRITICAL: Complete These Steps Before Sept 22**

### **Step 1: Database Migration (Day 1)**

```bash
# Run this command in your terminal:
npx prisma migrate deploy

# If that fails, try:
npx prisma db push
```

### **Step 2: Environment Variables (Day 1)**

Add these to your **Vercel Environment Variables**:

```env
# Database (Get from Neon.tech)
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication (Get from MSG91)
MSG91_AUTH_KEY=your_msg91_auth_key_here
MSG91_SENDER_ID=BELL24H

# Payment Gateway (Get from Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

# Email Service (Get from SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@bell24h.com

# JWT Secret (Generate random 32+ characters)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long

# App Configuration
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_here
NODE_ENV=production

# Feature Flags
ENABLE_ESCROW=false
ENABLE_AI_FEATURES=false
ENABLE_BLOCKCHAIN=false

# API Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

### **Step 3: Get API Keys (Day 1)**

#### **MSG91 (SMS OTP)**
1. Go to: https://msg91.com
2. Sign up for free account
3. Get your Auth Key
4. Add to Vercel environment variables

#### **Razorpay (Payments)**
1. Go to: https://razorpay.com
2. Create account
3. Get Test/Live API keys
4. Add to Vercel environment variables

#### **SendGrid (Email)**
1. Go to: https://sendgrid.com
2. Create free account
3. Get API key
4. Add to Vercel environment variables

### **Step 4: Test Authentication (Day 2)**

```bash
# Test OTP sending
curl -X POST https://your-app.vercel.app/api/auth/send-phone-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}'
```

### **Step 5: Test Payment (Day 3)**

```bash
# Test payment creation
curl -X POST https://your-app.vercel.app/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "currency": "INR", "type": "test"}'
```

## **Timeline Until Sept 22:**

| Day | Task | Status |
|-----|------|--------|
| **Day 1** | Database migration + API keys | ⏳ Pending |
| **Day 2** | Test authentication flow | ⏳ Pending |
| **Day 3** | Test payment integration | ⏳ Pending |
| **Day 4** | Load testing (50+ users) | ⏳ Pending |
| **Day 5** | Bug fixes and optimization | ⏳ Pending |
| **Day 6** | Final production testing | ⏳ Pending |

## **Critical Success Factors:**

1. **MSG91 must work** - Without this, users can't register
2. **Database must be migrated** - Without this, data won't persist
3. **Razorpay must work** - Without this, no revenue
4. **Load testing must pass** - Without this, site crashes under load

## **Next Actions:**

1. **Run database migration NOW**
2. **Get MSG91 API key TODAY**
3. **Add environment variables to Vercel**
4. **Test authentication flow**
5. **Test payment flow**

**Your platform is 80% ready - these final steps will make it 100% production-ready!** 🚀
