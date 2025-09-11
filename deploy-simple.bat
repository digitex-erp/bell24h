@echo off
echo Starting deployment...
npm install
npm run build
npx vercel --prod
pause
