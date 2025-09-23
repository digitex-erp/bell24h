@echo off
echo ========================================
echo FIXING BELL24H BUILD ERRORS
echo ========================================
echo.

echo [1/4] Installing missing dependencies...
cd client
npm install @next-auth/prisma-adapter
npm install @prisma/client
npm install prisma

echo [2/4] Installing Vercel CLI globally...
npm install -g vercel

echo [3/4] Testing build...
npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build still failing, trying alternative approach...
    npm install --legacy-peer-deps
    npm run build
)

echo [4/4] Starting development server...
npm run dev

echo.
echo ========================================
echo BUILD FIX COMPLETE!
echo ========================================
echo.
echo If build succeeded, your app is running at:
echo http://localhost:3000
echo.
echo If build failed, check the error messages above.
echo.
pause
