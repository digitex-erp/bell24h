@echo off
echo Starting Bell24h Fix...

cd client

echo Installing packages...
npm install @radix-ui/react-slot
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-tabs
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

echo Installing utilities...
npm install class-variance-authority
npm install clsx
npm install tailwind-merge

echo Installing forms...
npm install react-hook-form
npm install @hookform/resolvers
npm install zod

echo Building...
npm run build

echo Starting server...
npm run dev

pause
