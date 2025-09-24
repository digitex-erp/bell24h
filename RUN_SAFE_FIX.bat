@echo off
title BELL24H SAFE BUILD FIX
color 0A

echo.
echo ========================================
echo   BELL24H SAFE BUILD FIX
echo ========================================
echo.
echo SAFE APPROACH - No nuclear options!
echo.
echo This will:
echo 1. Fix PostCSS build error (SAFE)
echo 2. Try gentle git cleanup first (SAFE)
echo 3. Use GitHub's unblock link if needed (SAFE)
echo.
echo NO git history destruction!
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File ".\SAFE_BUILD_FIX.ps1"

echo.
echo ========================================
echo   SAFE FIX COMPLETE!
echo ========================================
echo.
echo Git history preserved - no nuclear options used!
echo.
pause
