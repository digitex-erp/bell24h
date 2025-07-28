import request from 'supertest';
import app from '../../app';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Initialize JSON Schema validator
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// Wallet API schemas
const schemas = {
  // Schema for wallet creation response
  walletCreateResponse: {
    type: 'object',
    required: ['id', 'userId', 'balance', 'currency', 'status', 'createdAt'],
    properties: {
      id: { type: 'string' },
      userId: { type: 'string' },
      balance: { type: 'number', minimum: 0 },
      currency: { type: 'string', minLength: 1 },
      status: { type: 'string', enum: ['active', 'inactive', 'suspended'] },
      createdAt: { type: 'string', format: 'date-time' },
      countryCode: { type: 'string' },
      email: { type: ['string', 'null'] },
      phone: { type: ['string', 'null'] },
      metadata: { type: 'object' }
    },
    additionalProperties: false
  },
  
  // Schema for wallet funding response
  walletFundResponse: {
    type: 'object',
    required: ['id', 'balance', 'transactionId'],
    properties: {
      id: { type: 'string' },
      balance: { type: 'number', minimum: 0 },
      transactionId: { type: 'string' },
      currency: { type: 'string' }
    },
    additionalProperties: false
  },
  
  // Schema for wallet transfer response
  walletTransferResponse: {
    type: 'object',
    required: ['id', 'status', 'transactionId'],
    properties: {
      id: { type: 'string' },
      status: { type: 'string', enum: ['completed', 'pending', 'failed'] },
      transactionId: { type: 'string' },
      fromWalletId: { type: 'string' },
      toWalletId: { type: 'string' },
      amount: { type: 'number' },
      timestamp: { type: 'string', format: 'date-time' }
    },
    additionalProperties: false
  },
  
  // Schema for wallet transaction list response
  walletTransactionsResponse: {
    type: 'object',
    required: ['transactions', 'pagination'],
    properties: {
      transactions: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'type', 'amount', 'status', 'timestamp'],
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: ['deposit', 'withdrawal', 'transfer', 'escrow', 'refund'] },
            amount: { type: 'number' },
            currency: { type: 'string' },
            status: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            metadata: { type: 'object' }
          }
        }
      },
      pagination: {
        type: 'object',
        required: ['currentPage', 'totalPages', 'totalItems'],
        properties: {
          currentPage: { type: 'number', minimum: 1 },
          totalPages: { type: 'number', minimum: 0 },
          totalItems: { type: 'number', minimum: 0 },
          pageSize: { type: 'number', minimum: 1 }
        }
      }
    },
    additionalProperties: false
  },
  
  // Schema for error response
  errorResponse: {
    type: 'object',
    required: ['error'],
    properties: {
      error: {
        type: 'object',
        required: ['message'],
        properties: {
          message: { type: 'string' },
          code: { type: 'string' },
          details: { type: 'array', items: { type: 'string' } }
        }
      }
    },
    additionalProperties: false
  }
};

// Compile schemas
const validateWalletCreate = ajv.compile(schemas.walletCreateResponse);
const validateWalletFund = ajv.compile(schemas.walletFundResponse);
const validateWalletTransfer = ajv.compile(schemas.walletTransferResponse);
const validateWalletTransactions = ajv.compile(schemas.walletTransactionsResponse);
const validateError = ajv.compile(schemas.errorResponse);

// Mock authentication middleware for tests
jest.mock('../../middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  }
}));

