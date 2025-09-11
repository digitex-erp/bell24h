# Fix Bell24h Crash Risks - Implementation NOW

Scan my entire codebase and implement these fixes:

## 1. Database Connection Pooling (lib/db.js or similar)
Find my database connection and add pooling:
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## 2. Fix Phone/Email OTP Authentication
Find auth pages and ensure:
- Phone OTP works with 10-digit validation
- OTP expires after 5 minutes
- Rate limiting: max 3 OTP requests per 10 minutes
- Add error handling for MSG91 failures

## 3. Add Error Boundaries to ALL Pages
Wrap every page in pages/ or app/ directory with:
```javascript
try {
  // existing page code
} catch (error) {
  return <div>Something went wrong. Please refresh.</div>
}
```

## 4. Disable These Mock Features
Find and replace with "Coming Soon" banners:
- Blockchain/escrow features
- AI negotiation
- Video RFQ
- Voice RFQ (unless working)
- Any feature using mock data

## 5. Fix All 404 Errors
Create placeholder pages for:
- /marketing/campaigns
- /auth/phone-email  
- /crm/leads
- Any other missing routes

## 6. Add Loading States
Every button that makes API calls needs:
- Disabled state while loading
- Spinner or "Loading..." text
- Error message on failure

## 7. Mobile Responsiveness
Fix these common issues:
- Buttons minimum 44px height
- No horizontal scroll
- Readable text (min 14px)
- Touch-friendly spacing

Generate the code changes NOW. Show me the diffs.
