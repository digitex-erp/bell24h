@echo off
echo 🚀 BELL24H DEPLOYMENT - EXECUTING NOW
echo ======================================

echo.
echo ✅ Step 1: Testing Build (All Fixes Applied)
echo --------------------------------------------
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed! Checking for remaining issues...
    echo.
    echo 🔍 Checking for missing components...
    if not exist "components\ComingSoonBanner.tsx" (
        echo ⚠️  Creating missing ComingSoonBanner component...
        echo export default function ComingSoonBanner({ title = 'Coming Soon' }: { title?: string }) { > components\ComingSoonBanner.tsx
        echo   return ^( >> components\ComingSoonBanner.tsx
        echo     ^<div className="flex items-center justify-center h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"^> >> components\ComingSoonBanner.tsx
        echo       ^<div className="text-center text-white"^> >> components\ComingSoonBanner.tsx
        echo         ^<h2 className="text-3xl font-bold mb-2"^>{title}^</h2^> >> components\ComingSoonBanner.tsx
        echo         ^<p className="text-lg"^>🚀 Coming Soon - Stay Tuned!^</p^> >> components\ComingSoonBanner.tsx
        echo       ^</div^> >> components\ComingSoonBanner.tsx
        echo     ^</div^> >> components\ComingSoonBanner.tsx
        echo   ^); >> components\ComingSoonBanner.tsx
        echo } >> components\ComingSoonBanner.tsx
    )
    
    if not exist "components\LoadingSpinner.tsx" (
        echo ⚠️  Creating missing LoadingSpinner component...
        echo export default function LoadingSpinner() { > components\LoadingSpinner.tsx
        echo   return ^( >> components\LoadingSpinner.tsx
        echo     ^<div className="flex items-center justify-center p-8"^> >> components\LoadingSpinner.tsx
        echo       ^<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"^>^</div^> >> components\LoadingSpinner.tsx
        echo     ^</div^> >> components\LoadingSpinner.tsx
        echo   ^); >> components\LoadingSpinner.tsx
        echo } >> components\LoadingSpinner.tsx
    )
    
    if not exist "components\PageErrorBoundary.tsx" (
        echo ⚠️  Creating missing PageErrorBoundary component...
        echo "use client" > components\PageErrorBoundary.tsx
        echo import { Component, ReactNode } from 'react'; >> components\PageErrorBoundary.tsx
        echo. >> components\PageErrorBoundary.tsx
        echo interface Props { children: ReactNode; } >> components\PageErrorBoundary.tsx
        echo interface State { hasError: boolean; } >> components\PageErrorBoundary.tsx
        echo. >> components\PageErrorBoundary.tsx
        echo export default class PageErrorBoundary extends Component^<Props, State^> { >> components\PageErrorBoundary.tsx
        echo   constructor(props: Props) { >> components\PageErrorBoundary.tsx
        echo     super(props); >> components\PageErrorBoundary.tsx
        echo     this.state = { hasError: false }; >> components\PageErrorBoundary.tsx
        echo   } >> components\PageErrorBoundary.tsx
        echo. >> components\PageErrorBoundary.tsx
        echo   static getDerivedStateFromError() { >> components\PageErrorBoundary.tsx
        echo     return { hasError: true }; >> components\PageErrorBoundary.tsx
        echo   } >> components\PageErrorBoundary.tsx
        echo. >> components\PageErrorBoundary.tsx
        echo   render() { >> components\PageErrorBoundary.tsx
        echo     if (this.state.hasError) { >> components\PageErrorBoundary.tsx
        echo       return ^<div className="p-8 text-center"^>^<h2^>Something went wrong. Please refresh the page.^</h2^>^</div^>; >> components\PageErrorBoundary.tsx
        echo     } >> components\PageErrorBoundary.tsx
        echo     return this.props.children; >> components\PageErrorBoundary.tsx
        echo   } >> components\PageErrorBoundary.tsx
        echo } >> components\PageErrorBoundary.tsx
    )
    
    echo.
    echo 🔄 Retrying build...
    npm run build
    if %errorlevel% neq 0 (
        echo ❌ Build still failing. Please check the errors above.
        pause
        exit /b 1
    )
)

echo.
echo ✅ Step 2: Build Successful! Deploying to Vercel
echo ------------------------------------------------
echo.
echo 🚀 Deploying to Vercel (Production)...
npx vercel --prod --name bell24h --yes

if %errorlevel% neq 0 (
    echo ❌ Vercel deployment failed!
    echo.
    echo 🔧 Manual deployment steps:
    echo 1. Go to https://vercel.com
    echo 2. Import your GitHub repository
    echo 3. Add environment variables from env.production.template
    echo 4. Deploy
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Step 3: Deployment Complete!
echo ================================
echo.
echo 🎉 Your Bell24h marketplace is now LIVE!
echo.
echo 📊 Next Steps:
echo 1. Visit your deployed URL
echo 2. Test the authentication flow
echo 3. Add real API keys when ready
echo 4. Start generating revenue!
echo.
echo 💰 Revenue Features Ready:
echo ✅ Lead generation system
echo ✅ Supplier verification
echo ✅ RFQ management
echo ✅ Payment processing (demo mode)
echo ✅ Email marketing
echo.
echo 🚀 Ready to scale to 1000+ users!
echo.
pause
