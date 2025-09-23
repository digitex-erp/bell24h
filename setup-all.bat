@echo off
echo 🚀 Setting up Bell24h Complete Production System...
echo.

echo 📦 Step 1: Installing Dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ npm install failed
    pause
    exit /b 1
)
echo ✅ Dependencies installed

echo.
echo 🔧 Step 2: Installing AI Dependencies...
call npm install whatwg-url node-fetch openai
if %errorlevel% neq 0 (
    echo ❌ AI dependencies installation failed
    pause
    exit /b 1
)
echo ✅ AI dependencies installed

echo.
echo 🗄️ Step 3: Generating Prisma Client...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Prisma generate failed
    pause
    exit /b 1
)
echo ✅ Prisma client generated

echo.
echo 🗄️ Step 4: Setting up Database...
call npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ Database setup failed
    pause
    exit /b 1
)
echo ✅ Database setup complete

echo.
echo 🤖 Step 5: Installing n8n...
call npm install -g n8n
if %errorlevel% neq 0 (
    echo ❌ n8n installation failed
    pause
    exit /b 1
)
echo ✅ n8n installed

echo.
echo 🧪 Step 6: Testing AI Integrations...
call node simple-ai-test.js
if %errorlevel% neq 0 (
    echo ❌ AI test failed
    pause
    exit /b 1
)
echo ✅ AI integrations tested

echo.
echo 🎉 Setup Complete!
echo.
echo 📋 Next Steps:
echo 1. Start n8n server: n8n start
echo 2. Start Bell24h app: npm run dev
echo 3. Open http://localhost:3000
echo 4. Open n8n at http://localhost:5678
echo.
pause
