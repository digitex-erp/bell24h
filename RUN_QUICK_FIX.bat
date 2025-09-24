@echo off
title BELL24H QUICK BUILD FIX
color 0A

echo.
echo ========================================
echo   BELL24H QUICK BUILD FIX
echo ========================================
echo.
echo This will quickly fix build errors:
echo 1. Remove API key files
echo 2. Fix authenticateAgent error
echo 3. Clean git and commit
echo 4. Test build
echo 5. Force push to GitHub
echo.
echo (No file searching - faster execution)
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File ".\QUICK_BUILD_FIX.ps1"

echo.
echo ========================================
echo   QUICK FIX COMPLETE!
echo ========================================
echo.
pause
