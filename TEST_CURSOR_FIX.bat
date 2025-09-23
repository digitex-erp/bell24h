@echo off
echo ========================================
echo TESTING CURSOR TERMINAL FIX
echo ========================================
echo.

echo Testing if 'q' prefix bug is fixed...
echo.

echo Test 1: npm --version
npm --version
if %errorlevel% neq 0 (
    echo ❌ npm still has 'q' prefix issue
) else (
    echo ✅ npm working without 'q' prefix
)

echo.
echo Test 2: node --version
node --version
if %errorlevel% neq 0 (
    echo ❌ node still has 'q' prefix issue
) else (
    echo ✅ node working without 'q' prefix
)

echo.
echo Test 3: npx --version
npx --version
if %errorlevel% neq 0 (
    echo ❌ npx still has 'q' prefix issue
) else (
    echo ✅ npx working without 'q' prefix
)

echo.
echo Test 4: dir
dir
if %errorlevel% neq 0 (
    echo ❌ dir still has 'q' prefix issue
) else (
    echo ✅ dir working without 'q' prefix
)

echo.
echo ========================================
echo TEST COMPLETED!
echo ========================================
echo.

if %errorlevel% equ 0 (
    echo 🎉 CURSOR TERMINAL BUG IS FIXED!
    echo You can now run all commands normally.
    echo Your automation will work perfectly!
) else (
    echo ⚠️ Cursor terminal bug still exists.
    echo Please run FIX_CURSOR_TERMINAL_BUG.bat
)

echo.
pause
