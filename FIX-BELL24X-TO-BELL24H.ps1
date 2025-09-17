# CRITICAL FIX: Bell24x → Bell24h Branding
# This script ensures you're viewing the correct Bell24h site

Write-Host "🚨 CRITICAL FIX: Bell24x → Bell24h Branding" -ForegroundColor Red
Write-Host "===============================================" -ForegroundColor Red

# Step 1: Kill ALL Node.js processes
Write-Host "🔄 Step 1: Killing ALL Node.js processes..." -ForegroundColor Yellow
taskkill /F /IM node.exe 2>$null
Start-Sleep -Seconds 2

# Step 2: Navigate to the CORRECT directory
Write-Host "📁 Step 2: Navigating to correct directory..." -ForegroundColor Yellow
Set-Location "C:\Users\Sanika\Projects\bell24x-complete"

# Step 3: Verify we're in the right place
Write-Host "✅ Step 3: Verifying correct directory..." -ForegroundColor Green
$currentPath = Get-Location
Write-Host "Current directory: $currentPath" -ForegroundColor Cyan

# Step 4: Check for Bell24x references and fix them
Write-Host "🔍 Step 4: Searching for Bell24x references..." -ForegroundColor Yellow
$bell24xFiles = Get-ChildItem -Recurse -Include "*.tsx", "*.ts", "*.js", "*.jsx", "*.md", "*.json" | Select-String "Bell24x" | Select-Object -ExpandProperty Filename | Get-Unique

if ($bell24xFiles) {
  Write-Host "❌ Found Bell24x references in: $bell24xFiles" -ForegroundColor Red
  Write-Host "🔧 Fixing Bell24x references..." -ForegroundColor Yellow
    
  # Fix all Bell24x references
  Get-ChildItem -Recurse -Include "*.tsx", "*.ts", "*.js", "*.jsx", "*.md", "*.json" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "Bell24x") {
      $content = $content -replace "Bell24x", "Bell24h"
      Set-Content -Path $_.FullName -Value $content -NoNewline
      Write-Host "✅ Fixed: $($_.Name)" -ForegroundColor Green
    }
  }
}
else {
  Write-Host "✅ No Bell24x references found!" -ForegroundColor Green
}

# Step 5: Clear any cached builds
Write-Host "🧹 Step 5: Clearing cached builds..." -ForegroundColor Yellow
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Step 6: Install dependencies if needed
if (!(Test-Path "node_modules")) {
  Write-Host "📦 Step 6: Installing dependencies..." -ForegroundColor Blue
  npm install
}

# Step 7: Start the development server
Write-Host "🚀 Step 7: Starting Bell24h development server..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "🌐 Open: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🎯 Look for: 'Bell24h' in top-left corner" -ForegroundColor Cyan
Write-Host "❌ Should NOT see: 'Bell24x'" -ForegroundColor Red
Write-Host "===============================================" -ForegroundColor Green

# Start the server
npm run dev
