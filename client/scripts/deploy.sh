#!/bin/bash

# Bell24h Production Deployment Script
# For 1000+ concurrent users

set -e

echo "🚀 Starting Bell24h production deployment..."

# Check prerequisites
echo "📋 Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo "Node.js required"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm required"; exit 1; }

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Build application
echo "🔨 Building application..."
export NODE_ENV=production
npm run build

# Setup database
echo "🗄️ Setting up database..."
npx prisma migrate deploy
node scripts/migrate-production.js

# Start application
echo "▶️ Starting application..."
npm start

echo "✅ Deployment completed!"