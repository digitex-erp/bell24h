# Bell24h Integration Testing Architecture

## Overview

This document outlines the comprehensive testing and integration structure for the Bell24h platform. It provides a systematic approach to testing all components, modules, features, and third-party integrations to ensure a robust deployment.

## Testing Directory Structure

```
/tests
├── unit/                       # Unit tests for isolated components
│   ├── client/                 # Frontend unit tests
│   │   ├── components/         # Component tests
│   │   ├── hooks/              # Custom hooks tests
│   │   └── lib/                # Utility functions tests
│   └── server/                 # Backend unit tests
│       ├── controllers/        # Controller function tests
│       ├── services/           # Service logic tests
│       └── utils/              # Utility function tests
│
├── integration/                # Integration tests for combined components
│   ├── api/                    # API endpoint integration tests
│   │   ├── gst-validation/     # GST validation API tests
│   │   ├── procurement/        # Procurement API tests
│   │   ├── suppliers/          # Supplier matching API tests
│   │   ├── blockchain/         # Blockchain payment API tests
│   │   └── financial/          # Financial services API tests
│   │
│   ├── workflows/              # Business workflow tests
│   │   ├── rfq-creation/       # RFQ creation workflow tests
│   │   ├── supplier-matching/  # Supplier matching workflow tests
│   │   ├── payment-processing/ # Payment processing workflow tests
│   │   └── procurement-challenges/ # Procurement challenge workflow tests
│   │
│   └── data-flow/              # Cross-component data flow tests
│       ├── user-preferences/   # User preference data flow tests
│       └── analytics/          # Analytics data flow tests
│
├── e2e/                        # End-to-end tests
│   ├── user-journeys/          # Common user journey tests
│   ├── responsive-design/      # Responsive UI tests
│   └── internationalization/   # i18n tests
│
├── performance/                # Performance testing
│   ├── load-tests/             # Load testing scripts
│   ├── stress-tests/           # Stress testing scripts
│   └── benchmarks/             # Performance benchmarks
│
└── third-party/                # Third-party integration tests
    ├── gst-api/                # GST API integration tests
    ├── m1-exchange/            # M1 Exchange integration tests
    ├── kredx/                  # KredX integration tests
    ├── blockchain/             # Ethereum/blockchain integration tests
    ├── openai/                 # OpenAI service integration tests
    └── gemini/                 # Google Gemini API integration tests
```

## Test Execution Framework

### 1. Test Runner Setup

```javascript
// tests/setup.js
const { setup } = require('@testing-library/react');
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const db = require('../db');

chai.use(chaiHttp);

// Global setup
before(async () => {
  // Initialize test database
  await db.initializeTestDatabase();
  
  // Set up test environment variables
  process.env.NODE_ENV = 'test';
  process.env.TEST_GST_API_KEY = 'test-key';
  
  console.log('Test environment initialized');
});

// Global teardown
after(async () => {
  // Clean up test database
  await db.cleanupTestDatabase();
  
  // Close server connections
  server.close();
  
  console.log('Test environment cleaned up');
});
```

### 2. Common Test Utilities

```javascript
// tests/utils/api-helpers.js
const makeApiRequest = async (method, endpoint, data = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const options = {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined
  };
  
  const response = await fetch(`http://localhost:5000/api${endpoint}`, options);
  return {
    status: response.status,
    data: await response.json(),
    headers: response.headers
  };
};

module.exports = {
  makeApiRequest
};
```

## Integration Testing Approach

### 1. Module-level Integration

Each module is first tested in isolation to verify its internal functionality:

```javascript
// tests/integration/api/gst-validation/basic.test.js
const { expect } = require('chai');
const { makeApiRequest } = require('../../../utils/api-helpers');

describe('GST Validation API Integration Tests', () => {
  it('should validate a valid GST number', async () => {
    const response = await makeApiRequest('POST', '/gst/validate', { 
      gstin: '27AADCB2230M1ZT' 
    });
    
    expect(response.status).to.equal(200);
    expect(response.data.valid).to.be.true;
    expect(response.data.legal_name).to.exist;
  });
  
  it('should reject an invalid GST number', async () => {
    const response = await makeApiRequest('POST', '/gst/validate', { 
      gstin: 'INVALID12345GSTIN' 
    });
    
    expect(response.status).to.equal(400);
    expect(response.data.valid).to.be.false;
  });
});
```

### 2. Cross-module Integration

Test interactions between different modules:

```javascript
// tests/integration/workflows/supplier-matching/gst-verification.test.js
const { expect } = require('chai');
const { makeApiRequest } = require('../../../utils/api-helpers');

describe('Supplier Onboarding with GST Verification Workflow', () => {
  it('should verify GST details during supplier registration', async () => {
    // Step 1: Create supplier with GST number
    const createResponse = await makeApiRequest('POST', '/suppliers', {
      name: 'Test Supplier Ltd',
      gstin: '27AADCB2230M1ZT',
      contactEmail: 'test@example.com'
    });
    
    expect(createResponse.status).to.equal(201);
    const supplierId = createResponse.data.id;
    
    // Step 2: Verify supplier has GST details automatically populated
    const getResponse = await makeApiRequest('GET', `/suppliers/${supplierId}`);
    
    expect(getResponse.status).to.equal(200);
    expect(getResponse.data.gstVerified).to.be.true;
    expect(getResponse.data.legalName).to.exist;
    expect(getResponse.data.address).to.exist;
    expect(getResponse.data.state).to.exist;
  });
});
```

### 3. Third-party Integration

Tests specifically for third-party integrations:

```javascript
// tests/third-party/gst-api/live-validation.test.js
const { expect } = require('chai');
const gstValidationService = require('../../server/services/gst-validation-service');

