@echo off
echo ========================================
echo RUNNING COMPLETE FIX SOLUTION
echo ========================================
echo.
echo This will fix all issues and deploy to bell24h-v1
echo.
pause

cd /d "C:\Users\Sanika\Projects\bell24h"
powershell -ExecutionPolicy Bypass -File "COMPLETE_FIX_SOLUTION.ps1"

echo.
echo ========================================
echo COMPLETE FIX SOLUTION FINISHED
echo ========================================
pause
