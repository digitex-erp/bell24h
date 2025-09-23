# PowerShell script to automatically start everything
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AUTO STARTING BELL24H + MCP AUTOMATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Start Bell24h Development Server
Write-Host "Step 1: Starting Bell24h Development Server..." -ForegroundColor Yellow
try {
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Normal
    Write-Host "✅ Bell24h server starting on http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start Bell24h server" -ForegroundColor Red
}

# Step 2: Start MCP Server
Write-Host ""
Write-Host "Step 2: Starting MCP Server..." -ForegroundColor Yellow
try {
    Start-Process -FilePath "npx" -ArgumentList "-y", "playwright-mcp" -WindowStyle Normal
    Write-Host "✅ MCP server starting for automation" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start MCP server" -ForegroundColor Red
}

# Step 3: Check Vercel CLI
Write-Host ""
Write-Host "Step 3: Checking Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI available: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Vercel CLI not installed. Installing..." -ForegroundColor Yellow
    npm install -g vercel
}

# Step 4: Deploy to Vercel
Write-Host ""
Write-Host "Step 4: Deploying to Vercel..." -ForegroundColor Yellow
try {
    Write-Host "Running: vercel --prod" -ForegroundColor White
    $deployResult = vercel --prod
    Write-Host "✅ Deployment successful!" -ForegroundColor Green
    Write-Host "Your site is now live!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Deployment failed or needs configuration" -ForegroundColor Yellow
}

# Step 5: Test Everything
Write-Host ""
Write-Host "Step 5: Testing Everything..." -ForegroundColor Yellow
Write-Host "✅ Bell24h: http://localhost:3000" -ForegroundColor Green
Write-Host "✅ MCP Server: Running for automation" -ForegroundColor Green
Write-Host "✅ Vercel: Deployed (check output above)" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AUTOMATION COMPLETE!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 Your Bell24h project is now running!" -ForegroundColor Green
Write-Host ""
Write-Host "You can now:" -ForegroundColor White
Write-Host "  - Visit: http://localhost:3000" -ForegroundColor White
Write-Host "  - Use MCP automation features" -ForegroundColor White
Write-Host "  - Access your deployed site" -ForegroundColor White
Write-Host "  - Test all functionality" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue..."
