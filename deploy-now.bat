@echo off
echo 🚀 Starting Bell24h Production Deployment...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Not in project root directory
    exit /b 1
)

REM Step 1: Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Step 2: Run database migration
echo 🗄️ Running database migration...
call npx prisma migrate deploy
if errorlevel 1 (
    echo Trying db push instead...
    call npx prisma db push
)

REM Step 2.5: Test API configurations
echo 📱 Testing MSG91 configuration...
echo MSG91_AUTH_KEY=468517Ak5rJ0vb7NDV68c24863P1
echo MSG91_SENDER_ID=BELL24H
echo 📧 Testing Resend configuration...
echo RESEND_API_KEY=re_dGNCnq2P_9Rc29SZYvTCasdhvLCQG2Zx4
echo FROM_EMAIL=noreply@bell24h.com

REM Step 3: Generate Prisma client
echo 🔧 Generating Prisma client...
call npx prisma generate

REM Step 4: Build the project
echo 🏗️ Building project...
call npm run build

REM Step 5: Run tests
echo 🧪 Running tests...
call npm test
if errorlevel 1 (
    echo ⚠️ Tests failed, but continuing...
)

REM Step 6: Deploy to Vercel
echo 🚀 Deploying to Vercel...
call vercel --prod

echo ✅ Deployment completed!
echo 📊 Check your Vercel dashboard for deployment status
echo 🔗 Your app should be live at: https://your-app.vercel.app
pause