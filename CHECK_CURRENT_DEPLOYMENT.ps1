# CHECK_CURRENT_DEPLOYMENT.ps1
# Check what's currently deployed on www.bell24h.com

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CHECKING CURRENT DEPLOYMENT STATUS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check current site
Write-Host ""
Write-Host "Checking current site status..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://www.bell24h.com" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Site is accessible" -ForegroundColor Green
        
        # Check title
        $title = ($response.Content | Select-String '<title>(.*?)</title>').Matches[0].Groups[1].Value
        Write-Host "📄 Current title: $title" -ForegroundColor White
        
        # Check for key elements
        $hasHero = $response.Content -match 'The Global B2B Operating System'
        $hasRazorpay = $response.Content -match 'rzp_live_'
        $hasNeon = $response.Content -match 'neondb'
        
        Write-Host ""
        Write-Host "🔍 FEATURE CHECK:" -ForegroundColor Yellow
        Write-Host "  Enhanced Hero: $(if ($hasHero) { '✅ YES' } else { '❌ NO' })" -ForegroundColor $(if ($hasHero) { 'Green' } else { 'Red' })
        Write-Host "  Razorpay Live: $(if ($hasRazorpay) { '✅ YES' } else { '❌ NO' })" -ForegroundColor $(if ($hasRazorpay) { 'Green' } else { 'Red' })
        Write-Host "  Neon Database: $(if ($hasNeon) { '✅ YES' } else { '❌ NO' })" -ForegroundColor $(if ($hasNeon) { 'Green' } else { 'Red' })
        
    } else {
        Write-Host "❌ Site returned status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Site is not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Check Vercel project status
Write-Host ""
Write-Host "Checking Vercel project status..." -ForegroundColor Yellow

if (Test-Path ".vercel\project.json") {
    $projectConfig = Get-Content ".vercel\project.json" | ConvertFrom-Json
    Write-Host "✅ Project ID: $($projectConfig.projectId)" -ForegroundColor Green
    Write-Host "✅ Org ID: $($projectConfig.orgId)" -ForegroundColor Green
    
    if ($projectConfig.projectId -eq "prj_8ub3FQx2y1KUEgTZcjrb2Urzt7mS") {
        Write-Host "✅ Correct project (bell24h-v1)" -ForegroundColor Green
    } else {
        Write-Host "❌ Wrong project! Should be bell24h-v1" -ForegroundColor Red
    }
} else {
    Write-Host "❌ No .vercel/project.json found" -ForegroundColor Red
}

# Check environment variables
Write-Host ""
Write-Host "Checking environment variables..." -ForegroundColor Yellow

if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local"
    $hasRazorpayKey = $envContent -match 'RAZORPAY_KEY_ID=rzp_live_'
    $hasNeonDb = $envContent -match 'DATABASE_URL=postgresql://neondb_owner'
    
    Write-Host "  Razorpay Live Key: $(if ($hasRazorpayKey) { '✅ YES' } else { '❌ NO' })" -ForegroundColor $(if ($hasRazorpayKey) { 'Green' } else { 'Red' })
    Write-Host "  Neon Database: $(if ($hasNeonDb) { '✅ YES' } else { '❌ NO' })" -ForegroundColor $(if ($hasNeonDb) { 'Green' } else { 'Red' })
} else {
    Write-Host "❌ No .env.local found" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DEPLOYMENT STATUS CHECK COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Read-Host "Press Enter to continue..." | Out-Null
