@echo off
echo ========================================
echo SETTING UP PRODUCTION ENVIRONMENT
echo ========================================
echo.

echo Creating .env.production file...
echo # Bell24h Production Environment Variables > .env.production
echo # For Vercel Deployment >> .env.production
echo. >> .env.production
echo # NextAuth Configuration >> .env.production
echo NEXTAUTH_URL=https://bell24h.vercel.app >> .env.production
echo NEXTAUTH_SECRET=bell24h-production-secret-key-2024-vercel >> .env.production
echo. >> .env.production
echo # MSG91 OTP Configuration (Working) >> .env.production
echo MSG91_AUTH_KEY=468517Ak5rJ0vb7NDV68c24863P1 >> .env.production
echo MSG91_SENDER_ID=BELL24H >> .env.production
echo. >> .env.production
echo # Database (Neon - you'll need to set this up) >> .env.production
echo DATABASE_URL=postgresql://username:password@hostname:5432/bell24h_prod >> .env.production
echo. >> .env.production
echo # Razorpay (Test keys for now) >> .env.production
echo RAZORPAY_KEY_ID=rzp_test_pending_approval >> .env.production
echo RAZORPAY_KEY_SECRET=test_secret_pending_approval >> .env.production
echo. >> .env.production
echo # Application Configuration >> .env.production
echo NODE_ENV=production >> .env.production
echo NEXT_PUBLIC_APP_URL=https://bell24h.vercel.app >> .env.production
echo NEXT_PUBLIC_APP_NAME=Bell24h >> .env.production
echo. >> .env.production
echo # Feature Flags (Beta Mode) >> .env.production
echo NEXT_PUBLIC_BETA_MODE=true >> .env.production
echo NEXT_PUBLIC_MAX_USERS=50 >> .env.production
echo NEXT_PUBLIC_FEATURES=registration,profiles,basic_rfq >> .env.production

echo ✅ Production environment file created!
echo.
echo IMPORTANT: Update DATABASE_URL with your Neon database URL
echo.
pause
