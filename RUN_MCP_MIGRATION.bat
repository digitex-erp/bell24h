@echo off
echo 🚀 Running MCP Database Migration...
echo.

cd /d "%~dp0"
node mcp-database-migrator.js

echo.
echo ✅ MCP Migration Complete!
pause
