# PowerShell script for Razorpay deployment
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RAZORPAY DEPLOYMENT SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to client directory
Write-Host "[1] Navigating to client directory..." -ForegroundColor Yellow
Set-Location "C:\Users\Sanika\Projects\bell24h\client"
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Green

# Install Vercel CLI globally
Write-Host ""
Write-Host "[2] Installing Vercel CLI globally..." -ForegroundColor Yellow
npm install -g vercel

# Refresh environment variables
Write-Host ""
Write-Host "[3] Refreshing environment..." -ForegroundColor Yellow
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Build the project
Write-Host ""
Write-Host "[4] Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
    
    # Deploy to Vercel
    Write-Host ""
    Write-Host "[5] Deploying to Vercel..." -ForegroundColor Yellow
    npx vercel --prod --force
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "DEPLOYMENT COMPLETE!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Your site is now live for Razorpay review!" -ForegroundColor Green
} else {
    Write-Host "Build failed. Please check the errors above." -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
