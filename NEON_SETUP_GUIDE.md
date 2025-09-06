# 🚀 **NEON.TECH DATABASE SETUP GUIDE**

## **Step 1: Create Neon.tech Account**
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create new project "bell24h"
4. Choose region: Asia Pacific (Mumbai)

## **Step 2: Get Connection String**
```bash
# Your connection string will look like:
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.us-east-1.aws.neon.tech/bell24h?sslmode=require"
```

## **Step 3: Add to Vercel Environment Variables**
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   - `DATABASE_URL` = your Neon connection string
   - `RAZORPAY_KEY_ID` = your Razorpay key
   - `RAZORPAY_KEY_SECRET` = your Razorpay secret
   - `NEXT_PUBLIC_APP_URL` = https://bell24h-v1.vercel.app

## **Step 4: Deploy to Vercel**
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Deploy to Vercel
vercel --prod
```

## **Step 5: Push Database Schema**
```bash
# After deployment, push schema to Neon
npx prisma db push
```

## **Free Tier Limits**
- **Storage**: 3GB (enough for 100k+ leads)
- **Compute**: 1 hour/day (sufficient for B2B)
- **Connections**: 100 concurrent
- **Cost**: ₹0/month

## **Migration Complete!**
Once this is done, you can shut down Railway and save ₹800/month.
