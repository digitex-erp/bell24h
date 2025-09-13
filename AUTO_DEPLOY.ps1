# BELL24H AUTOMATED DEPLOYMENT SCRIPT
Write-Host "🚀 BELL24H AUTOMATED DEPLOYMENT TO VERCEL" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

Write-Host ""
Write-Host "Step 1: Installing Vercel CLI globally..." -ForegroundColor Yellow
npm install -g vercel

Write-Host ""
Write-Host "Step 2: Deploying to Vercel using npx..." -ForegroundColor Yellow
Write-Host "This will open a browser for login..." -ForegroundColor Cyan

Write-Host ""
Write-Host "Step 3: Login to Vercel..." -ForegroundColor Yellow
npx vercel login

Write-Host ""
Write-Host "Step 4: Deploying to production..." -ForegroundColor Yellow
Write-Host "Answer the prompts as follows:" -ForegroundColor Cyan
Write-Host "- Set up and deploy? → Y" -ForegroundColor White
Write-Host "- Which scope? → Press Enter" -ForegroundColor White
Write-Host "- Link to existing project? → N" -ForegroundColor White
Write-Host "- Project name? → bell24h" -ForegroundColor White
Write-Host "- Directory? → Press Enter" -ForegroundColor White
Write-Host "- Override settings? → N" -ForegroundColor White
Write-Host ""

npx vercel --prod

Write-Host ""
Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Add environment variables in Vercel Dashboard:" -ForegroundColor Red
Write-Host "1. Go to: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "2. Select your bell24h project" -ForegroundColor Cyan
Write-Host "3. Go to Settings → Environment Variables" -ForegroundColor Cyan
Write-Host "4. Add the variables from COPY_PASTE_DEPLOYMENT.txt" -ForegroundColor Cyan
Write-Host "5. Redeploy with: npx vercel --prod" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your Bell24h platform is now live and ready for revenue generation!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
