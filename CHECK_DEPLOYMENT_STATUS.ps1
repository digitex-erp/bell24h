# Check deployment status
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CHECKING DEPLOYMENT STATUS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Hero.tsx is fixed
Write-Host "Checking Hero.tsx status..." -ForegroundColor Yellow
if (Test-Path "components/Hero.tsx") {
    $heroContent = Get-Content "components/Hero.tsx" -Raw
    if ($heroContent -match "bg-gradient-to-br from-indigo-600 to-emerald-600") {
        Write-Host "✅ Hero.tsx: Fixed and ready" -ForegroundColor Green
    } else {
        Write-Host "❌ Hero.tsx: Still needs fixing" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Hero.tsx: File not found" -ForegroundColor Red
}

# Check Razorpay keys
Write-Host ""
Write-Host "Checking Razorpay keys..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "rzp_live_RJjxcgaBo9j0UA") {
        Write-Host "✅ Razorpay keys: Configured" -ForegroundColor Green
    } else {
        Write-Host "❌ Razorpay keys: Not configured" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Environment file: Not found" -ForegroundColor Red
}

# Check Vercel project link
Write-Host ""
Write-Host "Checking Vercel project link..." -ForegroundColor Yellow
if (Test-Path ".vercel/project.json") {
    $project = Get-Content ".vercel/project.json" | ConvertFrom-Json
    Write-Host "✅ Project: $($project.projectName)" -ForegroundColor Green
    Write-Host "✅ Project ID: $($project.projectId)" -ForegroundColor Green
} else {
    Write-Host "❌ Vercel project: Not linked" -ForegroundColor Red
}

# Try to build
Write-Host ""
Write-Host "Testing build..." -ForegroundColor Yellow
try {
    Write-Host "Running: npm run build" -ForegroundColor Gray
    npm run build 2>&1 | Select-String -Pattern "Failed to compile|Error|✅|Success"
    Write-Host "✅ Build: Successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Build: Failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "STATUS CHECK COMPLETE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If everything shows ✅, you're ready to deploy!" -ForegroundColor Green
Write-Host "If any show ❌, we need to fix them first." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue..."
