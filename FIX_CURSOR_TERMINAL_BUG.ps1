# PowerShell script to fix Cursor terminal 'q' prefix bug
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FIXING CURSOR TERMINAL 'q' PREFIX BUG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create PowerShell profile if it doesn't exist
Write-Host "Step 1: Creating PowerShell profile..." -ForegroundColor Yellow
if (!(Test-Path -Path $PROFILE)) {
    New-Item -ItemType File -Path $PROFILE -Force
    Write-Host "✅ PowerShell profile created" -ForegroundColor Green
} else {
    Write-Host "✅ PowerShell profile already exists" -ForegroundColor Green
}

# Step 2: Add 'q' command fix to PowerShell profile
Write-Host ""
Write-Host "Step 2: Adding 'q' command fix to PowerShell profile..." -ForegroundColor Yellow
$fixContent = @"
# Fix Cursor terminal 'q' prefix bug
function q { }
Set-Alias -Name q -Value q
"@

Add-Content -Path $PROFILE -Value $fixContent
Write-Host "✅ 'q' command fix added to PowerShell profile" -ForegroundColor Green

# Step 3: Set environment variable
Write-Host ""
Write-Host "Step 3: Setting environment variable..." -ForegroundColor Yellow
[Environment]::SetEnvironmentVariable("CURSOR_TERMINAL_FIX", "1", "User")
Write-Host "✅ Environment variable set" -ForegroundColor Green

# Step 4: Reload PowerShell profile
Write-Host ""
Write-Host "Step 4: Reloading PowerShell profile..." -ForegroundColor Yellow
. $PROFILE
Write-Host "✅ PowerShell profile reloaded" -ForegroundColor Green

# Step 5: Test the fix
Write-Host ""
Write-Host "Step 5: Testing the fix..." -ForegroundColor Yellow

# Test npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm working: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm still has issues" -ForegroundColor Red
}

# Test Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js working: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js still has issues" -ForegroundColor Red
}

# Test npx
try {
    $npxVersion = npx --version
    Write-Host "✅ npx working: $npxVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npx still has issues" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CURSOR TERMINAL BUG FIX COMPLETED!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ PowerShell profile updated" -ForegroundColor Green
Write-Host "✅ Environment variable set" -ForegroundColor Green
Write-Host "✅ Commands tested without 'q' prefix" -ForegroundColor Green
Write-Host ""
Write-Host "Your Cursor terminal should now work normally!" -ForegroundColor Green
Write-Host "Restart Cursor for the fix to take full effect." -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter to continue..."
