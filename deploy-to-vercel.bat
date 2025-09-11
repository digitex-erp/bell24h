@echo off
echo 🚀 DEPLOYING BELL24H TO VERCEL - AUTOMATED
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
echo RAZORPAY_KEY_ID=your_razorpay_key_id_here
echo RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
echo JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
echo NEXTAUTH_URL=https://your-app.vercel.app
echo NEXTAUTH_SECRET=your_nextauth_secret_here
echo NODE_ENV=production
echo.

echo ✅ Deployment complete! Your platform is now live.
echo.
pause