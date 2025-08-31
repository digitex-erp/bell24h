@echo off
echo ========================================
echo COMPLETE TAILWIND CSS CORRUPTION FIX
echo ========================================
echo.

echo Step 1: Closing any running processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul
echo.

echo Step 2: Cleaning up corrupted files...
if exist "node_modules" (
    echo Removing corrupted node_modules...
    rmdir /s /q "node_modules"
    echo ✅ node_modules removed
)

if exist "package-lock.json" (
    echo Removing package-lock.json...
    del "package-lock.json"
    echo ✅ package-lock.json removed
)

if exist "tsconfig.tsbuildinfo" (
    echo Removing TypeScript build info...
    del "tsconfig.tsbuildinfo"
    echo ✅ tsconfig.tsbuildinfo removed
)

if exist ".next" (
    echo Removing Next.js build cache...
    rmdir /s /q ".next"
    echo ✅ .next cache removed
)

if exist "tailwind.config.ts" (
    echo Removing conflicting Tailwind config...
    del "tailwind.config.ts"
    echo ✅ tailwind.config.ts removed
)

echo.
echo Step 3: Clearing npm cache...
npm cache clean --force
echo ✅ NPM cache cleared

echo.
echo Step 4: Installing fresh dependencies...
npm install
echo.

if %errorlevel% equ 0 (
    echo ========================================
    echo ✅ DEPENDENCIES INSTALLED SUCCESSFULLY!
    echo ========================================
    echo.
    echo Now you can:
    echo 1. Run: npm run build
    echo 2. Run: npm run dev
    echo 3. Test admin pages
    echo.
) else (
    echo ========================================
    echo ❌ DEPENDENCY INSTALLATION FAILED
    echo ========================================
    echo.
    echo Try running: npm install --legacy-peer-deps
    echo.
)

echo Press any key to close...
pause >nul
