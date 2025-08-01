# 🔧 Supabase Authentication Setup Guide

## 🚨 Current Issue
Your Bell24H application is failing to load because the Supabase authentication service is not properly configured. The error message indicates missing environment variables.

## ✅ Quick Fix Steps

### Step 1: Get Your Supabase Credentials

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project** (or create a new one if needed)
3. **Navigate to Settings → API**
4. **Copy these values**:
   - **Project URL** (starts with `https://`)
   - **Anon Key** (starts with `eyJ`)

### Step 2: Update Environment Variables

1. **Open your `.env.local` file** in the `client` directory
2. **Replace the placeholder values** with your actual Supabase credentials:

```env
# Supabase Configuration - REQUIRED FOR AUTHENTICATION
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Restart Development Server

```bash
# Stop your current server (Ctrl+C)
# Then restart:
npm run dev
# or
yarn dev
```

## 🔍 Verification Steps

### Check if Configuration is Working

1. **Visit your login page**: `http://localhost:3000/auth/login`
2. **Check browser console** for any error messages
3. **Try registering a new account** to test authentication

### Expected Behavior After Fix

✅ **No more "Unhandled Runtime Error"**  
✅ **Login page loads without errors**  
✅ **Registration and login work properly**  
✅ **Dashboard access works**  

## 🛠️ Troubleshooting

### If you still see errors:

1. **Check your `.env.local` file**:
   ```bash
   # In the client directory
   cat .env.local
   ```

2. **Verify Supabase credentials**:
   - Go to Supabase Dashboard → Settings → API
   - Ensure you copied the correct URL and Anon Key

3. **Clear browser cache**:
   - Hard refresh: `Ctrl+Shift+R`
   - Or clear browser cache completely

4. **Check for typos**:
   - Ensure no extra spaces in environment variables
   - Verify the URL format is correct

### Common Issues:

**❌ "Invalid API key" error**
- Double-check your Anon Key starts with `eyJ`
- Ensure you're using the Anon Key, not the Service Role Key

**❌ "Project not found" error**
- Verify your Project URL is correct
- Check that your Supabase project is active

**❌ "Network error"**
- Check your internet connection
- Ensure Supabase service is available

## 📋 Complete Environment File Example

Here's what your `.env.local` should look like:

```env
# Supabase Configuration - REQUIRED FOR AUTHENTICATION
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Development Configuration
NODE_ENV=development
NEXT_TELEMETRY_DISABLED=1

# Application Configuration
NEXT_PUBLIC_APP_NAME=BELL24H
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_AI_MATCHING=true
NEXT_PUBLIC_ENABLE_VOICE_RFQ=true
NEXT_PUBLIC_ENABLE_ESCROW=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

## 🆘 Need Help?

If you're still having issues:

1. **Check the browser console** for specific error messages
2. **Verify your Supabase project** is properly set up
3. **Ensure your database schema** is created (see `supabase-schema.sql`)
4. **Contact support** if the issue persists

## 🎯 Next Steps After Fix

Once authentication is working:

1. **Test user registration**
2. **Test user login**
3. **Test dashboard access**
4. **Configure email verification** (optional)
5. **Set up Google OAuth** (optional)

---

**Note**: This setup is required for the authentication system to work. Without proper Supabase configuration, users cannot register, login, or access the dashboard. 