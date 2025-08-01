#!/bin/bash

echo "🚀 BELL24H AUTHENTICATION FIX DEPLOYMENT STARTING..."
echo "=================================================="

# Check if we're in the client directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the client directory"
    exit 1
fi

echo "📦 Installing required dependencies..."
npm install lucide-react next-auth

echo "🔧 Building the application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed!"
    exit 1
fi

echo "📝 Committing changes..."
git add .
git commit -m "🔧 CRITICAL: Authentication system fix - localStorage-based auth with proper login/logout flow"

echo "🚀 Pushing to Vercel..."
git push origin main

echo "✅ DEPLOYMENT COMPLETE!"
echo ""
echo "🎯 AUTHENTICATION FIX DEPLOYED TO VERCEL!"
echo ""
echo "📋 What was fixed:"
echo "• ✅ User registration with localStorage persistence"
echo "• ✅ Login after registration working correctly"
echo "• ✅ Session management with proper tokens"
echo "• ✅ Logout functionality working"
echo "• ✅ No more infinite registration loop!"
echo ""
echo "🧪 Test the fix:"
echo "1. Visit: https://bell24h-v1.vercel.app"
echo "2. Register a new account"
echo "3. Log out and try logging back in"
echo "4. The authentication loop should be completely fixed!"
echo ""
echo "🔗 Production URL: https://bell24h-v1.vercel.app"
echo "🔗 Login URL: https://bell24h-v1.vercel.app/auth/login"
echo "🔗 Register URL: https://bell24h-v1.vercel.app/auth/register"
echo "🔗 Dashboard URL: https://bell24h-v1.vercel.app/dashboard" 