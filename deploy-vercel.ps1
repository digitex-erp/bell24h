# BELL24H VERCEL DEPLOYMENT SCRIPT
Write-Host "🚀 BELL24H AUTOMATED DEPLOYMENT TO VERCEL" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

Write-Host ""
Write-Host "Step 1: Installing Vercel CLI globally..." -ForegroundColor Yellow
npm install -g vercel

Write-Host ""
Write-Host "Step 2: Deploying to production..." -ForegroundColor Yellow
npx vercel --prod

Write-Host ""
Write-Host "Step 3: IMPORTANT - Add environment variables in Vercel Dashboard" -ForegroundColor Red
Write-Host "Go to: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "Select your project → Settings → Environment Variables" -ForegroundColor Cyan
Write-Host "Add these for Production environment:" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXTAUTH_URL=https://your-app-name.vercel.app" -ForegroundColor White
Write-Host "NEXTAUTH_SECRET=bell24h-super-secret-key-32-chars-minimum-required" -ForegroundColor White
Write-Host "JWT_SECRET=bell24h-jwt-secret-key-32-chars-minimum" -ForegroundColor White
Write-Host "DATABASE_URL=postgresql://neondb_owner:npg_K6M8mRhTPpCH@ep-fragrant-smoke-ae00uwml-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require" -ForegroundColor White
Write-Host "MSG91_AUTH_KEY=468517Ak5rJ0vb7NDV68c24863P1" -ForegroundColor White
Write-Host "MSG91_SENDER_ID=BELL24H" -ForegroundColor White
Write-Host "API_SECRET_KEY=bell24h-api-secret-key-2024" -ForegroundColor White
Write-Host "ENCRYPTION_KEY=bell24h-encryption-key-32-chars-minimum" -ForegroundColor White
Write-Host "NODE_ENV=production" -ForegroundColor White
Write-Host "NEXT_PUBLIC_APP_NAME=BELL24H" -ForegroundColor White
Write-Host "NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app" -ForegroundColor White
Write-Host "NEXT_TELEMETRY_DISABLED=1" -ForegroundColor White
Write-Host ""
Write-Host "Step 4: After adding environment variables, redeploy:" -ForegroundColor Yellow
Write-Host "npx vercel --prod" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Your Bell24h platform will be live and ready for revenue generation!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
