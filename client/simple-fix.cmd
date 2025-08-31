@echo off
title TAILWIND FIX - SIMPLE VERSION
color 0A

echo ========================================
echo SIMPLE TAILWIND CSS FIX
echo ========================================
echo.
echo This will fix Tailwind CSS corruption...
echo.
echo Press any key to start...
pause

echo.
echo Step 1: Stopping processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul
echo Done.

echo.
echo Step 2: Cleaning up files...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "package-lock.json" del "package-lock.json"
if exist "tsconfig.tsbuildinfo" del "tsconfig.tsbuildinfo"
if exist ".next" rmdir /s /q ".next"
if exist "tailwind.config.ts" del "tailwind.config.ts"
echo Done.

echo.
echo Step 3: Clearing cache...
npm cache clean --force
echo Done.

echo.
echo Step 4: Installing dependencies...
npm install

echo.
echo ========================================
echo FIX COMPLETED!
echo ========================================
echo.
echo Press any key to close...
pause >nul
