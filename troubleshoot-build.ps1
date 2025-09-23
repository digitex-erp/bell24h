# Troubleshooting Steps - Following Cursor Agents Solution
Write-Host "TROUBLESHOOTING BUILD ISSUES" -ForegroundColor Red

# Step 1: Check Running Processes
Write-Host "Step 1: Checking for Node processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue
Write-Host "Killing all Node processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

# Step 2: Check File Locks
Write-Host "Step 2: Checking for file locks..." -ForegroundColor Yellow
Get-Process | Where-Object {$_.Path -like "*bell24h*"}

# Step 3: Temporary Workaround
Write-Host "Step 3: Building in different location..." -ForegroundColor Yellow
$env:TMPDIR = "C:\temp\nextjs"
if (!(Test-Path "C:\temp\nextjs")) {
    New-Item -ItemType Directory -Path "C:\temp\nextjs" -Force
}
npm run build

Write-Host "Troubleshooting complete!" -ForegroundColor Green
