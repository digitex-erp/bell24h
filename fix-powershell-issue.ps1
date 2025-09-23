# PowerShell script to fix 'q' prefix issue
Write-Host "========================================" -ForegroundColor Green
Write-Host "FIXING POWERSHELL 'q' PREFIX ISSUE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host ""
Write-Host "1. Checking for 'q' aliases..." -ForegroundColor Yellow
Get-Alias | Where-Object {$_.Name -like "*q*"}

Write-Host ""
Write-Host "2. Checking for 'q' functions..." -ForegroundColor Yellow
Get-Command | Where-Object {$_.Name -like "*q*"}

Write-Host ""
Write-Host "3. Checking PowerShell profile..." -ForegroundColor Yellow
if (Test-Path $PROFILE) {
    Write-Host "Profile exists: $PROFILE" -ForegroundColor Red
    Write-Host "Checking for 'q' references..." -ForegroundColor Yellow
    Get-Content $PROFILE | Select-String "q"
} else {
    Write-Host "No PowerShell profile found" -ForegroundColor Green
}

Write-Host ""
Write-Host "4. Testing direct commands..." -ForegroundColor Yellow
Write-Host "Testing: Get-Location"
Get-Location

Write-Host ""
Write-Host "Testing: npm --version"
npm --version

Write-Host ""
Write-Host "Testing: node --version"
node --version

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "SOLUTIONS TO TRY:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "SOLUTION 1: Remove 'q' alias if it exists" -ForegroundColor Cyan
Write-Host "Run: Remove-Item alias:q -Force" -ForegroundColor White
Write-Host ""
Write-Host "SOLUTION 2: Clear all aliases" -ForegroundColor Cyan
Write-Host "Run: Get-Alias | Remove-Item" -ForegroundColor White
Write-Host ""
Write-Host "SOLUTION 3: Restart PowerShell" -ForegroundColor Cyan
Write-Host "Close and reopen PowerShell" -ForegroundColor White
Write-Host ""
Write-Host "SOLUTION 4: Use Command Prompt instead" -ForegroundColor Cyan
Write-Host "Switch to Command Prompt in Cursor" -ForegroundColor White
Write-Host ""
Write-Host "SOLUTION 5: Reset PowerShell profile" -ForegroundColor Cyan
Write-Host "Run: Remove-Item $PROFILE -Force" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue"
