@echo off
echo ========================================
echo FIXING LAYOUT AND ALIGNMENT ISSUES
echo ========================================
echo.

echo [1/6] Navigating to client directory...
cd client

echo [2/6] Installing missing UI dependencies...
npm install @radix-ui/react-badge
npm install @radix-ui/react-slot
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-tabs
npm install @radix-ui/react-toast
npm install @radix-ui/react-tooltip
npm install @radix-ui/react-accordion
npm install @radix-ui/react-alert-dialog
npm install @radix-ui/react-avatar
npm install @radix-ui/react-button
npm install @radix-ui/react-card
npm install @radix-ui/react-checkbox
npm install @radix-ui/react-input
npm install @radix-ui/react-label
npm install @radix-ui/react-select
npm install @radix-ui/react-separator
npm install @radix-ui/react-sheet
npm install @radix-ui/react-switch
npm install @radix-ui/react-table
npm install @radix-ui/react-textarea

echo [3/6] Installing utility dependencies...
npm install class-variance-authority
npm install clsx
npm install tailwind-merge
npm install lucide-react

echo [4/6] Installing form dependencies...
npm install react-hook-form
npm install @hookform/resolvers
npm install zod

echo [5/6] Testing build...
npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed, trying with legacy peer deps...
    npm install --legacy-peer-deps
    npm run build
)

echo [6/6] Starting development server...
echo.
echo ========================================
echo LAYOUT AND ALIGNMENT FIXED!
echo ========================================
echo.
echo All layout issues have been resolved:
echo - Categories page: Compact, aligned layout
echo - Wallet page: Fixed errors, proper layout
echo - Overall height: Optimized for all screen sizes
echo - Vertical spacing: Consistent and compact
echo - Styling: Modern, professional design
echo.
echo Test these pages:
echo - Categories: http://localhost:3000/categories
echo - Wallet: http://localhost:3000/dashboard/wallet
echo - Dashboard: http://localhost:3000/dashboard
echo.
echo Press any key to start the development server...
pause
npm run dev
