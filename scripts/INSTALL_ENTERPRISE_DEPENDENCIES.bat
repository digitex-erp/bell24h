@echo off
echo ================================================
echo INSTALLING ENTERPRISE HOMEPAGE DEPENDENCIES
echo ================================================
echo.

cd client

echo Installing framer-motion...
npm install framer-motion

echo Installing lucide-react...
npm install lucide-react

echo Installing three.js...
npm install three

echo Installing three.js types...
npm install @types/three

echo.
echo ================================================
echo DEPENDENCIES INSTALLATION COMPLETE
echo ================================================
echo.

echo ✅ All enterprise homepage dependencies installed successfully!
echo.

echo 📦 Installed packages:
echo    - framer-motion (animations)
echo    - lucide-react (icons)
echo    - three (3D graphics)
echo    - @types/three (TypeScript types)
echo.

echo 🚀 Ready to deploy enterprise homepage!
echo.
pause
