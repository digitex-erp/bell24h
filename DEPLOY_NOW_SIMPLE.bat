@echo off
echo 🚀 BELL24H AUTOMATED DEPLOYMENT TO VERCEL
echo ==========================================

echo.
echo Step 1: Installing Vercel CLI globally...
npm install -g vercel

echo.
echo Step 2: Logging into Vercel...
vercel login

echo.
echo Step 3: Deploying to production...
vercel --prod

echo.
echo Step 4: IMPORTANT - Add these environment variables in Vercel Dashboard:
echo.
echo Go to: https://vercel.com/dashboard
echo Select your project → Settings → Environment Variables
echo Add these for Production environment:
echo.
echo NEXTAUTH_URL=https://your-app-name.vercel.app
echo NEXTAUTH_SECRET=bell24h-super-secret-key-32-chars-minimum-required
echo JWT_SECRET=bell24h-jwt-secret-key-32-chars-minimum
echo DATABASE_URL=postgresql://neondb_owner:npg_K6M8mRhTPpCH@ep-fragrant-smoke-ae00uwml-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
echo MSG91_AUTH_KEY=468517Ak5rJ0vb7NDV68c24863P1
echo MSG91_SENDER_ID=BELL24H
echo API_SECRET_KEY=bell24h-api-secret-key-2024
echo ENCRYPTION_KEY=bell24h-encryption-key-32-chars-minimum
echo NODE_ENV=production
echo NEXT_PUBLIC_APP_NAME=BELL24H
echo NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
echo NEXT_TELEMETRY_DISABLED=1
echo.
echo Step 5: After adding environment variables, redeploy:
echo vercel --prod
echo.
echo ✅ Your Bell24h platform will be live and ready for revenue generation!
echo.
pause
