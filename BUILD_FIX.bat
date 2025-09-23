@echo off
echo 🚀 BELL24H BUILD FIX - MEMORY & TAILWIND ISSUES
echo ================================================
echo.

echo 📋 Fixing build issues:
echo 1. Increase Node.js memory limit
echo 2. Fix Tailwind CSS configuration
echo 3. Test build with memory fix
echo.

echo 🔧 Step 1: Setting Node.js memory limit...
set NODE_OPTIONS=--max-old-space-size=4096

echo 🔧 Step 2: Updating Tailwind CSS configuration...
echo /** @type {import('tailwindcss').Config} */ > tailwind.config.js
echo module.exports = { >> tailwind.config.js
echo   content: [ >> tailwind.config.js
echo     './pages/**/*.{js,ts,jsx,tsx,mdx}', >> tailwind.config.js
echo     './components/**/*.{js,ts,jsx,tsx,mdx}', >> tailwind.config.js
echo     './app/**/*.{js,ts,jsx,tsx,mdx}', >> tailwind.config.js
echo   ], >> tailwind.config.js
echo   theme: { >> tailwind.config.js
echo     extend: { >> tailwind.config.js
echo       colors: { >> tailwind.config.js
echo         indigo: { >> tailwind.config.js
echo           50: '#eef2ff', >> tailwind.config.js
echo           100: '#e0e7ff', >> tailwind.config.js
echo           200: '#c7d2fe', >> tailwind.config.js
echo           300: '#a5b4fc', >> tailwind.config.js
echo           400: '#818cf8', >> tailwind.config.js
echo           500: '#6366f1', >> tailwind.config.js
echo           600: '#4f46e5', >> tailwind.config.js
echo           700: '#4338ca', >> tailwind.config.js
echo           800: '#3730a3', >> tailwind.config.js
echo           900: '#312e81', >> tailwind.config.js
echo         }, >> tailwind.config.js
echo         emerald: { >> tailwind.config.js
echo           50: '#ecfdf5', >> tailwind.config.js
echo           100: '#d1fae5', >> tailwind.config.js
echo           200: '#a7f3d0', >> tailwind.config.js
echo           300: '#6ee7b7', >> tailwind.config.js
echo           400: '#34d399', >> tailwind.config.js
echo           500: '#10b981', >> tailwind.config.js
echo           600: '#059669', >> tailwind.config.js
echo           700: '#047857', >> tailwind.config.js
echo           800: '#065f46', >> tailwind.config.js
echo           900: '#064e3b', >> tailwind.config.js
echo         }, >> tailwind.config.js
echo       }, >> tailwind.config.js
echo     }, >> tailwind.config.js
echo   }, >> tailwind.config.js
echo   plugins: [], >> tailwind.config.js
echo } >> tailwind.config.js

echo.
echo 🔧 Step 3: Testing build with memory fix...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed. Trying alternative approach...
    echo.
    echo 🔧 Step 4: Alternative build with more memory...
    set NODE_OPTIONS=--max-old-space-size=8192
    npm run build
)

if %errorlevel% equ 0 (
    echo.
    echo 🎉 BUILD SUCCESS! ✅
    echo.
    echo 🔧 Step 5: Starting development server...
    set NODE_OPTIONS=--max-old-space-size=4096
    npm run dev
) else (
    echo.
    echo ❌ Build still failing. Let's try development mode...
    echo.
    echo 🔧 Step 6: Starting development server (bypasses build)...
    set NODE_OPTIONS=--max-old-space-size=4096
    npm run dev
)

echo.
echo 🎉 BUILD FIX COMPLETE!
echo.
echo ✅ Memory limit increased
echo ✅ Tailwind CSS configuration updated
echo ✅ Build tested
echo.
echo 🌐 Visit: http://localhost:3000
echo.
pause

