@echo off
echo 🚀 Running Bell24h Category Seeding
echo ==================================
echo.

cd client
node scripts/seed-categories-simple.js

echo.
echo ✅ Seeding completed!
echo.
pause
