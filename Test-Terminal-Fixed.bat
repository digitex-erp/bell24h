@echo off
setlocal ENABLEDELAYEDEXPANSION

echo ==============================================
echo  Test-Terminal-Fixed.bat - Diagnostics and Fix
echo ==============================================
echo.

REM Determine target project directory
if "%~1"=="" (
  set "PROJECT_DIR=%CD%"
) else (
  set "PROJECT_DIR=%~1"
)
echo Project directory: "%PROJECT_DIR%"
if not exist "%PROJECT_DIR%" (
  echo [ERROR] Project directory does not exist.
  exit /b 1
)

echo.
echo [1/7] CMD diagnostic...
ver
echo ok-cmd

echo.
echo [2/7] PowerShell diagnostic (NoProfile)...
where powershell >NUL 2>&1
if errorlevel 1 (
  echo [WARN] powershell.exe not found in PATH. Skipping PowerShell checks.
) else (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Write-Output $PSVersionTable.PSVersion; Write-Output 'ok-ps'" 2>&1
)

echo.
echo [3/7] Ensure PowerShell execution policy (CurrentUser -> RemoteSigned)...
if not errorlevel 1 (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force; 'execpolicy-set'" 2>&1
)

echo.
echo [4/7] Clear CMD AutoRun if present...
reg query "HKCU\Software\Microsoft\Command Processor" /v AutoRun >NUL 2>&1
if not errorlevel 1 (
  reg delete "HKCU\Software\Microsoft\Command Processor" /v AutoRun /f >NUL 2>&1
  echo AutoRun cleared.
) else (
  echo No AutoRun set.
)

echo.
echo [5/7] Checking Node and npm...
node -v || (echo [ERROR] Node.js not found. Install Node.js and retry. & exit /b 1)
npm -v || (echo [ERROR] npm not found. Ensure Node.js installation includes npm. & exit /b 1)

echo.
echo [6/7] Preparing project...
pushd "%PROJECT_DIR%" || (echo [ERROR] Failed to enter project directory. & exit /b 1)

REM Back up package files per repo safety rules
if exist package.json (
  echo Backing up package.json to package.json.backup...
  copy /Y package.json package.json.backup >NUL 2>&1
)
if exist package-lock.json (
  echo Backing up package-lock.json to package-lock.json.backup...
  copy /Y package-lock.json package-lock.json.backup >NUL 2>&1
)

echo.
echo [7/7] Installing Prisma deps, generating client, and building...
echo Installing prisma and @prisma/client (pinned versions)...
npm install --save-exact @prisma/client@6.16.2 prisma@6.16.2 --no-fund --no-audit
if errorlevel 1 (
  echo [ERROR] npm install failed.
  popd
  exit /b 1
)

echo Running prisma generate...
npx prisma generate
if errorlevel 1 (
  echo [ERROR] prisma generate failed.
  popd
  exit /b 1
)

echo Building project...
npm run build
set BUILD_ERR=%ERRORLEVEL%

popd

if not %BUILD_ERR%==0 (
  echo [ERROR] Build failed with exit code %BUILD_ERR%.
  exit /b %BUILD_ERR%
)

echo.
echo ==============================================
echo  All steps completed successfully.
echo  If Cursor terminal remains unresponsive, use this script until fixed.
echo ==============================================
exit /b 0

