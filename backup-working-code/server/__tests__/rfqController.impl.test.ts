import { Request, Response } from 'express';
import { RFQ } from '../models/RFQModel';
import * as rfqController from '../controllers/rfqController';

// Mock the RFQ model
jest.mock('../models/RFQModel');

// Mock the email service
jest.mock('../services/emailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));

describe('RFQ Controller Implementation Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: Record<string, any>;
  let mockStatus: jest.Mock;
  let mockJson: jest.Mock;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup mock response
    mockJson = jest.fn().mockImplementation((result) => {
      responseObject = result;
      return mockResponse;
    });
    
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    
    mockResponse = {
      status: mockStatus,
      json: mockJson
    };
    
    responseObject = {};
  });

  describe('getFilteredRFQs', () => {
    it('should return 400 if no filters are provided', async () => {
      // Setup mock request with no query parameters
      mockRequest = { query: {} };

      // Call the controller function
      await rfqController.getFilteredRFQs(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assertions
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: 'At least one filter parameter is required'
      });
    });

    it('should filter RFQs by status', async () => {
      // Mock data
      const mockRFQs = [
        { id: '1', status: 'submitted', buyerName: 'Test Buyer' },
        { id: '2', status: 'submitted', buyerName: 'Another Buyer' }
      ];

      // Setup mock implementation
      (RFQ.findMany as jest.Mock).mockResolvedValue(mockRFQs);
      (RFQ.count as jest.Mock).mockResolvedValue(2);

      // Setup request with status filter
      mockRequest = {
        query: { status: 'submitted' }
      };

      // Call the controller function
      await rfqController.getFilteredRFQs(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assertions
      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(responseObject).toMatchObject({
        success: true,
        data: expect.any(Array)
      });
      expect(responseObject.data).toHaveLength(2);
      expect(RFQ.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { status: { in: ['submitted'] } },
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' }
      }));
    });
  });

  describe('createRFQ', () => {
    it('should create a new RFQ with default values', async () => {
      const rfqData = {
        productId: 'prod-123',
        productName: 'Test Product',
        quantity: 10,
        buyerId: 'buyer-123',
        buyerName: 'Test Buyer',
        buyerEmail: 'buyer@example.com',
        buyerCompany: 'Test Company'
      };

      const createdRFQ = {
        ...rfqData,
        id: 'rfq-123',
        status: 'draft',
        expiryDate: new Date()
      };

      // Setup mock implementation
      (RFQ.create as jest.Mock).mockResolvedValue(createdRFQ);

      // Setup request with RFQ data
      mockRequest = {
        body: rfqData
      };

      // Call the controller function
      await rfqController.createRFQ(
        mockRequest as Request,
        mockResponse as Response
      );

      // Assertions
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(responseObject).toMatchObject({
        success: true,
        data: expect.objectContaining({
          id: 'rfq-123',
          status: 'draft',
          ...rfqData
        })
      });
      expect(RFQ.create).toHaveBeenCalledWith(expect.objectContaining({
        status: 'draft',
        expiryDate: expect.any(Date)
      }));
    });
  });
});
