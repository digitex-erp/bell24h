@echo off
echo ========================================
echo FIXING EPERM BUILD ERROR
echo ========================================

echo [1/4] Closing all applications...
echo Please close the following applications:
echo - VS Code
echo - Any text editors
echo - File Explorer windows in project folder
echo - Any terminal windows pointing to the project
echo - Any Node.js processes
echo.
echo Press any key after closing all applications...
pause

echo [2/4] Navigating to client directory...
cd client

echo [3/4] Deleting .next folder completely...
if exist .next (
    echo Deleting .next folder...
    rmdir /s /q .next
    echo .next folder deleted successfully
) else (
    echo .next folder not found
)

echo [4/4] Testing build...
npm run build

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo BUILD SUCCESSFUL!
    echo ========================================
    echo The EPERM error has been fixed.
    echo Your project can now build successfully.
) else (
    echo ========================================
    echo BUILD STILL FAILING
    echo ========================================
    echo The EPERM error persists.
    echo Try running as Administrator or check file permissions.
)

echo.
pause
