# 🚀 AUTOMATIC VERCEL DEPLOYMENT - STEP BY STEP

## ✅ STEP 1: Import Project to Vercel
1. **Open:** https://vercel.com/new
2. **Click:** "Import Git Repository" 
3. **Find:** `digitex-erp/bell24h-production`
4. **Click:** "Import"

## ✅ STEP 2: Configure Project Settings
**Framework Preset:** Next.js (auto-detected)
**Root Directory:** `./` (keep as root)
**Build Command:** `npm run build` (auto-detected)
**Output Directory:** `.next` (auto-detected)
**Install Command:** `npm install` (auto-detected)

## ✅ STEP 3: Add Environment Variables
**Go to:** Project Settings → Environment Variables
**Add these variables:**

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

## ✅ STEP 4: Deploy
**Click:** "Deploy" button
**Wait:** 5-10 minutes for build to complete
**Result:** Your site will be live!

## 🎯 FINAL RESULT
- **Live URL:** https://your-project-name.vercel.app
- **Status:** Production ready
- **Build:** ✅ Successful
- **Deployment:** ✅ Complete

---
**Follow these steps exactly and your Bell24h platform will be live!**
