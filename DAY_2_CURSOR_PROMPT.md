# 🚀 **Cursor Prompt – Day 2: Post-Audit Fixes & Robustness**

Act as a **senior Next.js/TypeScript engineer**. Based on the **comprehensive audit findings from Day 1**, complete **Day 2 tasks** for Bell24h.com.

## **Primary Objective:**

Fix all **critical audit issues** that can crash the site or confuse users. Ensure every feature that appears on Vercel is either **fully functional** or **disabled gracefully**.

---

## **Day 2 Tasks**

### **1. Feature Scrutiny & Safe Mode**

* Review **audit Feature Matrix** results.
* For each **❌ Broken / Mock feature** (AI, Blockchain, Escrow, Dynamic Pricing):
  * Hide/disable them on Vercel OR replace with "Coming Soon" banners.
  * Prevent crashes by adding **error boundaries + null checks**.

### **2. Button & Form Functionality Audit**

* Test every button across:
  * `/admin/analytics`, `/marketing/campaigns`, `/crm/leads`
  * `/auth/*`, `/services/*`
* Fix non-functional buttons.
* Ensure all forms submit correctly (or are disabled if incomplete).

### **3. Authentication Load Reliability**

* Test **Phone OTP flow** with mock load (10–20 users).
* Fix race conditions, error handling, and expired OTP cases.
* Ensure **email verification fallback** works properly.

### **4. Admin Dashboard Completion**

* Finalize analytics, leads, and campaigns dashboards.
* Connect to database with error-safe queries.
* Add loading + error states so incomplete data doesn't break UI.

### **5. Compliance & UX Baseline**

* Add placeholder GDPR banner ("Cookie Policy – Coming Soon").
* Add multilingual placeholder toggle (English-only working).
* Ensure **mobile responsiveness** for homepage + auth pages.

---

## **Deliverables for Day 2**

1. ✅ **Broken/Mock features disabled or hidden**
2. ✅ **All buttons functional across admin & service pages**
3. ✅ **Phone OTP tested under mock load**
4. ✅ **Admin dashboards stable & error-proof**
5. ✅ **Compliance placeholders visible (GDPR + i18n)**
6. ✅ **Day 2 Completion Report**

---

## **Final Report Format (Output Expected)**

1. **✅ Completed Fixes** (list of pages/features updated)
2. **🚧 Issues Remaining** (features still pending real backend)
3. **📊 Phone OTP Load Test Results** (pass/fail + error logs)
4. **🎯 Ready for Day 3** (next tasks)

---

⚡ This prompt ensures that Day 2 is **not about adding new features**, but **making your existing deployment stable and crash-proof** — exactly what your software engineer friend warned about.