describe('GST API Live Integration Tests', () => {
  // Only run these tests when GST_API_KEY is available
  before(function() {
    if (!process.env.GST_API_KEY) {
      this.skip();
    }
  });
  
  it('should connect to live GST API and validate a number', async () => {
    const result = await gstValidationService.validateGSTIN('27AADCB2230M1ZT');
    
    expect(result.valid).to.be.true;
    expect(result.legal_name).to.be.a('string');
  });
  
  it('should handle rate limiting correctly', async () => {
    // Make multiple requests in quick succession
    const promises = Array(10).fill().map(() => 
      gstValidationService.validateGSTIN('27AADCB2230M1ZT')
    );
    
    const results = await Promise.all(promises);
    
    // Verify all completed without errors
    results.forEach(result => {
      expect(result).to.have.property('valid');
    });
  });
});
```

## Full System Integration Testing

Tests that verify the complete system works together:

```javascript
// tests/e2e/user-journeys/procurement-to-payment.test.js
const { expect } = require('chai');
const { makeApiRequest } = require('../../utils/api-helpers');
const { login, createRFQ, selectSupplier, makePayment } = require('../../utils/user-actions');

describe('Complete Procurement to Payment Flow', () => {
  let userToken, rfqId, supplierId, paymentId;
  
  before(async () => {
    // Login and get token
    const loginResponse = await login('buyer@example.com', 'password123');
    userToken = loginResponse.token;
  });
  
  it('should create an RFQ', async () => {
    const rfqData = {
      title: 'Test Procurement',
      description: 'Integration test for full procurement flow',
      category: 'Electronics',
      budget: 5000,
      deadline: '2025-05-30'
    };
    
    const response = await makeApiRequest('POST', '/rfqs', rfqData, userToken);
    expect(response.status).to.equal(201);
    rfqId = response.data.id;
  });
  
  it('should match with suppliers', async () => {
    const response = await makeApiRequest('GET', `/rfqs/${rfqId}/matched-suppliers`, null, userToken);
    expect(response.status).to.equal(200);
    expect(response.data.suppliers).to.be.an('array').with.length.greaterThan(0);
    
    supplierId = response.data.suppliers[0].id;
  });
  
  it('should select a supplier and create contract', async () => {
    const response = await makeApiRequest('POST', `/rfqs/${rfqId}/select-supplier`, {
      supplierId,
      milestones: [
        { description: 'Initial delivery', amount: 2000, deadline: '2025-06-15' },
        { description: 'Final delivery', amount: 3000, deadline: '2025-06-30' }
      ]
    }, userToken);
    
    expect(response.status).to.equal(200);
    expect(response.data.contractId).to.exist;
  });
  
  it('should process blockchain payment for first milestone', async () => {
    const response = await makeApiRequest('POST', `/payments/blockchain`, {
      rfqId,
      milestoneIndex: 0,
      amount: 2000
    }, userToken);
    
    expect(response.status).to.equal(200);
    expect(response.data.transactionId).to.exist;
    paymentId = response.data.id;
  });
  
  it('should verify payment was recorded in database', async () => {
    const response = await makeApiRequest('GET', `/payments/${paymentId}`, null, userToken);
    
    expect(response.status).to.equal(200);
    expect(response.data.status).to.equal('completed');
    expect(response.data.blockchain).to.have.property('transactionHash');
  });
});
```

## Deployment Integration Structure

For deployment, we create a unified structure that brings together all components:

```
/deployment
├── docker/                      # Docker containerization
│   ├── docker-compose.yml       # Multi-container orchestration
│   ├── Dockerfile.server        # Server container definition
│   ├── Dockerfile.client        # Client container definition
│   └── Dockerfile.db            # Database container definition
│
├── scripts/                     # Deployment scripts
│   ├── build.sh                 # Build all components
│   ├── deploy.sh                # Deploy to production
│   ├── migrate-db.sh            # Database migration script
│   └── rollback.sh              # Deployment rollback script
│
├── config/                      # Environment configurations
│   ├── production.env.example   # Production environment template
│   ├── staging.env.example      # Staging environment template
│   └── monitoring.conf          # Monitoring configuration
│
└── terraform/                   # Infrastructure as Code
    ├── main.tf                  # Main Terraform configuration
    ├── variables.tf             # Terraform variables
    └── outputs.tf               # Terraform outputs
```

## Continuous Integration Pipeline

A comprehensive CI/CD pipeline integrates all tests:

```yaml
# .github/workflows/ci-cd.yml
name: Bell24h CI/CD Pipeline

on:
  push:
    branches: [ main, development ]
  pull_request:
    branches: [ main, development ]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:unit
  
  integration-tests:
    needs: unit-tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_USER: postgres
          POSTGRES_DB: test_bell24h
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run db:migrate
      - run: npm run db:seed:test
      - run: npm run test:integration
  
  e2e-tests:
    needs: integration-tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Run E2E Tests
        run: npm run test:e2e
        env:
          NODE_ENV: test
          DATABASE_URL: postgres://postgres:postgres@localhost:5432/test_bell24h
  
  build-and-deploy:
    needs: [unit-tests, integration-tests, e2e-tests]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Production
        run: ./deployment/scripts/deploy.sh
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

This structure ensures that all components, modules, and features are thoroughly tested and properly integrated before deployment.