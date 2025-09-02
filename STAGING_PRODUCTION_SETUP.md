# 🚀 Bell24h Staging + Production Environment Setup

## 🎯 **Two-Environment Strategy**

### **Staging Environment:**
- **URL:** `https://staging-bell24h.up.railway.app`
- **Purpose:** Test features before going live
- **Database:** Separate staging database
- **Branch:** `staging` branch

### **Production Environment:**
- **URL:** `https://bell24h-production.up.railway.app`  
- **Purpose:** Live customer-facing app
- **Database:** Production database
- **Branch:** `main` branch

---

## 🔧 **Automated Setup Script**

### **Enhanced Deployment Script Features:**

```javascript
// Environment-specific deployment
const environments = {
  staging: {
    url: 'https://staging-bell24h.up.railway.app',
    branch: 'staging',
    database: 'staging_db',
    nodeEnv: 'staging'
  },
  production: {
    url: 'https://bell24h-production.up.railway.app',
    branch: 'main', 
    database: 'production_db',
    nodeEnv: 'production'
  }
};
```

### **Deployment Workflow:**

1. **Staging Deployment:**
   ```bash
   git checkout staging
   git merge main
   railway up --environment staging
   ```

2. **Production Deployment:**
   ```bash
   git checkout main
   railway up --environment production
   ```

---

## 📋 **Environment Variables**

### **Staging Environment:**
```
NODE_ENV=staging
DATABASE_URL=${{StagingPostgres.DATABASE_URL}}
JWT_SECRET=staging-jwt-secret-key-32-chars
NEXTAUTH_URL=https://staging-bell24h.up.railway.app
NEXT_PUBLIC_API_URL=https://staging-bell24h.up.railway.app
```

### **Production Environment:**
```
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=production-jwt-secret-key-32-chars
NEXTAUTH_URL=https://bell24h-production.up.railway.app
NEXT_PUBLIC_API_URL=https://bell24h-production.up.railway.app
```

---

## 🎯 **Benefits of Two-Environment Setup:**

### **For Development:**
- ✅ Test new features safely
- ✅ Verify integrations work
- ✅ Check performance before live
- ✅ Validate database migrations

### **For Business:**
- ✅ Zero downtime deployments
- ✅ Rollback capability
- ✅ A/B testing environment
- ✅ Staging demos for clients

### **For Team:**
- ✅ QA testing environment
- ✅ Client preview access
- ✅ Safe experimentation
- ✅ Continuous deployment

---

## 🚀 **Implementation Options:**

### **Option 1: Add to Current Script**
Enhance `AUTO_DEPLOY_FINAL.cjs` to support both environments:

```javascript
async function deployToEnvironment(environment) {
  if (environment === 'staging') {
    // Deploy to staging
    execSync('railway up --environment staging');
  } else {
    // Deploy to production  
    execSync('railway up --environment production');
  }
}
```

### **Option 2: Separate Scripts**
- `deploy-staging.cjs` - Deploy to staging
- `deploy-production.cjs` - Deploy to production
- `deploy-both.cjs` - Deploy to both environments

### **Option 3: Cursor Prompt Enhancement**
Add staging deployment to the Cursor prompt for automatic two-environment setup.

---

## 📊 **Railway Project Structure:**

```
Bell24h Project
├── Staging Service
│   ├── Staging Database (PostgreSQL)
│   └── Staging App (Node.js)
└── Production Service  
    ├── Production Database (PostgreSQL)
    └── Production App (Node.js)
```

---

## ✅ **Recommended Approach:**

**Add staging environment to your current deployment script** so you have:

1. **Staging:** `https://staging-bell24h.up.railway.app` (for testing)
2. **Production:** `https://bell24h-production.up.railway.app` (for live users)

This gives you the **best of both worlds** - safe testing environment + live production app!

---

## 🎯 **Next Steps:**

Would you like me to:

1. **Enhance the current script** to support both staging + production?
2. **Create separate staging deployment script**?
3. **Update the Cursor prompt** to include staging environment?

**This will give you professional-grade deployment with zero downtime!** 🚀
