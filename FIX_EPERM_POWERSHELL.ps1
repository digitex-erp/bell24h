# PowerShell script to fix EPERM error
Write-Host "========================================"
Write-Host "FIXING EPERM BUILD ERROR"
Write-Host "========================================"

# Navigate to client directory
Set-Location "client"

# Delete .next folder completely
Write-Host "Deleting .next folder..."
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host ".next folder deleted successfully"
} else {
    Write-Host ".next folder not found"
}

# Test build
Write-Host "Testing build..."
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "========================================"
    Write-Host "BUILD SUCCESSFUL!"
    Write-Host "========================================"
    Write-Host "The EPERM error has been fixed."
    Write-Host "Your project can now build successfully."
} else {
    Write-Host "========================================"
    Write-Host "BUILD STILL FAILING"
    Write-Host "========================================"
    Write-Host "The EPERM error persists."
    Write-Host "Try running as Administrator or check file permissions."
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
