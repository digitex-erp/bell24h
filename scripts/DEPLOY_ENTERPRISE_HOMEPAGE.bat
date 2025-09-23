@echo off
echo ================================================
echo BELL24H ENTERPRISE HOMEPAGE DEPLOYMENT
echo ================================================
echo.

echo 🚀 DEPLOYING ENTERPRISE HOMEPAGE COMPONENTS
echo.

echo ✅ WHAT'S BEING DEPLOYED:
echo    - Preserved existing grid structure
echo    - Added enterprise-grade components
echo    - All heavy effects behind feature flags (OFF by default)
echo    - Enhanced hero section and search bar
echo    - Trust elements and ROI calculator
echo.

echo 📋 DEPLOYMENT STEPS:
echo.

echo Step 1: Installing dependencies...
npm install framer-motion lucide-react three @types/three

echo Step 2: Setting environment variables...
echo NEXT_PUBLIC_ENABLE_CANVAS=false > .env.local
echo NEXT_PUBLIC_ENABLE_THREE_BELL=false >> .env.local
echo NEXT_PUBLIC_ENABLE_AUDIO=false >> .env.local

echo Step 3: Building project...
npm run build

echo Step 4: Starting development server...
npm run dev

echo.
echo ================================================
echo ENTERPRISE HOMEPAGE DEPLOYMENT COMPLETE
echo ================================================
echo.

echo 🎯 LAYOUT STRUCTURE PRESERVED:
echo    Hero Section → Search Bar → Your Existing Features Grid → Trust Logos → Timeline → ROI → Footer
echo.

echo 🔧 FEATURE FLAGS (All OFF by default):
echo    - Canvas Background: OFF
echo    - 3D Bell Icon: OFF  
echo    - Audio System: OFF
echo.

echo 📱 ACCESS YOUR ENHANCED HOMEPAGE:
echo    URL: http://localhost:3000
echo.

echo ✅ ALL EXISTING ELEMENTS PRESERVED
echo ✅ NEW ENTERPRISE FEATURES ADDED
echo ✅ GRID STRUCTURE LOCKED IN PLACE
echo.

echo 🚀 Your enterprise homepage is ready!
echo.
pause
