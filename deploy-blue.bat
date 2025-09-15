@echo off
echo 🚀 Bell24h Automatic Deployment Script
echo =====================================
echo.

echo 📋 Starting deployment process...
echo.

REM Step 1: Switch to main branch
echo Step 1: Switching to main branch...
git checkout main

REM Step 2: Pull latest changes
echo Step 2: Pulling latest changes...
git pull origin main --allow-unrelated-histories

REM Step 3: Create folders if they don't exist
echo Step 3: Ensuring folder structure...
if not exist "app" mkdir app
if not exist "components" mkdir components

REM Step 4: Move files to correct locations
echo Step 4: Moving files to correct locations...
if exist "page.tsx" move "page.tsx" "app\page.tsx"
if exist "Navigation.tsx" move "Navigation.tsx" "components\Navigation.tsx"

REM Step 5: Clean up misplaced files
echo Step 5: Cleaning up misplaced files...
if exist "page.tsx" del "page.tsx"
if exist "Navigation.tsx" del "Navigation.tsx"

REM Step 6: Stage changes
echo Step 6: Staging changes...
git add app/page.tsx components/Navigation.tsx

REM Step 7: Commit changes
echo Step 7: Committing changes...
git commit -m "Deploy beautiful blue homepage with navigation to production - automatic deployment"

REM Step 8: Push to GitHub
echo Step 8: Pushing to GitHub...
git push origin main

echo.
echo ✅ SUCCESS! Deployment pushed to GitHub!
echo 🌐 Vercel will auto-deploy in 2-3 minutes...
echo 🎨 Your beautiful blue homepage will be live at www.bell24h.com!
echo.
echo 📊 Check deployment status at: https://vercel.com/dashboard
echo.
pause
