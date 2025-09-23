# SIMPLE_GIT_FIX.ps1
# Simple git configuration and commit fix

Write-Host "Fixing git configuration and completing commit..." -ForegroundColor Yellow

# Step 1: Configure git identity
git config user.name "Bell24h Developer"
git config user.email "digitex.studio@gmail.com"

# Step 2: Remove embedded git repositories from staging
git rm --cached -r bell24h 2>$null
git rm --cached -r "https-github.com-digitex-erp-bell24h" 2>$null
git rm --cached -r "toolhive-studio" 2>$null

# Step 3: Pull latest changes
git pull origin main --allow-unrelated-histories --no-edit

# Step 4: Add all changes
git add .

# Step 5: Commit
git commit -m "Complete Cursor terminal bug solution with deployment automation - Add wrapper scripts to bypass Cursor terminal 'q' prefix bug - Pin Vercel project to bell24h-v1 - Create GitHub Actions CI/CD workflow - Configure Neon PostgreSQL database - Set up Razorpay live payment integration - Deploy enhanced homepage with animations - Deploy all admin pages - Create comprehensive automation scripts - Add complete documentation and deployment guides - All systems ready for deployment to www.bell24h.com"

# Step 6: Push
git push origin main

Write-Host "Git fix and commit completed!" -ForegroundColor Green
