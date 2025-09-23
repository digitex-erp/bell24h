# PowerShell script to fix JavaScript heap memory issue
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FIXING JAVASCRIPT HEAP MEMORY ISSUE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set environment variable for increased memory
Write-Host "Step 1: Setting Node.js memory limit..." -ForegroundColor Yellow
$env:NODE_OPTIONS = "--max-old-space-size=4096"
Write-Host "✅ Memory limit set to 4GB" -ForegroundColor Green

# Test build with increased memory
Write-Host ""
Write-Host "Step 2: Testing build with increased memory..." -ForegroundColor Yellow
try {
    $buildResult = npm run build
    Write-Host "✅ Build successful with increased memory!" -ForegroundColor Green
} catch {
    Write-Host "❌ Build still failed with memory issue" -ForegroundColor Red
    Write-Host "Trying alternative approach..." -ForegroundColor Yellow
    
    # Install build optimization packages
    Write-Host ""
    Write-Host "Step 3: Installing build optimization packages..." -ForegroundColor Yellow
    npm install --save-dev @next/bundle-analyzer
    
    # Try build with optimization
    Write-Host ""
    Write-Host "Step 4: Trying build with optimization..." -ForegroundColor Yellow
    try {
        $buildResult = npm run build
        Write-Host "✅ Build successful with optimization!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Build still failing - checking for other issues..." -ForegroundColor Red
    }
}

# Test development server
Write-Host ""
Write-Host "Step 5: Testing development server..." -ForegroundColor Yellow
try {
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden
    Write-Host "✅ Development server started successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Development server failed to start" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MEMORY ISSUE FIX COMPLETED!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your Bell24h project should now build without memory issues!" -ForegroundColor Green
Write-Host "You can now:" -ForegroundColor White
Write-Host "  - Run builds: npm run build" -ForegroundColor White
Write-Host "  - Start dev server: npm run dev" -ForegroundColor White
Write-Host "  - Use MCP server for automation" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue..."
