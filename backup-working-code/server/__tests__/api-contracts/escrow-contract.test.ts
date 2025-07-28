import request from 'supertest';
import app from '../../app';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

// Initialize JSON Schema validator
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// Escrow API schemas
const schemas = {
  // Schema for escrow hold creation response
  escrowCreateResponse: {
    type: 'object',
    required: ['id', 'status', 'amount', 'currency', 'createdAt'],
    properties: {
      id: { type: 'string' },
      status: { type: 'string', enum: ['active', 'released', 'refunded', 'cancelled'] },
      amount: { type: 'number', minimum: 0 },
      currency: { type: 'string', minLength: 1 },
      walletId: { type: 'string' },
      buyerId: { type: 'string' },
      sellerId: { type: 'string' },
      referenceId: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' },
      releaseDate: { type: ['string', 'null'], format: 'date-time' },
      metadata: { type: 'object' }
    },
    additionalProperties: false
  },
  
  // Schema for escrow release response
  escrowReleaseResponse: {
    type: 'object',
    required: ['id', 'status', 'releasedAt'],
    properties: {
      id: { type: 'string' },
      status: { type: 'string', enum: ['released'] },
      releasedAt: { type: 'string', format: 'date-time' },
      transactionId: { type: 'string' }
    },
    additionalProperties: false
  },
  
  // Schema for escrow refund response
  escrowRefundResponse: {
    type: 'object',
    required: ['id', 'status', 'refundedAt'],
    properties: {
      id: { type: 'string' },
      status: { type: 'string', enum: ['refunded'] },
      refundedAt: { type: 'string', format: 'date-time' },
      transactionId: { type: 'string' },
      reason: { type: ['string', 'null'] }
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
const validateEscrowCreate = ajv.compile(schemas.escrowCreateResponse);
const validateEscrowRelease = ajv.compile(schemas.escrowReleaseResponse);
const validateEscrowRefund = ajv.compile(schemas.escrowRefundResponse);
const validateError = ajv.compile(schemas.errorResponse);

// Mock authentication middleware for tests
jest.mock('../../middleware/auth', () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 'test-user-id' };
    next();
  }
}));

describe('Escrow API Contract Tests', () => {
  describe('POST /api/escrow/hold', () => {
    it('should respond with valid escrow creation schema', async () => {
      const response = await request(app)
        .post('/api/escrow/hold')
        .send({
          walletId: 'test-wallet-id',
          amount: 1000,
          currency: 'INR',
          buyerId: 'buyer-test-id',
          sellerId: 'seller-test-id'
        });
      
      // Check status code is in the expected range
      expect([200, 201]).toContain(response.status);
      
      // Validate response against schema
      const valid = validateEscrowCreate(response.body);
      if (!valid) {
        console.error('Schema validation errors:', ajv.errorsText(validateEscrowCreate.errors));
      }
      expect(valid).toBe(true);
    });
    
    it('should respond with valid error schema for invalid input', async () => {
      const response = await request(app)
        .post('/api/escrow/hold')
        .send({
          // Missing required fields
          walletId: 'test-wallet-id'
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
  
  describe('POST /api/escrow/release', () => {
    it('should respond with valid escrow release schema', async () => {
      // First create an escrow to release
      const createResponse = await request(app)
        .post('/api/escrow/hold')
        .send({
          walletId: 'test-wallet-id',
          amount: 1000,
          currency: 'INR',
          buyerId: 'buyer-test-id',
          sellerId: 'seller-test-id'
        });
      
      const escrowId = createResponse.body.id;
      
      const response = await request(app)
        .post('/api/escrow/release')
        .send({
          escrowId,
          userId: 'seller-test-id'
        });
      
      // Check status code
      expect(response.status).toBe(200);
      
      // Validate response against schema
      const valid = validateEscrowRelease(response.body);
      if (!valid) {
        console.error('Schema validation errors:', ajv.errorsText(validateEscrowRelease.errors));
      }
      expect(valid).toBe(true);
    });
    
    it('should respond with valid error schema for non-existent escrow', async () => {
      const response = await request(app)
        .post('/api/escrow/release')
        .send({
          escrowId: 'non-existent-id',
          userId: 'seller-test-id'
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
  
  describe('POST /api/escrow/refund', () => {
    it('should respond with valid escrow refund schema', async () => {
      // First create an escrow to refund
      const createResponse = await request(app)
        .post('/api/escrow/hold')
        .send({
          walletId: 'test-wallet-id',
          amount: 1000,
          currency: 'INR',
          buyerId: 'buyer-test-id',
          sellerId: 'seller-test-id'
        });
      
      const escrowId = createResponse.body.id;
      
      const response = await request(app)
        .post('/api/escrow/refund')
        .send({
          escrowId,
          userId: 'buyer-test-id',
          reason: 'Order cancelled'
        });
      
      // Check status code
      expect(response.status).toBe(200);
      
      // Validate response against schema
      const valid = validateEscrowRefund(response.body);
      if (!valid) {
        console.error('Schema validation errors:', ajv.errorsText(validateEscrowRefund.errors));
      }
      expect(valid).toBe(true);
    });
    
    it('should respond with valid error schema for unauthorized refund', async () => {
      // First create an escrow
      const createResponse = await request(app)
        .post('/api/escrow/hold')
        .send({
          walletId: 'test-wallet-id',
          amount: 1000,
          currency: 'INR',
          buyerId: 'buyer-test-id',
          sellerId: 'seller-test-id'
        });
      
      const escrowId = createResponse.body.id;
      
      // Try to refund with unauthorized user
      const response = await request(app)
        .post('/api/escrow/refund')
        .send({
          escrowId,
          userId: 'unauthorized-user-id'
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
});
