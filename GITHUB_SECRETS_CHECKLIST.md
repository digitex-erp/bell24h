# 🔐 **GITHUB SECRETS CHECKLIST FOR BELL24H AUTOMATION**

## **📍 WHERE TO ADD SECRETS:**
GitHub Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

---

## **✅ REQUIRED SECRETS (Must Have):**

### **🚀 Vercel Deployment:**
```
VERCEL_TOKEN
Value: [Get from Vercel Dashboard → Settings → Tokens]
Purpose: Deploy to Vercel automatically

VERCEL_PROJECT_ID  
Value: [Get from Vercel Dashboard → bell24h-v1 → Settings → General]
Purpose: Deploy to correct project

VERCEL_ORG_ID
Value: [Get from Vercel Dashboard → Settings → General] 
Purpose: Organization context (if needed)
```

### **🗄️ Database & Auth:**
```
DATABASE_URL
Value: postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
Purpose: Connect to your Neon database

NEXTAUTH_SECRET
Value: bell24h-super-secret-key-32-chars-minimum-required
Purpose: NextAuth authentication

MSG91_AUTH_KEY
Value: 468517Ak5rJ0vb7NDV68c24863P1
Purpose: Send OTP via MSG91
```

### **🧪 OTP Testing:**
```
OTP_TEST_MODE
Value: bypass
Purpose: Use test endpoints for OTP retrieval

OTP_API_URL
Value: https://staging.bell24h.com
Purpose: Base URL for test OTP endpoints

OTP_API_KEY
Value: bell24h-test-secret-key-2024
Purpose: Authorization token for test endpoints

TEST_PHONE_NUMBER
Value: +919004962871
Purpose: Phone number for OTP testing

TEST_EMAIL
Value: test@bell24h.com
Purpose: Email for OTP testing
```

---

## **🔧 OPTIONAL SECRETS (Nice to Have):**

### **☁️ Cloudflare Cache Purging:**
```
CF_API_TOKEN
Value: [Get from Cloudflare Dashboard → My Profile → API Tokens]
Purpose: Purge Cloudflare cache after deployment

CF_ZONE_ID
Value: [Get from Cloudflare Dashboard → bell24h.com → Overview]
Purpose: Identify which zone to purge
```

### **🔑 Additional API Keys:**
```
OPENAI_API_KEY
Value: [Your OpenAI API key]
Purpose: AI features testing

RAZORPAY_KEY_ID
Value: [Your Razorpay key]
Purpose: Payment testing

RAZORPAY_KEY_SECRET
Value: [Your Razorpay secret]
Purpose: Payment testing
```

---

## **📋 COPY-PASTE CHECKLIST:**

### **Step 1: Get Vercel Credentials**
- [ ] Go to https://vercel.com/dashboard
- [ ] Click on bell24h-v1 project
- [ ] Go to Settings → General
- [ ] Copy Project ID
- [ ] Go to Settings → Tokens
- [ ] Create new token with deploy permissions

### **Step 2: Add GitHub Secrets**
- [ ] Go to GitHub repo → Settings → Secrets and variables → Actions
- [ ] Add VERCEL_TOKEN
- [ ] Add VERCEL_PROJECT_ID
- [ ] Add VERCEL_ORG_ID (if needed)
- [ ] Add DATABASE_URL
- [ ] Add NEXTAUTH_SECRET
- [ ] Add MSG91_AUTH_KEY
- [ ] Add OTP_TEST_MODE = "bypass"
- [ ] Add OTP_API_URL
- [ ] Add OTP_API_KEY
- [ ] Add TEST_PHONE_NUMBER
- [ ] Add TEST_EMAIL

### **Step 3: Test the Setup**
- [ ] Commit and push the automation files
- [ ] Check GitHub Actions tab
- [ ] Verify workflow runs successfully
- [ ] Check if deployment triggers

---

## **🔍 HOW TO GET EACH VALUE:**

### **VERCEL_TOKEN:**
1. Go to https://vercel.com/dashboard
2. Click your profile → Settings
3. Go to Tokens tab
4. Click "Create Token"
5. Name: "Bell24h CI/CD"
6. Scope: Full Account
7. Copy the generated token

### **VERCEL_PROJECT_ID:**
1. Go to https://vercel.com/dashboard
2. Click on bell24h-v1 project
3. Go to Settings → General
4. Copy the "Project ID" field

### **VERCEL_ORG_ID:**
1. Go to https://vercel.com/dashboard
2. Go to Settings → General
3. Copy the "Team ID" or "User ID"

### **DATABASE_URL:**
Use your existing Neon database URL:
```
postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

---

## **⚠️ SECURITY NOTES:**

### **✅ DO:**
- Store all secrets in GitHub Secrets (never in code)
- Use different tokens for different environments
- Rotate tokens regularly
- Use least-privilege access

### **❌ DON'T:**
- Commit secrets to repository
- Share tokens in chat/email
- Use production tokens for testing
- Leave tokens in plain text files

---

## **🎯 QUICK SETUP COMMAND:**

After adding all secrets, run:
```bash
git add .
git commit -m "feat: Add CI/CD automation"
git push origin main
```

Then check GitHub Actions tab to see your automation in action! 🚀

---

## **📞 NEED HELP?**

If you get stuck:
1. Check GitHub Actions logs for specific errors
2. Verify all secrets are correctly formatted
3. Ensure Vercel project exists and is accessible
4. Test OTP endpoints manually first

**Your automation will be live in minutes!** ⚡
