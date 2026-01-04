# 🚀 BELL24H DEPLOYMENT PLAN
## Complete Wiring & Orchestration Strategy
### CEO-Approved Roadmap - January 4, 2025

---

## ⚠️ **CRITICAL: Cannot Deploy Yet - Here's Why**

**Current Status:** 30% Functionally Complete
**Reason:** Files exist but NOT wired together
**Required Work:** 150 hours of integration
**Timeline:** 4-5 weeks to deployment

---

## 📋 **DEPLOYMENT PLAN OVERVIEW**

### **Phase 1: CORE WIRING** (Week 1-2) - 80 hours
### **Phase 2: INTEGRATION TESTING** (Week 3) - 40 hours
### **Phase 3: PRODUCTION PREP** (Week 4) - 20 hours
### **Phase 4: DEPLOYMENT** (Week 5) - 10 hours

**TOTAL:** 150 hours | 5 weeks

---

## 🔧 **PHASE 1: CORE WIRING (Week 1-2) - 80 Hours**

### **Day 1-2: Database Foundation (16 hours)**

#### **Task 1.1: Create Prisma Client Wrapper (2h)**
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Deliverable:** `/lib/prisma.ts` file ✅
**Test:** `import { prisma } from '@/lib/prisma'` works

---

#### **Task 1.2: Deploy Prisma Schema to Neon (2h)**
```bash
# Navigate to project
cd /home/user/bell24h

# Generate Prisma client
npx prisma generate

# Push schema to Neon database
npx prisma db push

# Verify connection
npx prisma studio
```

**Deliverable:** Database tables created in Neon ✅
**Test:** Open Prisma Studio, see tables

---

#### **Task 1.3: Create Database Utilities (4h)**
```typescript
// lib/db/utils.ts
import { prisma } from '@/lib/prisma';

export async function createUser(data: {
  phone: string;
  name?: string;
  email?: string;
  role?: string;
}) {
  return await prisma.user.create({
    data: {
      phone: data.phone,
      name: data.name,
      email: data.email,
      role: data.role || 'BUYER',
      isActive: true,
      isVerified: false,
    }
  });
}

export async function findUserByPhone(phone: string) {
  return await prisma.user.findUnique({
    where: { phone }
  });
}

export async function createRFQ(data: any, userId: string) {
  return await prisma.rFQ.create({
    data: {
      title: data.title,
      category: data.category,
      description: data.description,
      quantity: data.quantity,
      unit: data.unit || 'units',
      timeline: data.timeline,
      createdBy: userId,
      status: 'ACTIVE',
    }
  });
}

export async function listRFQs(filters?: {
  category?: string;
  status?: string;
  limit?: number;
}) {
  return await prisma.rFQ.findMany({
    where: {
      ...(filters?.category && { category: filters.category }),
      ...(filters?.status && { status: filters.status as any }),
    },
    include: {
      user: {
        select: {
          name: true,
          company: true,
          location: true,
        }
      },
      quotes: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: filters?.limit || 50,
  });
}

// ... 10+ more helper functions
```

**Deliverable:** `/lib/db/utils.ts` with 15+ functions ✅
**Test:** Import and call each function

---

#### **Task 1.4: Create Session Management (4h)**
```typescript
// lib/auth/session.ts
import { getServerSession as getNextAuthSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getServerSession() {
  return await getNextAuthSession(authOptions);
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function getCurrentUser() {
  const session = await requireAuth();
  return await prisma.user.findUnique({
    where: { id: session.user.id }
  });
}
```

**Deliverable:** `/lib/auth/session.ts` ✅
**Test:** Call in API route, verify session

---

