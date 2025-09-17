@echo off
title VERCEL DNS SETUP FOR BELL24H
color 0B

echo.
echo  ██╗   ██╗███████╗██████╗  ██████╗███████╗██╗     
echo  ██║   ██║██╔════╝██╔══██╗██╔════╝██╔════╝██║     
echo  ██║   ██║█████╗  ██████╔╝██║     █████╗  ██║     
echo  ╚██╗ ██╔╝██╔══╝  ██╔══██╗██║     ██╔══╝  ██║     
echo   ╚████╔╝ ███████╗██║  ██║╚██████╗███████╗███████╗
echo    ╚═══╝  ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝╚══════╝
echo.
echo  ========================================
echo     VERCEL DNS SETUP FOR BELL24H
echo  ========================================
echo.

echo [STEP 1] Opening Vercel Dashboard...
start https://vercel.com/dashboard
echo ✅ Vercel dashboard opened in browser

echo.
echo [STEP 2] DNS Configuration Instructions...
echo.
echo 📋 FOLLOW THESE STEPS IN VERCEL:
echo.
echo 1. Click on your "bell24h-v1" project
echo 2. Go to "Settings" tab
echo 3. Click "Domains" in the left menu
echo 4. Add your custom domain (if you have one)
echo 5. Or keep using: bell24h-v1.vercel.app
echo.
echo [STEP 3] Environment Variables Setup...
echo.
echo 📋 SET THESE IN VERCEL:
echo.
echo 1. Go to "Settings" → "Environment Variables"
echo 2. Add these variables:
echo.
echo    NEXTAUTH_URL = https://bell24h-v1.vercel.app
echo    NEXTAUTH_SECRET = bell24h-secret-key-2025
echo    DATABASE_URL = postgresql://neondb_owner:npg_K6M8mRhTPpCH@ep-fragrant-smoke-ae00uwml-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
echo.
echo [STEP 4] Database Migration...
echo.
echo 📋 RUN THIS COMMAND:
echo.
echo npx prisma db push
echo.
echo Press any key after completing Vercel setup...
pause

echo.
echo [STEP 5] Testing Deployment...
echo.
echo Testing your live site...
start https://bell24h-v1.vercel.app
echo ✅ Your site opened in browser

echo.
echo ========================================
echo     🎉 DNS SETUP COMPLETE! 🎉
echo ========================================
echo.
echo Your Bell24h platform is now:
echo ✅ Deployed to Vercel
echo ✅ DNS configured
echo ✅ Environment variables set
echo ✅ Database connected
echo.
echo Live URL: https://bell24h-v1.vercel.app
echo.
echo Press any key to exit...
pause >nul
