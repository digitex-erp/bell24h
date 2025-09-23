# MCP Auto Deploy Script for Bell24h
Write-Host "🚀 MCP AUTOMATED DEPLOYMENT STARTING..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Yellow

# Step 1: Navigate to correct directory
Write-Host "[1] Setting up directory..." -ForegroundColor Cyan
Set-Location C:\Users\Sanika\Projects\bell24h
Write-Host "Current directory: $(Get-Location)" -ForegroundColor White

# Step 2: Create environment file if missing
Write-Host "[2] Creating environment file..." -ForegroundColor Cyan
$envPath = "client\.env.local"
if (-not (Test-Path $envPath)) {
    $envContent = @"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=bell24h-secret-key-32-characters-long
MSG91_AUTH_KEY=468517Ak5rJ0vb7NDV68c24863P1
MSG91_SENDER_ID=BELL24H
DATABASE_URL=postgresql://placeholder:placeholder@placeholder:5432/placeholder
RAZORPAY_KEY_ID=rzp_test_placeholder
RAZORPAY_KEY_SECRET=placeholder_secret
"@
    $envContent | Out-File -FilePath $envPath -Encoding UTF8
    Write-Host "✅ .env.local created!" -ForegroundColor Green
} else {
    Write-Host "✅ .env.local already exists!" -ForegroundColor Green
}

# Step 3: Test build
Write-Host "[3] Testing build..." -ForegroundColor Cyan
Set-Location client
Write-Host "Building in directory: $(Get-Location)" -ForegroundColor White

try {
    $buildResult = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ BUILD SUCCESSFUL!" -ForegroundColor Green
        Write-Host "Ready for deployment!" -ForegroundColor White
    } else {
        Write-Host "❌ BUILD FAILED!" -ForegroundColor Red
        Write-Host $buildResult -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ BUILD ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Install Vercel CLI if not present
Write-Host "[4] Setting up Vercel CLI..." -ForegroundColor Cyan
try {
    $vercelVersion = vercel --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Vercel CLI already installed: $vercelVersion" -ForegroundColor Green
    } else {
        Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
        npm install -g vercel
        Write-Host "✅ Vercel CLI installed!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Vercel CLI installation failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Deploy to Vercel
Write-Host "[5] Deploying to Vercel..." -ForegroundColor Cyan
Write-Host "Note: You'll need to login to Vercel first if not already logged in." -ForegroundColor Yellow

try {
    Write-Host "Starting deployment..." -ForegroundColor White
    vercel --prod --force
    Write-Host "✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
} catch {
    Write-Host "❌ Deployment failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "You may need to run 'vercel login' first." -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "🎉 MCP AUTOMATED DEPLOYMENT COMPLETE!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Check your Vercel dashboard for the live URL" -ForegroundColor White
Write-Host "2. Test the deployed site" -ForegroundColor White
Write-Host "3. Submit to Razorpay for approval" -ForegroundColor White