#### **Task 1.5: Wire OTP Authentication (4h)**
```typescript
// app/api/auth/send-phone-otp/route.ts (REWRITE)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSMS } from '@/lib/msg91';

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    // Validate phone
    if (!phone || !/^\+?[1-9]\d{9,14}$/.test(phone)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid phone number'
      }, { status: 400 });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save to database
    await prisma.oTPVerification.upsert({
      where: { phone },
      update: {
        otp,
        expiresAt,
        attempts: 0,
        isVerified: false,
      },
      create: {
        phone,
        otp,
        expiresAt,
        attempts: 0,
        isVerified: false,
      }
    });

    // Send via MSG91 (or console.log in dev)
    if (process.env.NODE_ENV === 'production') {
      await sendSMS(phone, `Your Bell24h OTP is ${otp}. Valid for 5 minutes.`);
    } else {
      console.log(`OTP for ${phone}: ${otp}`);
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      ...(process.env.NODE_ENV !== 'production' && { devOTP: otp })
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to send OTP'
    }, { status: 500 });
  }
}
```

**Deliverable:** Working OTP API ✅
**Test:** Call API, check database for OTP record

---

### **Day 3-4: Wire Core API Routes (16 hours)**

#### **Task 2.1: Wire RFQ Create API (4h)**
```typescript
// app/api/rfq/create/route.ts (REWRITE)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const rfqData = await request.json();

    // Validate required fields
    if (!rfqData.title || !rfqData.category) {
      return NextResponse.json({
        success: false,
        error: 'Title and category are required'
      }, { status: 400 });
    }

    // Create RFQ in database
    const rfq = await prisma.rFQ.create({
      data: {
        title: rfqData.title,
        category: rfqData.category,
        description: rfqData.description || '',
        quantity: rfqData.quantity || '1',
        unit: rfqData.unit || 'units',
        timeline: rfqData.timeline || '2 weeks',
        minBudget: rfqData.minBudget ? parseFloat(rfqData.minBudget) : null,
        maxBudget: rfqData.maxBudget ? parseFloat(rfqData.maxBudget) : null,
        requirements: rfqData.requirements,
        urgency: rfqData.urgency || 'NORMAL',
        location: rfqData.location,
        tags: rfqData.tags || [],
        createdBy: session.user.id,
        status: 'ACTIVE',
        isPublic: true,
      },
      include: {
        user: {
          select: {
            name: true,
            company: true,
          }
        }
      }
    });

    // TODO: Trigger N8N workflow for supplier matching

    return NextResponse.json({
      success: true,
      rfq,
      message: 'RFQ created successfully'
    });

  } catch (error) {
    console.error('Create RFQ error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create RFQ'
    }, { status: 500 });
  }
}
```

**Deliverable:** Functional RFQ creation ✅
**Test:** POST to API, verify in database

---

#### **Task 2.2: Wire RFQ List API (2h)**
```typescript
// app/api/rfq/list/route.ts (REWRITE)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const rfqs = await prisma.rFQ.findMany({
      where: {
        ...(category && { category }),
        ...(status && { status: status as any }),
        isPublic: true,
      },
      include: {
        user: {
          select: {
            name: true,
            company: true,
            location: true,
          }
        },
        _count: {
          select: {
            quotes: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      rfqs,
      count: rfqs.length
    });

  } catch (error) {
    console.error('List RFQs error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to list RFQs'
    }, { status: 500 });
  }
}
```

**Deliverable:** Functional RFQ listing ✅
**Test:** GET from API, verify data

---

#### **Task 2.3: Wire Dashboard Stats API (3h)**
```typescript
// app/api/dashboard/stats/route.ts (CREATE NEW)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    const userId = session.user.id;

    // Get real stats from database
    const [
      totalRFQs,
      activeRFQs,
      totalQuotes,
      acceptedQuotes,
      totalSpent,
      totalEarned,
    ] = await Promise.all([
      prisma.rFQ.count({
        where: { createdBy: userId }
      }),
      prisma.rFQ.count({
        where: { createdBy: userId, status: 'ACTIVE' }
      }),
      prisma.quote.count({
        where: { supplierId: userId }
      }),
      prisma.quote.count({
        where: { supplierId: userId, isAccepted: true }
      }),
      prisma.transaction.aggregate({
        where: { buyerId: userId },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { supplierId: userId },
        _sum: { amount: true }
      }),
    ]);

    const stats = {
      totalRFQs,
      activeRFQs,
      totalQuotes,
      acceptedQuotes,
      totalSpent: totalSpent._sum.amount || 0,
      totalEarned: totalEarned._sum.amount || 0,
      successRate: totalQuotes > 0
        ? (acceptedQuotes / totalQuotes * 100).toFixed(1)
        : 0,
    };

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch stats'
    }, { status: 500 });
  }
}
```

