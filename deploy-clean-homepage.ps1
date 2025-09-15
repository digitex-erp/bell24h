# Clean deployment script - only homepage files
Write-Host "🚀 Deploying clean beautiful blue homepage..." -ForegroundColor Green

# Create a clean branch for deployment
git checkout -b clean-homepage-deploy

# Add only the essential homepage files
git add app/page.tsx components/Navigation.tsx

# Commit with clean message
git commit -m "Deploy beautiful blue homepage with AI navigation"

# Push to clean branch
git push origin clean-homepage-deploy

Write-Host "✅ Clean homepage deployed to branch: clean-homepage-deploy" -ForegroundColor Green
Write-Host "🌐 You can now merge this branch in GitHub or create a pull request" -ForegroundColor Cyan
Write-Host "📊 Check: https://github.com/digitex-erp/bell24h" -ForegroundColor Blue
