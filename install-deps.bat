@echo off
echo Installing Prisma dependencies...
npm install @prisma/client prisma
echo Generating Prisma client...
npx prisma generate
echo Dependencies installed successfully!
pause
