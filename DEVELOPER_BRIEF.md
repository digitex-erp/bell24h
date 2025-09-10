# Developer Task: Fix Authentication

## Budget: ₹10,000-12,000
## Timeline: 2-3 days

## Required Fixes:
1. Remove all duplicate auth code
2. Implement single NextAuth solution with phone/OTP support
3. Connect to PostgreSQL database (Neon.tech)
4. Test login/register/logout works
5. Add basic password reset
6. Integrate existing phone/OTP components

## Success Criteria:
- User can register new account (phone + email)
- User can login with phone OTP
- Session persists on refresh
- Logout works properly
- No "Failed to fetch" errors
- Database properly stores user data

## Technical Requirements:
- NextAuth.js v4
- PostgreSQL (Neon.tech)
- Prisma ORM
- Phone OTP integration (MSG91)
- Email OTP integration (SendGrid)

## Files to Focus On:
- `/app/api/auth/` - API routes
- `/components/auth/` - React components
- `/prisma/schema.prisma` - Database schema
- `/lib/auth.ts` - Authentication logic

## Database Connection:
```
DATABASE_URL="postgresql://neondb_owner:npg_K6M8mRhTPpCH@ep-fragrant-smoke-ae00uwml-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

## Payment Structure:
- ₹3,000 advance (after setup)
- ₹4,000 after login works
- ₹3,000 after all tests pass
- ₹2,000 bonus if completed in 2 days