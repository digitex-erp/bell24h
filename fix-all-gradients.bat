@echo off
echo 🚀 FIXING ALL GRADIENTS - MATCHING REFERENCE DESIGN
echo ==================================================
echo.

echo 🔧 Replacing all gradient classes with solid colors...

echo Fixing app/rfq/new/page.tsx...
powershell -Command "(Get-Content 'app/rfq/new/page.tsx') -replace 'bg-gradient-to-r from-indigo-600 to-emerald-600', 'bg-indigo-600' -replace 'hover:from-indigo-700 hover:to-emerald-700', 'hover:bg-indigo-700' | Set-Content 'app/rfq/new/page.tsx'"

echo Fixing app/dashboard/page.tsx...
powershell -Command "(Get-Content 'app/dashboard/page.tsx') -replace 'bg-gradient-to-r from-indigo-600 to-emerald-600', 'bg-indigo-600' -replace 'hover:from-indigo-700 hover:to-emerald-700', 'hover:bg-indigo-700' -replace 'bg-gradient-to-r from-indigo-50 to-emerald-50', 'bg-indigo-50' -replace 'hover:from-indigo-100 hover:to-emerald-100', 'hover:bg-indigo-100' | Set-Content 'app/dashboard/page.tsx'"

echo Fixing app/auth/register/page.tsx...
powershell -Command "(Get-Content 'app/auth/register/page.tsx') -replace 'bg-gradient-to-r from-indigo-600 to-emerald-600', 'bg-indigo-600' -replace 'hover:from-indigo-700 hover:to-emerald-700', 'hover:bg-indigo-700' | Set-Content 'app/auth/register/page.tsx'"

echo Fixing app/auth/login/page.tsx...
powershell -Command "(Get-Content 'app/auth/login/page.tsx') -replace 'bg-gradient-to-r from-indigo-600 to-emerald-600', 'bg-indigo-600' -replace 'hover:from-indigo-700 hover:to-emerald-700', 'hover:bg-indigo-700' | Set-Content 'app/auth/login/page.tsx'"

echo.
echo 🎉 ALL GRADIENTS FIXED!
echo.
echo ✅ Replaced all gradient classes with solid indigo colors
echo ✅ Matches reference design (no gradients)
echo ✅ Ready for clean build
echo.
pause
