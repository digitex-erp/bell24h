# 🛠️ **Cursor Prompt – Crash-Proof Feature Audit & Pending Work Tracker**

Act as a **senior enterprise software auditor & Next.js/TypeScript engineer**. Perform a **full crash-proof audit** of the Bell24h.com project. The output must provide a **complete features + backend features list**, their **status**, and confirm which features are **stable (cannot crash under load)** vs **risky (must be disabled or fixed)**.

---

## **Audit Scope:**

### **1. Frontend Features (Pages & UI)**

* List **all pages** (Home, Login, Register, RFQ, Escrow, Negotiation, Admin, CRM, Campaigns, Dynamic Pricing, Wallet, AI, Blockchain, etc.).
* For each page, create a table:

```
Page | Location (Vercel / Local) | Status (Working / Partial / Coming Soon / Broken) | Crash Risk (Low / Medium / High) | Recommendation (Keep / Fix / Disable)
```

### **2. Backend Features (APIs & Services)**

* List **all API routes** (`/api/auth/*`, `/api/payment/*`, `/api/negotiation/*`, `/api/escrow/*`, `/api/ai/*`, etc.).
* For each, create a table:

```
API Route | Functionality | Status (Live / Mock / Broken) | Dependencies (DB, Razorpay, MSG91, Blockchain, etc.) | Crash Risk | Recommendation
```

### **3. Database & Persistence**

* Check Neon.tech connection pooling and Prisma schema.
* Confirm if data persists for **Auth (OTP), Payments, Escrow, Negotiations**.
* Flag any tables/services that use **mock data**.

### **4. Deployment Audit**

* Compare **Local Disk vs Vercel Deployment**.
* Identify which features are missing from Vercel but present locally.
* Create a **sync checklist** with priority.

### **5. Security & Compliance**

* Authentication: Is Phone OTP **reliable under 1000 users**?
* Payments: Razorpay integration **real or mock**?
* Blockchain: Smart contracts deployed or mock only?
* GDPR & Multilingual: Implemented or missing?

### **6. Performance & Load Risk**

* For each API/page, classify:

  * ✅ Stable (tested, won't crash)
  * 🚧 Risky (untested, may fail under load)
  * ❌ Mock (fake, disable immediately)

### **7. Final "Crash-Proof Feature List"**

* Create a **master table** showing which features are **ready to keep live** vs **must be disabled**.

```
Feature | Type (Frontend / Backend) | Status | Crash Proof (Yes/No) | Action (Keep / Fix / Disable)
```

---

## **Deliverables Required:**

1. **Feature Inventory Matrix** (all pages, UI status)
2. **Backend API Audit Table** (with crash risk)
3. **Deployment Sync Checklist** (local vs vercel)
4. **Security & Compliance Gaps Report**
5. **Performance & Load Handling Report**
6. **Final Crash-Proof Feature List** = ✅ Stable | 🚧 Risky | ❌ Mock
7. **Top 10 Immediate Fixes** (prioritized roadmap)

---

## **Final Output Format:**

* ✅ **Ready Features** (stable, safe for users)
* 🚧 **Risky Features** (must be fixed before going live)
* ❌ **Mock/Broken Features** (disable until real)
* 🎯 **Top Priorities Before Public Launch**

---

⚡ Use this audit to give me a **complete status report + crash-proof checklist**. Do **not generalize**. Every feature/page must be explicitly listed.

---

👉 This will give you the **master report** you can use to guide **Day 2 and beyond**, ensuring no surprises when 1000 users hit the platform.
