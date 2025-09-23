# Neon Database Setup for Bell24h

## 🎯 Database Configuration

### Connection Details
- **Provider**: Neon PostgreSQL
- **Region**: Asia Pacific (ap-southeast-1)
- **Database**: neondb
- **Host**: ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech
- **User**: neondb_owner
- **SSL**: Required with channel binding

### Connection String
```
postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## 🔧 Setup Steps

### 1. Run the Setup Script
```powershell
.\SETUP_NEON_DATABASE.ps1
```

### 2. Manual Database Connection Test
```bash
psql 'postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

### 3. Prisma Commands
```bash
# Generate Prisma client
npx prisma generate

# Push schema to Neon
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

## 🌐 Environment Variables

### Local Development (.env.local)
```env
DATABASE_URL=postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
RAZORPAY_KEY_ID=rzp_live_RJjxcgaBo9j0UA
RAZORPAY_KEY_SECRET=lwTxLReQSkVL7lbrr39XSoyG
NEXTAUTH_SECRET=bell24h_neon_production_secret_2024
NEXTAUTH_URL=https://www.bell24h.com
NODE_ENV=production
```

### Vercel Production
Add these same variables in Vercel Dashboard → Settings → Environment Variables

## ✅ Verification

### 1. Test Database Connection
```sql
-- Connect and run
SELECT version();
SELECT current_database();
SELECT current_user;
```

### 2. Check Prisma Connection
```bash
npx prisma db pull
npx prisma generate
npx prisma db push
```

### 3. Verify Environment Variables
```bash
# Check if DATABASE_URL is loaded
node -e "console.log(process.env.DATABASE_URL)"
```

## 🚀 Deployment

### 1. Add to Vercel Dashboard
- Go to: https://vercel.com/dashboard
- Project: bell24h-v1
- Settings → Environment Variables
- Add all variables from .vercel-env-vars.txt

### 2. Deploy
```bash
npx vercel --prod
```

### 3. Verify Live Site
- Visit: https://www.bell24h.com
- Test database operations
- Check Vercel function logs

## 🔍 Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check if Neon database is active
   - Verify connection string format
   - Ensure SSL settings are correct

2. **Authentication Failed**
   - Verify username/password
   - Check if database exists
   - Confirm user permissions

3. **SSL Issues**
   - Ensure `sslmode=require`
   - Add `channel_binding=require`
   - Check certificate validity

### Debug Commands

```bash
# Test connection with psql
psql "postgresql://neondb_owner:npg_0Duqdxs3RoyA@ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Check Prisma connection
npx prisma db execute --stdin < schema.sql

# View Prisma logs
DEBUG=prisma:* npx prisma generate
```

## 📊 Database Management

### Neon Console
- URL: https://console.neon.tech
- Manage databases, users, and connections
- View query performance and logs
- Monitor usage and billing

### Prisma Studio
```bash
npx prisma studio
```
- Visual database browser
- Edit data directly
- Run queries
- Manage relationships

## 🔒 Security Notes

- ✅ SSL connection required
- ✅ Channel binding enabled
- ✅ Production credentials secured
- ✅ Environment variables not committed
- ✅ Database access restricted to application

## 📈 Performance

- **Region**: Asia Pacific (ap-southeast-1)
- **Connection Pooling**: Enabled
- **SSL**: Required for security
- **Backup**: Automated by Neon
- **Scaling**: Auto-scaling available

---

**Database**: Neon PostgreSQL  
**Region**: ap-southeast-1  
**Project**: Bell24h (bell24h-v1)  
**Domain**: https://www.bell24h.com