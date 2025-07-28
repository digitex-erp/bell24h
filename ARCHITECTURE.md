# Bell24H Platform Architecture

## Overview

Bell24H is an enterprise-grade B2B marketplace platform with advanced AI features, real-time communication, and multimedia capabilities. This document outlines the architecture, key components, and integration points.

## System Architecture

Bell24H follows a modern TypeScript stack with a focus on performance, scalability, and real-time interaction:

```
┌─────────────────────────┐     ┌───────────────────────┐
│      Client Layer       │     │      Server Layer     │
│                         │     │                       │
│  ┌─────────────────┐    │     │   ┌───────────────┐   │
│  │ React Frontend  │    │     │   │   API Server  │   │
│  └─────────────────┘    │     │   └───────────────┘   │
│           │             │     │           │           │
│  ┌─────────────────┐    │     │   ┌───────────────┐   │
│  │ Real-time Comm. │◄───┼─────┼──►│ WebSockets    │   │
│  └─────────────────┘    │     │   └───────────────┘   │
│           │             │     │           │           │
│  ┌─────────────────┐    │     │   ┌───────────────┐   │
│  │  State Manager  │    │     │   │ SSE Server    │   │
│  └─────────────────┘    │     │   └───────────────┘   │
└─────────────────────────┘     └───────────────────────┘
             │                              │
┌─────────────────────────┐     ┌───────────────────────┐
│   Integration Layer     │     │     Database Layer    │
│                         │     │                       │
│  ┌─────────────────┐    │     │   ┌───────────────┐   │
│  │   Cloudinary    │    │     │   │  PostgreSQL   │   │
│  └─────────────────┘    │     │   └───────────────┘   │
│           │             │     │           │           │
│  ┌─────────────────┐    │     │   ┌───────────────┐   │
│  │   Blockchain    │    │     │   │   Migrations  │   │
│  └─────────────────┘    │     │   └───────────────┘   │
│           │             │     │           │           │
│  ┌─────────────────┐    │     │   ┌───────────────┐   │
│  │ CRM/ERP Connect │    │     │   │  Cache Layer  │   │
│  └─────────────────┘    │     │   └───────────────┘   │
└─────────────────────────┘     └───────────────────────┘
```

## Core Components

### 1. Frontend Layer

#### React Components
- **Pages**: Main application pages (dashboard, perplexity, RFQ, bidding)
- **Components**: Reusable UI components
  - **Perplexity**: Advanced perplexity analytics visualizations
  - **Video**: Video upload and playback components
  - **RealTimeNotifications**: Real-time notification system

#### State Management
- **Context API**: For application-wide state
- **Local State**: Component-specific state

### 2. Backend Layer

#### API Services
- `server/api/`: RESTful API endpoints
- `server/services/`: Business logic implementation
- `server/middleware/`: Authentication, validation, and other middleware

#### Real-time Communication
- **WebSocket Server**: `src/websocket/server.ts` - Main WebSocket implementation
- **WebSocket Proxy**: `src/websocket/proxy.ts` - Scalable proxy layer
- **SSE Server**: `src/websocket/sse.ts` - Server-Sent Events implementation

#### Database
- **Schema**: Defined in `src/db/schema.ts` using Drizzle ORM
- **Migrations**: SQL migrations in `drizzle/migrations/`

## Key Features

### 1. Advanced Perplexity Analytics

**Components**:
- `server/services/perplexity-analytics.ts`: Backend service for analytics
- `server/api/perplexity-analytics.ts`: API endpoints
- `src/types/perplexity-analytics.ts`: TypeScript types
- `src/components/PerplexityAdvanced/*.tsx`: UI components
- `src/pages/perplexity/advanced-dashboard.tsx`: Main dashboard

**Features**:
- Temporal trends analysis
- Competitive intelligence
- Market segmentation
- Success prediction modeling
- Text improvement recommendations
- Customer profiling
- Multilingual analysis

### 2. Video & Multimedia

**Components**:
- `server/api/voice-rfq.ts`: Voice-based RFQ submission
- `server/api/video-rfq.ts`: Video RFQ submission
- `server/api/product-showcases.ts`: Product showcases with video
- `server/api/video-analytics.ts`: Video engagement analytics

**Features**:
- Direct-to-cloud video uploads (Cloudinary)
- Automatic thumbnail generation
- Engagement analytics tracking
- Optimized video processing

### 3. Real-time Communication

