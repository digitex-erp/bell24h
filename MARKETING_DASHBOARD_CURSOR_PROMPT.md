# 📢 Bell24h Marketing Dashboard - Cursor Prompt

Copy-paste this into Cursor to add the AI-powered marketing dashboard to your admin panel:

---

**PROMPT START**

# Task: Add Marketing Dashboard to Bell24h Admin Panel

## Context
- Project: Bell24h B2B Marketplace (deployment protection active)
- Location: C:\Users\Sanika\Projects\bell24h
- Protection: Deployment protection is active - DO NOT modify protected files

## Requirements

### 1. Create Feature Branch First
```bash
git checkout -b feature/marketing-dashboard
```

### 2. Add Marketing Dashboard Tab
**Path:** `app/admin/marketing/page.tsx`

Create a new admin route with:
- Campaign generator form (Product name, description, target market)
- Content preview panels (LinkedIn, WhatsApp, Email)
- Approval workflow buttons
- Campaign status tracker

### 3. Database Schema Update
**Path:** `prisma/schema.prisma`

Add these models:
```prisma
model MarketingCampaign {
  id              String   @id @default(cuid())
  supplierId      String
  productName     String
  targetMarket    String
  channels        String[]
  linkedinPost    String?
  emailContent    String?
  whatsappMessage String?
  status          CampaignStatus @default(DRAFT)
  createdAt       DateTime @default(now())
  approvedBy      String?
  publishedAt     DateTime?
}

enum CampaignStatus {
  DRAFT
  APPROVED
  PUBLISHED
}
```

### 4. API Endpoints
**Create:** `pages/api/admin/marketing/`

- `POST /generate` - Mock Nano Banana API integration
- `POST /approve` - Update campaign status
- `POST /publish` - Send to n8n webhook
- `GET /campaigns` - List all campaigns

### 5. Mock Integrations
For now, create mock functions:
```javascript
// Mock Nano Banana API
async function generateContent(product, market) {
  return {
    linkedin: `Introducing ${product} - perfect for ${market} market...`,
    email: `Dear Partner, We're excited to present ${product}...`,
    whatsapp: `*${product}* - Now available for ${market} businesses!`
  };
}

// Mock n8n webhook
async function publishCampaign(campaignData) {
  console.log('Would send to n8n:', campaignData);
  return { success: true, mockResponse: true };
}
```

### 6. UI Components
Use existing Tailwind classes. Create:
- CampaignGenerator component
- ContentPreview component  
- CampaignList table
- ApprovalWorkflow component

### 7. Testing Before Merge
- Run build: `npm run build`
- Test locally: `npm run dev`
- Run protection verify: `npm run verify`

### 8. Safe Merge to Main
```bash
git add .
git commit -m "feat: Add marketing dashboard to admin panel"
git checkout main
git merge feature/marketing-dashboard
git push origin main
```

## Important Notes
- DO NOT modify: `next.config.js`, `railway.json`, `package-lock.json`
- DO NOT delete: `.next/`, `node_modules/`
- KEEP all existing protection files intact
- TEST thoroughly before merging to main

**PROMPT END**

---

## 🎯 **Marketing Dashboard Features:**

### **Campaign Generator:**
- Product name input
- Product description textarea
- Target market dropdown (India, UAE, USA, Europe)
- Channel selection (LinkedIn, WhatsApp, Email)
- Generate button

### **Content Preview:**
- LinkedIn post preview
- Email content preview
- WhatsApp message preview
- Edit capabilities

### **Approval Workflow:**
- Draft → Approved → Published status
- Admin approval buttons
- Agent assignment
- Publish to n8n webhook

### **Campaign Management:**
- Campaign history table
- Status tracking
- Performance metrics
- Bulk actions

---

## 🚀 **After Implementation:**

1. **Test the marketing dashboard** in your admin panel
2. **Verify all integrations** work properly
3. **Deploy using your protected system**:
   ```bash
   npm run deploy:safe
   ```
4. **Your marketing dashboard will be live** at:
   `https://bell24h-production.up.railway.app/admin/marketing`

---

*This will add professional AI-powered marketing capabilities to your Bell24h admin panel!*
