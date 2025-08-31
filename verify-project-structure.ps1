# BELL24H Project Structure Verification Script
# This script will check what actually exists on your system

Write-Host "🔍 BELL24H PROJECT STRUCTURE VERIFICATION" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check current working directory
Write-Host "📍 Current Working Directory:" -ForegroundColor Yellow
Get-Location | Write-Host
Write-Host ""

# Check what exists in Projects directory
Write-Host "📁 Checking C:\Users\Sanika\Projects:" -ForegroundColor Yellow
if (Test-Path "C:\Users\Sanika\Projects") {
    Get-ChildItem "C:\Users\Sanika\Projects" | ForEach-Object {
        Write-Host "  - $($_.Name) ($($_.Attributes))" -ForegroundColor Green
    }
} else {
    Write-Host "  ❌ C:\Users\Sanika\Projects does not exist" -ForegroundColor Red
}
Write-Host ""

# Check if bell24h-clean exists
Write-Host "🔍 Checking bell24h-clean directory:" -ForegroundColor Yellow
$bell24hCleanPath = "C:\Users\Sanika\Projects\bell24h-clean"
if (Test-Path $bell24hCleanPath) {
    Write-Host "  ✅ $bell24hCleanPath exists" -ForegroundColor Green
    
    # Check what's inside
    Write-Host "  📂 Contents:" -ForegroundColor Yellow
    Get-ChildItem $bell24hCleanPath | ForEach-Object {
        Write-Host "    - $($_.Name) ($($_.Attributes))" -ForegroundColor Green
    }
    
    # Check if client subdirectory exists
    $clientPath = Join-Path $bell24hCleanPath "client"
    Write-Host "  🔍 Checking client subdirectory:" -ForegroundColor Yellow
    if (Test-Path $clientPath) {
        Write-Host "    ✅ $clientPath exists" -ForegroundColor Green
        
        # Check if it's a Next.js project
        $packageJsonPath = Join-Path $clientPath "package.json"
        if (Test-Path $packageJsonPath) {
            Write-Host "    ✅ package.json found - appears to be a Node.js project" -ForegroundColor Green
        } else {
            Write-Host "    ❌ package.json not found" -ForegroundColor Red
        }
    } else {
        Write-Host "    ❌ $clientPath does not exist" -ForegroundColor Red
    }
} else {
    Write-Host "  ❌ $bell24hCleanPath does not exist" -ForegroundColor Red
}
Write-Host ""

# Check for any bell24h-related directories
Write-Host "🔍 Searching for any bell24h-related directories:" -ForegroundColor Yellow
$bell24hDirs = Get-ChildItem "C:\Users\Sanika\Projects" -Directory | Where-Object { $_.Name -like "*bell24h*" }
if ($bell24hDirs) {
    $bell24hDirs | ForEach-Object {
        Write-Host "  📁 Found: $($_.FullName)" -ForegroundColor Green
    }
} else {
    Write-Host "  ❌ No bell24h-related directories found" -ForegroundColor Red
}
Write-Host ""

# Check for global npm packages
Write-Host "📦 Checking for global npm packages:" -ForegroundColor Yellow
try {
    $globalPackages = npm list -g --depth=0 2>$null
    if ($globalPackages) {
        Write-Host "  ✅ Global npm packages found" -ForegroundColor Green
        Write-Host "  📊 Count: $($globalPackages.Count - 1) packages" -ForegroundColor Green
    } else {
        Write-Host "  ❌ No global npm packages found" -ForegroundColor Red
    }
} catch {
    Write-Host "  ❌ Error checking global npm packages: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

Write-Host "✅ Verification complete!" -ForegroundColor Cyan
Write-Host "Please share this output so we can understand what actually exists on your system."
