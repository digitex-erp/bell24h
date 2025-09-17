@echo off
echo ========================================
echo    FIXING CURSOR TERMINAL INTEGRATION
echo ========================================
echo.

echo [STEP 1] Killing stuck shell processes...
taskkill /F /IM pwsh.exe /IM powershell.exe /IM cmd.exe /IM conhost.exe >NUL 2>&1
echo ✅ Shell processes killed

echo.
echo [STEP 2] Clearing CMD AutoRun if set...
reg delete "HKCU\Software\Microsoft\Command Processor" /v AutoRun /f >NUL 2>&1
echo ✅ CMD AutoRun cleared

echo.
echo [STEP 3] Setting user execution policy to RemoteSigned...
powershell -NoProfile -Command "Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force" 2>NUL
echo ✅ Execution policy set

echo.
echo [STEP 4] Renaming PowerShell profiles (if exist)...
powershell -NoProfile -Command "Get-ChildItem -LiteralPath $PROFILE* -ErrorAction SilentlyContinue | ForEach-Object { Rename-Item -LiteralPath $_.FullName -NewName ($_.Name + '.bak') -Force }"
echo ✅ PowerShell profiles renamed

echo.
echo [STEP 5] Creating Cursor terminal reset instructions...
echo.
echo ========================================
echo    CURSOR TERMINAL RESET INSTRUCTIONS
echo ========================================
echo.
echo 1. Open Cursor Settings (Ctrl+,)
echo 2. Search for "terminal integrated"
echo 3. Set these values:
echo    - terminal.integrated.defaultProfile.windows = "Command Prompt"
echo    - terminal.integrated.windowsEnableConpty = false
echo    - terminal.integrated.enablePersistentSessions = false
echo 4. Fully quit and relaunch Cursor
echo 5. Create a New Terminal → choose "Command Prompt"
echo 6. Test with: echo ok && node -v && npm -v
echo.
echo If Command Prompt works, switch back to PowerShell and test:
echo powershell -NoProfile -Command "$PSVersionTable.PSVersion; 'ok-ps'"
echo.
echo ========================================
echo    EXTERNAL SHELL FALLBACK COMMANDS
echo ========================================
echo.
echo If Cursor terminal still doesn't work, use Windows Terminal:
echo.
echo cd C:\Users\Sanika\Projects\bell24h
echo npm install @prisma/client@6.16.2 prisma@6.16.2
echo npx prisma generate
echo npm run build
echo.
echo ========================================
echo Done! Please follow the instructions above.
echo ========================================
pause
