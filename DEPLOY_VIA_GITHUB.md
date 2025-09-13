# 🚀 DEPLOY BELL24H VIA GITHUB (Alternative Method)

Since Vercel CLI is having ENOENT issues, let's deploy via GitHub instead:

## Step 1: Push to GitHub
```bash
git add .
git commit -m "Production ready build"
git push origin main
```

## Step 2: Connect to Vercel via GitHub
1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `bell24h` repository
4. Click "Import"

## Step 3: Configure Project
- **Framework Preset:** Next.js
- **Root Directory:** ./ (root)
- **Build Command:** npm run build
- **Output Directory:** .next

## Step 4: Add Environment Variables
Add these in Vercel dashboard:
```
DATABASE_URL=postgresql://username:password@host:port/database
MSG91_AUTH_KEY=468517Ak5rJ0vb7NDV68c24863P1
MSG91_SENDER_ID=BELL24H
RESEND_API_KEY=re_dGNCnq2P_9Rc29SZYvTCasdhvLCQG2Zx4
FROM_EMAIL=noreply@bell24h.com
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_nextauth_secret_here
NODE_ENV=production
```

## Step 5: Deploy
Click "Deploy" - your site will be live in 5 minutes!

---
**This method bypasses CLI issues and uses GitHub integration instead.**