**Components**:
- `src/websocket/server.ts`: Main WebSocket server
- `src/websocket/proxy.ts`: WebSocket proxy for scaling
- `src/websocket/sse.ts`: Server-Sent Events (SSE) implementation
- `src/components/RealTimeNotifications/RealtimeManager.tsx`: UI component

**Features**:
- Real-time notifications
- Live updates for RFQs and bids
- Connection pooling for high concurrency
- Heartbeat mechanism for connection stability
- Fallback mechanisms (SSE, polling)

### 4. Analytics Export

**Components**:
- `server/api/analytics-export.ts`: Export API endpoints
- `src/components/AnalyticsExport.tsx`: UI component

**Features**:
- Multiple export formats (CSV, Excel, PDF)
- Customizable columns and filters
- Visual formatting for Excel exports
- PDF reports with visualizations

### 5. Blockchain Integration (75% Complete)

**Components**:
- `contracts/SupplierVerification.sol`: Smart contract
- `src/api/blockchain.ts`: Blockchain API
- `src/utils/mumbai-sdk.ts`: Polygon Mumbai integration

**Features**:
- Business credential verification
- Decentralized identity verification
- Integration with Polygon network

## Database Schema

### Core Tables
- `users`: User accounts and authentication
- `rfqs`: Request For Quotes
- `bids`: Bid submissions
- `products`: Product catalog
- `transactions`: Financial transactions
- `notifications`: System notifications
- `messages`: User-to-user messages
- `attachments`: File attachments

### Feature-specific Tables
- `supplier_categories`: Supplier categorization (Migration: 001-supplier-categories.sql)
- `organizations`, `org_roles`, `org_members`: Organization hierarchy (Migration: 002-org-hierarchy.sql)
- `video_rfqs`: Video-based RFQs (Migration: 0003_add_video_features.sql)
- `product_showcases`: Product showcases with video (Migration: 0008_enhanced_video_features.sql)
- `video_analytics`: Video engagement metrics

## Integration Points

### External Services
- **Cloudinary**: Media storage and processing
- **Make.com**: Workflow automation and GST validation
- **CRM Systems**: Zoho, Salesforce integration
- **Blockchain**: Polygon Mumbai network

## Deployment Architecture

```
┌─────────────────┐       ┌─────────────────┐
│   Web Frontend  │       │   API Server    │
│    (Vercel)     │ ─────▶│   (Node.js)     │
└─────────────────┘       └─────────────────┘
                                   │
                                   ▼
┌─────────────────┐       ┌─────────────────┐
│  WebSocket/SSE  │       │   PostgreSQL    │
│    Servers      │◀─────▶│   Database      │
└─────────────────┘       └─────────────────┘
        │
        ▼
┌─────────────────┐       ┌─────────────────┐
│    Cloudinary   │       │   Polygon       │
│    (Media)      │       │   (Blockchain)  │
└─────────────────┘       └─────────────────┘
```

## Development & Deployment Workflow

### Local Development
1. Clone repository
2. Copy `.env.template` to `.env` and configure
3. Install dependencies with `npm install`
4. Run database migrations with `npm run migrate`
5. Start development server with `npm run dev`

### CI/CD Pipeline
- GitHub Actions workflow in `.github/workflows/main.yml`
- Automatic testing and linting
- Deployment to staging/production based on branch

## Security Architecture

- JWT-based authentication
- Role-based access control
- API endpoint protection
- Secure WebSocket connections
- Environment variable segregation

## Monitoring & Performance

- Real-time performance metrics
- Error tracking with Sentry
- Detailed logging
- Database query performance monitoring

## Future Extensions

1. **Mobile Application** (Planned for Phase 2)
   - React Native implementation
   - Offline support
   - Push notifications

2. **Enhanced User Roles & Permissions** (40% Complete)
   - Multi-level organizational hierarchy
   - Permission delegation
   - Team management

3. **AI Chatbot & Support Center** (Planned)
   - Dialogflow integration
   - Automated response system

4. **Blockchain Expansion** (In Progress)
   - Smart contract expansion
   - Multi-chain support

## Migration from Replit

For projects migrating from Replit to local development:

1. Run validation script: `node scripts/validate-migration.mjs`
2. Create placeholders: `node scripts/migrate-from-replit.mjs`
3. Validate database schema: `node scripts/validate-schema.mjs`
4. Configure environment variables

---

Document Version: 1.0  
Last Updated: May 10, 2025
