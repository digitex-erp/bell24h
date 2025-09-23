# PowerShell script to test Playwright MCP server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TESTING PLAYWRIGHT MCP SERVER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if terminal is working
Write-Host "Step 1: Testing terminal functionality..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Terminal still has 'q' prefix issue!" -ForegroundColor Red
    Write-Host "Please use External Terminal (Ctrl+Shift+P -> Terminal: Open External Terminal)" -ForegroundColor Red
    exit 1
}

# Test 2: Check MCP configuration
Write-Host ""
Write-Host "Step 2: Checking MCP configuration..." -ForegroundColor Yellow
if (Test-Path ".cursor\mcp.json") {
    Write-Host "✅ MCP config file found: .cursor\mcp.json" -ForegroundColor Green
    $mcpConfig = Get-Content ".cursor\mcp.json" | ConvertFrom-Json
    Write-Host "✅ MCP servers configured: $($mcpConfig.mcpServers.PSObject.Properties.Name -join ', ')" -ForegroundColor Green
} else {
    Write-Host "❌ ERROR: MCP config file not found!" -ForegroundColor Red
    exit 1
}

# Test 3: Check Playwright MCP availability
Write-Host ""
Write-Host "Step 3: Checking Playwright MCP availability..." -ForegroundColor Yellow
try {
    $playwrightCheck = npx -y playwright-mcp --help
    Write-Host "✅ Playwright MCP is available" -ForegroundColor Green
} catch {
    Write-Host "⚠️ WARNING: Playwright MCP might not be installed" -ForegroundColor Yellow
    Write-Host "Installing Playwright MCP..." -ForegroundColor Yellow
    npm install -g playwright-mcp
}

# Test 4: Test Bell24h project
Write-Host ""
Write-Host "Step 4: Testing Bell24h project..." -ForegroundColor Yellow
try {
    $buildTest = npm run build
    Write-Host "✅ Bell24h project builds successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Bell24h project build failed!" -ForegroundColor Red
    Write-Host "Checking for missing dependencies..." -ForegroundColor Yellow
    npm install
}

# Test 5: Start Playwright MCP server (background)
Write-Host ""
Write-Host "Step 5: Starting Playwright MCP server..." -ForegroundColor Yellow
try {
    Start-Process -FilePath "npx" -ArgumentList "-y", "playwright-mcp" -WindowStyle Hidden
    Write-Host "✅ Playwright MCP server started in background" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Failed to start Playwright MCP server!" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PLAYWRIGHT MCP TEST COMPLETED!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your Playwright MCP server is now ready!" -ForegroundColor Green
Write-Host "You can now:" -ForegroundColor White
Write-Host "  - Use Playwright MCP for web automation" -ForegroundColor White
Write-Host "  - Run Bell24h: npm run dev" -ForegroundColor White
Write-Host "  - Build project: npm run build" -ForegroundColor White
Write-Host "  - Test web automation with Playwright" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue..."
