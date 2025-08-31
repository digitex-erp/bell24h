@echo off
title COMPLETE TAILWIND CSS CORRUPTION FIX - PERSISTENT VERSION
color 0A

echo ========================================
echo COMPLETE TAILWIND CSS CORRUPTION FIX
echo ========================================
echo.
echo This script will NOT close automatically!
echo Press any key to continue with each step...
echo.
pause

echo.
echo ========================================
echo STEP 1: CLOSING RUNNING PROCESSES
echo ========================================
echo.
echo Stopping any running Node.js processes...
taskkill /f /im node.exe 2>nul
if %errorlevel% equ 0 (
    echo ✅ Node.js processes stopped
) else (
    echo ℹ️ No Node.js processes found
)

echo Stopping any running npm processes...
taskkill /f /im npm.exe 2>nul
if %errorlevel% equ 0 (
    echo ✅ npm processes stopped
) else (
    echo ℹ️ No npm processes found
)

echo.
echo Step 1 completed! Press any key to continue...
pause

echo.
echo ========================================
echo STEP 2: CLEANING UP CORRUPTED FILES
echo ========================================
echo.

if exist "node_modules" (
    echo Removing corrupted node_modules...
    rmdir /s /q "node_modules"
    if exist "node_modules" (
        echo ❌ Failed to remove node_modules
    ) else (
        echo ✅ node_modules removed successfully
    )
) else (
    echo ℹ️ node_modules folder not found
)

if exist "package-lock.json" (
    echo Removing package-lock.json...
    del "package-lock.json"
    if exist "package-lock.json" (
        echo ❌ Failed to remove package-lock.json
    ) else (
        echo ✅ package-lock.json removed successfully
    )
) else (
    echo ℹ️ package-lock.json not found
)

if exist "tsconfig.tsbuildinfo" (
    echo Removing TypeScript build info...
    del "tsconfig.tsbuildinfo"
    if exist "tsconfig.tsbuildinfo" (
        echo ❌ Failed to remove tsconfig.tsbuildinfo
    ) else (
        echo ✅ tsconfig.tsbuildinfo removed successfully
    )
) else (
    echo ℹ️ tsconfig.tsbuildinfo not found
)

if exist ".next" (
    echo Removing Next.js build cache...
    rmdir /s /q ".next"
    if exist ".next" (
        echo ❌ Failed to remove .next cache
    ) else (
        echo ✅ .next cache removed successfully
    )
) else (
    echo ℹ️ .next cache not found
)

if exist "tailwind.config.ts" (
    echo Removing conflicting Tailwind config...
    del "tailwind.config.ts"
    if exist "tailwind.config.ts" (
        echo ❌ Failed to remove tailwind.config.ts
    ) else (
        echo ✅ tailwind.config.ts removed successfully
    )
) else (
    echo ℹ️ tailwind.config.ts not found
)

echo.
echo Step 2 completed! Press any key to continue...
pause

echo.
echo ========================================
echo STEP 3: CLEARING NPM CACHE
echo ========================================
echo.
echo Clearing npm cache (this may take a moment)...
npm cache clean --force
if %errorlevel% equ 0 (
    echo ✅ NPM cache cleared successfully
) else (
    echo ❌ Failed to clear NPM cache
)

echo.
echo Step 3 completed! Press any key to continue...
pause

echo.
echo ========================================
echo STEP 4: INSTALLING FRESH DEPENDENCIES
echo ========================================
echo.
echo Installing fresh dependencies (this will take several minutes)...
echo Please wait and DO NOT close this window...
echo.

npm install

echo.
if %errorlevel% equ 0 (
    echo ========================================
    echo ✅ DEPENDENCIES INSTALLED SUCCESSFULLY!
    echo ========================================
    echo.
    echo 🎉 Tailwind CSS corruption has been fixed!
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

echo ========================================
echo SCRIPT COMPLETED!
echo ========================================
echo.
echo This window will stay open so you can see the results.
echo.
echo Press any key to close this window when you're ready...
pause >nul
