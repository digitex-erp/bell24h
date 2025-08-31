Write-Host "🔧 Fixing Bell24H Dependencies..." -ForegroundColor Green
Write-Host ""

# Clean up corrupted files
Write-Host "🧹 Cleaning up corrupted files..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Path "node_modules" -Recurse -Force
    Write-Host "✅ Removed node_modules" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item -Path "package-lock.json" -Force
    Write-Host "✅ Removed package-lock.json" -ForegroundColor Green
}

if (Test-Path "tsconfig.tsbuildinfo") {
    Remove-Item -Path "tsconfig.tsbuildinfo" -Force
    Write-Host "✅ Removed tsconfig.tsbuildinfo" -ForegroundColor Green
}

if (Test-Path "tailwind.config.ts") {
    Remove-Item -Path "tailwind.config.ts" -Force
    Write-Host "✅ Removed tailwind.config.ts" -ForegroundColor Green
}

Write-Host ""
Write-Host "📦 Installing fresh dependencies..." -ForegroundColor Yellow

try {
    # Clear npm cache
    npm cache clean --force
    Write-Host "✅ NPM cache cleared" -ForegroundColor Green
    
    # Install dependencies
    npm install
    Write-Host ""
    Write-Host "🎉 Dependencies installed successfully!" -ForegroundColor Green
    Write-Host "🚀 Now you can run: npm run build" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ Error installing dependencies: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Try running: npm install --legacy-peer-deps" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
