@echo off
echo 🤖 STARTING N8N WITH TUNNEL SUPPORT
echo ===================================

cd /d "C:\Users\Sanika\Projects\bell24h\client"

echo Creating N8N configuration...
echo N8N_BASIC_AUTH_ACTIVE=true > n8n.env
echo N8N_BASIC_AUTH_USER=admin >> n8n.env
echo N8N_BASIC_AUTH_PASSWORD=Bell24h@2025! >> n8n.env
echo N8N_PORT=5678 >> n8n.env
echo N8N_HOST=0.0.0.0 >> n8n.env
echo N8N_PROTOCOL=http >> n8n.env
echo N8N_TUNNEL_ENABLED=true >> n8n.env
echo N8N_LOG_LEVEL=info >> n8n.env

echo.
echo Starting N8N with tunnel support...
echo N8N will be available at: http://localhost:5678
echo Username: admin
echo Password: Bell24h@2025!

start "N8N Service" cmd /k "npx n8n start --env-file=n8n.env --tunnel"

echo.
echo ✅ N8N Service Starting...
echo Please wait for N8N to fully load before accessing the dashboard.

pause
