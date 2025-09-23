@echo off
echo ========================================
echo QUICK FIX FOR BELL24H
echo ========================================

echo [1/4] Navigating to client directory...
cd client

echo [2/4] Installing correct Radix UI packages...
npm install @radix-ui/react-slot
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-tabs
npm install class-variance-authority
npm install clsx
npm install tailwind-merge

echo [3/4] Installing additional UI components...
npm install @radix-ui/react-toast
npm install @radix-ui/react-tooltip
npm install @radix-ui/react-accordion
npm install @radix-ui/react-alert-dialog
npm install @radix-ui/react-avatar
npm install @radix-ui/react-checkbox
npm install @radix-ui/react-input
npm install @radix-ui/react-label
npm install @radix-ui/react-select
npm install @radix-ui/react-separator
npm install @radix-ui/react-sheet
npm install @radix-ui/react-switch
npm install @radix-ui/react-table
npm install @radix-ui/react-textarea

echo [4/4] Building and starting...
npm run build
npm run dev

echo ========================================
echo FIX COMPLETE!
echo ========================================
pause
