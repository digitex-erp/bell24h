# DEFINITIVE FIX: Bell24x → Bell24h (Bypass Cursor Issues)
# This script fixes the repository confusion and ensures correct Bell24h branding

Write-Host "🚨 DEFINITIVE FIX: Bell24x → Bell24h Branding" -ForegroundColor Red
Write-Host "=====================================================" -ForegroundColor Red
Write-Host "🎯 Root Cause: Cursor background agent misconfiguration" -ForegroundColor Yellow
Write-Host "🔧 Solution: Manual fix bypassing Cursor entirely" -ForegroundColor Yellow
Write-Host "=====================================================" -ForegroundColor Red

# Step 1: Kill ALL processes to ensure clean slate
Write-Host "🔄 Step 1: Killing ALL processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
taskkill /F /IM cursor.exe 2>$null
Start-Sleep -Seconds 3

# Step 2: Navigate to the CORRECT directory (bell24x-complete)
Write-Host "📁 Step 2: Navigating to CORRECT directory..." -ForegroundColor Yellow
Set-Location "C:\Users\Sanika\Projects\bell24x-complete"

# Step 3: Verify we're in the right place
Write-Host "✅ Step 3: Verifying correct directory..." -ForegroundColor Green
$currentPath = Get-Location
Write-Host "Current directory: $currentPath" -ForegroundColor Cyan

# Step 4: Check what's actually in the homepage file
Write-Host "🔍 Step 4: Checking homepage content..." -ForegroundColor Yellow
$homepageContent = Get-Content "src\app\page.tsx" -Raw
if ($homepageContent -match "Bell24x") {
  Write-Host "❌ Found Bell24x in homepage - fixing now..." -ForegroundColor Red
  $homepageContent = $homepageContent -replace "Bell24x", "Bell24h"
  Set-Content -Path "src\app\page.tsx" -Value $homepageContent -NoNewline
  Write-Host "✅ Fixed homepage: Bell24x → Bell24h" -ForegroundColor Green
}
else {
  Write-Host "✅ Homepage already shows Bell24h" -ForegroundColor Green
}

# Step 5: Check layout file
Write-Host "🔍 Step 5: Checking layout content..." -ForegroundColor Yellow
$layoutContent = Get-Content "src\app\layout.tsx" -Raw
if ($layoutContent -match "Bell24x") {
  Write-Host "❌ Found Bell24x in layout - fixing now..." -ForegroundColor Red
  $layoutContent = $layoutContent -replace "Bell24x", "Bell24h"
  Set-Content -Path "src\app\layout.tsx" -Value $layoutContent -NoNewline
  Write-Host "✅ Fixed layout: Bell24x → Bell24h" -ForegroundColor Green
}
else {
  Write-Host "✅ Layout already shows Bell24h" -ForegroundColor Green
}

# Step 6: Check package.json
Write-Host "🔍 Step 6: Checking package.json..." -ForegroundColor Yellow
$packageContent = Get-Content "package.json" -Raw
if ($packageContent -match "Bell24x") {
  Write-Host "❌ Found Bell24x in package.json - fixing now..." -ForegroundColor Red
  $packageContent = $packageContent -replace "Bell24x", "Bell24h"
  Set-Content -Path "package.json" -Value $packageContent -NoNewline
  Write-Host "✅ Fixed package.json: Bell24x → Bell24h" -ForegroundColor Green
}
else {
  Write-Host "✅ Package.json already shows Bell24h" -ForegroundColor Green
}

# Step 7: Clear any cached builds
Write-Host "🧹 Step 7: Clearing cached builds..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Step 8: Install dependencies if needed
if (!(Test-Path "node_modules")) {
  Write-Host "📦 Step 8: Installing dependencies..." -ForegroundColor Blue
  npm install
}

# Step 9: Start the development server
Write-Host "🚀 Step 9: Starting Bell24h development server..." -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green
Write-Host "🌐 Open: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🎯 Look for: 'Bell24h' in top-left corner" -ForegroundColor Cyan
Write-Host "❌ Should NOT see: 'Bell24x'" -ForegroundColor Red
Write-Host "✅ This will be the CORRECT Bell24h site" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green

# Start the server
npm run dev
