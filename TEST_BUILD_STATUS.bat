@echo off
echo ===============================================
echo TESTING BUILD STATUS - BELL24H PROJECT
echo ===============================================
echo.

echo 1. Testing ROOT directory build (Enterprise Homepage):
cd /d "%~dp0"
echo Current directory: %CD%
echo.
echo Running: npm run build
call npm run build
echo.
echo Build exit code: %ERRORLEVEL%
echo.

if %ERRORLEVEL% EQU 0 (
    echo ✅ ROOT BUILD SUCCESSFUL
    echo.
    echo 2. Testing CLIENT directory build (Existing System):
    cd client
    echo Current directory: %CD%
    echo.
    echo Running: npm run build
    call npm run build
    echo.
    echo Client build exit code: %ERRORLEVEL%
    echo.
    
    if %ERRORLEVEL% EQU 0 (
        echo ✅ CLIENT BUILD SUCCESSFUL
        echo.
        echo ===============================================
        echo BUILD STATUS: BOTH SYSTEMS WORKING
        echo ===============================================
        echo.
        echo ROOT (Enterprise Homepage): ✅ READY
        echo CLIENT (Existing System): ✅ READY
        echo.
        echo NEXT STEPS:
        echo 1. Deploy ROOT for enterprise homepage
        echo 2. Or continue with CLIENT for existing system
        echo 3. Or merge both systems
    ) else (
        echo ❌ CLIENT BUILD FAILED
        echo.
        echo ===============================================
        echo BUILD STATUS: MIXED
        echo ===============================================
        echo.
        echo ROOT (Enterprise Homepage): ✅ READY
        echo CLIENT (Existing System): ❌ BROKEN
        echo.
        echo RECOMMENDATION: Use ROOT directory for deployment
    )
) else (
    echo ❌ ROOT BUILD FAILED
    echo.
    echo 2. Testing CLIENT directory build (Existing System):
    cd client
    echo Current directory: %CD%
    echo.
    echo Running: npm run build
    call npm run build
    echo.
    echo Client build exit code: %ERRORLEVEL%
    echo.
    
    if %ERRORLEVEL% EQU 0 (
        echo ✅ CLIENT BUILD SUCCESSFUL
        echo.
        echo ===============================================
        echo BUILD STATUS: MIXED
        echo ===============================================
        echo.
        echo ROOT (Enterprise Homepage): ❌ BROKEN
        echo CLIENT (Existing System): ✅ READY
        echo.
        echo RECOMMENDATION: Use CLIENT directory for deployment
    ) else (
        echo ❌ CLIENT BUILD FAILED
        echo.
        echo ===============================================
        echo BUILD STATUS: BOTH BROKEN
        echo ===============================================
        echo.
        echo ROOT (Enterprise Homepage): ❌ BROKEN
        echo CLIENT (Existing System): ❌ BROKEN
        echo.
        echo CRITICAL: Need to fix build errors first
    )
)

echo.
echo ===============================================
echo TEST COMPLETE
echo ===============================================
pause