**Deliverable:** Real dashboard stats ✅
**Test:** GET from API, verify numbers

---

#### **Task 2.4: Wire Quote APIs (3h)**
- Create quote submission
- List quotes for RFQ
- Accept/reject quote

#### **Task 2.5: Wire User Profile APIs (2h)**
- Get user profile
- Update profile
- Upload avatar

#### **Task 2.6: Wire Payment APIs (2h)**
- Create Razorpay order
- Webhook handler
- Transaction history

---

### **Day 5-6: Wire Frontend Pages (16 hours)**

#### **Task 3.1: Wire Dashboard Page (4h)**
```typescript
// app/dashboard/page.tsx (UPDATE)
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function loadDashboard() {
      try {
        // Fetch real stats
        const res = await fetch('/api/dashboard/stats');
        const data = await res.json();

        if (data.success) {
          setStats(data.stats);
        } else {
          // Handle error - maybe redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Load dashboard error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  if (!stats) {
    return <div>Failed to load dashboard</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <StatCard
          title="Total RFQs"
          value={stats.totalRFQs}
          icon={FileText}
        />
        <StatCard
          title="Active RFQs"
          value={stats.activeRFQs}
          icon={Activity}
        />
        {/* ... more stats */}
      </div>
    </div>
  );
}
```

**Deliverable:** Dashboard shows real data ✅
**Test:** Login, see actual numbers from database

---

#### **Task 3.2: Wire RFQ Browse Page (3h)**
```typescript
// app/rfqs/page.tsx or similar
useEffect(() => {
  async function loadRFQs() {
    const res = await fetch('/api/rfq/list?limit=20');
    const data = await res.json();
    if (data.success) {
      setRFQs(data.rfqs);
    }
  }
  loadRFQs();
}, []);
```

**Deliverable:** Browse page shows real RFQs ✅

---

#### **Task 3.3: Wire RFQ Create Page (3h)**
#### **Task 3.4: Wire Login Page (2h)**
#### **Task 3.5: Wire Profile Page (2h)**
#### **Task 3.6: Add Loading & Error States (2h)**

---

### **Day 7-8: Service Integration (16 hours)**

