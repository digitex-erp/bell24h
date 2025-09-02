# CURSOR PROMPT: Audit & Safe Page Migration System

## 🎯 OBJECTIVE
Create an automated audit system to:
1. Compare localhost pages vs Vercel deployment
2. Identify missing pages/features
3. Safely migrate missing pages without overwriting
4. Generate comprehensive audit report

## 📊 STEP 1: Create Audit System

### Create: scripts/audit-pages.js
```javascript
// This script will:
// 1. Scan all pages in localhost (pages/, app/, src/)
// 2. Fetch list of routes from Vercel deployment
// 3. Compare and identify differences
// 4. Generate detailed audit report

const auditConfig = {
  localhost: {
    directories: ['app', 'pages', 'src/pages'],
    extensions: ['.tsx', '.jsx', '.js', '.ts']
  },
  vercel: {
    url: 'https://bell24h-v1.vercel.app',
    apiEndpoint: '/_next/static/chunks/pages'
  },
  output: 'audit-report-' + new Date().toISOString().split('T')[0] + '.json'
};

// Scan localhost files
async function scanLocalhost() {
  // Return array of all page routes
}

// Fetch Vercel routes
async function fetchVercelRoutes() {
  // Use sitemap.xml or _next/static analysis
}

// Compare and generate report
async function compareDeployments() {
  return {
    totalLocalPages: 0,
    totalVercelPages: 0,
    missingInVercel: [],
    missingInLocal: [],
    differentVersions: []
  };
}
```

## 📊 STEP 2: Create Comparison Dashboard

### Create: admin/audit-dashboard.html
```html
<!-- Visual dashboard showing:
- Pages in localhost: ✅/❌
- Pages in Vercel: ✅/❌  
- Differences highlighted
- One-click migration buttons
- Backup status
-->
```

## 🔄 STEP 3: Safe Migration Script

### Create: scripts/migrate-missing-pages.js
```javascript
// Safely migrate pages missing in Vercel
const migrationRules = {
  // NEVER overwrite existing pages
  skipExisting: true,
  
  // Create backup before migration
  backupFirst: true,
  
  // Test pages before migration
  runTests: true,
  
  // Migrate to staging first
  targetEnvironment: 'staging',
  
  // Only migrate after confirmation
  requireConfirmation: true
};

async function migratePage(pagePath) {
  // 1. Check if page exists in Vercel
  // 2. If not, copy from localhost
  // 3. Preserve all dependencies
  // 4. Update routing
  // 5. Test page works
  // 6. Add to git
}
```

## 📋 STEP 4: Generate Audit Reports

### Create: scripts/generate-audit-report.js
Output three reports:

1. **pages-audit.md** - Human-readable summary
2. **pages-audit.json** - Machine-readable data
3. **pages-audit.html** - Visual dashboard

### Report Structure:
```markdown
# Bell24h Pages Audit Report
Generated: [Date]

## Summary
- Total Pages in Localhost: 165
- Total Pages in Vercel: 150
- Missing in Vercel: 15
- Need Update: 8

## Missing Pages (Not in Vercel)
1. /admin/dashboard ❌
2. /api/v2/webhooks ❌
3. /marketing/campaigns ❌
[... list all]

## Action Plan
- [ ] Backup current Vercel
- [ ] Migrate missing pages to staging
- [ ] Test all pages
- [ ] Deploy to production
```

## 🛠️ STEP 5: Implementation Commands

Add to package.json:
```json
{
  "scripts": {
    "audit": "node scripts/audit-pages.js",
    "audit:visual": "open admin/audit-dashboard.html",
    "migrate:missing": "node scripts/migrate-missing-pages.js",
    "migrate:test": "npm run migrate:missing -- --dry-run",
    "compare": "npm run audit && npm run audit:visual"
  }
}
```

## ✅ STEP 6: Validation Checklist

Before migrating any page:
- [ ] Is page missing in Vercel? (not overwriting)
- [ ] All dependencies available?
- [ ] UI theme matches production?
- [ ] API endpoints working?
- [ ] Mobile responsive?
- [ ] SEO meta tags present?
- [ ] Performance acceptable?

## 🚀 EXECUTION SEQUENCE

1. **Run Audit:**
   ```bash
   npm run audit
   ```

2. **Review Report:**
   ```bash
   npm run audit:visual
   ```

3. **Test Migration (Dry Run):**
   ```bash
   npm run migrate:test
   ```

4. **Migrate to Staging:**
   ```bash
   npm run migrate:missing -- --env=staging
   ```

5. **Verify Staging:**
   ```bash
   open https://staging.bell24h.railway.app
   ```

6. **Deploy to Production:**
   ```bash
   npm run migrate:missing -- --env=production
   ```

## 🔐 SAFETY RULES

1. NEVER run migration without audit first
2. ALWAYS backup before migration
3. TEST in staging before production
4. PRESERVE existing Vercel pages
5. MAINTAIN UI consistency
6. KEEP rollback plan ready

## 📊 Expected Output

After running audit:
```
✅ Audit Complete!

Localhost Pages: 165
Vercel Pages: 150
Missing in Vercel: 15
Ready to Migrate: 15

Missing Pages:
- /admin/dashboard
- /admin/marketing  
- /api/admin/campaigns
- /marketing/generator
[... etc]

Run 'npm run migrate:missing' to safely add missing pages.
```

## 🎯 **WHAT THIS ACCOMPLISHES:**

1. **Complete visibility** of what's in localhost vs Vercel
2. **Safe migration** of missing pages without overwriting
3. **Visual dashboard** to track progress
4. **Automated testing** before deployment
5. **Backup protection** at every step

## ✅ **YOUR NEXT ACTIONS:**

1. **Copy the Cursor prompt above**
2. **Let Cursor create the audit system**
3. **Run the audit to see missing pages**
4. **Migrate missing pages to staging first**
5. **Test thoroughly before production**

This approach ensures you **never lose work** and can **safely merge** all your localhost development into the live site.
