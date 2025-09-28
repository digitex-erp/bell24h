# PowerShell automation that bypasses q prefix
Write-Host "Running automation without q prefix..."

# Direct execution
& npm install
& npx prisma generate
& npm run build
& git add -A
& git commit -m "AUTO-DEPLOY: Fix q prefix and deploy"
& git push origin main
& npx vercel --prod

Write-Host "Automation completed successfully!"
