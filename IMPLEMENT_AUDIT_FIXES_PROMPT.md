# 🚀 **Cursor Prompt – Implement Audit Fixes & Deploy Stable Build**

Act as a **senior Next.js/TypeScript engineer**. Using the results from the **Crash-Proof Feature Audit**, now start coding and implementing the following tasks to make Bell24h.com fully stable and production-ready on Vercel.

---

## **Tasks to Implement Now**

### **1. Disable Mock/Broken Features**

* For every ❌ Mock or Broken feature from the audit (AI, Blockchain, Escrow UI, Negotiation, etc.):

  * Replace with `"Coming Soon"` banners or placeholder cards
  * Disable all related buttons/forms (no user should trigger them)
  * Wrap in `<ErrorBoundary>` to prevent site crashes

### **2. Fix Risky Features**

* For every 🚧 Risky feature (Phone OTP, Payment API, Admin pages, etc.):

  * Add **loading states + error handling**
  * Add **try/catch + fallback UI**
  * Add **rate limiting + timeout (10s)** to API routes
  * Ensure DB connection pooling is used

### **3. Sync Deployment (Local → Vercel)**

* Identify all pages ready in **local disk** (Admin Analytics, CRM, Campaigns, Dynamic Pricing, etc.)
* Deploy them to Vercel with correct routing
* Ensure feature flags disable unfinished features

### **4. Add Global Safety Nets**

* Add **Error Boundaries** to `_app.tsx` or `layout.tsx`
* Add **database retry logic** in `lib/db.js`
* Add **API timeout wrapper** for all API calls
* Add **user-friendly fallback error messages**

### **5. Compliance Placeholders**

* Add **GDPR cookie banner (placeholder)**
* Add **Privacy Policy & Terms links**
* Add **Language toggle (English only for now)**

---

## **Deliverables**

1. ✅ **Stable codebase** where risky features are wrapped/disabled
2. ✅ **All working features deployed on Vercel**
3. ✅ **Error boundaries & crash protection** applied everywhere
4. ✅ **Mock features hidden** (no broken links or buttons)
5. ✅ **Public site crash-proof under 1000 users**

---

## **Final Report Format**

At the end of this run, output a **Deployment Readiness Report**:

* ✅ Disabled Features (list of all mock/broken features hidden)
* 🛡️ Fixes Applied (list of error handling, API protections, DB pooling)
* 📊 Deployment Status (which pages synced to Vercel)
* ⚖️ Compliance Placeholders Added (GDPR, Privacy, Terms)
* 🎯 Site Status = **Stable, Crash-Proof, Safe for Public Users**

---

⚡ **Goal**: Produce and deploy a **stable Vercel build** where every feature is either **100% safe** or gracefully disabled, ensuring Bell24h.com won't crash when shown to global partners (India, Africa, etc.).

---

👉 Copy-paste this into Cursor now. It will **start coding, disabling risky features, fixing partial ones, and preparing a stable deployment to Vercel**.
