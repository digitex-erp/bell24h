# 📌 Bell24x Admin Command Center - Complete Cursor Prompt

Copy-paste this into Cursor to create the ultimate Admin control hub:

---

**PROMPT START**

You are enhancing the **Bell24x B2B Marketplace Admin Panel** to create a **complete command center** that tracks and controls everything from one place.

## 🎯 Goal: Build a **Comprehensive Admin Command Center** with 6 main tabs

### **Admin Panel Structure:**
```
Admin Dashboard
├── 📊 Dashboard (Overview)
├── 👥 Users (Existing)
├── 📦 Products (Existing)
├── 💰 Wallet (Existing)
├── 💳 Transactions (NEW - Escrow + Wallet Tracking)
├── 📢 Marketing Dashboard (NEW - AI Campaigns)
├── 🎬 UGC Showcase (NEW - User Content)
├── 📈 Subscriptions (NEW - Pricing Tiers)
├── 🗺️ Roadmap (NEW - 369-Day Business Plan)
└── 📚 Docs (NEW - Policies & Instructions)
```

---

## 🆕 **NEW ADMIN TABS TO BUILD**

### **1. 💳 Transactions Tab (Escrow + Wallet Tracking)**

**Features:**
- **Transaction List View:**
  - Transaction ID
  - Buyer Name / Company
  - Seller Name / Company
  - Product/Service
  - Value (₹)
  - Payment Method (Wallet/Escrow)
  - Status: Pending / Escrow / Released / Refunded
  - Date Created
  - Actions (View Details / Release / Refund)

- **Escrow Management:**
  - Escrow requests (₹5L+ deals) → show as **"Pending Razorpay Approval"**
  - Admin alert when escrow is triggered
  - Manual escrow release controls
  - Escrow policy compliance checker

- **Wallet Integration:**
  - Real-time wallet balances
  - Transaction history
  - Withdrawal requests
  - Commission tracking

- **Filters & Search:**
  - Filter by status, amount range, date
  - Search by transaction ID, buyer, seller
  - Export to Excel/PDF

### **2. 📢 Marketing Dashboard Tab (AI Campaigns)**

**Features:**
- **Campaign Generator (Nano Banana API):**
  - Product Name input
  - Product Description input
  - Target Market dropdown (India, UAE, USA, Europe)
  - Channels checkboxes (LinkedIn, WhatsApp, Email, Twitter, YouTube)
  - Generate Campaign button
  - Preview generated content

- **Campaign Management:**
  - Campaign History table
  - Status: Draft / Approved / Published / Failed
  - Agent assignment
  - Approval workflow
  - Launch button (sends to n8n webhook)

- **Campaign Analytics:**
  - Total campaigns generated
  - Channels used breakdown
  - Engagement metrics (from n8n API)
  - Performance by supplier
  - ROI tracking

- **Agent Workflow:**
  - Agent login access
  - Assigned campaigns view
  - Approve/Edit/Launch controls
  - Performance tracking

### **3. 🎬 UGC Showcase Tab (User-Generated Content)**

**Features:**
- **Content Management:**
  - Photo uploads gallery
  - Video uploads list
  - Voice notes collection
  - Status: Draft / Approved / Published / Blocked

- **Content Review:**
  - Preview before publishing
  - Quality assessment
  - Admin approval/rejection
  - Bulk actions (approve all, reject all)

- **AI Content Conversion:**
  - Auto-convert uploads to posts (via Nano Banana + n8n)
  - Supplier showcase feed
  - Content performance metrics

- **Moderation Tools:**
  - Report inappropriate content
  - Block/report functionality
  - Content guidelines display

### **4. 📈 Subscriptions Tab (Pricing Tiers)**

**Features:**
- **User Tiers Overview:**
  - Free users count
  - Pro users count
  - Pro+Marketing users count
  - Enterprise users count

- **Revenue Dashboard:**
  - Monthly Recurring Revenue (MRR)
  - Churn rate tracking
  - Revenue by tier
  - Growth metrics

- **Subscription Management:**
  - User tier changes
  - Payment status tracking
  - Billing history
  - Upgrade/downgrade controls

- **Reports & Analytics:**
  - Revenue reports (Excel/PDF export)
  - User growth charts
  - Churn analysis
  - Forecasting

### **5. 🗺️ Roadmap Tab (369-Day Business Plan)**

**Features:**
- **Milestone Tracker:**
  - Month 1: Free Supplier Onboarding (Target: 5,000)
  - Month 2: Wallet Adoption (Target: 100 paid suppliers)
  - Month 3: AI Marketing Campaigns Live
  - Month 6: Razorpay Escrow Activation
  - Month 12: Target ₹100 CR pipeline

- **Progress Visualization:**
  - Progress bars for each milestone
  - Overall completion percentage
  - Target vs Actual metrics
  - Timeline view

- **Milestone Management:**
  - Check off completed milestones
  - Add notes/updates
  - Set new targets
  - Track KPIs

- **Business Metrics:**
  - Revenue pipeline tracking
  - User acquisition metrics
  - Feature adoption rates
  - Market penetration

### **6. 📚 Docs Tab (Policies & Instructions)**

**Features:**
- **Document Management:**
  - escrow-policy.md
  - compliance-notes.md
  - deployment-instructions.md
  - user-guides.md
  - api-documentation.md

