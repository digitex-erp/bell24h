# Bell24h Deployment Checklist

## Pre-Deployment ✅
- [x] Build successful
- [x] Protection system active
- [x] Backups created
- [x] Files protected
- [x] Git repository ready

## GitHub Setup ⏳
- [ ] Create repository at github.com/new
- [ ] Name: bell24h
- [ ] Keep public
- [ ] Don't initialize with README
- [ ] Push code to GitHub

## Railway Deployment ⏳
- [ ] Go to railway.app/dashboard
- [ ] Connect GitHub repository
- [ ] Set environment variables
- [ ] Deploy application

## Post-Deployment ⏳
- [ ] Verify app is live
- [ ] Test core functionality
- [ ] Monitor logs
- [ ] Update DNS if needed

## Environment Variables Required:
- DATABASE_URL=${{Postgres.DATABASE_URL}}
- NODE_ENV=production
- JWT_SECRET=your-32-char-secret
- NEXTAUTH_URL=https://your-app.railway.app
