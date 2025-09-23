@echo off
echo 🤖 Setting up n8n Workflow Automation Server...
echo.

echo 📁 Step 1: Creating n8n directory...
if not exist "n8n-server" mkdir n8n-server
cd n8n-server

echo.
echo ⚙️ Step 2: Creating n8n configuration...
echo # n8n Configuration > .env
echo N8N_BASIC_AUTH_ACTIVE=true >> .env
echo N8N_BASIC_AUTH_USER=admin@bell24h.com >> .env
echo N8N_BASIC_AUTH_PASSWORD=bell24h-n8n-2024 >> .env
echo. >> .env
echo # Database >> .env
echo DB_TYPE=sqlite >> .env
echo DB_SQLITE_DATABASE=./n8n.db >> .env
echo. >> .env
echo # Webhook URL >> .env
echo WEBHOOK_URL=http://localhost:5678 >> .env
echo. >> .env
echo # API >> .env
echo N8N_API_ENABLED=true >> .env
echo N8N_API_ENDPOINT_REST=rest >> .env
echo N8N_API_ENDPOINT_WEBHOOK=webhook >> .env
echo. >> .env
echo # Bell24h Integration >> .env
echo BELL24H_API_URL=http://localhost:3000 >> .env
echo BELL24H_WEBHOOK_SECRET=bell24h-webhook-secret-2024 >> .env

echo ✅ n8n configuration created

echo.
echo 📋 Step 3: Creating n8n startup script...
echo @echo off > start-n8n.bat
echo echo Starting n8n Workflow Server... >> start-n8n.bat
echo echo. >> start-n8n.bat
echo echo 🌐 n8n will be available at: http://localhost:5678 >> start-n8n.bat
echo echo 👤 Login: admin@bell24h.com >> start-n8n.bat
echo echo 🔑 Password: bell24h-n8n-2024 >> start-n8n.bat
echo echo. >> start-n8n.bat
echo echo Press Ctrl+C to stop the server >> start-n8n.bat
echo echo. >> start-n8n.bat
echo n8n start >> start-n8n.bat

echo ✅ n8n startup script created

echo.
echo 📁 Step 4: Copying Bell24h workflows...
if not exist "workflows" mkdir workflows
copy "..\n8n\workflows\*.json" "workflows\" >nul 2>&1

echo ✅ Workflows copied

echo.
echo 🎉 n8n Setup Complete!
echo.
echo 📋 To start n8n:
echo 1. cd n8n-server
echo 2. start-n8n.bat
echo.
echo 📋 To import workflows:
echo 1. Open http://localhost:5678
echo 2. Login with admin@bell24h.com / bell24h-n8n-2024
echo 3. Import workflows from workflows/ directory
echo.
cd ..
pause
