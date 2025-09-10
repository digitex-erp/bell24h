# Authentication Problems to Fix

## Current Issues:
1. Multiple auth systems conflict (NextAuth + custom + localStorage)
2. Login shows "Failed to fetch" error
3. Registration doesn't save to database
4. No password reset functionality
5. Phone/OTP system partially implemented but not connected to database

## Files with Conflicts:
- /app/api/auth/* (duplicate routes)
- /app/login/page.tsx (broken fetch)
- /app/register/page.tsx (not connected to DB)
- /lib/auth.ts (multiple implementations)
- /components/auth/* (new phone/OTP components not integrated)

## Expected Solution:
- Single NextAuth implementation with phone/OTP support
- PostgreSQL database connection (Neon.tech)
- Working login/register/logout
- Session persistence
- Integration with existing phone/OTP components

## Priority Order:
1. Fix database connection (Neon PostgreSQL)
2. Implement single NextAuth system
3. Integrate phone/OTP authentication
4. Test all authentication flows
5. Deploy to Vercel

## Budget: ₹10,000-12,000
## Timeline: 2-3 days