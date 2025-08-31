@echo off
echo Fixing Bell24H dependencies...
echo.

echo Cleaning up corrupted files...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "package-lock.json" del "package-lock.json"
if exist "tsconfig.tsbuildinfo" del "tsconfig.tsbuildinfo"
if exist "tailwind.config.ts" del "tailwind.config.ts"

echo.
echo Installing fresh dependencies...
npm install

echo.
echo Dependencies installed successfully!
echo Now you can run: npm run build
echo.
echo Press any key to close this window...
pause >nul
