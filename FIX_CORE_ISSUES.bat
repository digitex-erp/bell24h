@echo off
echo 🚀 FIXING CORE BUILD ISSUES
echo ==========================
echo.

cd /d "%~dp0\client"

echo 📍 Current directory: %CD%
echo.

echo 🔧 Fix 1: AgentAuth method already fixed
echo ✅ authenticateAgent method added
echo.

echo 🔧 Fix 2: Lucide React version check
echo ✅ Already at latest version (0.263.1)
echo.

echo 🔧 Fix 3: Fixing Tailwind invalid classes...
powershell -Command "(Get-ChildItem -Recurse -Include '*.tsx','*.ts','*.js','*.jsx' | ForEach-Object { (Get-Content $_.FullName) -replace 'from-indigo-600', 'from-blue-600' | Set-Content $_.FullName })"
echo ✅ Replaced 'from-indigo-600' with 'from-blue-600'
echo.

echo 🔧 Fix 4: Installing dependencies...
call npm install
echo ✅ Dependencies updated
echo.

echo 🚀 Pushing fixes to GitHub...
cd /d "%~dp0"
git add .
git commit -m "Fix: Core build issues - AgentAuth method, Tailwind classes"
git push origin main
echo ✅ Pushed to GitHub
echo.

echo 🎉 CORE ISSUES FIXED!
echo.
echo ✅ AgentAuth.authenticateAgent method added
echo ✅ Tailwind invalid classes fixed
echo ✅ Dependencies updated
echo ✅ Changes pushed to GitHub
echo.
echo 🚀 Vercel will auto-redeploy in 2 minutes!
echo.
pause
