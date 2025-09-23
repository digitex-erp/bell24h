# Complete EPERM Fix - Following Cursor Agents Solution
# Run in PowerShell as Administrator

Write-Host "========================================"
Write-Host "COMPLETE EPERM FIX - CURSOR AGENTS SOLUTION"
Write-Host "========================================"

Write-Host "Step 1: Close all applications first!"
Write-Host "Close VS Code, File Explorer, any terminals, Node.js processes"
Write-Host "Press any key after closing all applications..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host "Step 2: Navigate to client directory..."
Set-Location "C:\Users\Sanika\Projects\bell24h\client"

Write-Host "Step 3: Delete .next folder completely..."
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
    Write-Host ".next folder deleted successfully"
} else {
    Write-Host ".next folder not found"
}

Write-Host "Step 4: Delete node_modules (if needed)..."
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
    Write-Host "node_modules deleted successfully"
} else {
    Write-Host "node_modules not found"
}

Write-Host "Step 5: Clear npm cache..."
npm cache clean --force

Write-Host "Step 6: Fix Permissions..."
Write-Host "Taking ownership of the folder..."
takeown /f /r /d y

Write-Host "Granting full permissions..."
icacls . /grant "%USERNAME%:(OI)(CI)F" /t

Write-Host "Step 7: Reinstall and Build..."
Write-Host "Installing dependencies..."
npm install

Write-Host "Building the project..."
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "========================================"
    Write-Host "BUILD SUCCESSFUL!"
    Write-Host "========================================"
    Write-Host "The EPERM error has been completely fixed."
    Write-Host "Your project can now build successfully."
} else {
    Write-Host "========================================"
    Write-Host "BUILD STILL FAILING"
    Write-Host "========================================"
    Write-Host "The EPERM error persists."
    Write-Host "Check the output above for details."
}

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
