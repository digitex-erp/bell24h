# Bell24H B2B Marketplace

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

## 🚀 MVP Launch: June 4, 2025

Welcome to Bell24H, the next-generation B2B marketplace connecting buyers and suppliers with AI-powered matching and secure transactions.

## 📌 Quick Start

### Prerequisites

- Node.js 18.0.0 or higher
- PostgreSQL 14.0 or higher
- npm 8.0.0 or higher
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/bell24H-dashboard.git
   cd bell24H-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm ci
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate deploy
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🏗 Project Structure

```
bell24H-dashboard/
├── client/                 # Frontend React application
├── server/                 # Backend Node.js/Express server
├── prisma/                 # Database schema and migrations
├── public/                 # Static files
├── scripts/               # Utility scripts
├── .env.example           # Example environment variables
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

Or use the deployment script:

```bash
node scripts/deploy-mvp.js
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# App
NODE_ENV=production
PORT=3000
APP_URL=https://hostscue.com
API_BASE_URL=https://api.hostscue.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/bell24H

# Authentication
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@example.com
SMTP_PASSWORD=your_email_password
EMAIL_FROM=noreply@bell24H.com

# Payments
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET=your_paypal_secret
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Founder**: Vishal A Pendharkar
- **Director**: Bharti A Pendharkar
- **Development Team**: Bell24H Engineering

## 📧 Contact

For inquiries, please contact us at [support@bell24H.com](mailto:support@bell24H.com)

---

<div align="center">
  <p>Made with ❤️ by the Bell24H Team</p>
  <p>© 2025 Bell24H. All rights reserved.</p>
</div>

## 🛠️ Development Tools

### WebThinker Integration

This project uses [WebThinker](https://webthinker.dev) for enhanced development workflows, including:

- **Code Analysis**: Automated code quality checks and optimizations
- **Performance Optimization**: Memory usage analysis and optimization suggestions
- **Testing Automation**: Automatic test generation and coverage analysis
- **Documentation**: Automated API and code documentation generation

#### Getting Started with WebThinker

1. **Installation**:
   ```bash
   npm run setup:webthinker
   ```

2. **Run Analysis**:
   ```bash
   npm run webthinker:analyze
   ```

3. **Generate Documentation**:
   ```bash
   npm run webthinker:docs
   ```

4. **Run Optimizations**:
   ```bash
   npm run webthinker:optimize
   ```

For detailed usage, see the [WebThinker Integration Guide](./docs/WEBTHINKER-INTEGRATION.md).

## 🚀 Project Status & Roadmap (as of May 20, 2025)

### Recently Implemented Features

#### 🔄 Real-Time Communication System
- **WebSocket Infrastructure**
  - Robust WebSocket server with connection management
  - WebSocket proxy with REST API endpoints
  - Server-Sent Events (SSE) implementation
  - React RealTimeNotifications component

#### 🎥 Video & Multimedia Features
- **Video RFQ System**
  - Video upload and preview UI
  - Cloudinary integration for video hosting
  - Video URL field added to RFQs table

- **Product Showcase**
  - Supplier product showcases with video
  - Video analytics for engagement tracking
  - Automatic thumbnail generation

#### 📊 Enhanced Analytics
- **Perplexity Dashboard**
  - Text complexity visualization
  - Feature importance ranking 
  - AI model explainability (SHAP/LIME)
  - Natural language summaries

- **Analytics Export**
  - Multiple export formats (CSV, Excel, PDF)
  - Column customization
  - Visual formatting for reports

#### 🧰 Infrastructure & Migration
- **Migration from Replit**
  - Migration validation scripts
  - Database schema validation
  - Environment template
  - WebSocket testing utilities

### Service/Supplier Showcase & Catalog
- **Implemented:**
  - Seller profile and product grid templates
  - Fallback logic for missing tables
  - Supplier data API endpoints
- **Pending:**
  - `supplier_categories` table
  - Pricing and analytics integration
  - Mobile responsiveness

### Pricing & Admin Dashboard
- **Implemented:**
  - Revenue prediction and pricing strategy tables
  - Wallet/Escrow APIs
- **Pending:**
  - Pricing page UI
  - Admin dashboard UI
  - D3.js/React charts for metrics

### Monetization & 369-Day Revenue Plan
- **Implemented:**
  - Revenue streams documented (subscriptions, fees, ads, etc.)
  - Target: ₹100 crore in 369 days
- **Pending:**
  - Pricing logic linkage to admin dashboard
  - UI for pricing tiers and revenue breakdown

---

## 📝 Next Steps
- Complete migration from Replit using migration toolkit
- Integrate real-time notifications with existing features
- Connect Perplexity Analytics to the WebSocket system
- Create `supplier_categories` table and migrate
- Build pricing and admin dashboard UIs
- Connect pricing logic to catalog and admin dashboard

---

## 📋 Implementation Checklist
| Feature | Status | Notes |
|---------|--------|-------|
| WebSocket Server | ✅ Complete | Real-time notification system |
| SSE Implementation | ✅ Complete | One-way server-to-client communication |
| Video RFQ | ✅ Complete | Video upload and processing |
| Product Showcase | ✅ Complete | Product videos with analytics |
| Perplexity Dashboard | ✅ Complete | AI explainability features |
| Analytics Export | ✅ Complete | Multiple export formats |
| Supplier Categories Table | ⏳ Pending | Needed for dynamic catalog |
| Pricing Page UI | ⏳ Pending | Needed for monetization features |
| Admin Dashboard UI | ⏳ Pending | Needed for analytics & revenue |
| Analytics Integration | ⏳ Pending | Dashboard and catalog |
| Mobile Responsiveness | ⏳ Pending | All UIs |
| Pricing Logic Link | ⏳ Pending | Catalog and dashboard |

---

## 📚 References
- See `TODO.md` and `features.md` for detailed status and task breakdowns.
- Revenue plan and pricing strategy in `Pasted_Text_1745574244324.txt`.

---

# [Legacy README Content Continues Below]
