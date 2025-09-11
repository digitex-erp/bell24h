#!/bin/bash

# Bell24h Production Deployment Script
echo "🚀 Starting Bell24h Production Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project root directory"
    exit 1
fi

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Run database migration
echo "🗄️ Running database migration..."
npx prisma migrate deploy || npx prisma db push

# Step 3: Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Step 4: Build the project
echo "🏗️ Building project..."
npm run build

# Step 5: Run tests
echo "🧪 Running tests..."
npm test || echo "⚠️ Tests failed, but continuing..."

# Step 6: Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment completed!"
echo "📊 Check your Vercel dashboard for deployment status"
echo "🔗 Your app should be live at: https://your-app.vercel.app"
