@echo off
echo ========================================
echo TERMINAL FUNCTIONALITY TEST
echo ========================================
echo.

echo [1] Testing basic commands...
echo Current directory:
cd

echo.
echo [2] Testing Node.js...
node --version

echo.
echo [3] Testing npm...
npm --version

echo.
echo [4] Testing directory navigation...
cd /d C:\Users\Sanika\Projects\bell24h
echo Navigated to: 
cd

echo.
echo [5] Testing file creation...
echo Test file created successfully > test_file.txt
if exist test_file.txt (
    echo ✅ File creation: WORKING
    del test_file.txt
) else (
    echo ❌ File creation: FAILED
)

echo.
echo [6] Testing PowerShell commands...
powershell -Command "Write-Host 'PowerShell test successful'"

echo.
echo ========================================
echo TERMINAL TEST COMPLETE
echo ========================================
echo.
echo If you see this message, the terminal is working!
echo.
echo Next step: Run AUTO_DEPLOY_ALL.bat
echo.
pause
