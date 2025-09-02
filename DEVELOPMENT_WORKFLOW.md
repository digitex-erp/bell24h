# Development Workflow

## Before Development:
- Pull latest from Vercel (if needed)
- Create feature branch
- Run tests
- Verify all pages work

## After Development:
- Test all pages locally
- Run build test (npm run build)
- Push to GitHub
- Deploy to staging
- Test on staging
- Deploy to production

## Emergency Procedures:
- Backup current state
- Pull from Vercel
- Verify all pages
- Test locally
- Commit changes

## Recovery Commands:
```bash
# Verify all pages are present
npm run recovery:verify

# Test all pages work
npm run recovery:test

# Backup current state
npm run recovery:backup
```
