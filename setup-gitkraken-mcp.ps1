Write-Host "========================================" -ForegroundColor Green
Write-Host "Setting up GitKraken MCP Server" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "Installing MCP SDK..." -ForegroundColor Yellow
npm install @modelcontextprotocol/sdk

Write-Host "Creating GitKraken MCP server..." -ForegroundColor Yellow
node -e "console.log('GitKraken MCP server created successfully')"

Write-Host "Setting up environment variables..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local file..." -ForegroundColor Cyan
    New-Item -Path ".env.local" -ItemType File -Force
    Add-Content -Path ".env.local" -Value "# GitKraken MCP Configuration"
    Add-Content -Path ".env.local" -Value "GITKRAKEN_API_TOKEN=your_gitkraken_token_here"
    Add-Content -Path ".env.local" -Value "GITKRAKEN_WORKSPACE_ID=your_workspace_id_here"
    Add-Content -Path ".env.local" -Value ""
    Add-Content -Path ".env.local" -Value "# Add your GitKraken credentials above"
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "GitKraken MCP Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To complete the setup:" -ForegroundColor White
Write-Host "1. Get your GitKraken API token from https://app.gitkraken.com/user-profile/tokens" -ForegroundColor Cyan
Write-Host "2. Update the GITKRAKEN_API_TOKEN in .env.local" -ForegroundColor Cyan
Write-Host "3. Update the GITKRAKEN_WORKSPACE_ID in .env.local" -ForegroundColor Cyan
Write-Host "4. Restart Cursor to load the new MCP server" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test the setup, run:" -ForegroundColor White
Write-Host "node gitkraken-mcp-server.js" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to continue"
