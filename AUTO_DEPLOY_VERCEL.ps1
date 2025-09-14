# 🚀 BELL24H AUTOMATIC VERCEL DEPLOYMENT SCRIPT
# Run this script in PowerShell as Administrator

Write-Host "🚀 BELL24H AUTOMATIC DEPLOYMENT STARTING..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Yellow

# Step 1: Check if we're in the right directory
if (!(Test-Path "package.json")) {
  Write-Host "❌ Error: package.json not found. Please run this script from the bell24h project directory." -ForegroundColor Red
  exit 1
}

Write-Host "✅ Step 1: Project directory verified" -ForegroundColor Green

# Step 2: Build the project
Write-Host "🔨 Step 2: Building project..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Build failed! Please fix errors first." -ForegroundColor Red
  exit 1
}
Write-Host "✅ Build successful!" -ForegroundColor Green

# Step 3: Check git status
Write-Host "📋 Step 3: Checking git status..." -ForegroundColor Cyan
git status --porcelain
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Git not initialized or no repository found" -ForegroundColor Red
  exit 1
}
Write-Host "✅ Git repository verified" -ForegroundColor Green

# Step 4: Open Vercel dashboard
Write-Host "🌐 Step 4: Opening Vercel dashboard..." -ForegroundColor Cyan
Start-Process "https://vercel.com/new"
Write-Host "✅ Vercel dashboard opened in browser" -ForegroundColor Green

# Step 5: Display deployment instructions
Write-Host ""
Write-Host "📋 MANUAL STEPS TO COMPLETE:" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. In the opened browser window:" -ForegroundColor White
Write-Host "   - Click 'Import Git Repository'" -ForegroundColor Gray
Write-Host "   - Find 'digitex-erp/bell24h-production'" -ForegroundColor Gray
Write-Host "   - Click 'Import'" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Configure project (auto-detected):" -ForegroundColor White
Write-Host "   - Framework: Next.js ✅" -ForegroundColor Gray
Write-Host "   - Root Directory: ./ ✅" -ForegroundColor Gray
Write-Host "   - Build Command: npm run build ✅" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Add Environment Variables:" -ForegroundColor White
Write-Host "   - Go to Settings → Environment Variables" -ForegroundColor Gray
Write-Host "   - Add the variables listed below" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Deploy:" -ForegroundColor White
Write-Host "   - Click 'Deploy' button" -ForegroundColor Gray
Write-Host "   - Wait 5-10 minutes for build" -ForegroundColor Gray
Write-Host ""

# Step 6: Display environment variables
Write-Host "🔑 ENVIRONMENT VARIABLES TO ADD:" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "DATABASE_URL=postgresql://username:password@host:port/database" -ForegroundColor Cyan
Write-Host "MSG91_AUTH_KEY=468517Ak5rJ0vb7NDV68c24863P1" -ForegroundColor Cyan
Write-Host "MSG91_SENDER_ID=BELL24H" -ForegroundColor Cyan
Write-Host "RESEND_API_KEY=re_dGNCnq2P_9Rc29SZYvTCasdhvLCQG2Zx4" -ForegroundColor Cyan
Write-Host "FROM_EMAIL=noreply@bell24h.com" -ForegroundColor Cyan
Write-Host "JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long" -ForegroundColor Cyan
Write-Host "NEXTAUTH_URL=https://your-app.vercel.app" -ForegroundColor Cyan
Write-Host "NEXTAUTH_SECRET=your_nextauth_secret_here" -ForegroundColor Cyan
Write-Host "NODE_ENV=production" -ForegroundColor Cyan
Write-Host ""

# Step 7: Wait for user input
Write-Host "🎯 READY TO DEPLOY!" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Yellow
Write-Host ""
Write-Host "Your project is built and ready for deployment." -ForegroundColor White
Write-Host "Follow the manual steps above to complete the deployment." -ForegroundColor White
Write-Host ""
Write-Host "After deployment, your site will be live at:" -ForegroundColor White
Write-Host "https://your-project-name.vercel.app" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "🚀 DEPLOYMENT SCRIPT COMPLETED!" -ForegroundColor Green
Write-Host "Good luck with your deployment!" -ForegroundColor Cyan
