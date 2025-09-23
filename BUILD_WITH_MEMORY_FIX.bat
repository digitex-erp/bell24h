@echo off
echo ===============================================
echo BUILDING WITH MEMORY FIX
echo ===============================================
echo.

echo Fixing JavaScript heap out of memory error...
echo.

echo Setting Node.js memory limit to 4GB...
set NODE_OPTIONS=--max-old-space-size=4096

echo.
echo Running build with increased memory...
npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ BUILD SUCCESSFUL!
    echo.
    echo ===============================================
    echo READY FOR DEPLOYMENT
    echo ===============================================
    echo.
    echo Your enterprise homepage is now ready to deploy!
    echo.
    echo NEXT STEPS:
    echo 1. Deploy to Vercel/Netlify
    echo 2. Test the live site
    echo 3. Add real content
    echo.
) else (
    echo.
    echo ❌ BUILD STILL FAILING
    echo.
    echo Let's try alternative approaches...
    echo.
    echo Option 1: Try client directory
    echo Option 2: Disable problematic components
    echo.
    echo Testing CLIENT directory...
    cd client
    set NODE_OPTIONS=--max-old-space-size=4096
    npm run build
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ CLIENT BUILD SUCCESSFUL!
        echo.
        echo RECOMMENDATION: Use CLIENT directory for deployment
        echo.
    ) else (
        echo.
        echo ❌ BOTH BUILDS FAILING
        echo.
        echo Need to check dependencies and configuration.
        echo.
    )
)

echo.
echo ===============================================
echo BUILD ATTEMPT COMPLETE
echo ===============================================
pause
