# Database Seeding Guide for Bell24h

This guide explains how to seed your database with test data for the Bell24h B2B marketplace.

## Quick Start

### Option 1: Basic Seed (Recommended for Development)
Quick setup with minimal data - perfect for getting started:

```bash
npm run db:seed:basic
```

This creates:
- 8 product categories
- 5 users (2 buyers, 3 suppliers)
- 5 sample RFQs
- 8 sample quotes
- Basic test data

### Option 2: Comprehensive Seed (Full Dataset)
Complete dataset with realistic Indian B2B data:

```bash
npm run db:seed:comprehensive
```

This creates:
- 50 product categories
- 70 users (20 buyers, 50 suppliers)
- 30 active RFQs
- 50 quotes
- 100 chat messages
- Payment records
- Reviews and ratings

## Test Accounts

After running either seed, you can log in with these test accounts:

**Buyer Accounts:**
- buyer1@bell24h.com / Test@123
- buyer2@bell24h.com / Test@123

**Supplier Accounts:**
- supplier1@bell24h.com / Test@123
- supplier2@bell24h.com / Test@123
- supplier3@bell24h.com / Test@123

## Step-by-Step Setup

### 1. Database Setup
First, ensure your database is properly set up:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations if you have them
npm run db:migrate
```

### 2. Run Basic Seed
Start with the basic seed to get minimal data:

```bash
npm run db:seed:basic
```

### 3. Verify Data
Check your data in Prisma Studio:

```bash
npm run db:studio
```

### 4. Optional: Run Comprehensive Seed
For full testing and demos, run the comprehensive seed:

```bash
npm run db:seed:comprehensive
```

## Data Structure

### Categories Created
- Electronics & Electricals
- Textiles & Apparel
- Chemicals & Petrochemicals
- Machinery & Equipment
- Construction & Building Materials
- Automotive & Auto Parts
- Agriculture & Food Products
- Pharmaceuticals & Healthcare

### Sample RFQs Include
- Android Tablets (1000 units)
- Cotton Fabric (5000 meters)
- Industrial Chemicals (2000 kg)
- Hydraulic Press (5 units)
- PVC Pipes (10000 meters)

### Sample Quotes Include
- Realistic pricing based on target prices
- Delivery timelines (10-30 days)
- Terms and conditions
- Product specifications

## Troubleshooting

### Common Issues

1. **Prisma Client Not Found**
   ```bash
   npm run db:generate
   ```

2. **Database Connection Error**
   - Check your DATABASE_URL in .env
   - Ensure your database is running
   - Verify connection credentials

3. **Seed Script Fails**
   - Clear existing data first: `npx prisma db push --force-reset`
   - Check for unique constraint violations
   - Ensure all required environment variables are set

### Reset Database
If you need to start fresh:

```bash
# Reset database (WARNING: This deletes all data!)
npx prisma db push --force-reset

# Run seed again
npm run db:seed:basic
```

## Customization

### Adding Your Own Data
You can modify the seed scripts:
- Basic seed: `src/scripts/seed-basic.ts`
- Comprehensive seed: `src/scripts/seed-database.ts`

### Creating Custom Seeds
Create your own seed file:

```typescript
// src/scripts/my-custom-seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function myCustomSeed() {
  // Your custom seed logic here
}

if (require.main === module) {
  myCustomSeed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
```

Add to package.json:
```json
"scripts": {
  "db:seed:custom": "tsx src/scripts/my-custom-seed.ts"
}
```

## Next Steps

After seeding your database:

1. **Test the Application**
   - Log in with test accounts
   - Create new RFQs
   - Submit quotes
   - Test the payment flow

2. **Test Razorpay Integration**
   - Use test payment credentials
   - Verify payment flow works
   - Check payment records in database

3. **Test n8n Workflows**
   - Import marketing workflows
   - Test email notifications
   - Verify webhook integrations

4. **Prepare for Production**
   - Replace test data with real data
   - Update user credentials
   - Configure production payment gateway

## Support

If you encounter issues:
1. Check the console output for error messages
2. Verify your database connection
3. Ensure all dependencies are installed
4. Check Prisma schema matches your database

For detailed error logs, run:
```bash
DEBUG=prisma:* npm run db:seed:basic
```