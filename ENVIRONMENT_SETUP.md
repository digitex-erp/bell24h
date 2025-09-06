# 🔧 **ENVIRONMENT VARIABLES SETUP**

## **Required Environment Variables for Vercel**

### **1. Database (Neon.tech - FREE)**
```env
DATABASE_URL=postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/bell24h?sslmode=require
```

### **2. Razorpay Production Keys**
```env
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

### **3. Business Information**
```env
NEXT_PUBLIC_GST_NUMBER=PENDING
BUSINESS_EMAIL=your-email@gmail.com
BUSINESS_PHONE=+91-XXXXXXXXXX
```

### **4. App Configuration**
```env
NEXT_PUBLIC_APP_URL=https://bell24h-v1.vercel.app
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://bell24h-v1.vercel.app
```

### **5. Service Pricing (in INR)**
```env
VERIFICATION_REPORT_PRICE=2000
RFQ_WRITING_PRICE=500
FEATURED_LISTING_PRICE=1000
GST_RATE=18
```

## **How to Add to Vercel**

1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable above
5. Set environment to "Production"
6. Redeploy your project

## **Neon.tech Database Setup**

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create new project "bell24h"
4. Choose region: Asia Pacific (Mumbai)
5. Copy the connection string
6. Add to Vercel as `DATABASE_URL`

## **Razorpay Setup**

1. Go to [razorpay.com](https://razorpay.com)
2. Sign up for business account
3. Complete KYC verification
4. Get live API keys
5. Add to Vercel environment variables

## **After Adding Variables**

```bash
# Run these commands locally
npx prisma generate
npx prisma db push

# Then redeploy to Vercel
vercel --prod
```
