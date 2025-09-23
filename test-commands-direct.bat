@echo off
echo ========================================
echo TESTING COMMANDS DIRECTLY
echo ========================================

echo.
echo Testing if commands work without 'q' prefix...
echo.

echo 1. Testing dir command...
dir

echo.
echo 2. Testing npm --version...
npm --version

echo.
echo 3. Testing node --version...
node --version

echo.
echo 4. Testing npm run build...
npm run build

echo.
echo 5. Testing npx prisma generate...
npx prisma generate

echo.
echo ========================================
echo RESULTS ABOVE
echo ========================================

pause
