# Fix Build Issues - Following Cursor Agents Solution
Write-Host "Fixing Bell24h Build Issues..." -ForegroundColor Green

# Stop all Node processes
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Host "Stopped all Node processes" -ForegroundColor Yellow

# Clean build directory
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Write-Host "Cleaned .next directory" -ForegroundColor Yellow

# Fix permissions
takeown /f /r /d y | Out-Null
icacls . /grant "$env:USERNAME:(OI)(CI)F" /t | Out-Null
Write-Host "Fixed permissions" -ForegroundColor Yellow

# Reinstall dependencies
npm install
Write-Host "Reinstalled dependencies" -ForegroundColor Yellow

# Build project
Write-Host "Building project..." -ForegroundColor Green
npm run build

Write-Host "Build complete!" -ForegroundColor Green
