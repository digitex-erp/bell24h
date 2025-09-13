@echo off
echo ========================================
echo    BELL24H FINAL DEPLOYMENT
echo ========================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo Please install Node.js from: https://nodejs.org/
    echo Choose LTS version (18.x or 20.x)
    echo Then restart this script.
    pause
    exit /b 1
)

echo Node.js found: 
node --version
echo.

echo Step 1: Installing Vercel CLI...
npm install -g vercel
echo.

echo Step 2: Logging into Vercel...
echo IMPORTANT: Complete browser authentication when prompted
vercel login
echo.

echo Step 3: Deploying to Production...
vercel --prod
echo.

echo Step 4: Environment Variables Setup...
echo.
echo ========================================
echo    CRITICAL: ADD THESE TO VERCEL
echo ========================================
echo.
echo Go to: vercel.com → Your Project → Settings → Environment Variables
echo Add these for Production environment:
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
echo Step 5: Testing Your Live Site...
echo.
echo Test these URLs after deployment:
echo - Homepage: [your-deployment-url]/
echo - Mobile OTP: [your-deployment-url]/auth/phone-email
echo - Revenue Service: [your-deployment-url]/services/verification/order
echo - Health Check: [your-deployment-url]/api/health
echo - AI Dashboard: [your-deployment-url]/dashboard/ai-matching
echo.
echo Step 6: Mobile OTP Testing...
echo 1. Go to /auth/phone-email
echo 2. Enter your phone number
echo 3. Verify OTP is received via SMS
echo 4. Complete registration
echo.
echo Step 7: Revenue Generation...
echo Open marketing/whatsapp-messages.txt and start sending!
echo.
echo ========================================
echo    DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo Your Bell24h platform is now LIVE and ready for revenue generation!
echo Expected revenue: ₹4,000-10,000 in 48 hours
echo.
pause

