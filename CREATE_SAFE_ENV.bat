@echo off
echo ===============================================
echo CREATING SAFE ENVIRONMENT FILE
echo ===============================================
echo.

echo Creating .env.local with safe feature flags...
echo.

(
echo # Feature Flags - Disable problematic components for safe deployment
echo NEXT_PUBLIC_ENABLE_THREE_BELL=false
echo NEXT_PUBLIC_ENABLE_CANVAS=false
echo NEXT_PUBLIC_ENABLE_AUDIO=false
echo.
echo # Site Configuration
echo NEXT_PUBLIC_SITE_URL=https://bell24h.com
echo.
echo # Analytics ^(Optional - can be added later^)
echo # NEXT_PUBLIC_GA_ID=your-ga-id
echo # NEXT_PUBLIC_PLAUSIBLE_DOMAIN=bell24h.com
echo.
echo # Monitoring ^(Optional - can be added later^)
echo # SENTRY_DSN=your-sentry-dsn
) > .env.local

echo ✅ Environment file created successfully!
echo.
echo Feature flags set to SAFE MODE:
echo - ThreeBell: DISABLED
echo - Canvas: DISABLED  
echo - Audio: DISABLED
echo.
echo ===============================================
echo TESTING BUILD WITH SAFE FLAGS
echo ===============================================
echo.

npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ BUILD SUCCESSFUL IN SAFE MODE!
    echo.
    echo ===============================================
    echo READY FOR DEPLOYMENT
    echo ===============================================
    echo.
    echo Your homepage is ready to deploy without:
    echo - 3D bell animation
    echo - Canvas background
    echo - Audio features
    echo.
    echo These can be enabled later once dependencies are fixed.
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
    echo There are other issues beyond the ThreeBell component.
    echo Let's try the CLIENT directory instead...
    echo.
    echo Testing CLIENT directory...
    cd client
    npm run build
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ✅ CLIENT BUILD SUCCESSFUL!
        echo.
        echo RECOMMENDATION: Use CLIENT directory for deployment
        echo The CLIENT directory has a working build.
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
echo SAFE ENVIRONMENT SETUP COMPLETE
echo ===============================================
pause
