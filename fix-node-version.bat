@echo off
echo 🔧 FIXING NODE.JS VERSION FOR N8N COMPATIBILITY
echo ================================================
echo.

echo 📋 Current Node.js version check...
node --version
echo.

echo ⚠️ n8n requires Node.js >=20.19, but you have 20.11.1
echo.

echo 🔧 Solution 1: Use npx n8n (Recommended for now)
echo ================================================
echo This will work with your current Node.js version
echo.

echo 🚀 Starting n8n with npx...
echo.
echo 🌐 n8n will be available at: http://localhost:5678
echo 👤 Login: admin@bell24h.com
echo 🔑 Password: bell24h-n8n-2024
echo.
echo Press Ctrl+C to stop the server
echo.

npx n8n start

pause
