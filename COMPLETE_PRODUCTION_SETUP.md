# 🚀 COMPLETE PRODUCTION SETUP GUIDE
## Bell24h - All Missing Configurations

**Total Setup Time**: ~2 hours  
**Status**: Ready to implement  
**Priority**: High

---

## 📋 **WHAT'S MISSING & SOLUTIONS**

### 1. **Environment Variables** (30 minutes) ✅
### 2. **API Key Configuration** (15 minutes) ✅  
### 3. **Database Deployment** (15 minutes) ⏳
### 4. **Domain DNS Setup** (30 minutes) ⏳
### 5. **n8n Workflow Server** (45 minutes) ⏳

---

## 🤖 **N8N WORKFLOW AUTOMATION SETUP**

### **What n8n Does in Bell24h:**
- **Multi-channel marketing** (Facebook, Instagram, Twitter, LinkedIn, Email)
- **RFQ notifications** to suppliers
- **Escrow release notifications** to buyers
- **User onboarding** workflows
- **Analytics logging** and reporting
- **Campaign automation** for marketing

### **n8n Workflows Found:**
1. **`bell24h-integration.workflow.json`** - Main integration workflow
2. **`rfq.workflow.json`** - RFQ processing automation
3. **`user.onboarding.workflow.json`** - User registration flows

---

## 🔧 **STEP-BY-STEP SETUP**

### **Phase 1: Environment Configuration** (30 minutes)

#### **1.1 Create .env.local**
```bash
# Bell24h Local Development Environment Variables

# Database Configuration
DATABASE_URL="file:./prisma/dev.db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="bell24h-nextauth-secret-key-2024-development-32-chars"

# JWT Configuration
JWT_SECRET="bell24h-jwt-secret-key-2024-development-32-chars"

# AI Integration Keys
OPENAI_API_KEY="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"
NANO_BANANA_API_KEY="AIzaSyC-XH19RV9PgHAgTmduVcEd2IeMz8iwvac"

# n8n Workflow Automation
N8N_WEBHOOK_URL="http://localhost:5678/webhook/bell24h"
N8N_API_URL="http://localhost:5678/api"
N8N_USER_EMAIL="admin@bell24h.com"
N8N_USER_PASSWORD="bell24h-n8n-2024"

# Payment Gateway (Development)
RAZORPAY_KEY_ID="rzp_test_your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-secret-key"
STRIPE_PUBLIC_KEY="pk_test_your-stripe-public-key"
STRIPE_SECRET_KEY="sk_test_your-stripe-secret-key"

# Development Flags
NODE_ENV="development"
NEXT_PUBLIC_DEBUG="true"
NEXT_PUBLIC_ENABLE_AI_FEATURES="true"
NEXT_PUBLIC_ENABLE_VOICE_RFQ="true"
NEXT_PUBLIC_ENABLE_N8N_AUTOMATION="true"
```

#### **1.2 Create .env.production**
```bash
# Bell24h Production Environment Variables

# Database Configuration
DATABASE_URL="postgresql://username:password@host:5432/bell24h_prod"

# NextAuth Configuration
NEXTAUTH_URL="https://www.bell24h.com"
NEXTAUTH_SECRET="your-production-nextauth-secret-32-chars"

# JWT Configuration
JWT_SECRET="your-production-jwt-secret-32-chars"

# AI Integration Keys
OPENAI_API_KEY="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"
NANO_BANANA_API_KEY="AIzaSyC-XH19RV9PgHAgTmduVcEd2IeMz8iwvac"

# n8n Workflow Automation
N8N_WEBHOOK_URL="https://n8n.bell24h.com/webhook/bell24h"
N8N_API_URL="https://n8n.bell24h.com/api"

# Payment Gateway (Production)
RAZORPAY_KEY_ID="rzp_live_your-production-key-id"
RAZORPAY_KEY_SECRET="your-production-razorpay-secret"
STRIPE_PUBLIC_KEY="pk_live_your-production-stripe-key"
STRIPE_SECRET_KEY="sk_live_your-production-stripe-secret"

# Production Flags
NODE_ENV="production"
NEXT_PUBLIC_DEBUG="false"
NEXT_PUBLIC_ENABLE_AI_FEATURES="true"
NEXT_PUBLIC_ENABLE_VOICE_RFQ="true"
NEXT_PUBLIC_ENABLE_N8N_AUTOMATION="true"
```

### **Phase 2: Database Deployment** (15 minutes)

#### **2.1 Install Prisma CLI**
```bash
npm install -g prisma
```

#### **2.2 Generate Prisma Client**
```bash
npx prisma generate
```

#### **2.3 Run Database Migrations**
```bash
# For development
npx prisma db push

# For production
npx prisma migrate deploy
```

#### **2.4 Seed Database (Optional)**
```bash
npx prisma db seed
```

### **Phase 3: n8n Server Setup** (45 minutes)

