@echo off
:: Bell24h Application Runner for Windows
:: This script provides an easy way to run the Bell24h application on Windows

TITLE Bell24h Marketplace Application Runner

:: Text styling
set "BOLD=[1m"
set "GREEN=[92m"
set "BLUE=[94m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

:: Print header
echo %BLUE%%BOLD%Bell24h Marketplace Application Runner%NC%
echo --------------------------------------

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo %RED%Error: Node.js is not installed%NC%
    echo Please install Node.js v18 or later: https://nodejs.org/
    exit /b 1
)

:: Check Node.js version
for /f "tokens=1,2,3 delims=." %%a in ('node -v ^| find "v"') do (
    set NODE_MAJOR=%%a
    set NODE_MAJOR=!NODE_MAJOR:v=!
)

if %NODE_MAJOR% LSS 18 (
    echo %YELLOW%Warning: Node.js version below v18 detected%NC%
    echo Bell24h recommends Node.js v18 or later. You may experience issues.
    echo.
)

:: Check for .env file
if not exist .env (
    if exist .env.example (
        echo %YELLOW%Warning: No .env file found, but .env.example exists%NC%
        set /p answer="Would you like to create a .env file from .env.example? [y/N] "
        if /i "!answer!"=="y" (
            copy .env.example .env
            echo %GREEN%Created .env file from template.%NC%
            echo %YELLOW%Please edit .env file to set your environment variables.%NC%
            exit /b 0
        )
    ) else (
        echo %YELLOW%Warning: No .env or .env.example file found%NC%
        echo Environment variables may need to be set manually.
    )
)

:: Function to display menu
:show_menu
echo.
echo %BOLD%Select an option:%NC%
echo 1) Start development server
echo 2) Build for production
echo 3) Start production server
echo 4) Check database connection
echo 5) Push schema to database
echo 6) Package for deployment
echo 7) Exit
echo.
set /p selection="Enter option [1-7]: "

:: Handle menu selection
if "%selection%"=="1" (
    echo %GREEN%Starting development server...%NC%
    set NODE_ENV=development
    npx tsx server/index.ts
    goto :continue
)
if "%selection%"=="2" (
    echo %GREEN%Building for production...%NC%
    npm run build
    goto :continue
)
if "%selection%"=="3" (
    echo %GREEN%Starting production server...%NC%
    set NODE_ENV=production
    node dist/index.js
    goto :continue
)
if "%selection%"=="4" (
    echo %GREEN%Checking database connection...%NC%
    
    :: Extract database details from DATABASE_URL if .env exists
    if exist .env (
        for /f "tokens=2 delims==" %%a in ('findstr /C:"DATABASE_URL" .env') do set DATABASE_URL=%%a
    )
    
    if "%DATABASE_URL%"=="" (
        echo %RED%Error: DATABASE_URL not set%NC%
        echo Please check your .env file
        goto :continue
    )
    
    :: Simple connection test
    echo Connecting to database...
    node -e "const { Pool } = require('@neondatabase/serverless'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT NOW()').then(res => { console.log('\x1b[32mConnection successful!\x1b[0m'); console.log('Server time:', res.rows[0].now); pool.end(); }).catch(err => { console.error('\x1b[31mConnection failed:\x1b[0m', err.message); process.exit(1); });"
    goto :continue
)
if "%selection%"=="5" (
    echo %GREEN%Pushing schema to database...%NC%
    npx drizzle-kit push
    goto :continue
)
if "%selection%"=="6" (
    echo %GREEN%Packaging for deployment...%NC%
    node package-for-deployment.js
    goto :continue
)
if "%selection%"=="7" (
    echo %BLUE%Exiting. Goodbye!%NC%
    exit /b 0
)

echo %RED%Invalid option. Please try again.%NC%

:continue
echo.
echo %YELLOW%Press Enter to continue...%NC%
pause >nul
goto :show_menu