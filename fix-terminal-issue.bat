@echo off
echo ========================================
echo FIXING TERMINAL 'q' PREFIX ISSUE
echo ========================================

echo.
echo Checking for alias or function issues...
echo.

echo 1. Checking if 'q' is an alias...
where q 2>nul
if %errorlevel% equ 0 (
    echo WARNING: 'q' command found - this might be causing the issue
) else (
    echo OK: No 'q' command found
)

echo.
echo 2. Checking PowerShell profile...
if exist "%USERPROFILE%\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1" (
    echo WARNING: PowerShell profile exists - checking for 'q' aliases...
    findstr /i "alias.*q" "%USERPROFILE%\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1" 2>nul
    if %errorlevel% equ 0 (
        echo FOUND: 'q' aliases in PowerShell profile
    ) else (
        echo OK: No 'q' aliases found in PowerShell profile
    )
) else (
    echo OK: No PowerShell profile found
)

echo.
echo 3. Checking for Cursor-specific issues...
echo Checking if this is a Cursor AI terminal issue...

echo.
echo 4. Testing direct command execution...
echo Testing: dir
dir

echo.
echo 5. Testing: npm --version
npm --version

echo.
echo 6. Testing: node --version
node --version

echo.
echo ========================================
echo SOLUTIONS TO TRY:
echo ========================================
echo.
echo SOLUTION 1: Restart Cursor completely
echo - Close Cursor
echo - Reopen Cursor
echo - Open terminal again
echo.
echo SOLUTION 2: Use Command Prompt instead of PowerShell
echo - Press Ctrl+Shift+P
echo - Type "Terminal: Select Default Profile"
echo - Choose "Command Prompt"
echo.
echo SOLUTION 3: Clear PowerShell aliases
echo - Run: Remove-Item alias:q -Force
echo.
echo SOLUTION 4: Use full paths
echo - Instead of: npm run build
echo - Use: C:\Program Files\nodejs\npm.cmd run build
echo.
echo SOLUTION 5: Reset terminal
echo - Press Ctrl+Shift+P
echo - Type "Terminal: Kill All Terminals"
echo - Open new terminal
echo.
echo ========================================

pause
