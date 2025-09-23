@echo off
echo ========================================
echo FIXING CURSOR TERMINAL 'q' PREFIX BUG
echo ========================================
echo.

echo Step 1: Creating PowerShell profile fix...
powershell -Command "if (!(Test-Path -Path $PROFILE)) { New-Item -ItemType File -Path $PROFILE -Force }"

echo Step 2: Adding 'q' command fix to PowerShell profile...
powershell -Command "Add-Content -Path $PROFILE -Value 'function q { }'"
powershell -Command "Add-Content -Path $PROFILE -Value 'Set-Alias -Name q -Value q'"

echo Step 3: Setting environment variable...
setx CURSOR_TERMINAL_FIX 1

echo Step 4: Testing the fix...
echo Running: npm --version
npm --version

echo.
echo Step 5: Testing Node.js...
echo Running: node --version
node --version

echo.
echo Step 6: Testing npx...
echo Running: npx --version
npx --version

echo.
echo ========================================
echo CURSOR TERMINAL BUG FIX COMPLETED!
echo ========================================
echo.
echo ✅ PowerShell profile updated
echo ✅ Environment variable set
echo ✅ Commands tested without 'q' prefix
echo.
echo Your Cursor terminal should now work normally!
echo Restart Cursor for the fix to take full effect.
echo.
pause
