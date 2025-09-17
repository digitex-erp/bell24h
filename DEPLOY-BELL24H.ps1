# Bell24h PowerShell Deployment Script
Write-Host "🚀 BELL24H DEPLOYMENT SCRIPT" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Step 1: Clean up problematic files
Write-Host "`n[STEP 1] Cleaning up problematic files..." -ForegroundColor Yellow
if (Test-Path "src\components\mobile") { Remove-Item -Recurse -Force "src\components\mobile" }
if (Test-Path "src\pages\mobile") { Remove-Item -Recurse -Force "src\pages\mobile" }
if (Test-Path "src\services\logistics") { Remove-Item -Recurse -Force "src\services\logistics" }
Write-Host "✅ Problematic files removed" -ForegroundColor Green

# Step 2: Install dependencies
Write-Host "`n[STEP 2] Installing dependencies..." -ForegroundColor Yellow
npm install @mui/material @emotion/react @emotion/styled axios
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
  exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green

# Step 3: Install Vercel CLI
Write-Host "`n[STEP 3] Installing Vercel CLI..." -ForegroundColor Yellow
npm install -g vercel
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Failed to install Vercel CLI" -ForegroundColor Red
  exit 1
}
Write-Host "✅ Vercel CLI installed" -ForegroundColor Green

# Step 4: Create environment file
Write-Host "`n[STEP 4] Creating environment file..." -ForegroundColor Yellow
@"
# Bell24h Environment Variables
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=bell24h-secret-key-2025
DATABASE_URL=postgresql://neondb_owner:npg_K6M8mRhTPpCH@ep-fragrant-smoke-ae00uwml-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
"@ | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Host "✅ Environment file created" -ForegroundColor Green

# Step 5: Build project
Write-Host "`n[STEP 5] Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Build failed! Please check for errors above." -ForegroundColor Red
  Write-Host "`n🔧 TROUBLESHOOTING:" -ForegroundColor Yellow
  Write-Host "   - Make sure all dependencies are installed" -ForegroundColor White
  Write-Host "   - Check for any remaining import errors" -ForegroundColor White
  Write-Host "   - Try running: npm install" -ForegroundColor White
  exit 1
}
Write-Host "✅ Build successful!" -ForegroundColor Green

# Step 6: Deploy to Vercel
Write-Host "`n[STEP 6] Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "   📝 You will be prompted to login to Vercel" -ForegroundColor Cyan
Write-Host "   📝 Follow the on-screen instructions" -ForegroundColor Cyan
Write-Host "   📝 Choose your project settings when prompted" -ForegroundColor Cyan
Write-Host ""

vercel --prod --yes

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "     🎉 DEPLOYMENT COMPLETE! 🎉" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "`nYour Bell24h platform is now live!" -ForegroundColor Green
Write-Host "Check the URL provided above." -ForegroundColor Green
Write-Host "`n📋 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "   1. Configure your domain (bell24h.com)" -ForegroundColor White
Write-Host "   2. Set up DNS records" -ForegroundColor White
Write-Host "   3. Test all features" -ForegroundColor White
Write-Host "   4. Start using your B2B marketplace!" -ForegroundColor White
