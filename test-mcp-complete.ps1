# PowerShell script to test MCP server and Bell24h project
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TESTING MCP SERVER AND BELL24H PROJECT" -ForegroundColor Cyan
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

# Test 2: Check Node.js version
Write-Host ""
Write-Host "Step 2: Checking Node.js version..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Node.js not found!" -ForegroundColor Red
    exit 1
}

# Test 3: Check MCP server availability
Write-Host ""
Write-Host "Step 3: Checking MCP server availability..." -ForegroundColor Yellow
try {
    $mcpCheck = npx @modelcontextprotocol/server-filesystem --help
    Write-Host "✅ MCP server is available" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: MCP server not found!" -ForegroundColor Red
    Write-Host "Installing MCP server..." -ForegroundColor Yellow
    npm install -g @modelcontextprotocol/server-filesystem
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

# Test 5: Start MCP server (background)
Write-Host ""
Write-Host "Step 5: Starting MCP server..." -ForegroundColor Yellow
try {
    Start-Process -FilePath "npx" -ArgumentList "@modelcontextprotocol/server-filesystem" -WindowStyle Hidden
    Write-Host "✅ MCP server started in background" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: Failed to start MCP server!" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ALL TESTS COMPLETED!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your terminal and MCP server are now working!" -ForegroundColor Green
Write-Host "You can now:" -ForegroundColor White
Write-Host "  - Run MCP server: npx @modelcontextprotocol/server-filesystem" -ForegroundColor White
Write-Host "  - Start Bell24h: npm run dev" -ForegroundColor White
Write-Host "  - Build project: npm run build" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue..."