#### **Task 4.1: MSG91 SMS Integration (4h)**
```typescript
// lib/msg91.ts
export async function sendSMS(phone: string, message: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV] SMS to ${phone}: ${message}`);
    return { success: true };
  }

  const response = await fetch('https://api.msg91.com/api/v5/flow/', {
    method: 'POST',
    headers: {
      'authkey': process.env.MSG91_AUTH_KEY!,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      flow_id: process.env.MSG91_FLOW_ID,
      mobiles: phone,
      otp: message,
    })
  });

  return await response.json();
}
```

**Deliverable:** Working SMS service ✅
**Test:** Send real SMS (with test account)

---

#### **Task 4.2: Razorpay Webhook (4h)**
```typescript
// app/api/payment/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);

    // Handle payment events
    if (event.event === 'payment.captured') {
      await prisma.transaction.update({
        where: { paymentId: event.payload.payment.entity.id },
        data: {
          status: 'COMPLETED',
          metadata: event.payload.payment.entity,
        }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}
```

**Deliverable:** Working payment webhook ✅

---

#### **Task 4.3: N8N Workflows (4h)**
- Create RFQ notification workflow
- Create quote alert workflow
- Test webhooks

#### **Task 4.4: Cloudinary Media Upload (2h)**
#### **Task 4.5: Groq AI Integration (2h)**

---

### **Day 9-10: Docker Orchestration (16 hours)**

#### **Task 5.1: Fix docker-compose.yml (4h)**
```yaml
# docker-compose.yml (UPDATE)
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: bell24h-app
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=${DATABASE_URL}  # Use Neon cloud
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - RAZORPAY_KEY_ID=${RAZORPAY_KEY_ID}
      - RAZORPAY_KEY_SECRET=${RAZORPAY_KEY_SECRET}
    ports:
      - '3000:3000'
    networks:
      - bell24h-network

  n8n:
    image: n8nio/n8n:1.94.1
    container_name: bell24h-n8n
    restart: unless-stopped
    ports:
      - '5678:5678'
    environment:
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_HOST=${N8N_HOST}
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - N8N_WEBHOOK_URL=${N8N_WEBHOOK_URL}
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - bell24h-network

  # Remove MongoDB (not used)

volumes:
  n8n_data:

networks:
  bell24h-network:
    driver: bridge
```

**Deliverable:** Clean docker setup ✅

---

#### **Task 5.2: Update Dockerfile (3h)**
#### **Task 5.3: Create nginx.conf (3h)**
#### **Task 5.4: Environment Variables (3h)**
#### **Task 5.5: Test Local Containers (3h)**

---

## 🧪 **PHASE 2: INTEGRATION TESTING (Week 3) - 40 Hours**

### **Day 11-13: End-to-End Testing (24 hours)**

#### **Test Flow 1: User Registration & Login (4h)**
1. Register new user (API + DB)
2. Send OTP (API + MSG91)
3. Verify OTP (API + DB)
4. Create session (NextAuth + DB)
5. Load dashboard (API + DB)

#### **Test Flow 2: Create & Browse RFQ (4h)**
1. Login as buyer
2. Create RFQ (form → API → DB)
3. Verify in database
4. Browse RFQs (API → DB → page)
5. View RFQ detail

#### **Test Flow 3: Quote Submission (4h)**
1. Login as supplier
2. Browse RFQs
3. Submit quote (form → API → DB)
4. Verify in database
5. Buyer sees quote

#### **Test Flow 4: Payment Flow (4h)**
1. Accept quote
2. Create Razorpay order
3. Mock payment
4. Webhook triggers
5. Transaction updates

#### **Test Flow 5: N8N Automation (4h)**
1. Trigger workflow
2. Verify webhook received
3. Check email/notification sent
4. Verify database updates

#### **Additional Testing (4h)**
- Error handling
- Edge cases
- Security checks
- Performance tests

---

### **Day 14-15: Bug Fixes (16 hours)**
- Fix integration bugs
- Optimize queries
- Improve error handling
- Add validation

---

## 🛠️ **PHASE 3: PRODUCTION PREP (Week 4) - 20 Hours**

### **Day 16-17: Server Setup (10 hours)**

#### **Task 7.1: Server Configuration (3h)**
- SSH to 165.232.187.195
- Install dependencies
- Configure firewall
- Setup SSL

#### **Task 7.2: Environment Variables (2h)**
- Create production .env
- Set all secrets
- Verify configuration

#### **Task 7.3: Database Migration (3h)**
```bash
# On server
cd /root/bell24h-app
npx prisma migrate deploy
npx prisma generate
```

#### **Task 7.4: Deploy Smart Contracts (2h)**
```bash
# Deploy to Polygon testnet
npx hardhat run scripts/deploy.ts --network mumbai

# Verify contracts
npx hardhat verify --network mumbai <contract-address>
```

---

### **Day 18-19: Security & Performance (10 hours)**

#### **Task 8.1: Security Audit (4h)**
- Check SQL injection protection
- Verify auth middleware
- Test rate limiting
- Review CORS settings

#### **Task 8.2: Performance Optimization (3h)**
- Database query optimization
- Image optimization
- Code splitting
- Caching strategy

#### **Task 8.3: Monitoring Setup (3h)**
- Setup error tracking (Sentry)
- Configure logging
- Setup uptime monitoring

---

## 🚀 **PHASE 4: DEPLOYMENT (Week 5) - 10 Hours**

### **Day 20: Final Deployment**

#### **9:00 AM - Deploy Code (2h)**
```bash
# On server
cd /root/bell24h-app
git pull origin main
npm install
npm run build
docker-compose down
docker-compose up -d --build
```

#### **11:00 AM - Verify Services (1h)**
```bash
docker ps  # Check containers
docker logs bell24h-app  # Check logs
curl http://localhost:3000/api/health  # Health check
```

#### **12:00 PM - DNS & SSL (2h)**
- Configure Cloudflare DNS
- Setup SSL certificates
- Verify HTTPS works

#### **2:00 PM - Smoke Tests (2h)**
- Test registration flow
- Test RFQ creation
- Test quote submission
- Test payment flow

#### **4:00 PM - Monitor & Fix (3h)**
- Monitor error logs
- Fix any issues
- Performance check
- Load testing

---

## 📊 **DEPLOYMENT CHECKLIST**

### **Pre-Deployment ✅**
- [ ] All APIs wired to database
- [ ] All pages call APIs
- [ ] Authentication works
- [ ] OTP sending works
- [ ] Payment integration works
- [ ] N8N workflows configured
- [ ] Smart contracts deployed
- [ ] Environment variables set
- [ ] Database migrated
- [ ] SSL configured
- [ ] Error tracking setup
- [ ] Monitoring configured

### **During Deployment ✅**
- [ ] Code deployed
- [ ] Docker containers running
- [ ] Database accessible
- [ ] APIs responding
- [ ] Frontend loads
- [ ] Authentication tested
- [ ] Payment tested
- [ ] Email/SMS tested

### **Post-Deployment ✅**
- [ ] No errors in logs
- [ ] Performance acceptable
- [ ] All features working
- [ ] Backup system in place
- [ ] Rollback plan ready

---

## 💰 **RESOURCE ALLOCATION**

### **Timeline:**
```
Week 1-2:  Core Wiring           80 hours
Week 3:    Integration Testing   40 hours
Week 4:    Production Prep       20 hours
Week 5:    Deployment            10 hours
TOTAL:     150 hours (4-5 weeks)
```

### **Cost (if hiring):**
```
Developer Rate: $50-100/hour
Total Cost: $7,500 - $15,000
```

### **OR Do It Yourself:**
```
Full-time (40h/week): 4 weeks
Part-time (20h/week): 8 weeks
Evenings (10h/week): 15 weeks
```

---

## ✅ **SUCCESS CRITERIA**

### **Phase 1 Success:**
- [ ] Can create user in database
- [ ] Can send real OTP
- [ ] Can create RFQ that saves
- [ ] Can list RFQs from database
- [ ] Dashboard shows real stats
- [ ] All API calls work

### **Phase 2 Success:**
- [ ] Full user journey works
- [ ] No critical bugs
- [ ] All integrations working
- [ ] Error handling in place

### **Phase 3 Success:**
- [ ] Server configured
- [ ] Database migrated
- [ ] Smart contracts deployed
- [ ] Monitoring active

### **Phase 4 Success:**
- [ ] Site is live
- [ ] All features working
- [ ] No errors in production
- [ ] Users can sign up & use

---

## 🎯 **CONCLUSION**

### **Current Reality:**
- Files: 92-95% ✅
- Wiring: 20% ❌
- Functional: 30% ❌

### **After This Plan:**
- Files: 95% ✅
- Wiring: 100% ✅
- Functional: 95% ✅
- Deployable: YES ✅

### **Timeline:**
**START DATE:** January 6, 2025
**END DATE:** February 3, 2025
**LAUNCH DATE:** February 10, 2025

### **As CEO, I Approve This Plan ✅**

This is a REALISTIC, ACHIEVABLE plan to take the project from:
- **30% functional → 95% functional**
- **Not deployable → Production ready**
- **Mock data → Real database**

**Let's wire everything together and LAUNCH!** 🚀

---

**Plan Created:** January 4, 2025
**Approved By:** CEO/Technical Lead
**Status:** READY TO EXECUTE
**Next Step:** START PHASE 1 - DAY 1 🔧
