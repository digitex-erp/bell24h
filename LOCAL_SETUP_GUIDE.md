# Local Database Setup Guide for Bell24h

## Quick Start (Local SQLite)

### 1. Set up local SQLite database
```bash
# Update your .env file to use local SQLite
cp .env.example .env.local
```

Edit `.env.local` and set:
```env
# Local SQLite (for development)
DATABASE_URL="file:./dev.db"

# Or use local PostgreSQL
# DATABASE_URL="postgresql://username:password@localhost:5432/bell24h"
```

### 2. Initialize database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to local database
npm run db:push
```

### 3. Seed with test data
```bash
# Run local seed script (SQLite compatible)
npm run db:seed:local
```

### 4. Verify data
```bash
# Open Prisma Studio to view data
npm run db:studio

# Or run verification queries
cd src/scripts
sqlite3 dev.db < verify-seed.sql
```

## Test Accounts

### Buyer Accounts (20)
- Emails: `buyer1@bell24h.com` to `buyer20@bell24h.com`
- Password: `Test@123`
- Features: Can create RFQs, receive quotes, send messages

### Supplier Accounts (50)
- Emails: `supplier1@bell24h.com` to `supplier50@bell24h.com`
- Password: `Test@123`
- Features: Can submit quotes, respond to RFQs, send messages

## Data Generated

### Suppliers (50)
- Realistic Indian company names
- Valid GST numbers (27XXXXX1234XXX format)
- 70% verified suppliers
- 3-5 star ratings
- 0-100 completed orders

### Buyers (20)
- Realistic Indian company names
- Valid GST numbers
- 80% verified buyers
- 3-5 star ratings

### RFQs (30)
- Realistic B2B products (steel sheets, tablets, cables, etc.)
- Indian cities (Mumbai, Delhi, Bangalore, etc.)
- 7-30 day delivery requirements
- Budget range: ₹10,000 - ₹1,000,000

### Quotes (50)
- 2-3 quotes per RFQ
- Realistic pricing
- Delivery and payment terms

### Messages (100)
- Hindi-English mixed conversations
- Realistic business negotiations
- Sample: "Sir ji, aapka rate thoda jyada lag raha hai. Kya thoda adjustment possible hai?"

### Categories (50)
- Complete B2B product categories
- Icons and slugs included

### Payments (25)
- Razorpay integration ready
- Various payment statuses
- Realistic amounts

## Verification Commands

### Check counts
```sql
-- Suppliers
SELECT COUNT(*) FROM users WHERE type = 'SUPPLIER'; -- Should be 50

-- Buyers  
SELECT COUNT(*) FROM users WHERE type = 'BUYER'; -- Should be 20

-- RFQs
SELECT COUNT(*) FROM rfqs; -- Should be 30

-- Quotes
SELECT COUNT(*) FROM quotes; -- Should be 50

-- Messages
SELECT COUNT(*) FROM messages; -- Should be 100
```

### Sample data check
```sql
-- Check supplier details
SELECT email, companyName, city, verified, rating FROM users WHERE type = 'SUPPLIER' LIMIT 5;

-- Check RFQ titles
SELECT title, quantity, unit, targetPrice FROM rfqs LIMIT 5;

-- Check Hindi-English messages
SELECT content FROM messages WHERE content LIKE '%hai%' LIMIT 5;
```

## Troubleshooting

### Database connection issues
```bash
# Reset local database
npx prisma migrate reset

# Clear all data
npx prisma db push --force-reset

# Check database file
ls -la dev.db
```

### Seed script errors
```bash
# Run with debug output
DEBUG=* npm run db:seed:local

# Check Prisma logs
npx prisma generate --watch
```

### Prisma client issues
```bash
# Regenerate client
npx prisma generate

# Clear node_modules
rm -rf node_modules
npm install
```

## Production Setup (Neon PostgreSQL)

When ready for production, switch to Neon PostgreSQL:

1. Get your Neon connection string from https://neon.tech
2. Update `.env.production`:
```env
DATABASE_URL="postgresql://username:password@ep-xxx-xxx.aws.neon.tech/dbname?sslmode=require"
```

3. Run production seed:
```bash
npm run db:seed:comprehensive
```

## Next Steps

1. **Test user authentication** with test accounts
2. **Create RFQs** as buyers
3. **Submit quotes** as suppliers  
4. **Test messaging** (Hindi-English mix)
5. **Test Razorpay payments** (use test mode)
6. **Test n8n workflows** (marketing automation)

Happy testing! 🎉