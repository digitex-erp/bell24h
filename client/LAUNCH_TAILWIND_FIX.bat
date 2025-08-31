@echo off
title BELL24H TAILWIND FIX LAUNCHER
color 0B

echo ========================================
echo BELL24H TAILWIND CSS FIX LAUNCHER
echo ========================================
echo.
echo This will launch PowerShell to fix Tailwind CSS...
echo.
echo Press any key to start...
pause >nul

echo.
echo Launching PowerShell with auto-fix script...
echo.

REM Launch PowerShell with the auto-fix script
powershell.exe -ExecutionPolicy Bypass -File "%~dp0auto-fix-tailwind.ps1"

echo.
echo PowerShell script completed.
echo Press any key to close this launcher...
pause >nul