#### **3.1 Install n8n**
```bash
# Global installation
npm install -g n8n

# Or local installation
npm install n8n
```

#### **3.2 Create n8n Configuration**
```bash
# Create n8n directory
mkdir n8n-server
cd n8n-server

# Initialize n8n
n8n init
```

#### **3.3 Configure n8n Environment**
Create `n8n-server/.env`:
```bash
# n8n Configuration
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin@bell24h.com
N8N_BASIC_AUTH_PASSWORD=bell24h-n8n-2024

# Database
DB_TYPE=sqlite
DB_SQLITE_DATABASE=./n8n.db

# Webhook URL
WEBHOOK_URL=http://localhost:5678

# API
N8N_API_ENABLED=true
N8N_API_ENDPOINT_REST=rest
N8N_API_ENDPOINT_WEBHOOK=webhook
```

#### **3.4 Start n8n Server**
```bash
# Start n8n
n8n start

# Or with PM2 for production
pm2 start n8n --name "bell24h-n8n"
```

#### **3.5 Import Bell24h Workflows**
1. Open n8n at `http://localhost:5678`
2. Login with admin credentials
3. Import workflows from `n8n/workflows/` directory
4. Configure webhook URLs
5. Test workflows

### **Phase 4: Domain DNS Configuration** (30 minutes)

#### **4.1 Vercel Domain Setup**
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings > Domains
4. Add `bell24h.com` and `www.bell24h.com`
5. Configure DNS records

#### **4.2 DNS Records Required**
```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME
Name: www
Value: cname.vercel-dns.com

Type: CNAME
Name: n8n
Value: cname.vercel-dns.com
```

#### **4.3 SSL Certificate**
- Automatically handled by Vercel
- Force HTTPS redirect
- Update NEXTAUTH_URL to https://

### **Phase 5: Testing & Verification** (30 minutes)

#### **5.1 Test Database Connection**
```bash
npx prisma db pull
npx prisma studio
```

#### **5.2 Test AI Integrations**
```bash
node test-ai-keys.js
```

#### **5.3 Test n8n Webhooks**
```bash
curl -X POST http://localhost:5678/webhook/bell24h \
  -H "Content-Type: application/json" \
  -d '{"event":"test","data":{"message":"Hello Bell24h"}}'
```

#### **5.4 Test Payment Integration**
```bash
# Test Razorpay
curl -X POST http://localhost:3000/api/payments/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount":1000,"currency":"INR"}'
```

---

## 🚀 **QUICK START COMMANDS**

### **Development Setup (5 minutes)**
```bash
# 1. Create environment file
cp env.local.example .env.local

# 2. Install dependencies
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Start database
npx prisma db push

# 5. Start n8n server
n8n start

# 6. Start Bell24h app
npm run dev
```

### **Production Deployment (15 minutes)**
```bash
# 1. Set environment variables in Vercel
# 2. Deploy database
npx prisma migrate deploy

# 3. Deploy n8n server
pm2 start n8n --name "bell24h-n8n"

# 4. Deploy Bell24h
vercel --prod
```

---

## 📊 **VERIFICATION CHECKLIST**

### **✅ Environment Variables**
- [ ] .env.local created
- [ ] .env.production created
- [ ] All API keys configured
- [ ] Database URL set

### **✅ Database**
- [ ] Prisma client generated
- [ ] Migrations run successfully
- [ ] Database accessible
- [ ] Tables created

### **✅ n8n Server**
- [ ] n8n installed and running
- [ ] Webhooks accessible
- [ ] Workflows imported
- [ ] Authentication working

### **✅ Domain & DNS**
- [ ] Domain added to Vercel
- [ ] DNS records configured
- [ ] SSL certificate active
- [ ] HTTPS redirect working

### **✅ AI Integrations**
- [ ] OpenAI API working
- [ ] Nano Banana API working
- [ ] Voice processing functional
- [ ] Content generation working

### **✅ Payment Integration**
- [ ] Razorpay configured
- [ ] Stripe configured
- [ ] Test payments working
- [ ] Webhooks configured

---

## 🎯 **EXPECTED RESULTS**

After completing this setup:

1. **Bell24h app** running at `http://localhost:3000`
2. **n8n server** running at `http://localhost:5678`
3. **Database** accessible with all tables
4. **AI features** fully functional
5. **Payment processing** working
6. **Workflow automation** active
7. **Production deployment** ready

---

## 🆘 **TROUBLESHOOTING**

### **If n8n won't start:**
- Check port 5678 is available
- Verify environment variables
- Check database connection

### **If database fails:**
- Verify DATABASE_URL format
- Check Prisma schema
- Run migrations manually

### **If AI integrations fail:**
- Verify API keys are valid
- Check rate limits
- Test with curl commands

---

**🎉 Total setup time: ~2 hours for complete production-ready system!**
