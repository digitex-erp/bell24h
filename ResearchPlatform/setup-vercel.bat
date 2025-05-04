@echo off
REM === Setting up Vercel CLI ===
echo === Setting up Vercel CLI ===

REM Step 1: Check if Node.js and npm are installed
echo Checking for Node.js and npm installation...
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js and try again.
    exit /b 1
)
npm --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: npm is not installed. Please install npm and try again.
    exit /b 1
)
echo Node.js and npm are installed.

REM Step 2: Install Vercel CLI globally
echo Installing Vercel CLI globally...
npm install -g vercel >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to install Vercel CLI. Please check your npm setup.
    exit /b 1
)
echo Vercel CLI installed successfully.

REM Step 3: Update Vercel CLI globally
echo Updating Vercel CLI globally...
npm update -g vercel >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Failed to update Vercel CLI. Please check your npm setup.
    exit /b 1
)
echo Vercel CLI updated successfully.

REM Step 4: Verify installation
echo Verifying Vercel CLI installation...
vercel --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Error: Vercel CLI is not installed correctly. Please try reinstalling.
    exit /b 1
)
echo Vercel CLI version: 
vercel --version

REM Step 5: Add npm global directory to PATH (if needed)
echo Adding npm global directory to PATH (if not already added)...
setx PATH "%PATH%;C:\Users\Sanika\AppData\Roaming\npm" >nul 2>&1
echo PATH updated successfully.

REM Final message
echo Vercel CLI setup complete!
echo To deploy your project, run:
echo vercel --prod
echo If the command still fails, please restart your terminal or computer.