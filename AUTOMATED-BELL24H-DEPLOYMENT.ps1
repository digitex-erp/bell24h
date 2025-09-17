# BELL24H AUTOMATED DEPLOYMENT SCRIPT
# This script will automatically fix branding and deploy your site

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    BELL24H AUTOMATED DEPLOYMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install Vercel CLI
Write-Host "[1/6] Installing Vercel CLI..." -ForegroundColor Yellow
try {
  npm install -g vercel
  Write-Host "✅ Vercel CLI installed successfully" -ForegroundColor Green
}
catch {
  Write-Host "❌ ERROR: Failed to install Vercel CLI" -ForegroundColor Red
  Read-Host "Press Enter to exit"
  exit 1
}

# Step 2: Install dependencies
Write-Host "[2/6] Installing project dependencies..." -ForegroundColor Yellow
try {
  npm install
  Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}
catch {
  Write-Host "❌ ERROR: Failed to install dependencies" -ForegroundColor Red
  Read-Host "Press Enter to exit"
  exit 1
}

# Step 3: Fix Bell24h branding
Write-Host "[3/6] Fixing Bell24h branding..." -ForegroundColor Yellow
try {
  $content = Get-Content 'src\app\page.tsx' -Raw
  $content = $content -replace 'Bell24x', 'Bell24h'
  $content = $content -replace 'bell24x', 'bell24h'
  $content = $content -replace 'Bell24X', 'Bell24h'
  Set-Content 'src\app\page.tsx' -Value $content
  Write-Host "✅ Branding fixed successfully" -ForegroundColor Green
}
catch {
  Write-Host "❌ ERROR: Failed to fix branding" -ForegroundColor Red
  Read-Host "Press Enter to exit"
  exit 1
}

# Step 4: Build the project
Write-Host "[4/6] Building the project..." -ForegroundColor Yellow
try {
  npm run build
  Write-Host "✅ Build completed successfully" -ForegroundColor Green
}
catch {
  Write-Host "❌ ERROR: Build failed" -ForegroundColor Red
  Read-Host "Press Enter to exit"
  exit 1
}

# Step 5: Deploy to Vercel
Write-Host "[5/6] Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "Please login to Vercel when prompted..." -ForegroundColor Cyan
try {
  vercel --prod --yes
  Write-Host "✅ Deployment completed successfully" -ForegroundColor Green
}
catch {
  Write-Host "❌ ERROR: Deployment failed" -ForegroundColor Red
  Read-Host "Press Enter to exit"
  exit 1
}

# Step 6: Success message
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Your Bell24h site is now live!" -ForegroundColor Green
Write-Host "🌐 Check the URL provided above" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
