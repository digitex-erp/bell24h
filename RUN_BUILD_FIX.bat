@echo off
title BELL24H BUILD ERROR FIX
color 0A

echo.
echo ========================================
echo   BELL24H BUILD ERROR FIX
echo ========================================
echo.
echo This will fix all build errors:
echo 1. TypeScript authenticateAgent errors
echo 2. ESLint useEffect dependency warnings  
echo 3. Remove API key files
echo 4. Clean git history
echo 5. Test build
echo 6. Deploy to Vercel
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File ".\FIX_BUILD_ERRORS.ps1"

echo.
echo ========================================
echo   BUILD FIX COMPLETE!
echo ========================================
echo.
echo Your Bell24h site should now be working!
echo.
pause
