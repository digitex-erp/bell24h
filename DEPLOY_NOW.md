# 🚀 Deploy InsForge Integration to Production Server

## Quick Deployment (Choose Option 1 or 2)

---

### **Option 1: One-Line Deployment (Recommended)**

Copy and paste this **single command** into your terminal (PowerShell, CMD, or WSL):

```bash
ssh root@165.232.187.195 "cd /var/www/bell24h && git fetch origin && git checkout claude/document-project-architecture-QHk0Z && git pull origin claude/document-project-architecture-QHk0Z && npm install && npm run build && pm2 restart bell24h --update-env && sleep 5 && pm2 logs bell24h --lines 30"
```

**What this does:**
1. ✅ Connects to production server
2. ✅ Switches to feature branch with InsForge integration
3. ✅ Pulls latest code from Git
4. ✅ Installs dependencies (@supabase/supabase-js)
5. ✅ Builds production bundle
6. ✅ Restarts PM2 with new code
7. ✅ Shows logs to verify deployment

**Expected time:** 2-3 minutes

---

### **Option 2: Step-by-Step Deployment**

If you prefer to see each step, run these commands one by one:

#### 1. SSH into the server
```bash
ssh root@165.232.187.195
```

#### 2. Navigate to app directory
```bash
cd /var/www/bell24h
```

#### 3. Stop the application
```bash
pm2 stop bell24h
```

#### 4. Pull latest code
```bash
git fetch origin
git checkout claude/document-project-architecture-QHk0Z
git pull origin claude/document-project-architecture-QHk0Z
```

#### 5. Install dependencies
```bash
npm install
```

#### 6. Clear build cache
```bash
rm -rf .next/cache
```

#### 7. Build production bundle
```bash
npm run build
```

#### 8. Restart application
```bash
pm2 restart bell24h --update-env
```

#### 9. Check logs
```bash
pm2 logs bell24h --lines 30
```

#### 10. Verify deployment
```bash
curl http://localhost:3000/api/dashboard/stats
```

You should see JSON response (not HTML 404)

---

### **Option 3: Using the Deployment Script**

#### 1. Copy script to server
```bash
scp deploy-on-server.sh root@165.232.187.195:/var/www/bell24h/
```

#### 2. SSH into server
```bash
ssh root@165.232.187.195
```

#### 3. Run the script
```bash
cd /var/www/bell24h
chmod +x deploy-on-server.sh
./deploy-on-server.sh
```

---

## ✅ Verify Deployment Succeeded

After deployment, test these endpoints from your local machine:

### Test 1: Homepage (should return 200)
```bash
curl -I http://165.232.187.195/
```
Expected: `HTTP/1.1 200 OK`

### Test 2: Dashboard Stats API (should return JSON)
```bash
curl http://165.232.187.195/api/dashboard/stats
```
Expected: `{"success":false,"error":"Unauthorized"}` or similar JSON (not HTML 404)

### Test 3: Check server logs
```bash
ssh root@165.232.187.195 "pm2 logs bell24h --lines 30 --nostream"
```
Expected: No "Server Action" errors, no import errors for `lib/insforge`

---

## 🐛 Troubleshooting

### If you see "Failed to find Server Action" errors:
```bash
ssh root@165.232.187.195 "cd /var/www/bell24h && rm -rf .next && npm run build && pm2 restart bell24h"
```

### If API still returns 404:
Check that the new files exist on server:
```bash
ssh root@165.232.187.195 "ls -la /var/www/bell24h/lib/insforge.ts"
ssh root@165.232.187.195 "ls -la /var/www/bell24h/app/api/dashboard/stats/route.ts"
```

### If build fails with module errors:
```bash
ssh root@165.232.187.195 "cd /var/www/bell24h && npm install @supabase/supabase-js dotenv && npm run build"
```

---

## 📋 What Gets Deployed

This deployment includes:

✅ **lib/insforge.ts** - InsForge database client wrapper
✅ **app/api/dashboard/stats/route.ts** - Real-time dashboard stats API
✅ **app/api/rfq/create/route.ts** - Updated to save to InsForge database
✅ **app/api/auth/send-phone-otp/route.ts** - Updated OTP system
✅ **@supabase/supabase-js** - Required dependency for InsForge

---

## 🎯 Next Steps After Deployment

1. **Run E2E tests:**
   ```bash
   ./test-production.sh
   ```

2. **Test login with real phone:**
   - Navigate to http://165.232.187.195/login
   - Enter your phone number
   - Verify SMS received (costs ~₹0.15)

3. **Create test RFQ:**
   - Login to dashboard
   - Create new RFQ
   - Verify it appears in InsForge database

4. **Set up InsForge database schema** (if not done yet):
   - Go to https://insforge.dev/dashboard
   - Run the SQL from `insforge-schema.sql`

---

## 💡 Pro Tips

- **Check PM2 status anytime:** `ssh root@165.232.187.195 "pm2 status"`
- **View live logs:** `ssh root@165.232.187.195 "pm2 logs bell24h"`
- **Restart if needed:** `ssh root@165.232.187.195 "pm2 restart bell24h"`
- **Rollback if issues:** `ssh root@165.232.187.195 "cd /var/www/bell24h && git checkout main && npm run build && pm2 restart bell24h"`

---

**Ready to deploy?** Choose Option 1 for fastest deployment! 🚀
