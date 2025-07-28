import { jest } from '@jest/globals';
import { Request, Response } from 'express';
import { RFQ } from '../models/RFQModel';
import * as rfqController from '../controllers/rfqController';

// Mock the RFQ model
jest.mock('../models/RFQModel');

// Mock the email service
jest.mock('../services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));

describe('RFQ Controller - Complete Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: Record<string, any>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup mock response
    responseObject = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockImplementation((result) => {
        responseObject = result;
        return mockResponse;
      }),
      send: jest.fn().mockReturnThis()
    };
  });

  describe('getFilteredRFQs', () => {
    it('should filter RFQs by status', async () => {
      // Mock request with status filter
      mockRequest = {
        query: {
          status: 'submitted',
          page: '1',
          limit: '10'
        }
      };

      // Mock the RFQ model response
      const mockRFQs = [
        { id: '1', status: 'submitted', buyerName: 'Test Buyer' },
        { id: '2', status: 'submitted', buyerName: 'Another Buyer' }
      ];

      (RFQ as any).findMany = jest.fn().mockResolvedValue(mockRFQs);
      (RFQ as any).count = jest.fn().mockResolvedValue(2);

      // Call the controller
      await rfqController.getFilteredRFQs(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assertions
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.success).toBe(true);
      expect(responseObject.data).toHaveLength(2);
      expect(RFQ.findMany).toHaveBeenCalledWith({
        where: {
          status: { in: ['submitted'] }
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' }
      });
    });
  });

  describe('createRFQ', () => {
    it('should create a new RFQ', async () => {
      const rfqData = {
        productId: 'prod-123',
        productName: 'Test Product',
        quantity: 10,
        buyerId: 'buyer-123',
        buyerName: 'Test Buyer',
        buyerEmail: 'buyer@example.com',
        buyerCompany: 'Test Company'
      };

      mockRequest = {
        body: rfqData
      };

      const createdRFQ = {
        id: 'rfq-123',
        ...rfqData,
        status: 'draft',
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      (RFQ as any).create = jest.fn().mockResolvedValue(createdRFQ);

      await rfqController.createRFQ(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(responseObject.message).toBe('RFQ created successfully');
      expect(responseObject.rfq).toMatchObject({
        id: 'rfq-123',
        status: 'draft'
      });
    });
  });

  describe('getRFQ', () => {
    it('should get an RFQ by ID', async () => {
      const rfqId = 'rfq-123';
      const mockRFQ = {
        id: rfqId,
        productName: 'Test Product',
        buyerName: 'Test Buyer',
        status: 'submitted'
      };

      mockRequest = {
        params: { id: rfqId }
      };

      (RFQ as any).findById = jest.fn().mockResolvedValue(mockRFQ);

      await rfqController.getRFQ(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject).toMatchObject({
        id: rfqId,
        status: 'submitted'
      });
      expect(RFQ.findById).toHaveBeenCalledWith(rfqId);
    });
  });

  describe('updateRFQ', () => {
    it('should update an existing RFQ', async () => {
      const rfqId = 'rfq-123';
      const updateData = {
        status: 'quoted',
        quotedPrice: 1000,
        quotedCurrency: 'USD'
      };

      mockRequest = {
        params: { id: rfqId },
        body: updateData
      };

      const updatedRFQ = {
        id: rfqId,
        productName: 'Test Product',
        status: 'quoted',
        quotedPrice: 1000,
        quotedCurrency: 'USD',
        quotedAt: new Date()
      };

      (RFQ as any).update = jest.fn().mockResolvedValue(updatedRFQ);

      await rfqController.updateRFQ(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.message).toBe('RFQ updated successfully');
      expect(responseObject.rfq).toMatchObject({
        id: rfqId,
        status: 'quoted',
        quotedPrice: 1000
      });
    });
  });

  describe('listBuyerRFQs', () => {
    it('should list RFQs for a buyer', async () => {
      const buyerId = 'buyer-123';
      const mockRFQs = [
        { id: '1', buyerId, status: 'submitted' },
        { id: '2', buyerId, status: 'draft' }
      ];

      mockRequest = {
        user: { id: buyerId },
        query: { page: '1', limit: '10' }
      };

      (RFQ as any).listByBuyer = jest.fn().mockResolvedValue({
        items: mockRFQs,
        pagination: {
          total: 2,
          page: 1,
          totalPages: 1,
          limit: 10
        }
      });

      await rfqController.listBuyerRFQs(
        mockRequest as any, // Cast to any to bypass type checking for user property
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(responseObject.data).toHaveLength(2);
      expect(responseObject.pagination.total).toBe(2);
      expect(RFQ.listByBuyer).toHaveBeenCalledWith(buyerId, {
        page: 1,
        limit: 10
      });
    });
  });
});
