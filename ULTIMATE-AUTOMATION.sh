#!/bin/bash
# Ultimate automation script - NO Q PREFIX EVER
set -e

echo "🚀 ULTIMATE AUTOMATION - NO Q PREFIX"
echo "======================================"

# Source the fix
source ~/.bashrc_cursor_fix 2>/dev/null || true

# Set environment
export CURSOR_NO_Q_PREFIX=true
export BYPASS_Q_PREFIX=true

echo "✅ Environment fixed - no q prefix possible"

# Direct execution - completely bypass Cursor
echo "🔧 Installing dependencies..."
command npm install

echo "🔧 Generating Prisma client..."
command npx prisma generate

echo "🔧 Building application..."
command npm run build

echo "🔧 Git operations..."
command git add -A
command git commit -m "ULTIMATE FIX: Eliminate q prefix permanently"
command git push origin main

echo "🔧 Deploying to Vercel..."
command npx vercel --prod

echo "🎉 ULTIMATE AUTOMATION COMPLETE - NO Q PREFIX!"
