# 🔐 GitHub Secrets Setup for Bell24h Automation

## Required GitHub Secrets (Add these in GitHub → Settings → Secrets and variables → Actions)

### 🗄️ Database Secrets
```
DATABASE_URL=postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 🔑 Authentication Secrets
```
NEXTAUTH_SECRET=bell24h-production-secret-key-2024
NEXTAUTH_URL=https://www.bell24h.com
```

### 📱 OTP Testing Secrets
```
TEST_PHONE_NUMBER=+919876543210
TEST_EMAIL=test@bell24h.com
OTP_TEST_MODE=bypass
OTP_API_URL=https://bell24h-v1.vercel.app
OTP_API_KEY=test-api-key-123
```

### 🚀 Vercel Deployment Secrets
```
VERCEL_TOKEN=your_vercel_token_here
VERCEL_PROJECT_ID=your_project_id_here
VERCEL_ORG_ID=your_org_id_here
```

### ☁️ Cloudflare Secrets (Optional)
```
CF_API_TOKEN=your_cloudflare_token
CF_ZONE_ID=your_zone_id
```

## 📋 How to Add Secrets (Non-Coder Friendly)

### Step 1: Go to GitHub
1. Open your Bell24h repository in GitHub
2. Click **Settings** tab (top right)
3. Click **Secrets and variables** → **Actions**

### Step 2: Add Each Secret
1. Click **New repository secret**
2. Enter the **Name** (exactly as shown above)
3. Enter the **Value** (your actual values)
4. Click **Add secret**
5. Repeat for all secrets

### Step 3: Get Vercel Values
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Find your `bell24h-v1` project
3. Go to **Settings** → **General**
4. Copy **Project ID** → use as `VERCEL_PROJECT_ID`
5. Go to **Settings** → **Tokens**
6. Create new token → use as `VERCEL_TOKEN`

## 🧪 Test OTP Endpoint (Create this in your app)

Add this API route to enable OTP testing:

```javascript
// pages/api/test/otp.js or app/api/test/otp/route.js
export default async function handler(req, res) {
  // Only allow in test/staging environments
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  const { phone } = req.query;
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get last OTP for this phone (implement your logic)
  const otp = await getLastOtpForPhone(phone);
  
  res.json({ otp });
}
```

## ✅ Verification Checklist

- [ ] All secrets added to GitHub
- [ ] Vercel token created and added
- [ ] Test OTP endpoint created (optional)
- [ ] Repository has Actions enabled
- [ ] Main branch protection enabled

## 🚀 After Setup

1. Push code to trigger first CI run
2. Check GitHub Actions tab for results
3. Verify deployment to Vercel
4. Check live site health

Your automation is now ready! 🎉
