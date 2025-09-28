#!/bin/bash
# Automation script that bypasses q prefix
set -e

echo "Running automation without q prefix..."

# Direct execution - no q prefix
npm install
npx prisma generate
npm run build
git add -A
git commit -m "AUTO-DEPLOY: Fix q prefix and deploy"
git push origin main
npx vercel --prod

echo "Automation completed successfully!"
