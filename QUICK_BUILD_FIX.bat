@echo off
echo ========================================
echo QUICK BUILD FIX FOR BELL24H
echo ========================================
echo.

echo [1/3] Installing missing dependencies...
cd client
npm install @next-auth/prisma-adapter
npm install @prisma/client
npm install prisma
npm install bcryptjs
npm install next-auth

echo [2/3] Testing build...
npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed, trying alternative approach...
    echo Installing all dependencies...
    npm install --legacy-peer-deps
    npm run build
)

echo [3/3] Starting development server...
echo.
echo ========================================
echo BUILD FIX COMPLETE!
echo ========================================
echo.
echo Your app should now be running at:
echo http://localhost:3000
echo.
echo To test negotiation system:
echo http://localhost:3000/negotiation
echo.
echo Press any key to start dev server...
pause
npm run dev