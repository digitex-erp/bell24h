import { jest } from '@jest/globals';
import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

// Enable better stack traces
process.env.NODE_ENV = 'test';

// Import the controller
import { getFilteredRFQs } from '../controllers/rfqController.js';

// Add debug logging
const debug = (message: string, ...args: any[]) => {
  if (process.env.DEBUG) {
    console.debug(`[DEBUG] ${message}`, ...args);
  }
};

// Mock Prisma client
const mockPrisma = {
  rFQ: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
  $disconnect: jest.fn(),
} as unknown as PrismaClient;

// Mock the Prisma client creation
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

describe('RFQ Controller - Prisma Integration', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;

  // Sample test data
  const mockRFQs = [
    {
      id: '1',
      productName: 'Test Product',
      status: 'submitted',
      buyerName: 'Test Buyer',
      productCategory: 'Electronics',
      price: 1000,
      assignedUser: 'user@example.com',
      supplierRiskScore: 75,
      location: 'New York',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup request with query parameters
    req = {
      query: {},
      params: {},
      body: {},
    };

    // Setup response mock
    json = jest.fn().mockReturnThis();
    status = jest.fn().mockReturnValue({ json });
    
    res = {
      status,
      json,
    };

    // Default mock implementations
    (mockPrisma.rFQ.findMany as jest.Mock).mockResolvedValue(mockRFQs);
    (mockPrisma.rFQ.count as jest.Mock).mockResolvedValue(1);
  });

  afterAll(async () => {
    // Clean up
    await mockPrisma.$disconnect();
  });

  describe('getFilteredRFQs', () => {
    it('should return 400 if no filters are provided', async () => {
      // Call the function
      await getFilteredRFQs(req as Request, res as Response, jest.fn());

      // Assertions
      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith({
        success: false,
        message: 'At least one filter parameter is required',
      });
    });

    it('should filter by status', async () => {
      // Setup request with status filter
      req.query = { status: 'submitted' };
      
      // Call the function
      await getFilteredRFQs(req as Request, res as Response, jest.fn());

      // Assertions
      expect(status).toHaveBeenCalledWith(200);
      expect(mockPrisma.rFQ.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { in: ['submitted'] },
          }),
        })
      );
    });

    it('should handle date range filters', async () => {
      // Setup request with date range
      req.query = {
        creationDateStart: '2023-01-01',
        creationDateEnd: '2023-12-31',
      };
      
      // Call the function
      await getFilteredRFQs(req as Request, res as Response, jest.fn());

      // Assertions
      expect(status).toHaveBeenCalledWith(200);
      expect(mockPrisma.rFQ.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: new Date('2023-01-01'),
              lte: new Date('2023-12-31'),
            },
          }),
        })
      );
    });

    it('should handle pagination', async () => {
      // Setup request with pagination
      req.query = {
        status: 'submitted',
        page: '2',
        limit: '10',
      };
      
      // Call the function
      await getFilteredRFQs(req as Request, res as Response, jest.fn());

      // Assertions
      expect(status).toHaveBeenCalledWith(200);
      expect(mockPrisma.rFQ.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
          where: {
            status: { in: ['submitted'] },
          },
        })
      );
    });
  });
});
