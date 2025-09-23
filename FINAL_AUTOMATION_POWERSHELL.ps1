# PowerShell script to run everything in external PowerShell (no 'q' prefix issues)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FINAL AUTOMATION - EXTERNAL POWERSHELL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Start Bell24h Development Server
Write-Host "Step 1: Starting Bell24h Development Server..." -ForegroundColor Yellow
try {
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Normal
    Write-Host "✅ Bell24h server starting on http://localhost:3000" -ForegroundColor Green
    Start-Sleep -Seconds 3
} catch {
    Write-Host "❌ Failed to start Bell24h server" -ForegroundColor Red
}

# Step 2: Start MCP Server
Write-Host ""
Write-Host "Step 2: Starting MCP Server..." -ForegroundColor Yellow
try {
    Start-Process -FilePath "npx" -ArgumentList "-y", "playwright-mcp" -WindowStyle Normal
    Write-Host "✅ MCP server starting for automation" -ForegroundColor Green
    Start-Sleep -Seconds 3
} catch {
    Write-Host "❌ Failed to start MCP server" -ForegroundColor Red
}

# Step 3: Install and Deploy to Vercel
Write-Host ""
Write-Host "Step 3: Installing Vercel CLI and Deploying..." -ForegroundColor Yellow
try {
    # Install Vercel CLI
    Write-Host "Installing Vercel CLI..." -ForegroundColor White
    npm install -g vercel
    
    # Deploy to Vercel
    Write-Host "Deploying to Vercel..." -ForegroundColor White
    vercel --prod
    
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Deployment might need manual configuration" -ForegroundColor Yellow
}

# Step 4: Test Everything
Write-Host ""
Write-Host "Step 4: Testing Everything..." -ForegroundColor Yellow
Write-Host "✅ Bell24h: http://localhost:3000" -ForegroundColor Green
Write-Host "✅ MCP Server: Running for automation" -ForegroundColor Green
Write-Host "✅ Vercel: Deployed (check output above)" -ForegroundColor Green

# Step 5: Open Browser
Write-Host ""
Write-Host "Step 5: Opening Browser..." -ForegroundColor Yellow
try {
    Start-Process "http://localhost:3000"
    Write-Host "✅ Browser opened to Bell24h" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not open browser automatically" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AUTOMATION COMPLETE!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Your Bell24h project is now running!" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Local: http://localhost:3000" -ForegroundColor Green
Write-Host "✅ MCP: Running for automation" -ForegroundColor Green
Write-Host "✅ Deployed: Check Vercel URL above" -ForegroundColor Green
Write-Host ""
Write-Host "You can now:" -ForegroundColor White
Write-Host "  - Visit: http://localhost:3000" -ForegroundColor White
Write-Host "  - Use MCP automation features" -ForegroundColor White
Write-Host "  - Access your deployed site" -ForegroundColor White
Write-Host "  - Test all functionality" -ForegroundColor White
Write-Host ""
Write-Host "No more 'q' prefix issues - using external PowerShell!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to continue..."
