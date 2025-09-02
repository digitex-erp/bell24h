#!/bin/bash
# Railway Deployment Script for Bell24h

echo "🚀 Railway Deployment Script"
echo "============================="

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

echo "🔐 Logging into Railway..."
railway login

echo "🔗 Linking to Railway project..."
railway link

echo "🚀 Deploying to Railway..."
railway up

echo "✅ Deployment complete!"
echo "🌐 Your app should be live at: https://your-app.railway.app"
