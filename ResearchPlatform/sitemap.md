# Bell24h Marketplace Sitemap

## User Journey Flow

```
                             ┌────────────────┐
                             │   Homepage     │
                             └───────┬────────┘
                                     │
                 ┌───────────────────┼───────────────────┐
                 │                   │                   │
        ┌────────▼─────────┐ ┌──────▼───────┐  ┌────────▼─────────┐
        │  Authentication  │ │ Marketplace  │  │  Insights Hub    │
        └────────┬─────────┘ └──────┬───────┘  └────────┬─────────┘
                 │                  │                   │
         ┌───────┴───────┐   ┌─────┴─────┐     ┌───────┴───────┐  
         │  Registration │   │   RFQs    │     │ Industry      │  
         └───────────────┘   └─────┬─────┘     │ Trends        │
                                   │           └───────┬───────┘
                          ┌────────┴────────┐          │
                          │ Financial       │ ┌────────┴────────┐
                          │ Services        │ │ Global Trade    │
                          └─────────────────┘ │ Insights        │
                                              └─────────────────┘
```

> **Note on User Journey Flow**:  
> This flow aligns with intuitive user psychology while supporting Bell24h's focus on harmonious business relationships. The direct path to RFQs and marketplace functions supports the core "Fast RFQ Automation" concept, while the Financial Services and Insights layers build trust and differentiate from ordinary RFQ sites.

## Complete Site Structure

### 1. Public Pages
- **Homepage** (`/`)
  - Platform introduction
  - Featured suppliers
  - Recent RFQs
  - Success stories
  - Getting started guide

- **About** (`/about`)
  - Company mission
  - Team
  - Testimonials
  - Partners

- **Authentication** 
  - Login (`/login`)
  - Registration (`/register`)
  - Password Reset (`/reset-password`)
  - Email Verification (`/verify-email`)

### 2. User Dashboard
- **Dashboard Home** (`/dashboard`)
  - Activity summary
  - Quick stats
  - Recent notifications
  - Action items

- **Profile Management** (`/profile`)
  - Personal information
  - Company details
  - Security settings
  - Notification preferences

### 3. Marketplace
- **RFQ Management** (`/rfqs`)
  - RFQ Listing (`/rfqs`)
  - Create RFQ (`/rfqs/create`)
  - RFQ Details (`/rfqs/:id`)
  - Voice RFQ Creation (`/voice-rfq`)
    - Audio feedback confirmation
    - Real-time transcription preview

- **Supplier Discovery** (`/suppliers`)
  - Supplier listing
  - Supplier profiles
  - Supplier comparison
  - Saved suppliers

- **Trading** (`/trading`)
  - Active trades
  - Trade history
  - Performance metrics
  - Dispute resolution

### 4. Financial Services
- **KredX Integration** (`/financial/kredx`)
  - Invoice discounting
  - Working capital solutions
  - Credit risk assessment
  - Transaction history

- **Payments** (`/payments`)
  - Payment methods
  - Transaction history
  - Escrow services
  - Milestone payments

- **Blockchain** (`/blockchain`)
  - Smart contract status
  - Transaction verification
  - Wallet connection
  - Security audit
  - Educational guides & infographics
  - Blockchain benefits for B2B trade

### 5. Business Intelligence
- **Alert System** (`/alerts`)
  - Alert configurations
  - Notification history
  - Alert preferences
  - Quick actions

- **Industry Trends** (`/industry-trends`)
  - One-Click Industry Snapshot Generator
  - Trend analysis
  - Template management
  - Saved reports
  - Weekly industry trends newsletter
  - Email subscription preferences

- **Global Trade Insights** (`/global-trade-insights`)
  - Country analytics
  - Industry reports
  - Trade data visualization
  - Export & import statistics

- **RFQ Categorization** (`/rfq-categorization`)
  - AI-powered categorization
  - Category management
  - Matching probability
  - Classification reports

### 6. Admin Portal
- **User Management** (`/admin/users`)
  - User listing
  - Role management
  - Account verification
  - Activity logs

- **Content Management** (`/admin/content`)
  - News and announcements
  - Success stories
  - Help articles
  - FAQ management

- **System Monitoring** (`/admin/monitoring`)
  - API performance
  - Error logs
  - User activity
  - System health

- **Settings** (`/admin/settings`)
  - Platform configuration
  - Email templates
  - Security settings
  - Integration management

### 7. Help & Support
- **Help Center** (`/help`)
  - Documentation
  - Tutorials
  - Getting started guides
  - Video walkthroughs

- **Support** (`/support`)
  - Contact form
  - Live chat
  - Ticket management
  - Feedback submission

## API Structure

> **Future API Enhancement Note**:  
> A GraphQL API gateway is planned for future implementation to optimize mobile app performance and enable more efficient data fetching with fewer network requests.

### Authentication APIs
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/verify-email`
- `/api/auth/reset-password`
- `/api/auth/refresh-token`

### User APIs
- `/api/users/profile`
- `/api/users/preferences`
- `/api/users/companies`
- `/api/users/notifications`

### RFQ APIs
- `/api/rfqs`
- `/api/rfqs/:id`
- `/api/rfqs/categories`
- `/api/rfqs/matching`
- `/api/rfqs/voice-processing`

### Financial APIs
- `/api/financial/kredx/invoices`
- `/api/financial/payments`
- `/api/financial/escrow`
- `/api/financial/blockchain/verify`

### Analytics APIs
- `/api/alerts`
- `/api/industry-trends/snapshot`
- `/api/industry-trends/templates`
- `/api/global-trade/insights`
- `/api/global-trade/countries`
- `/api/global-trade/trade-data`

### Admin APIs
- `/api/admin/users`
- `/api/admin/logs`
- `/api/admin/settings`
- `/api/admin/content`