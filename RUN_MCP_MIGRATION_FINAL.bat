@echo off
echo 🚀 MCP DATABASE MIGRATION & BUILD FIXES
echo ========================================
echo.

cd /d "%~dp0"
echo 📍 Current directory: %CD%
echo.

echo 🔄 Step 1: Running MCP Database Migration...
node mcp-database-migrator.js
echo.

echo 🔧 Step 2: Running Build Error Fixes...
cd client
node FIX_ALL_BUILD_ERRORS.js
echo.

echo 🧪 Step 3: Testing Database Connection...
node test-neon-connection-simple.js
echo.

echo 🎉 MCP MIGRATION COMPLETE!
echo.
pause
