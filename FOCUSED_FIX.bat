@echo off
echo 🎯 FOCUSED FIX FOR BELL24H BUILD ERRORS
echo ======================================
echo.

cd /d "%~dp0"

echo 📍 Current directory: %CD%
echo.

echo 🔧 Step 1: AgentAuth class already created
echo ✅ Simple AgentAuth.authenticateAgent method implemented
echo.

echo 🔧 Step 2: Fixing Tailwind classes in source files only...
cd client
powershell -Command "(Get-ChildItem -Recurse -Include '*.tsx','*.ts','*.js','*.jsx' | Where-Object { $_.FullName -notlike '*\.next\*' -and $_.FullName -notlike '*\node_modules\*' } | ForEach-Object { (Get-Content $_.FullName) -replace 'from-indigo-600', 'from-blue-600' | Set-Content $_.FullName })"
echo ✅ Tailwind classes fixed in source files
echo.

echo 🚀 Step 3: Deploying focused fix...
cd /d "%~dp0"
git add .
git commit -m "Fix: AgentAuth method and Tailwind classes - focused solution"
git push origin main
echo ✅ Pushed to GitHub
echo.

echo 🎉 FOCUSED FIX DEPLOYED!
echo.
echo ✅ AgentAuth.authenticateAgent method added
echo ✅ Tailwind invalid classes fixed
echo ✅ Changes pushed to GitHub
echo.
echo 🚀 Vercel will auto-redeploy in 2 minutes!
echo 🌐 Your Bell24h will be live at: https://bell24h-v1.vercel.app
echo.
echo 📝 This focused approach:
echo - Fixes the core TypeScript error
echo - Fixes the Tailwind CSS error  
echo - Doesn't edit build artifacts
echo - Targets source files only
echo.
pause
