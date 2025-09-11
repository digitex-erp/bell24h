# 🛠️ **Cursor Prompt – Comprehensive Audit Before Implementation**

Act as a **senior enterprise software auditor**. Perform a **full audit of the Bell24h.com project** (Next.js + TypeScript + APIs + Vercel deployment + Local Disk). The goal is to identify **all features**, their **current status**, and **gaps** before proceeding with further implementation.

## **Audit Scope:**

### **1. Frontend (UI/UX Pages)**
List every page available in the project (Home, Login, Register, RFQ, Escrow, Negotiation, Admin, CRM, Campaigns, etc.).

For each page, create a table:
```
Page | Location (Vercel / Local) | Status (Working / Partial / Coming Soon / Broken) | Critical Issues | Recommendation
```

### **2. Backend (APIs & Services)**
List all API routes (auth, OTP, negotiation, escrow, payments, AI, blockchain, etc.).

For each API, create a table:
```
API Route | Functionality | Status (Live / Mock / Broken) | Dependencies | Risk Level
```

### **3. Database & Integrations**
Audit Neon.tech connection pooling, Prisma schema, and ORM integration.
Check if OTP, payments, escrow, and negotiation actually persist data.
Identify mock integrations (AI, Blockchain, Analytics).

### **4. Deployment Audit (Sync Status)**
Compare **Vercel vs Local Disk vs Railway (if any)**.
Identify features/pages present locally but missing on Vercel.
Identify duplicated or outdated deployments.

### **5. Security & Compliance**
Audit authentication (Phone OTP + Email) → status, gaps, reliability.
Escrow & Wallet → check if real RazorpayX/Blockchain integration exists or if it's just UI.
GDPR, data privacy, multilingual support → mark implemented/not implemented.

### **6. Performance & Load Handling**
Check which features have **connection pooling + rate limiting**.
Identify which APIs/pages will fail under **1000 concurrent users**.
Recommend features that must be disabled until tested.

### **7. UI/UX Broken Links & Dead Ends**
Identify all "Coming Soon" or dead buttons that can crash UX.
Suggest fixes: disable, replace, or redirect.

---

## **Deliverables:**

* **Feature Inventory Matrix** (all pages + status)
* **Backend API Audit Table**
* **Deployment Sync Checklist** (local vs vercel)
* **Security & Compliance Risk Report**
* **Performance Risk Report**
* **Top 10 Critical Fixes Before Launch**

---

## **Final Report Format Example:**

1. **✅ Ready Features** (Safe to keep live)
2. **🚧 Partial Features** (Need fixes before public use)
3. **❌ Broken / Mock Features** (Disable immediately)
4. **🎯 Top Priorities (Legal + Technical)**

---

⚡ Use this audit to produce a **single comprehensive report** that I can read and directly use to plan **Day 2 and beyond**. Do NOT skip features, do NOT generalize. Every feature must be explicitly listed with location and status.

---

👉 This prompt will force Cursor to **map everything in one shot** instead of giving you generic answers like before.
