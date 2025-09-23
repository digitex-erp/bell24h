@echo off
echo ========================================
echo FINAL BUILD FIX FOR BELL24H
echo ========================================
echo.

echo [1/4] Navigating to client directory...
cd client

echo [2/4] Installing all required dependencies...
npm install @auth/prisma-adapter
npm install @prisma/client
npm install prisma
npm install bcryptjs
npm install next-auth
npm install @next-auth/providers

echo [3/4] Testing build...
npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed, trying with legacy peer deps...
    npm install --legacy-peer-deps
    npm run build
)

if %ERRORLEVEL% NEQ 0 (
    echo Build still failing, checking for other issues...
    echo Please check the error messages above.
    pause
    exit /b 1
)

echo [4/4] Build successful! Starting development server...
echo.
echo ========================================
echo BUILD FIX SUCCESSFUL!
echo ========================================
echo.
echo Your Bell24h app is now ready!
echo.
echo Access your app at:
echo - Main site: http://localhost:3000
echo - Negotiations: http://localhost:3000/negotiation
echo - Admin: http://localhost:3000/admin
echo.
echo Press any key to start the development server...
pause
npm run dev
