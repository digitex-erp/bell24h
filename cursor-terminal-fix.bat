@echo off
echo ========================================
echo CURSOR TERMINAL FIX
echo ========================================

echo.
echo This script will help fix Cursor terminal issues...
echo.

echo 1. Checking Cursor version...
echo Please check your Cursor version in Help > About

echo.
echo 2. Common Cursor terminal fixes:
echo.
echo FIX 1: Restart Cursor completely
echo - Close Cursor
echo - Reopen Cursor
echo - Open new terminal
echo.
echo FIX 2: Change terminal type
echo - Press Ctrl+Shift+P
echo - Type "Terminal: Select Default Profile"
echo - Choose "Command Prompt" instead of PowerShell
echo.
echo FIX 3: Reset terminal settings
echo - Press Ctrl+Shift+P
echo - Type "Terminal: Kill All Terminals"
echo - Press Ctrl+Shift+P
echo - Type "Developer: Reload Window"
echo.
echo FIX 4: Check Cursor settings
echo - Press Ctrl+,
echo - Search for "terminal"
echo - Look for any custom terminal settings
echo.
echo FIX 5: Use external terminal
echo - Press Ctrl+Shift+P
echo - Type "Terminal: Open External Terminal"
echo - Use the external terminal instead
echo.

echo 3. Testing if this is a Cursor-specific issue...
echo Running test commands...

echo.
echo Testing: echo "Hello World"
echo "Hello World"

echo.
echo Testing: dir
dir

echo.
echo Testing: npm --version
npm --version

echo.
echo ========================================
echo IF COMMANDS STILL HAVE 'q' PREFIX:
echo ========================================
echo.
echo This is likely a Cursor AI terminal bug
echo Try these solutions in order:
echo.
echo 1. Restart Cursor completely
echo 2. Change to Command Prompt terminal
echo 3. Use external terminal
echo 4. Update Cursor to latest version
echo 5. Report bug to Cursor support
echo.

pause
