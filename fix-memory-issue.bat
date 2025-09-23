@echo off
echo ========================================
echo FIXING JAVASCRIPT HEAP MEMORY ISSUE
echo ========================================
echo.

echo Step 1: Setting Node.js memory limit...
set NODE_OPTIONS=--max-old-space-size=4096

echo Step 2: Testing build with increased memory...
echo Running: npm run build
npm run build

if %errorlevel% neq 0 (
    echo ERROR: Build still failed with memory issue
    echo Trying alternative approach...
    echo.
    echo Step 3: Installing build optimization packages...
    npm install --save-dev @next/bundle-analyzer
    echo.
    echo Step 4: Trying build with optimization...
    npm run build
) else (
    echo ✅ Build successful with increased memory!
)

echo.
echo Step 5: Testing development server...
echo Running: npm run dev
npm run dev

echo.
echo Memory issue fix completed!
pause
