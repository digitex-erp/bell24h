@echo off
echo ========================================
echo DEPLOYING NEW HOMEPAGE TO REPLACE OLD
echo ========================================
echo.

echo Current Status:
echo ❌ OLD VERSION: https://www.bell24h.com/auth/login (login page)
echo ✅ NEW VERSION: Enhanced homepage with modern UI (local)
echo.

echo Step 1: Building new homepage with enhancements...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)
echo ✅ New homepage built successfully

echo.
echo Step 2: Deploying to existing Vercel project...
echo This will replace the OLD login page with NEW homepage
vercel --prod
if %errorlevel% neq 0 (
    echo ❌ Deployment failed
    pause
    exit /b 1
)
echo ✅ New homepage deployed successfully!

echo.
echo Step 3: Deployment Summary...
echo ✅ NEW HOMEPAGE: https://www.bell24h.com (updated)
echo ✅ OLD LOGIN PAGE: Replaced with new homepage
echo ✅ MODERN UI: Glass morphism, animations, gradients
echo ✅ ENHANCED HERO: Better styling and interactions

echo.
echo ========================================
echo NEW HOMEPAGE DEPLOYED SUCCESSFULLY!
echo ========================================
echo.
echo 🎉 Your new enhanced homepage is now live!
echo.
echo Visit: https://www.bell24h.com
echo You should now see the NEW homepage instead of the OLD login page!
echo.
pause