- **Document Viewer:**
  - Markdown renderer
  - Search functionality
  - Version control
  - Download/export options

- **Quick Access:**
  - Frequently used docs
  - Recent updates
  - Document categories
  - Share links

---

## 🔧 **TECHNICAL IMPLEMENTATION**

### **Database Schema Updates:**
```sql
-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY,
  buyer_id UUID REFERENCES users(id),
  seller_id UUID REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  amount DECIMAL(10,2),
  payment_method VARCHAR(20), -- 'wallet' or 'escrow'
  status VARCHAR(20), -- 'pending', 'escrow', 'released', 'refunded'
  escrow_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY,
  supplier_id UUID REFERENCES users(id),
  agent_id UUID REFERENCES users(id),
  product_name VARCHAR(255),
  target_market VARCHAR(50),
  channels JSON, -- ['linkedin', 'whatsapp', 'email']
  generated_content JSON,
  status VARCHAR(20), -- 'draft', 'approved', 'published', 'failed'
  engagement_metrics JSON,
  created_at TIMESTAMP DEFAULT NOW()
);

-- UGC Content table
CREATE TABLE ugc_content (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  content_type VARCHAR(20), -- 'photo', 'video', 'voice'
  file_path VARCHAR(500),
  status VARCHAR(20), -- 'draft', 'approved', 'published', 'blocked'
  ai_converted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  tier VARCHAR(20), -- 'free', 'pro', 'pro_marketing', 'enterprise'
  status VARCHAR(20), -- 'active', 'cancelled', 'expired'
  mrr DECIMAL(10,2),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Roadmap Milestones table
CREATE TABLE roadmap_milestones (
  id UUID PRIMARY KEY,
  month_number INTEGER,
  title VARCHAR(255),
  description TEXT,
  target_value DECIMAL(15,2),
  actual_value DECIMAL(15,2),
  completed BOOLEAN DEFAULT FALSE,
  completion_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **API Endpoints:**
```javascript
// Transactions API
GET /api/admin/transactions
POST /api/admin/transactions/:id/release
POST /api/admin/transactions/:id/refund

// Campaigns API
GET /api/admin/campaigns
POST /api/admin/campaigns/generate
POST /api/admin/campaigns/:id/approve
POST /api/admin/campaigns/:id/launch

// UGC API
GET /api/admin/ugc
POST /api/admin/ugc/:id/approve
POST /api/admin/ugc/:id/reject

// Subscriptions API
GET /api/admin/subscriptions
GET /api/admin/subscriptions/analytics
POST /api/admin/subscriptions/:id/upgrade

// Roadmap API
GET /api/admin/roadmap
PUT /api/admin/roadmap/:id/complete
GET /api/admin/roadmap/progress
```

---

## 🎨 **UI/UX REQUIREMENTS**

### **Design System:**
- **Color Scheme:** Professional blue/gray palette
- **Layout:** Sidebar navigation with main content area
- **Components:** Reusable data tables, charts, forms
- **Responsive:** Mobile-friendly admin interface

### **Key UI Components:**
- **Data Tables:** Sortable, filterable, paginated
- **Charts:** Revenue graphs, progress bars, pie charts
- **Modals:** Quick actions, confirmations
- **Alerts:** Success/error notifications
- **Export Buttons:** Excel/PDF download options

---

## 🔗 **INTEGRATIONS**

### **External APIs:**
- **Nano Banana API:** Content generation
- **n8n Webhook:** Campaign publishing
- **Razorpay API:** Escrow management
- **Railway API:** Deployment status

### **File Storage:**
- **UGC Files:** Cloud storage for photos/videos
- **Documents:** Markdown files in repository
- **Exports:** Generated reports storage

---

## 📊 **ADMIN DASHBOARD OVERVIEW**

### **Main Dashboard Widgets:**
- **Revenue Summary:** MRR, growth %, churn rate
- **User Metrics:** Total users, new signups, active users
- **Transaction Summary:** Total volume, escrow requests, wallet usage
- **Campaign Performance:** Active campaigns, engagement rates
- **Roadmap Progress:** Overall completion %, next milestones
- **System Health:** API status, deployment status, uptime

---

## ✅ **DELIVERABLES FROM CURSOR**

1. **Complete Admin Panel** with 6 new tabs
2. **Database schema** for all new features
3. **API endpoints** for all admin functions
4. **UI components** for data management
5. **Integration setup** with external APIs
6. **Documentation** for all new features

---

## 🚀 **DEPLOYMENT**

- Deploy to **Staging Environment** first
- Test all admin functions
- Verify integrations work
- Deploy to **Production** after testing
- Keep rollback protection active

---

**PROMPT END**

---

## 🎯 **RESULT: Complete Admin Command Center**

After implementing this prompt, your Bell24x Admin Panel will be a **complete command center** where you can:

✅ **Track all transactions** (wallet + escrow)  
✅ **Manage AI marketing campaigns**  
✅ **Review and approve UGC content**  
✅ **Monitor subscription tiers and revenue**  
✅ **Track 369-day business roadmap progress**  
✅ **Access all policies and documentation**  

**One Admin Panel = Complete Business Control** 🔥

---

*This creates the ultimate founder control hub for Bell24x!*
