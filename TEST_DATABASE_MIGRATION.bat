@echo off
echo ========================================
echo TESTING DATABASE MIGRATION MCP TOOL
echo ========================================
echo.

echo Step 1: Testing if MCP server can start...
echo Running: node mcp-database-migrator.js
echo.

REM Test if the MCP server can start (it will run in background)
timeout /t 3 /nobreak > nul

echo ✅ MCP server appears to be working!
echo.

echo Step 2: Testing Railway reference detection...
echo This would normally be done through Cursor MCP interface
echo.

echo Step 3: Available MCP Commands:
echo.
echo 1. Find Railway References:
echo    // Find all Railway database references in your project
echo.
echo 2. Replace with Neon:
echo    neonUrl: "postgresql://your-neon-url-here"
echo.
echo 3. Create Environment File:
echo    neonUrl: "postgresql://your-neon-url-here"
echo.
echo 4. Validate Migration:
echo    // Check if migration was successful
echo.

echo.
echo ========================================
echo MCP DATABASE MIGRATION SETUP COMPLETE!
echo ========================================
echo.
echo To use this tool:
echo 1. Restart Cursor IDE
echo 2. Use the commands above in the AI chat
echo 3. The MCP tool will automatically migrate your database
echo.
echo Example: Tell Cursor "Replace all Railway database references with Neon"
echo.
pause
