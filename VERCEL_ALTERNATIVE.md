# VERCEL ALTERNATIVE DEPLOYMENT METHOD

If the CLI deployment fails, use this method:

## Step 1: Build Locally
```cmd
cd C:\Users\Sanika\Projects\bell24h
npm install
npm run build
```

## Step 2: Deploy via Vercel Dashboard
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Connect your GitHub account
4. Select "digitex-erp/bell24h"
5. Set Root Directory to: `./`
6. Click "Deploy"

## Step 3: Configure Domain
1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add "bell24h.com"
4. Add "www.bell24h.com"
5. Vercel will automatically configure DNS

## Step 4: Environment Variables (if needed)
1. Go to "Settings" → "Environment Variables"
2. Add any required variables:
   - DATABASE_URL
   - JWT_SECRET
   - MSG91_AUTH_KEY
   - RAZORPAY_KEY_ID
   - RAZORPAY_KEY_SECRET

## Expected Result
- Your site will be live at bell24h.com
- Mobile OTP login will work
- All pages will load without errors
