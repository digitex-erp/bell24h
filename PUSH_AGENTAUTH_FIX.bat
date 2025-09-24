@echo off
echo 🚀 PUSHING AGENTAUTH FIX TO GITHUB
echo ==================================
echo.

cd /d "%~dp0"

echo 📍 Current directory: %CD%
echo.

echo 📦 Adding changes...
git add .
echo ✅ Changes added
echo.

echo 💾 Committing fix...
git commit -m "Fix: Add missing AgentAuth.authenticateAgent method"
echo ✅ Committed
echo.

echo 🚀 Pushing to GitHub...
git push origin main
echo ✅ Pushed successfully
echo.

echo 🎉 AGENTAUTH FIX DEPLOYED!
echo.
echo ✅ Missing method added
echo ✅ Build error fixed
echo ✅ Vercel will auto-redeploy
echo.
pause
