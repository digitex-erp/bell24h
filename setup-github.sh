#!/bin/bash
echo "🚀 Automated GitHub Setup for Bell24h"
echo "====================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Please run 'git init' first."
    exit 1
fi

echo "📦 Current repository status:"
git status --short

echo ""
echo "🔗 MANUAL STEPS REQUIRED:"
echo "1. Go to: https://github.com/new"
echo "2. Repository name: bell24h"
echo "3. Keep it Public"
echo "4. DON'T initialize with README"
echo "5. Click 'Create repository'"
echo ""
echo "📋 After creating the repository, run these commands:"
echo "git remote add origin https://github.com/YOUR_USERNAME/bell24h.git"
echo "git branch -M main"
echo "git push -u origin main"
echo ""
echo "🚀 Then go to Railway.app and connect the repository!"
