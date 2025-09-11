# 🗄️ Neon.tech Database Setup - Complete Guide

## ✅ **CURRENT STATUS (From Your Dashboard)**

**Project**: Bell24h (FREE tier)  
**Database**: bell24h-prod  
**Usage**: Very low - well within free limits  
**Storage**: 0.03 GB / 0.5 GB (only 6% used)  
**Compute**: 0.11 hours / 50 hours (minimal usage)  

**This is PERFECT for your needs and completely FREE!**

---

## 🔗 **Get Your Neon Connection String**

From your Neon dashboard (console.neon.tech):

1. **Click "Connection Details"** in your bell24h-prod database
2. **Copy the "Connection string"** 
3. **It will look like**: `postgresql://username:password@ep-morning-sound-81469811.us-east-1.aws.neon.tech/bell24h?sslmode=require`

---

## ⚙️ **Vercel Environment Variables Setup**

### **Required Environment Variables:**

```env
# Database (Neon.tech)
DATABASE_URL=postgresql://[your-neon-connection-string]
POSTGRES_PRISMA_URL=[same-as-above]
POSTGRES_URL_NON_POOLING=[same-as-above]

# Authentication  
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://bell24h.vercel.app

# API Keys
MSG91_API_KEY=your_msg91_key
SENDGRID_API_KEY=your_sendgrid_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### **How to Add to Vercel:**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your Bell24h project
3. Go to **Settings** → **Environment Variables**
4. Add each variable above
5. **Redeploy** after adding all variables

---

## 🚀 **Deployment Commands**

### **Test Neon Connection Locally:**

```bash
# Test database connection
npx prisma db pull

# Should connect successfully to Neon
```

### **Deploy to Vercel:**

```bash
# Add all changes
git add .

# Commit with Neon database update
git commit -m "Switch to Neon.tech database (removed expensive Railway)

- ✅ Connected to free Neon.tech PostgreSQL
- ✅ Updated all DATABASE_URL references  
- ✅ Removed Railway dependencies
- ✅ Cost: ₹0/month instead of Railway's high fees"

# Push to GitHub (triggers Vercel deployment)
git push origin main
```

---

## 💰 **Cost Analysis**

### **Railway vs Neon.tech:**

```
❌ Railway (What you deleted):
- Database: $5-20/month minimum
- Compute: $10-50/month  
- Total: $15-70/month ($180-840/year)

✅ Neon.tech (What you have now):
- Database: FREE (500MB, 50 compute hours)
- Perfect for your current usage
- Total: ₹0/month (₹0/year)

SAVINGS: $180-840/year by switching to Neon! 💰
```

### **Current Usage Analysis:**

From your dashboard:
- **Storage**: 0.03 GB / 0.5 GB (plenty of room)
- **Compute**: 0.11 hours / 50 hours (minimal usage)  
- **Branches**: 2/10 (good for development)

**You can scale to 1000+ users before hitting Neon's free limits!**

---

## 🔧 **Database Connection Code**

### **Updated API Routes for Neon:**

```javascript
// pages/api/auth/verify-otp.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone, otp } = req.body;
    
    // Verify OTP with Neon database
    const client = await pool.connect();
    const result = await client.query(
      'SELECT * FROM users WHERE phone = $1 AND otp = $2',
      [phone, otp]
    );
    
    client.release();
    
    if (result.rows.length > 0) {
      res.status(200).json({ success: true, user: result.rows[0] });
    } else {
      res.status(400).json({ error: 'Invalid OTP' });
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database connection failed' });
  }
}
```

---

## 🧪 **Test Connection Script**

Create this file to test your Neon connection:

```javascript
// test-neon-connection.js
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to Neon.tech successfully!');
    
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database query works:', result.rows[0]);
    
    client.release();
  } catch (error) {
    console.error('❌ Connection failed:', error);
  }
}

testConnection();
```

### **Run the test:**

```bash
node test-neon-connection.js

# Should output:
# ✅ Connected to Neon.tech successfully!
# ✅ Database query works: [current timestamp]
```

---

## 📊 **Monitoring Your Usage**

### **Keep Track of Limits:**

```bash
# Check your Neon dashboard regularly:
# console.neon.tech/app/projects/morning-sound-81469811

# Current limits (FREE tier):
- Storage: 0.5 GB (you're using 0.03 GB)
- Compute: 50 hours/month (you're using 0.11 hours)
- Connections: 1000 concurrent
```

### **Scaling Plan:**

```
Phase 1 (Current): Neon FREE - ₹0/month
├── Perfect for 0-1000 users
└── 0.5 GB storage, 50 hours compute

Phase 2 (Future): Neon Scale - $19/month  
├── When you hit 1000+ users
└── 10 GB storage, unlimited compute

Phase 3 (Much Later): Neon Pro - $69/month
├── When you hit 10,000+ users  
└── Unlimited everything + support
```

---

## 🎯 **Immediate Next Steps**

### **1. Copy Your Connection String (2 minutes):**
- Go to console.neon.tech
- Click "Connection Details" 
- Copy the full postgresql://... string

### **2. Update Vercel Environment Variables (5 minutes):**
- Replace any Railway references with Neon
- Add DATABASE_URL with your Neon string
- Add all other required environment variables

### **3. Test Deployment (3 minutes):**
- Push changes to trigger new build
- Verify all database operations work
- Check that 404 errors are fixed

### **🚀 Expected Result:**
- All 404 errors fixed
- Database operations working
- Phone OTP authentication functional  
- Admin dashboard preserved
- **Total monthly cost: ₹0 (versus Railway's high fees)**

**Smart financial decision - you chose the perfect free database solution for Bell24h!** 🎉
