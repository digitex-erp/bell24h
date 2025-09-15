# --- Bell24h Automatic Deployment Script ---
# This script automatically deploys your beautiful blue homepage to production

Write-Host "🚀 Starting Bell24h deployment..." -ForegroundColor Green
Write-Host ""

# Step 1: Ensure correct branch
Write-Host "📋 Step 1: Switching to main branch..." -ForegroundColor Yellow
git checkout main
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Failed to switch to main branch" -ForegroundColor Red
  exit 1
}

# Step 2: Pull latest from remote safely
Write-Host "📥 Step 2: Pulling latest changes..." -ForegroundColor Yellow
git pull origin main --allow-unrelated-histories
if ($LASTEXITCODE -ne 0) {
  Write-Host "⚠️  Warning: Pull had issues, but continuing..." -ForegroundColor Yellow
}

# Step 3: Ensure correct folder structure
Write-Host "📁 Step 3: Ensuring correct folder structure..." -ForegroundColor Yellow
if (-Not (Test-Path "app")) { 
  Write-Host "   Creating app/ folder..." -ForegroundColor Cyan
  mkdir app 
}
if (-Not (Test-Path "components")) { 
  Write-Host "   Creating components/ folder..." -ForegroundColor Cyan
  mkdir components 
}

# Step 4: Move files into correct locations
Write-Host "📦 Step 4: Moving files to correct locations..." -ForegroundColor Yellow
if (Test-Path "page.tsx") { 
  Write-Host "   Moving page.tsx to app/page.tsx..." -ForegroundColor Cyan
  Move-Item "page.tsx" "app/page.tsx" -Force 
}
if (Test-Path "Navigation.tsx") { 
  Write-Host "   Moving Navigation.tsx to components/Navigation.tsx..." -ForegroundColor Cyan
  Move-Item "Navigation.tsx" "components/Navigation.tsx" -Force 
}

# Step 5: Clean up any misplaced files in root
Write-Host "🧹 Step 5: Cleaning up misplaced files..." -ForegroundColor Yellow
if (Test-Path "page.tsx") { 
  Write-Host "   Removing misplaced page.tsx from root..." -ForegroundColor Cyan
  Remove-Item "page.tsx" -Force 
}
if (Test-Path "Navigation.tsx") { 
  Write-Host "   Removing misplaced Navigation.tsx from root..." -ForegroundColor Cyan
  Remove-Item "Navigation.tsx" -Force 
}

# Step 6: Stage changes
Write-Host "📝 Step 6: Staging changes..." -ForegroundColor Yellow
git add app/page.tsx components/Navigation.tsx
if (Test-Path "app/page.tsx") {
  Write-Host "   ✅ app/page.tsx staged" -ForegroundColor Green
}
if (Test-Path "components/Navigation.tsx") {
  Write-Host "   ✅ components/Navigation.tsx staged" -ForegroundColor Green
}

# Step 7: Commit with clear message
Write-Host "💾 Step 7: Committing changes..." -ForegroundColor Yellow
git commit -m "Deploy beautiful blue homepage with navigation to production - automatic deployment"
if ($LASTEXITCODE -ne 0) {
  Write-Host "⚠️  Warning: Commit had issues, but continuing..." -ForegroundColor Yellow
}

# Step 8: Push to GitHub main branch
Write-Host "🚀 Step 8: Pushing to GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "✅ SUCCESS! Deployment pushed to GitHub!" -ForegroundColor Green
  Write-Host "🌐 Vercel will auto-deploy in 2-3 minutes..." -ForegroundColor Cyan
  Write-Host "🎨 Your beautiful blue homepage will be live at www.bell24h.com!" -ForegroundColor Magenta
  Write-Host ""
  Write-Host "📊 Check deployment status at:" -ForegroundColor Yellow
  Write-Host "   https://vercel.com/dashboard" -ForegroundColor Blue
  Write-Host ""
}
else {
  Write-Host "❌ Push failed. Please check your git configuration." -ForegroundColor Red
  Write-Host "💡 Try running: git remote -v" -ForegroundColor Yellow
}

Write-Host "🏁 Deployment script completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
