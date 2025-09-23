@echo off
echo ========================================
echo FIXING SIMPLE-SWIZZLE DEPENDENCY
echo ========================================
echo.

echo [1] Navigating to client directory...
cd /d C:\Users\Sanika\Projects\bell24h\client
echo Current directory: %CD%

echo.
echo [2] Installing missing dependency...
npm install simple-swizzle

echo.
echo [3] Installing all dependencies to ensure compatibility...
npm install

echo.
echo [4] Testing build again...
npm run build

echo.
echo ========================================
echo DEPENDENCY FIX COMPLETE
echo ========================================
pause
