# Bell24h Deployment Script - PowerShell Version
Write-Host "========================================" -ForegroundColor Green
Write-Host "    BELL24H DEPLOYMENT - PS VERSION" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "[STEP 1] Cleaning up problematic files..." -ForegroundColor Yellow
if (Test-Path "src\components\mobile") { Remove-Item -Recurse -Force "src\components\mobile" }
if (Test-Path "src\pages\mobile") { Remove-Item -Recurse -Force "src\pages\mobile" }
if (Test-Path "src\services\logistics") { Remove-Item -Recurse -Force "src\services\logistics" }
Write-Host "✅ Problematic files removed" -ForegroundColor Green

Write-Host ""
Write-Host "[STEP 2] Installing Prisma dependencies..." -ForegroundColor Yellow
npm install @prisma/client prisma
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Failed to install Prisma dependencies" -ForegroundColor Red
  Read-Host "Press Enter to exit"
  exit 1
}
Write-Host "✅ Prisma dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "[STEP 3] Installing other dependencies..." -ForegroundColor Yellow
npm install @mui/material @emotion/react @emotion/styled axios
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
  Read-Host "Press Enter to exit"
  exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green

Write-Host ""
Write-Host "[STEP 4] Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
  Read-Host "Press Enter to exit"
  exit 1
}
Write-Host "✅ Prisma client generated" -ForegroundColor Green

Write-Host ""
Write-Host "[STEP 5] Installing Vercel CLI..." -ForegroundColor Yellow
npm install -g vercel
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Failed to install Vercel CLI" -ForegroundColor Red
  Read-Host "Press Enter to exit"
  exit 1
}
Write-Host "✅ Vercel CLI installed" -ForegroundColor Green

Write-Host ""
Write-Host "[STEP 6] Creating environment file..." -ForegroundColor Yellow
@"
# Bell24h Environment Variables
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=bell24h-secret-key-2025
DATABASE_URL=postgresql://neondb_owner:npg_K6M8mRhTPpCH@ep-fragrant-smoke-ae00uwml-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Host "✅ Environment file created" -ForegroundColor Green

Write-Host ""
Write-Host "[STEP 7] Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Build failed! Please check for errors above." -ForegroundColor Red
  Write-Host ""
  Write-Host "🔧 TROUBLESHOOTING:" -ForegroundColor Yellow
  Write-Host "   - Make sure all dependencies are installed"
  Write-Host "   - Check for any remaining import errors"
  Write-Host "   - Try running: npm install"
  Write-Host ""
  Read-Host "Press Enter to exit"
  exit 1
}
Write-Host "✅ Build successful!" -ForegroundColor Green

Write-Host ""
Write-Host "[STEP 8] Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "   📝 You will be prompted to login to Vercel"
Write-Host "   📝 Follow the on-screen instructions"
Write-Host "   📝 Choose your project settings when prompted"
Write-Host ""
vercel --prod --yes

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "     🎉 DEPLOYMENT COMPLETE! 🎉" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your Bell24h platform is now live!" -ForegroundColor Cyan
Write-Host "Check the URL provided above." -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "   1. Configure your domain (bell24h.com)"
Write-Host "   2. Set up DNS records"
Write-Host "   3. Test all features"
Write-Host "   4. Start using your B2B marketplace!"
Write-Host ""
Read-Host "Press Enter to exit"
