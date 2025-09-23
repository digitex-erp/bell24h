@echo off
echo ========================================
echo COMPLETE EPERM FIX - CURSOR AGENTS SOLUTION
echo ========================================

echo Step 1: Close all applications first!
echo Close VS Code, File Explorer, any terminals, Node.js processes
echo Press any key after closing all applications...
pause

echo Step 2: Navigate to client directory...
cd client

echo Step 3: Delete .next folder completely...
if exist .next (
    echo Deleting .next folder...
    rmdir /s /q .next
    echo .next folder deleted successfully
) else (
    echo .next folder not found
)

echo Step 4: Delete node_modules (if needed)...
if exist node_modules (
    echo Deleting node_modules...
    rmdir /s /q node_modules
    echo node_modules deleted successfully
) else (
    echo node_modules not found
)

echo Step 5: Clear npm cache...
npm cache clean --force

echo Step 6: Fix Permissions...
echo Taking ownership of the folder...
takeown /f /r /d y

echo Granting full permissions...
icacls . /grant "%USERNAME%:(OI)(CI)F" /t

echo Step 7: Reinstall and Build...
echo Installing dependencies...
npm install

echo Building the project...
npm run build

if %ERRORLEVEL% EQU 0 (
    echo ========================================
    echo BUILD SUCCESSFUL!
    echo ========================================
    echo The EPERM error has been completely fixed.
    echo Your project can now build successfully.
) else (
    echo ========================================
    echo BUILD STILL FAILING
    echo ========================================
    echo The EPERM error persists.
    echo Check the output above for details.
)

echo.
pause
