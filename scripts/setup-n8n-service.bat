@echo off
echo 🚀 SETTING UP N8N SERVICE FOR BELL24H
echo ======================================

echo.
echo 📦 Step 1: Installing N8N globally...
npm install -g n8n

echo.
echo 🎯 Step 2: Creating N8N configuration...
echo N8N_BASIC_AUTH_ACTIVE=true > n8n.env
echo N8N_BASIC_AUTH_USER=admin >> n8n.env
echo N8N_BASIC_AUTH_PASSWORD=Bell24h@2025! >> n8n.env
echo N8N_PORT=5678 >> n8n.env
echo N8N_HOST=localhost >> n8n.env

echo.
echo 🔧 Step 3: Starting N8N service...
echo Starting N8N on http://localhost:5678
echo Username: admin
echo Password: Bell24h@2025!
echo.
echo Press Ctrl+C to stop N8N service

start "N8N Service" cmd /k "n8n start --env-file=n8n.env"

echo.
echo ✅ N8N SERVICE SETUP COMPLETE!
echo ==============================
echo.
echo N8N Dashboard: http://localhost:5678
echo Username: admin
echo Password: Bell24h@2025!
echo.
echo Your N8N service is now running and ready for autonomous scraping!

pause
