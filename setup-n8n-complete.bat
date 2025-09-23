@echo off
echo 🤖 BELL24H N8N WORKFLOW AUTOMATION SETUP
echo =========================================
echo.

echo 📋 Setting up n8n server with Bell24h workflows...
echo.

echo 📁 Step 1: Creating n8n server directory...
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
echo # API Configuration >> .env
echo N8N_API_ENABLED=true >> .env
echo N8N_API_ENDPOINT_REST=rest >> .env
echo N8N_API_ENDPOINT_WEBHOOK=webhook >> .env
echo. >> .env
echo # Bell24h Integration >> .env
echo BELL24H_API_URL=http://localhost:3000 >> .env
echo BELL24H_WEBHOOK_SECRET=bell24h-webhook-secret-2024 >> .env
echo. >> .env
echo # Production URLs >> .env
echo BELL24H_PRODUCTION_URL=https://www.bell24h.com >> .env
echo N8N_PRODUCTION_URL=https://n8n.bell24h.com >> .env

echo ✅ n8n configuration created

echo.
echo 📋 Step 3: Creating n8n startup scripts...
echo @echo off > start-n8n.bat
echo echo 🤖 Starting Bell24h n8n Workflow Server... >> start-n8n.bat
echo echo. >> start-n8n.bat
echo echo 🌐 n8n Dashboard: http://localhost:5678 >> start-n8n.bat
echo echo 👤 Login: admin@bell24h.com >> start-n8n.bat
echo echo 🔑 Password: bell24h-n8n-2024 >> start-n8n.bat
echo echo. >> start-n8n.bat
echo echo 📋 Available Workflows: >> start-n8n.bat
echo echo - Bell24h Integration (Main) >> start-n8n.bat
echo echo - RFQ Processing >> start-n8n.bat
echo echo - User Onboarding >> start-n8n.bat
echo echo. >> start-n8n.bat
echo echo 🔗 Webhook URL: http://localhost:5678/webhook/bell24h >> start-n8n.bat
echo echo. >> start-n8n.bat
echo echo Press Ctrl+C to stop the server >> start-n8n.bat
echo echo. >> start-n8n.bat
echo n8n start >> start-n8n.bat

echo ✅ n8n startup script created

echo.
echo 📁 Step 4: Copying Bell24h workflows...
if not exist "workflows" mkdir workflows
if exist "..\n8n\workflows\bell24h-integration.workflow.json" (
    copy "..\n8n\workflows\bell24h-integration.workflow.json" "workflows\" >nul
    echo ✅ Main integration workflow copied
)
if exist "..\n8n\workflows\rfq.workflow.json" (
    copy "..\n8n\workflows\rfq.workflow.json" "workflows\" >nul
    echo ✅ RFQ workflow copied
)
if exist "..\n8n\workflows\user.onboarding.workflow.json" (
    copy "..\n8n\workflows\user.onboarding.workflow.json" "workflows\" >nul
    echo ✅ User onboarding workflow copied
)

echo.
echo 📋 Step 5: Creating workflow import guide...
echo # Bell24h n8n Workflow Import Guide > IMPORT_WORKFLOWS.md
echo. >> IMPORT_WORKFLOWS.md
echo ## How to Import Workflows >> IMPORT_WORKFLOWS.md
echo. >> IMPORT_WORKFLOWS.md
echo 1. Start n8n server: start-n8n.bat >> IMPORT_WORKFLOWS.md
echo 2. Open http://localhost:5678 >> IMPORT_WORKFLOWS.md
echo 3. Login with admin@bell24h.com / bell24h-n8n-2024 >> IMPORT_WORKFLOWS.md
echo 4. Click "Import from File" >> IMPORT_WORKFLOWS.md
echo 5. Import each workflow from workflows/ directory >> IMPORT_WORKFLOWS.md
echo. >> IMPORT_WORKFLOWS.md
echo ## Available Workflows >> IMPORT_WORKFLOWS.md
echo. >> IMPORT_WORKFLOWS.md
echo - bell24h-integration.workflow.json (Main integration) >> IMPORT_WORKFLOWS.md
echo - rfq.workflow.json (RFQ processing) >> IMPORT_WORKFLOWS.md
echo - user.onboarding.workflow.json (User registration) >> IMPORT_WORKFLOWS.md
echo. >> IMPORT_WORKFLOWS.md
echo ## Webhook Configuration >> IMPORT_WORKFLOWS.md
echo. >> IMPORT_WORKFLOWS.md
echo Webhook URL: http://localhost:5678/webhook/bell24h >> IMPORT_WORKFLOWS.md
echo Bell24h API: http://localhost:3000 >> IMPORT_WORKFLOWS.md

echo ✅ Workflow import guide created

echo.
echo 🧪 Step 6: Creating n8n test script...
echo @echo off > test-n8n.bat
echo echo 🧪 Testing n8n Webhook Integration... >> test-n8n.bat
echo echo. >> test-n8n.bat
echo curl -X POST http://localhost:5678/webhook/bell24h ^ >> test-n8n.bat
echo   -H "Content-Type: application/json" ^ >> test-n8n.bat
echo   -d "{\"event\":\"test\",\"data\":{\"message\":\"Hello Bell24h n8n!\"}}" >> test-n8n.bat
echo echo. >> test-n8n.bat
echo echo ✅ Test webhook sent to n8n >> test-n8n.bat
echo pause >> test-n8n.bat

echo ✅ n8n test script created

cd ..

echo.
echo 🎉 N8N SETUP COMPLETE!
echo =====================
echo.
echo 📋 What's been set up:
echo ✅ n8n server directory created
echo ✅ Authentication configured (admin@bell24h.com)
echo ✅ Webhook URLs configured
echo ✅ Bell24h workflows copied
echo ✅ Startup scripts created
echo ✅ Test scripts created
echo.
echo 🚀 To start n8n:
echo 1. cd n8n-server
echo 2. start-n8n.bat
echo.
echo 🌐 Access n8n at: http://localhost:5678
echo 👤 Login: admin@bell24h.com
echo 🔑 Password: bell24h-n8n-2024
echo.
echo 📋 Next: Import workflows and test integration
echo.
pause
