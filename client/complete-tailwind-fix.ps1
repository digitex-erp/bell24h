Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COMPLETE TAILWIND CSS CORRUPTION FIX" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 1: Closing any running processes..." -ForegroundColor Yellow
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Get-Process -Name "npm" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✅ Processes stopped" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ No running processes found" -ForegroundColor Blue
}
Write-Host ""

Write-Host "Step 2: Cleaning up corrupted files..." -ForegroundColor Yellow

# Remove node_modules
if (Test-Path "node_modules") {
    Write-Host "Removing corrupted node_modules..." -ForegroundColor Yellow
    Remove-Item -Path "node_modules" -Recurse -Force
    Write-Host "✅ node_modules removed" -ForegroundColor Green
}

# Remove package-lock.json
if (Test-Path "package-lock.json") {
    Write-Host "Removing package-lock.json..." -ForegroundColor Yellow
    Remove-Item -Path "package-lock.json" -Force
    Write-Host "✅ package-lock.json removed" -ForegroundColor Green
}

# Remove TypeScript build info
if (Test-Path "tsconfig.tsbuildinfo") {
    Write-Host "Removing TypeScript build info..." -ForegroundColor Yellow
    Remove-Item -Path "tsconfig.tsbuildinfo" -Force
    Write-Host "✅ tsconfig.tsbuildinfo removed" -ForegroundColor Green
}

# Remove Next.js build cache
if (Test-Path ".next") {
    Write-Host "Removing Next.js build cache..." -ForegroundColor Yellow
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "✅ .next cache removed" -ForegroundColor Green
}

# Remove conflicting Tailwind config
if (Test-Path "tailwind.config.ts") {
    Write-Host "Removing conflicting Tailwind config..." -ForegroundColor Yellow
    Remove-Item -Path "tailwind.config.ts" -Force
    Write-Host "✅ tailwind.config.ts removed" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 3: Clearing npm cache..." -ForegroundColor Yellow
try {
    npm cache clean --force
    Write-Host "✅ NPM cache cleared" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not clear NPM cache" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 4: Installing fresh dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ DEPENDENCIES INSTALLED SUCCESSFULLY!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Now you can:" -ForegroundColor Cyan
    Write-Host "1. Run: npm run build" -ForegroundColor White
    Write-Host "2. Run: npm run dev" -ForegroundColor White
    Write-Host "3. Test admin pages" -ForegroundColor White
    Write-Host ""
} catch {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "❌ DEPENDENCY INSTALLATION FAILED" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try running: npm install --legacy-peer-deps" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
