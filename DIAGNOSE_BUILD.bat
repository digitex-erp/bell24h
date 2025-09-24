@echo off
echo 🔍 DIAGNOSING BUILD ISSUES
echo ==========================
echo.

cd /d "%~dp0\client"

echo 📍 Current directory: %CD%
echo.

echo 🔍 Checking required files...
if exist package.json (
    echo ✅ package.json exists
) else (
    echo ❌ package.json missing
)

if exist next.config.js (
    echo ✅ next.config.js exists
) else (
    echo ❌ next.config.js missing
)

if exist src (
    echo ✅ src folder exists
) else (
    echo ❌ src folder missing
)

echo.
echo 🔍 Checking build artifacts...
if exist .next (
    echo ✅ .next folder exists
    echo 📁 Contents of .next:
    dir .next /b
    echo.
    if exist .next\static (
        echo ✅ .next\static exists
        echo 📁 Contents of .next\static:
        dir .next\static /b
    ) else (
        echo ❌ .next\static missing
    )
) else (
    echo ❌ .next folder missing
)

echo.
echo 🔍 Checking Vercel configuration...
if exist .vercel (
    echo ✅ .vercel folder exists
    echo 📁 Contents of .vercel:
    dir .vercel /b
) else (
    echo ❌ .vercel folder missing
)

echo.
echo 🔍 Checking for build errors...
if exist .next\BUILD_ERROR.txt (
    echo ❌ Build error file found:
    type .next\BUILD_ERROR.txt
) else (
    echo ✅ No build error file found
)

echo.
echo 📋 SUMMARY:
echo ===========
echo Check the output above for any ❌ marks
echo These indicate missing files that need to be fixed
echo.
pause