describe('Wallet API Contract Tests', () => {
  describe('POST /api/wallet', () => {
    it('should respond with valid wallet creation schema', async () => {
      const response = await request(app)
        .post('/api/wallet')
        .send({
          userId: 'user-test-id',
          countryCode: 'IN',
          email: 'testuser@example.com'
        });
      
      // Check status code is in the expected range
      expect([200, 201]).toContain(response.status);
      
      // Validate response against schema
      const valid = validateWalletCreate(response.body);
      if (!valid) {
        console.error('Schema validation errors:', ajv.errorsText(validateWalletCreate.errors));
      }
      expect(valid).toBe(true);
    });
    
    it('should respond with valid error schema for invalid input', async () => {
      const response = await request(app)
        .post('/api/wallet')
        .send({
          // Missing required userId
          countryCode: 'IN'
        });
      
      // Check status code is client error
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
      
      // Validate error response against schema
      const valid = validateError(response.body);
      if (!valid) {
        console.error('Schema validation errors:', ajv.errorsText(validateError.errors));
      }
      expect(valid).toBe(true);
    });
  });
  
  describe('POST /api/wallet/fund', () => {
    it('should respond with valid wallet funding schema', async () => {
      // First create a wallet to fund
      const createResponse = await request(app)
        .post('/api/wallet')
        .send({
          userId: 'user-test-id',
          countryCode: 'IN',
          email: 'testuser@example.com'
        });
      
      const walletId = createResponse.body.id;
      
      const response = await request(app)
        .post('/api/wallet/fund')
        .send({
          walletId,
          amount: 500
        });
      
      // Check status code
      expect(response.status).toBe(200);
      
      // Validate response against schema
      const valid = validateWalletFund(response.body);
      if (!valid) {
        console.error('Schema validation errors:', ajv.errorsText(validateWalletFund.errors));
      }
      expect(valid).toBe(true);
    });
    
    it('should respond with valid error schema for non-existent wallet', async () => {
      const response = await request(app)
        .post('/api/wallet/fund')
        .send({
          walletId: 'non-existent-id',
          amount: 500
        });
      
      // Check status code is client error
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
      
      // Validate error response against schema
      const valid = validateError(response.body);
      if (!valid) {
        console.error('Schema validation errors:', ajv.errorsText(validateError.errors));
      }
      expect(valid).toBe(true);
    });
    
    it('should respond with valid error schema for negative amount', async () => {
      // First create a wallet
      const createResponse = await request(app)
        .post('/api/wallet')
        .send({
          userId: 'user-test-id',
          countryCode: 'IN',
          email: 'testuser@example.com'
        });
      
      const walletId = createResponse.body.id;
      
      const response = await request(app)
        .post('/api/wallet/fund')
        .send({
          walletId,
          amount: -500 // Negative amount
        });
      
      // Check status code is client error
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
      
      // Validate error response against schema
      const valid = validateError(response.body);
      if (!valid) {
        console.error('Schema validation errors:', ajv.errorsText(validateError.errors));
      }
      expect(valid).toBe(true);
    });
  });
  
  describe('POST /api/wallet/transfer', () => {
    it('should respond with valid wallet transfer schema', async () => {
      // Create two wallets for transfer
      const wallet1Response = await request(app)
        .post('/api/wallet')
        .send({
          userId: 'user-test-id-1',
          countryCode: 'IN',
          email: 'testuser1@example.com'
        });
      
      const wallet2Response = await request(app)
        .post('/api/wallet')
        .send({
          userId: 'user-test-id-2',
          countryCode: 'IN',
          email: 'testuser2@example.com'
        });
      
      // Fund the first wallet
      await request(app)
        .post('/api/wallet/fund')
        .send({
          walletId: wallet1Response.body.id,
          amount: 1000
        });
      
      // Perform transfer
      const response = await request(app)
        .post('/api/wallet/transfer')
        .send({
          fromWalletId: wallet1Response.body.id,
          toWalletId: wallet2Response.body.id,
          amount: 200
        });
      
      // Check status code
      expect(response.status).toBe(200);
      
      // Validate response against schema
      const valid = validateWalletTransfer(response.body);
      if (!valid) {
        console.error('Schema validation errors:', ajv.errorsText(validateWalletTransfer.errors));
      }
      expect(valid).toBe(true);
    });
    
    it('should respond with valid error schema for insufficient funds', async () => {
      // Create two wallets for transfer
      const wallet1Response = await request(app)
        .post('/api/wallet')
        .send({
          userId: 'user-test-id-3',
          countryCode: 'IN',
          email: 'testuser3@example.com'
        });
      
      const wallet2Response = await request(app)
        .post('/api/wallet')
        .send({
          userId: 'user-test-id-4',
          countryCode: 'IN',
          email: 'testuser4@example.com'
        });
      
      // Attempt transfer without funding (insufficient balance)
      const response = await request(app)
        .post('/api/wallet/transfer')
        .send({
          fromWalletId: wallet1Response.body.id,
          toWalletId: wallet2Response.body.id,
          amount: 500
        });
      
      // Check status code is client error
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
      
      // Validate error response against schema
      const valid = validateError(response.body);
      if (!valid) {
        console.error('Schema validation errors:', ajv.errorsText(validateError.errors));
      }
      expect(valid).toBe(true);
    });
  });
  
  describe('GET /api/wallet/:walletId/transactions', () => {
    it('should respond with valid transactions list schema', async () => {
      // Create a wallet
      const createResponse = await request(app)
        .post('/api/wallet')
        .send({
          userId: 'user-test-id-5',
          countryCode: 'IN',
          email: 'testuser5@example.com'
        });
      
      const walletId = createResponse.body.id;
      
      // Fund it to create a transaction
      await request(app)
        .post('/api/wallet/fund')
        .send({
          walletId,
          amount: 500
        });
      
      // Get transactions
      const response = await request(app)
        .get(`/api/wallet/${walletId}/transactions`);
      
      // Check status code
      expect(response.status).toBe(200);
      
      // Validate response against schema
      const valid = validateWalletTransactions(response.body);
      if (!valid) {
        console.error('Schema validation errors:', ajv.errorsText(validateWalletTransactions.errors));
      }
      expect(valid).toBe(true);
    });
    
    it('should include pagination parameters in response', async () => {
      // Create a wallet
      const createResponse = await request(app)
        .post('/api/wallet')
        .send({
          userId: 'user-test-id-6',
          countryCode: 'IN',
          email: 'testuser6@example.com'
        });
      
      const walletId = createResponse.body.id;
      
      // Get transactions with pagination
      const response = await request(app)
        .get(`/api/wallet/${walletId}/transactions`)
        .query({ page: 1, limit: 10 });
      
      // Check status code
      expect(response.status).toBe(200);
      
      // Validate response against schema
      const valid = validateWalletTransactions(response.body);
      if (!valid) {
        console.error('Schema validation errors:', ajv.errorsText(validateWalletTransactions.errors));
      }
      expect(valid).toBe(true);
      
      // Check pagination parameters
      expect(response.body.pagination.currentPage).toBe(1);
      expect(response.body.pagination.pageSize).toBe(10);
    });
  });
});
