@echo off
echo 🚀 INSTALLING MCP SERVERS FOR GITHUB UNBLOCK
echo ============================================
echo.

echo 📦 Installing GitHub MCP Server...
npm install -g @modelcontextprotocol/server-github
echo.

echo 📦 Installing Puppeteer MCP Server...
npm install -g @modelcontextprotocol/server-puppeteer
echo.

echo ✅ MCP Servers Installed Successfully!
echo.
echo 🔑 Next Steps:
echo 1. Get GitHub Personal Access Token
echo 2. Add to Cursor MCP Settings
echo 3. Run GitHub unblock automation
echo.
pause
