@echo off
echo Fixing PowerShell Execution Policy...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
echo PowerShell execution policy updated!
echo.
echo Testing PowerShell...
powershell -Command "Get-ExecutionPolicy"
echo.
echo Now try running your deployment script again!
pause
