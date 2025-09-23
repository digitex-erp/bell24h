@echo off
echo.
echo ================================================================
echo 🔧 INSTALLING SUPPLIER PROFILE DEPENDENCIES
echo ================================================================
echo.

echo 📋 Installing image processing dependencies...
cd /d "C:\Users\Sanika\Projects\bell24h\client"

echo Installing Sharp for image optimization...
npm install sharp

echo Installing Multer for file uploads...
npm install multer @types/multer

echo ✅ Dependencies installed successfully!
echo.

echo 🔧 Testing build system...
npm run build

echo.
echo ✅ Build test completed!
echo.

echo 🌐 Starting development server...
npm run dev

echo.
echo ✅ Development server started!
echo.
echo Access Points:
echo - Bell24h: http://localhost:3000
echo - Supplier Profiles: http://localhost:3000/suppliers
echo - Image Upload API: http://localhost:3000/api/upload/supplier-image
echo.
pause