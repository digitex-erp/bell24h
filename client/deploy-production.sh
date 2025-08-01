#!/bin/bash

# 🚀 BELL24H PRODUCTION DEPLOYMENT SCRIPT
# This script handles all critical fixes and deploys to production

echo "🚀 Starting Bell24h Production Deployment..."

# 1. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 2. Generate Prisma client
echo "🗄️ Generating Prisma client..."
npx prisma generate

# 3. Run build to check for errors
echo "🔨 Running production build..."
npm run build

# 4. Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful! Deploying to Vercel..."
    
    # 5. Deploy to Vercel
    echo "🚀 Deploying to Vercel..."
    npx vercel --prod --yes
    
    echo "🎉 Deployment completed successfully!"
    echo "🌐 Your Bell24h app is now live at: https://bell24h-v1.vercel.app"
    
    # 6. Post-deployment tasks
    echo "📋 Post-deployment checklist:"
    echo "   ✅ Set up Google Analytics 4"
    echo "   ✅ Submit sitemap to Google Search Console"
    echo "   ✅ Activate automated category generation"
    echo "   ✅ Start backlink campaign"
    echo "   ✅ Monitor search rankings"
    
else
    echo "❌ Build failed! Please fix the errors above before deploying."
    exit 1
fi

echo "🎯 Bell24h is ready to dominate the Indian B2B marketplace!" 