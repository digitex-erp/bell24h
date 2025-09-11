# 🚀 **CURSOR BUILD FIX AUTOMATION - BELL24H PLATFORM**

## **Act as a Senior DevOps Engineer**

Fix all build errors and prepare the Bell24h platform for production deployment without Razorpay dependencies.

---

## **🎯 AUTOMATION TASKS**

### **1. Fix Prisma Import Issues**

```bash
# Verify Prisma client is properly exported
cat lib/db.ts
# Should show: export const prisma = new PrismaClient()

# Check if Prisma client is generated
npx prisma generate

# Test Prisma connection
npx prisma db push
```

### **2. Create Environment Variables (Without Razorpay)**

Create `.env.local`:
```env
# Bell24h Development Environment Variables
# Copy these to Vercel Environment Variables for production

# Database (Get from Neon.tech - FREE)
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication (MSG91 - Ready!)
MSG91_AUTH_KEY=468517Ak5rJ0vb7NDV68c24863P1
MSG91_SENDER_ID=BELL24H
MSG91_TEMPLATE_ID=default

# Email Service (Resend - Ready!)
RESEND_API_KEY=re_dGNCnq2P_9Rc29SZYvTCasdhvLCQG2Zx4
FROM_EMAIL=noreply@bell24h.com

# JWT Secret (Generate random 32+ characters)
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long

# App Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
NODE_ENV=development

# Feature Flags
ENABLE_ESCROW=false
ENABLE_AI_FEATURES=false
ENABLE_BLOCKCHAIN=false

# API Rate Limiting
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Note: Razorpay keys will be added after merchant account approval
# RAZORPAY_KEY_ID=your_razorpay_key_id_here
# RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
```

### **3. Fix Admin Pages with Error Boundaries**

```typescript
// app/admin/analytics/page.tsx
'use client';

import PageErrorBoundary from '../../components/PageErrorBoundary';
import ComingSoonBanner from '../../components/ComingSoonBanner';

export default function AnalyticsPage() {
  return (
    <PageErrorBoundary>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="mt-2 text-gray-600">Track your platform performance and user metrics</p>
          </div>

          <ComingSoonBanner 
            title="Advanced Analytics Coming Soon"
            description="We're building powerful analytics tools to help you track performance, user engagement, and revenue metrics."
            features={[
              "Real-time user activity tracking",
              "Revenue and transaction analytics", 
              "User engagement metrics",
              "Performance dashboards",
              "Custom reporting tools"
            ]}
          />
        </div>
      </div>
    </PageErrorBoundary>
  );
}
```

### **4. Fix Payment API Routes (Demo Mode)**

```typescript
// app/api/payments/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR', description, orderId } = await request.json();

    // Validate inputs
    if (!amount || amount < 100) {
      return NextResponse.json({
        success: false,
        error: 'Minimum amount is ₹1.00'
      }, { status: 400 });
    }

    // Demo mode until Razorpay merchant account is approved
    return NextResponse.json({
      success: true,
      message: 'Payment system in demo mode - Razorpay integration pending approval',
      demoMode: true,
      order: {
        id: `order_demo_${Date.now()}`,
        amount: amount * 100, // Convert to paisa
        currency,
        status: 'created',
        receipt: orderId || `receipt_${Date.now()}`,
        notes: {
          description: description || 'Bell24h Service Payment'
        }
      },
      note: 'Real payment processing will be available after Razorpay merchant account approval'
    });

  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create payment order. Please try again.'
    }, { status: 500 });
  }
}
```

### **5. Test Build Success**

```bash
# Run build test
npm run build

# If successful, test development server
npm run dev

# Test health endpoint
curl http://localhost:3000/api/health
```

### **6. Create Deployment Script**

Create `deploy-without-razorpay.bat`:
```batch
@echo off
echo 🚀 DEPLOYING BELL24H WITHOUT RAZORPAY - DEMO MODE
echo.

echo Step 1: Building project...
call npm run build
if errorlevel 1 (
    echo ❌ Build failed! Please fix errors first.
    pause
    exit /b 1
)

echo ✅ Build successful!

echo Step 2: Installing Vercel CLI...
call npm install -g vercel

echo Step 3: Deploying to Vercel...
call vercel --prod --yes

echo Step 4: Setting up environment variables...
echo Please add these to Vercel Environment Variables:
echo.
echo DATABASE_URL=postgresql://username:password@host:port/database
echo MSG91_AUTH_KEY=468517Ak5rJ0vb7NDV68c24863P1
echo MSG91_SENDER_ID=BELL24H
echo RESEND_API_KEY=re_dGNCnq2P_9Rc29SZYvTCasdhvLCQG2Zx4
echo FROM_EMAIL=noreply@bell24h.com
echo JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
echo NEXTAUTH_URL=https://your-app.vercel.app
echo NEXTAUTH_SECRET=your_nextauth_secret_here
echo NODE_ENV=production
echo.

echo ✅ Deployment complete! Your platform is now live in demo mode.
echo 💡 Add Razorpay keys after merchant account approval for real payments.
echo.
pause
```

---

## **🎯 DELIVERABLES**

After running this automation:

1. ✅ **Build Success** - No more Prisma import errors
2. ✅ **Environment Setup** - All required variables configured (except Razorpay)
3. ✅ **Admin Pages Fixed** - Error boundaries prevent crashes
4. ✅ **Payment Demo Mode** - Works without Razorpay keys
5. ✅ **Deployment Ready** - Can deploy to Vercel immediately

## **💰 COST BREAKDOWN (Without Razorpay)**

- **GitHub** → ₹0 (Free for public repos)
- **Vercel** → ₹0 (Free tier covers your needs)
- **Resend** → ₹0 (3,000 emails/month free)
- **MSG91** → ₹0 (100 SMS/month free)
- **Neon.tech** → ₹0 (3GB database free)
- **Razorpay** → ₹0 (Will add after approval)

**Total: ₹0/month** (Your ₹10,000 budget is more than enough!)

---

## **🚀 EXECUTION INSTRUCTIONS**

1. **Copy this entire prompt**
2. **Paste into Cursor with your Bell24h project open**
3. **Let Cursor execute all automation tasks**
4. **Run `npm run build` to verify success**
5. **Deploy to Vercel using the provided script**

## **🎉 SUCCESS CRITERIA**

- ✅ Build completes without errors
- ✅ All admin pages load with error boundaries
- ✅ Payment API works in demo mode
- ✅ Environment variables properly configured
- ✅ Ready for Vercel deployment

**Your Bell24h platform will be live and functional (in demo mode) within 30 minutes!** 🚀

**Razorpay integration can be added later after merchant account approval.** 💰
