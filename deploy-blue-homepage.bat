@echo off
echo 🚀 Deploying beautiful blue homepage to bell24h.com...
echo.

echo 📁 Adding files to git...
git add app/page.tsx components/Navigation.tsx

echo 📝 Committing changes...
git commit -m "Deploy beautiful blue homepage with navigation - automatic fix"

echo 🚀 Pushing to GitHub...
git push origin main --force

echo.
echo ✅ Deployment complete!
echo 🌐 Your beautiful blue homepage will be live at bell24h.com in 2-3 minutes!
echo.
pause
