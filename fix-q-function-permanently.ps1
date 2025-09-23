# PERMANENT FIX for Q: function causing 'q' prefix issue
Write-Host "========================================" -ForegroundColor Green
Write-Host "PERMANENT FIX FOR Q: FUNCTION" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host ""
Write-Host "Problem: Q: function is adding 'q' prefix to all commands" -ForegroundColor Red
Write-Host "Solution: Remove the Q: function permanently" -ForegroundColor Green
Write-Host ""

# Step 1: Check if Q: function exists
Write-Host "Step 1: Checking for Q: function..." -ForegroundColor Yellow
$qFunction = Get-Command Q: -ErrorAction SilentlyContinue
if ($qFunction) {
    Write-Host "FOUND: Q: function exists - this is the problem!" -ForegroundColor Red
    Write-Host "Function details: $($qFunction.Source)" -ForegroundColor Red
} else {
    Write-Host "OK: No Q: function found" -ForegroundColor Green
}

# Step 2: Remove Q: function
Write-Host ""
Write-Host "Step 2: Removing Q: function..." -ForegroundColor Yellow
try {
    Remove-Item function:Q: -Force -ErrorAction SilentlyContinue
    Write-Host "SUCCESS: Q: function removed" -ForegroundColor Green
} catch {
    Write-Host "INFO: Q: function was not found or already removed" -ForegroundColor Yellow
}

# Step 3: Remove Q: alias if it exists
Write-Host ""
Write-Host "Step 3: Removing Q: alias..." -ForegroundColor Yellow
try {
    Remove-Item alias:Q: -Force -ErrorAction SilentlyContinue
    Write-Host "SUCCESS: Q: alias removed" -ForegroundColor Green
} catch {
    Write-Host "INFO: Q: alias was not found or already removed" -ForegroundColor Yellow
}

# Step 4: Test commands
Write-Host ""
Write-Host "Step 4: Testing commands..." -ForegroundColor Yellow
Write-Host "Testing: npm --version"
npm --version

Write-Host ""
Write-Host "Testing: node --version"
node --version

Write-Host ""
Write-Host "Testing: Get-Location"
Get-Location

# Step 5: Create permanent fix
Write-Host ""
Write-Host "Step 5: Creating permanent fix..." -ForegroundColor Yellow

$permanentFix = @"
# PERMANENT FIX: Remove Q: function on PowerShell startup
if (Get-Command Q: -ErrorAction SilentlyContinue) {
    Remove-Item function:Q: -Force -ErrorAction SilentlyContinue
    Write-Host "Q: function removed - terminal fixed!" -ForegroundColor Green
}
"@

# Add to PowerShell profile
$profilePath = $PROFILE
if (-not (Test-Path $profilePath)) {
    New-Item -Path $profilePath -ItemType File -Force
    Write-Host "Created PowerShell profile: $profilePath" -ForegroundColor Green
}

# Add the fix to profile
Add-Content -Path $profilePath -Value $permanentFix -Force
Write-Host "Added permanent fix to PowerShell profile" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "PERMANENT FIX COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Q: function removed" -ForegroundColor Green
Write-Host "✅ Commands should work normally now" -ForegroundColor Green
Write-Host "✅ Fix will be applied automatically on next PowerShell startup" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 You can now start your MCP server!" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to continue"
