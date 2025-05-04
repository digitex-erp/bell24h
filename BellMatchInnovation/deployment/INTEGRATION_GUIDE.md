# Bell24h Integration & Deployment Guide

## Overview

This document outlines how all Bell24h modules, features, and third-party integrations come together in a unified structure for deployment. It serves as a comprehensive reference for understanding the integration architecture and deployment workflow.

## Project Structure

The Bell24h platform is structured in a modular way that facilitates testing, integration and deployment:

```
/
├── client/                # Frontend React application
│   ├── src/               # Source code
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   ├── pages/         # Route-based pages
│   │   └── services/      # API service integrations
│   └── index.html         # Entry HTML file
│
├── server/                # Backend Express application
│   ├── controllers/       # API route controllers
│   ├── services/          # Business logic services
│   ├── data/              # Data sources and interactions
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   └── vite.ts            # Vite server config
│
├── shared/                # Shared code between client and server
│   └── schema.ts          # Database schema definitions
│
├── db/                    # Database configuration
│   ├── index.ts           # Database connection
│   └── seed.ts            # Database seed data
│
├── deployment/            # Deployment configuration
│   ├── docker/            # Docker configuration
│   ├── scripts/           # Deployment scripts
│   └── config/            # Environment configuration
│
├── tests/                 # Testing infrastructure
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   ├── e2e/               # End-to-end tests
│   ├── third-party/       # Third-party integration tests
│   └── run-all-tests.sh   # Test runner script
│
└── contracts/             # Blockchain smart contracts
```

## Module Integration Architecture

The Bell24h platform integrates several modules and features:

1. **Core Platform** (99% Complete)
   - Database Schema (PostgreSQL with Drizzle ORM)
   - API Endpoints (Express.js)
   - Frontend Components (React + TypeScript)
   - Authentication System (JWT-based)

2. **AI Features** (100% Complete)
   - Supplier Matching (OpenAI integration)
   - Risk Assessment (SHAP/LIME)
   - Procurement Assistant (Gemini API)

3. **Voice/Video RFQ System** (90% Complete)
   - OpenAI Whisper Integration
   - Voice Command System
   - Base64 Processing

4. **Financial Services** (80% Complete)
   - Payment Gateway
   - Blockchain Integration (Polygon)
   - M1 Exchange Integration
   - KredX Integration

5. **GST Validation System** (100% Complete)
   - GSTIN Validation
   - Business Details Retrieval
   - Invoice Verification

6. **Testing & Deployment Infrastructure** (95% Complete)
   - Comprehensive Test Framework
   - Docker Containerization
   - CI/CD Pipeline

## Third-Party Service Integration

The Bell24h platform integrates with several third-party services:

| Service | Purpose | Integration Point | Environment Variable |
|---------|---------|-------------------|----------------------|
| OpenAI API | Voice-to-text, AI analysis | `server/services/openai-service.ts` | `OPENAI_API_KEY` |
| Gemini API | Procurement chatbot | `server/services/gemini-service.ts` | `GEMINI_API_KEY` |
| GST API | GST verification | `server/services/gst-validation-service.ts` | `GST_API_KEY` |
| M1 Exchange | Financial services | `server/services/m1-exchange-service.ts` | `M1_EXCHANGE_API_KEY` |
| KredX | Invoice discounting | `server/services/kredx-service.ts` | `KREDX_API_KEY` |
| Polygon RPC | Blockchain integration | `server/services/blockchain-service.ts` | `POLYGON_RPC_URL` |
| RazorpayX | Wallet system | `server/services/payment-service.ts` | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` |

## Database Integration

The database schema is defined in `shared/schema.ts` and consists of the following key tables:

- Users
- Suppliers
- RFQs
- Matches
- Payments
- Transactions
- Metrics
- Challenges
- GST_Validations

All tables are related through foreign keys and managed using Drizzle ORM.

## Testing Integration

The testing framework is designed to test all components individually and in integration:

1. **Unit Tests**
   - Test individual components and functions
   - Isolated from external dependencies

2. **Integration Tests**
   - Test interaction between components
   - Mock third-party services when needed

3. **E2E Tests**
   - Test complete user journeys
   - Simulate real user interactions

4. **Third-Party Tests**
   - Test integration with external services
   - Only run when API keys are available

The test runner script (`tests/run-all-tests.sh`) provides a unified interface for running all tests.

## Deployment Process

The deployment process follows these steps:

1. **Build**
   - Run tests to ensure quality
   - Build client and server
   - Create Docker images

2. **Database Migration**
   - Apply database schema changes
   - Seed initial data if needed

3. **Service Deployment**
   - Deploy Docker containers
   - Configure environment variables
   - Set up Nginx reverse proxy

4. **Monitoring Setup**
   - Configure Prometheus/Grafana
   - Set up logging
   - Configure health checks

5. **Verification**
   - Run health checks
   - Verify third-party integrations
   - Validate key features

## Continuous Integration

The CI/CD pipeline is configured in `.github/workflows/ci-cd.yml` and includes:

1. **Test Phase**
   - Run unit tests
   - Run integration tests
   - Run E2E tests

2. **Build Phase**
   - Build Docker images
   - Push to container registry

3. **Deploy Phase**
   - Deploy to staging/production
   - Run post-deployment checks

## Environment Configuration

The application requires several environment variables, which are defined in `.env` files:

- `.env.development` - Development environment
- `.env.test` - Test environment
- `.env.production` - Production environment

For security, API keys and secrets are not stored in these files but are injected during deployment.

## Getting Started

To set up a complete development environment:

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Initialize database: `npm run db:push && npm run db:seed`
5. Start the development server: `npm run dev`

For deployment:

1. Build the application: `./deployment/scripts/build.sh`
2. Deploy to production: `./deployment/scripts/deploy.sh`

## Troubleshooting

Common issues and their solutions:

1. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check database server is running
   - Ensure correct permissions are granted

2. **API Integration Issues**
   - Verify API keys are valid and not expired
   - Check API request format matches documentation
   - Ensure proper error handling for API failures

3. **Deployment Issues**
   - Verify Docker is installed and running
   - Check environment variables are correctly set
   - Ensure ports are not already in use

## Conclusion

The Bell24h platform is designed as a comprehensive, integrated system that brings together multiple technologies and services to create a seamless RFQ marketplace. The modular architecture allows for independent testing and development of features while maintaining cohesion in the final product.