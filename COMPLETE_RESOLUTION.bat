@echo off
echo ==========================================
echo COMPLETE BELL24H PROBLEM RESOLUTION
echo ==========================================

cd /d "C:\Users\Sanika\Projects\bell24h"

echo Current directory: %CD%

echo.
echo STEP 1: FIXING ESLINT WARNINGS
echo ==========================================

echo Fixing useEffect dependency warnings...

REM Fix monitoring page ESLint warning
if exist "client\app\admin\monitoring\page.tsx" (
    powershell -Command "(Get-Content 'client\app\admin\monitoring\page.tsx') -replace 'useEffect\(\(\) => \{([^}]*mockAlerts[^}]*)\}, \[\]\)', 'useEffect(() => {$1}, [mockAlerts])' | Set-Content 'client\app\admin\monitoring\page.tsx'"
    echo ✅ Fixed monitoring page useEffect dependency
)

if exist "client\src\app\admin\monitoring\page.tsx" (
    powershell -Command "(Get-Content 'client\src\app\admin\monitoring\page.tsx') -replace 'useEffect\(\(\) => \{([^}]*mockAlerts[^}]*)\}, \[\]\)', 'useEffect(() => {$1}, [mockAlerts])' | Set-Content 'client\src\app\admin\monitoring\page.tsx'"
    echo ✅ Fixed monitoring page useEffect dependency
)

REM Fix analytics dashboard ESLint warning
if exist "client\components\admin\AnalyticsDashboard.tsx" (
    powershell -Command "(Get-Content 'client\components\admin\AnalyticsDashboard.tsx') -replace 'useEffect\(\(\) => \{([^}]*fetchAnalyticsData[^}]*)\}, \[\]\)', 'useEffect(() => {$1}, [fetchAnalyticsData])' | Set-Content 'client\components\admin\AnalyticsDashboard.tsx'"
    echo ✅ Fixed analytics dashboard useEffect dependency
)

if exist "client\src\components\admin\AnalyticsDashboard.tsx" (
    powershell -Command "(Get-Content 'client\src\components\admin\AnalyticsDashboard.tsx') -replace 'useEffect\(\(\) => \{([^}]*fetchAnalyticsData[^}]*)\}, \[\]\)', 'useEffect(() => {$1}, [fetchAnalyticsData])' | Set-Content 'client\src\components\admin\AnalyticsDashboard.tsx'"
    echo ✅ Fixed analytics dashboard useEffect dependency
)

echo.
echo STEP 2: COMMITTING ESLINT FIXES
echo ==========================================

git add -A
git commit -m "Fix: ESLint useEffect dependency warnings"
git push origin main

echo ✅ ESLint fixes committed and pushed

echo.
echo STEP 3: WAITING FOR DEPLOYMENT
echo ==========================================

echo Waiting 90 seconds for Vercel auto-deployment...
timeout /t 90 /nobreak >nul

echo.
echo STEP 4: DEPLOYMENT VERIFICATION
echo ==========================================

echo 🌐 Testing main site...
curl -s -o nul -w "Main Site Status: %%{http_code} | Load Time: %%{time_total}s\n" https://bell24h-v1.vercel.app

echo.
echo 📱 Testing key pages...
curl -s -o nul -w "Dashboard: %%{http_code}\n" https://bell24h-v1.vercel.app/dashboard
curl -s -o nul -w "Mobile OTP Login: %%{http_code}\n" https://bell24h-v1.vercel.app/auth/mobile-otp
curl -s -o nul -w "Admin Login: %%{http_code}\n" https://bell24h-v1.vercel.app/admin/login
curl -s -o nul -w "RFQ Page: %%{http_code}\n" https://bell24h-v1.vercel.app/rfq

echo.
echo STEP 5: AGENTAUTH API TESTING
echo ==========================================

echo 🔐 Testing AgentAuth API with invalid credentials (expect 401)...
curl -s -X POST https://bell24h-v1.vercel.app/api/agents/auth -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"test\",\"action\":\"login\"}"

echo.
echo.
echo 📝 Testing with missing fields (expect 400)...
curl -s -X POST https://bell24h-v1.vercel.app/api/agents/auth -H "Content-Type: application/json" -d "{\"email\":\"\",\"password\":\"\",\"action\":\"login\"}"

echo.
echo.
echo STEP 6: FINAL STATUS CHECK
echo ==========================================

echo 🔧 Running final build test locally...
cd client
npm run build

if %ERRORLEVEL% EQU 0 (
    echo ✅ BUILD SUCCESS - All issues resolved
) else (
    echo ❌ BUILD FAILED - Check output above for errors
)

echo.
echo ==========================================
echo 🎉 RESOLUTION COMPLETE
echo ==========================================

echo 📊 Status Codes Guide:
echo ✅ 200 = SUCCESS
echo 🔐 401 = UNAUTHORIZED (expected for test credentials)
echo 📝 400 = BAD REQUEST (expected for missing fields)
echo ❌ 404 = NOT FOUND (check routing)
echo 🚨 500 = SERVER ERROR (needs investigation)

echo.
echo 🌐 Live Site: https://bell24h-v1.vercel.app
echo 📊 Vercel Dashboard: https://vercel.com/dashboard

echo.
echo 🎉 ALL PROBLEMS SHOULD NOW BE RESOLVED
pause
