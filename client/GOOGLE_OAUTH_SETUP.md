# 🚀 Google OAuth Setup Guide for Bell24h 2.0

## 📋 **PREREQUISITES**

- Google Account
- Access to Vercel Dashboard
- 15 minutes of time

---

## 🎯 **STEP 1: GOOGLE CLOUD CONSOLE (5 minutes)**

### **1.1 Access Google Cloud Console**

```
🌐 Visit: https://console.cloud.google.com
📋 Sign in with your Google account
```

### **1.2 Create/Select Project**

```
🔧 If you don't have a project:
   - Click "Select a project" → "New Project"
   - Name: "Bell24h Production"
   - Click "Create"

🔧 If you have a project:
   - Select your existing project
```

### **1.3 Enable Google+ API**

```
🔧 Go to: APIs & Services → Library
🔍 Search for: "Google+ API" or "Google Identity"
✅ Click "Enable"
```

### **1.4 Create OAuth 2.0 Credentials**

```
🔧 Go to: APIs & Services → Credentials
➕ Click: "Create Credentials" → "OAuth 2.0 Client IDs"

📝 Fill in the form:
   - Application Type: "Web Application"
   - Name: "Bell24h Production"
   - Authorized JavaScript origins:
     https://bell24h-v1-rm1zdwt68-vishaals-projects-892b178d.vercel.app
   - Authorized redirect URIs:
     https://bell24h-v1-rm1zdwt68-vishaals-projects-892b178d.vercel.app/api/auth/callback/google
```

### **1.5 Copy Your Credentials**

```
📋 After creation, you'll see:
   Client ID: xxxxxx.apps.googleusercontent.com
   Client Secret: xxxxxx

💾 Save these - you'll need them in Step 2
```

---

## 🎯 **STEP 2: VERCEL ENVIRONMENT VARIABLES (2 minutes)**

### **2.1 Access Vercel Dashboard**

```
🌐 Visit: https://vercel.com/dashboard
🔧 Go to: bell24h-v1 project → Settings → Environment Variables
```

### **2.2 Add Environment Variables**

```
➕ Add Variable 1:
   Name: GOOGLE_ID
   Value: [Your Client ID from Step 1.5]
   Environment: Production

➕ Add Variable 2:
   Name: GOOGLE_SECRET
   Value: [Your Client Secret from Step 1.5]
   Environment: Production
```

---

## 🎯 **STEP 3: DEPLOY AND TEST (3 minutes)**

### **3.1 Deploy Changes**

```bash
npx vercel --prod
```

### **3.2 Test Google OAuth**

```
🌐 Visit: https://bell24h-v1-rm1zdwt68-vishaals-projects-892b178d.vercel.app/auth/login
🔍 Look for: "Sign in with Google" button
🖱️ Click: "Sign in with Google"
✅ Should redirect to Google login
✅ Should redirect back to dashboard
```

---

## 🎯 **STEP 4: VERIFICATION (2 minutes)**

### **4.1 Check Environment Variables**

```bash
curl "https://bell24h-v1-rm1zdwt68-vishaals-projects-892b178d.vercel.app/api/health"
```

**Expected Response:**

```json
{
  "status": "OPERATIONAL",
  "environment": {
    "GOOGLE_ID": "SET",
    "GOOGLE_SECRET": "SET"
  }
}
```

### **4.2 Test Complete Flow**

```
1. Visit login page
2. Click "Sign in with Google"
3. Complete Google authentication
4. Should redirect to dashboard
5. Check user is created in database
```

---

## 🚨 **TROUBLESHOOTING**

### **Issue: "Google sign-in failed"**

```
🔧 Check:
1. Environment variables are set correctly
2. Authorized origins include your domain
3. Authorized redirect URI is correct
4. Google+ API is enabled
```

### **Issue: "Redirect URI mismatch"**

```
🔧 Fix:
1. Go to Google Cloud Console
2. Edit OAuth 2.0 Client ID
3. Add exact redirect URI:
   https://bell24h-v1-rm1zdwt68-vishaals-projects-892b178d.vercel.app/api/auth/callback/google
```

### **Issue: "Client ID not found"**

```
🔧 Fix:
1. Check GOOGLE_ID environment variable
2. Ensure it ends with .apps.googleusercontent.com
3. Redeploy after setting environment variables
```

---

## ✅ **SUCCESS INDICATORS**

- ✅ Google OAuth button appears on login page
- ✅ Clicking button opens Google login
- ✅ Successful login redirects to dashboard
- ✅ User is created in database
- ✅ Session persists across page refreshes

---

## 🎉 **READY FOR LAUNCH!**

Once Google OAuth is working:

- ✅ Platform is 100% ready
- ✅ Professional user experience
- ✅ Higher conversion rates
- ✅ Complete feature set

**Bell24h 2.0 will be ready for world-class launch!** 🚀
