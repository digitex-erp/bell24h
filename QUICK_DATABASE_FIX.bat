@echo off
echo 🚀 QUICK DATABASE FIX
echo ====================

cd client

echo 🔧 Removing old migration files...
if exist "prisma\migrations" rmdir /s /q "prisma\migrations"
if exist "prisma\migration_lock.toml" del "prisma\migration_lock.toml"

echo 🔨 Pushing schema to database...
npx prisma db push --accept-data-loss

echo ✅ Database fixed! Starting application...
npm run dev
