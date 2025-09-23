# Vercel Environment Variables Setup Guide

## 🎯 Quick Setup

### 1. Access Vercel Dashboard
- Go to: https://vercel.com/dashboard
- Click on your **bell24h-v1** project
- Navigate to **Settings → Environment Variables**

### 2. Required Environment Variables

Add these variables with **Production** environment selected:

| Variable Name | Value | Description |
|---------------|-------|-------------|
| `RAZORPAY_KEY_ID` | `rzp_live_RJjxcgaBo9j0UA` | Razorpay Live API Key ID |
| `RAZORPAY_KEY_SECRET` | `lwTxLReQSkVL7lbrr39XSoyG` | Razorpay Live API Secret |
| `NEXTAUTH_SECRET` | `[Generated Random String]` | JWT signing secret for NextAuth |
| `NEXTAUTH_URL` | `https://www.bell24h.com` | Your production domain |
| `NODE_ENV` | `production` | Node.js environment |
| `DATABASE_URL` | `[Your Production DB URL]` | PostgreSQL connection string |

### 3. Generate NextAuth Secret

Run this PowerShell command to generate a secure secret:

```powershell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Or use this online generator: https://generate-secret.vercel.app/32

### 4. Database URL Format

Your `DATABASE_URL` should follow this format:
```
postgresql://username:password@host:port/database
```

Example:
```
postgresql://bell24h_user:secure_password@db.bell24h.com:5432/bell24h_production
```

## 🔧 Automated Setup

### Option 1: Run the PowerShell Script
```powershell
.\CONFIGURE_VERCEL_ENV_VARS.ps1
```

### Option 2: Manual CLI Setup
```bash
# Login to Vercel
vercel login

# Add environment variables
vercel env add RAZORPAY_KEY_ID production
vercel env add RAZORPAY_KEY_SECRET production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production
vercel env add NODE_ENV production
vercel env add DATABASE_URL production
```

## ✅ Verification

After setting up environment variables:

1. **Check Variables**: Go to Settings → Environment Variables in Vercel
2. **Redeploy**: Trigger a new deployment to apply changes
3. **Test Live Site**: Visit https://www.bell24h.com and test functionality
4. **Check Logs**: Monitor deployment logs for any environment variable issues

## 🚨 Important Notes

- **Security**: Never commit `.env` files to version control
- **Environment**: Always select "Production" for live site variables
- **Redeploy**: Environment variable changes require a new deployment
- **Database**: Ensure your production database is accessible from Vercel's IP ranges

## 🔍 Troubleshooting

### Common Issues:

1. **Variables Not Loading**: Check if they're set for "Production" environment
2. **Build Failures**: Verify all required variables are present
3. **Runtime Errors**: Check Vercel function logs for missing variables
4. **Database Connection**: Ensure DATABASE_URL is correct and accessible

### Debug Commands:

```bash
# List all environment variables
vercel env ls

# Pull environment variables locally
vercel env pull .env.local

# Check deployment logs
vercel logs [deployment-url]
```

## 📞 Support

If you encounter issues:
1. Check Vercel's environment variables documentation
2. Review your project's deployment logs
3. Verify all variables are correctly formatted
4. Ensure your database is accessible from Vercel

---

**Last Updated**: December 2024  
**Project**: Bell24h (bell24h-v1)  
**Domain**: https://www.bell24h.com
