@echo off
echo ========================================
echo    BELL24H AUTOMATED DEPLOYMENT
echo ========================================
echo.

echo Step 1: Installing Vercel CLI...
call npm install -g vercel
echo.

echo Step 2: Logging into Vercel...
echo Please complete browser authentication when prompted
call vercel login
echo.

echo Step 3: Deploying to Production...
call vercel --prod
echo.

echo Step 4: Setting Environment Variables...
echo.
echo IMPORTANT: After deployment completes, add these environment variables in Vercel Dashboard:
echo.
echo NEXTAUTH_URL=https://www.bell24h.com
echo NEXTAUTH_SECRET=bell24h-super-secret-key-32-chars-minimum-required
echo JWT_SECRET=bell24h-jwt-secret-key-32-chars-minimum
echo DATABASE_URL=postgresql://neondb_owner:npg_K6M8mRhTPpCH@ep-fragrant-smoke-ae00uwml-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require^&channel_binding=require
echo MSG91_AUTH_KEY=468517Ak5rJ0vb7NDV68c24863P1
echo MSG91_SENDER_ID=BELL24H
echo API_SECRET_KEY=bell24h-api-secret-key-2024
echo ENCRYPTION_KEY=bell24h-encryption-key-32-chars-minimum
echo NODE_ENV=production
echo NEXT_PUBLIC_APP_NAME=BELL24H
echo NEXT_PUBLIC_APP_URL=https://www.bell24h.com
echo NEXT_TELEMETRY_DISABLED=1
echo.
echo Step 5: Testing Deployment...
echo Your site will be available at the URL shown above
echo Test these pages:
echo - Homepage: [your-url]/
echo - Revenue Service: [your-url]/services/verification/order
echo - Health Check: [your-url]/api/health
echo - Phone Auth: [your-url]/auth/phone-email
echo.
echo Step 6: Marketing Launch Ready
echo Open marketing/whatsapp-messages.txt and start sending messages!
echo.
echo ========================================
echo    DEPLOYMENT COMPLETE!
echo ========================================
pause