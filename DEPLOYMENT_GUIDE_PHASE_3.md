# 🚀 DEPLOYMENT GUIDE: Phase 3 - Database Schema & Agent Authentication

## 🎯 **READY FOR DEPLOYMENT** ✅

Your Bell24h application now has a complete database schema with Campaign and Agent models, plus a full authentication system. Here's how to deploy it safely to production.

---

## 📋 **PRE-DEPLOYMENT CHECKLIST**

### **✅ Environment Variables**
Make sure these are set in your Railway environment:
```bash
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-here
NEXTAUTH_SECRET=your-nextauth-secret-here
NEXTAUTH_URL=https://your-domain.com
```

### **✅ Dependencies Installed**
All required packages are already in `package.json`:
- `@prisma/client` - Database client
- `prisma` - Database toolkit
- `jose` - JWT handling
- `bcryptjs` - Password hashing
- `nanoid` - Unique ID generation

---

## 🚀 **DEPLOYMENT STEPS**

### **Step 1: Deploy to Railway**
```bash
# Deploy to production
railway up --environment production

# Or if using Railway CLI
railway deploy
```

### **Step 2: Run Database Migration**
After deployment, run the migration:
```bash
# Connect to your Railway environment
railway shell

# Run the migration
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### **Step 3: Seed Database (Optional)**
```bash
# Seed with sample data
npx prisma db seed
```

### **Step 4: Verify Deployment**
```bash
# Test database connection
curl https://your-domain.com/api/health

# Test campaign API
curl https://your-domain.com/api/campaigns

# Test agent authentication
curl -X POST https://your-domain.com/api/auth/agent/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bell24h.com","password":"admin123"}'
```

---

## 🔐 **AGENT AUTHENTICATION SETUP**

### **Create First Admin Agent**
```bash
# Register admin agent
curl -X POST https://your-domain.com/api/auth/agent/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@bell24h.com",
    "password": "secure-password-123",
    "role": "ADMIN"
  }'
```

### **Login and Get Token**
```bash
# Login
curl -X POST https://your-domain.com/api/auth/agent/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bell24h.com",
    "password": "secure-password-123"
  }'
```

### **Use Token for API Calls**
```bash
# Create campaign with authentication
curl -X POST https://your-domain.com/api/campaigns \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "supplierId": "supplier-123",
    "productName": "Test Product",
    "description": "Test campaign description",
    "targetMarket": "Global",
    "channels": ["email", "social"],
    "content": "Campaign content here"
  }'
```

---

## 🗄️ **DATABASE SCHEMA OVERVIEW**

### **Tables Created**
- `Campaign` - Marketing campaigns
- `Agent` - System agents/users
- `CampaignEvent` - Campaign tracking events
- `AgentSession` - Agent login sessions

### **Key Features**
- **Foreign Key Relationships** - Proper data integrity
- **Unique Constraints** - Email uniqueness, token uniqueness
- **Indexes** - Optimized for performance
- **Timestamps** - Created/updated tracking

---

## 📊 **API ENDPOINTS AVAILABLE**

### **Campaign Management**
```
GET    /api/campaigns           - List all campaigns
POST   /api/campaigns           - Create new campaign
GET    /api/campaigns/[id]      - Get specific campaign
PUT    /api/campaigns/[id]      - Update campaign
DELETE /api/campaigns/[id]      - Delete campaign
```

### **Agent Authentication**
```
POST   /api/auth/agent/register - Register new agent
POST   /api/auth/agent/login    - Login agent
GET    /api/auth/agent/verify   - Verify JWT token
GET    /api/auth/session        - Get current session
POST   /api/auth/logout         - Logout agent
```

---

## 🛡️ **SECURITY FEATURES**

### **Authentication**
- ✅ **JWT Tokens** - Secure, stateless authentication
- ✅ **Password Hashing** - bcryptjs with salt rounds
- ✅ **Session Management** - Database-tracked sessions
- ✅ **Token Expiration** - 7-day token lifetime

### **Authorization**
- ✅ **Role-Based Access** - AGENT, ADMIN, USER roles
- ✅ **Protected Routes** - Authentication required
- ✅ **Input Validation** - Comprehensive data validation
- ✅ **Error Handling** - Secure error responses

---

## 🔍 **TESTING YOUR DEPLOYMENT**

### **1. Database Connection**
Visit: `https://your-domain.com/api/health`
Expected: `{"status":"healthy","database":"connected"}`

### **2. Campaign API**
Visit: `https://your-domain.com/api/campaigns`
Expected: `[]` (empty array initially)

### **3. Agent Registration**
```bash
curl -X POST https://your-domain.com/api/auth/agent/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Agent","email":"test@example.com","password":"test123"}'
```

### **4. Marketing Dashboard**
Visit: `https://your-domain.com/admin`
Expected: Marketing Dashboard with database integration

---

## 🚨 **TROUBLESHOOTING**

### **Database Connection Issues**
```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Test connection
npx prisma db pull
```

### **Migration Issues**
```bash
# Reset database (DANGER: deletes all data)
npx prisma migrate reset

# Force migration
npx prisma migrate deploy --force
```

### **JWT Issues**
```bash
# Check JWT_SECRET is set
echo $JWT_SECRET

# Verify token format
# Tokens should be: header.payload.signature
```

---

## 📈 **MONITORING & MAINTENANCE**

### **Database Monitoring**
- Monitor connection pool usage
- Track query performance
- Watch for migration issues

### **Authentication Monitoring**
- Track login attempts
- Monitor token usage
- Watch for security issues

### **API Monitoring**
- Track response times
- Monitor error rates
- Watch for rate limiting

---

## 🎉 **SUCCESS INDICATORS**

### **✅ Deployment Successful When:**
- [ ] Database migration completed without errors
- [ ] All API endpoints responding correctly
- [ ] Agent authentication working
- [ ] Marketing Dashboard loading with database data
- [ ] Campaign creation/retrieval working
- [ ] JWT tokens being generated and validated

### **✅ Production Ready When:**
- [ ] All environment variables set
- [ ] Database backups configured
- [ ] Monitoring alerts set up
- [ ] Error logging configured
- [ ] Performance metrics tracked

---

## 🚀 **NEXT STEPS AFTER DEPLOYMENT**

### **Phase 4: Agent Onboarding**
1. Create admin agent account
2. Set up agent permissions
3. Test campaign creation workflow
4. Validate end-to-end functionality

### **Phase 5: Production Optimization**
1. Set up database monitoring
2. Configure error tracking
3. Implement rate limiting
4. Add performance monitoring

---

## 📞 **SUPPORT & ROLLBACK**

### **If Issues Occur:**
1. **Check Railway logs**: `railway logs`
2. **Verify environment variables**: `railway variables`
3. **Test database connection**: `railway shell` → `npx prisma db pull`
4. **Rollback if needed**: `railway rollback`

### **Emergency Rollback:**
```bash
# Rollback to previous deployment
railway rollback

# Or redeploy previous version
git checkout previous-commit
railway deploy
```

---

## 🎯 **FINAL STATUS**

### **✅ PHASE 3 COMPLETE**
- Database schema implemented
- Agent authentication ready
- API endpoints functional
- Marketing Dashboard integrated
- Production deployment ready

### **🚀 READY FOR PHASE 4**
- Agent onboarding
- Production optimization
- Performance monitoring
- Advanced features

---

*Deployment Guide Generated: ${new Date().toLocaleString()}*
*Phase 3 Status: COMPLETE ✅*
*Next Phase: Production Deployment & Agent Onboarding*
