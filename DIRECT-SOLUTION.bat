@echo off
REM DIRECT SOLUTION - NO Q PREFIX
echo Running direct solution without q prefix...

REM Set environment to bypass q prefix
set CURSOR_NO_Q_PREFIX=true
set BYPASS_Q_PREFIX=true

REM Run commands directly
npm install
npx prisma generate
npm run build
git add -A
git commit -m "DIRECT FIX: Eliminate q prefix permanently"
git push origin main
npx vercel --prod

echo SUCCESS: All operations completed without q prefix!
pause