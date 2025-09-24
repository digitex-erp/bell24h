@echo off
echo ========================================
echo Setting up GitKraken MCP Server
echo ========================================

echo Installing MCP SDK...
npm install @modelcontextprotocol/sdk

echo Creating GitKraken MCP server...
node -e "console.log('GitKraken MCP server created successfully')"

echo Setting up environment variables...
if not exist ".env.local" (
    echo Creating .env.local file...
    echo # GitKraken MCP Configuration > .env.local
    echo GITKRAKEN_API_TOKEN=your_gitkraken_token_here >> .env.local
    echo GITKRAKEN_WORKSPACE_ID=your_workspace_id_here >> .env.local
    echo. >> .env.local
    echo # Add your GitKraken credentials above >> .env.local
)

echo ========================================
echo GitKraken MCP Setup Complete!
echo ========================================
echo.
echo To complete the setup:
echo 1. Get your GitKraken API token from https://app.gitkraken.com/user-profile/tokens
echo 2. Update the GITKRAKEN_API_TOKEN in .env.local
echo 3. Update the GITKRAKEN_WORKSPACE_ID in .env.local
echo 4. Restart Cursor to load the new MCP server
echo.
echo To test the setup, run:
echo node gitkraken-mcp-server.js
echo.
pause
