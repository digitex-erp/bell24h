import { Request, Response } from 'express';
import { getFilteredRFQs } from '../src/controllers/rfqController';
import { 
  createMockRequest, 
  createMockResponse, 
  resetMocks, 
  mockRFQ, 
  mockNext,
  MockRFQ 
} from './test-utils';

// Mock the Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    rFQ: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
}));

// Mock the Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    rFQ: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
  Prisma: {
    PrismaClientKnownRequestError: class MockPrismaClientKnownRequestError extends Error {
      code: string;
      meta?: Record<string, unknown>;
      
      constructor(message: string, code: string, meta?: Record<string, unknown>) {
        super(message);
        this.code = code;
        this.meta = meta;
        this.name = 'PrismaClientKnownRequestError';
      }
    },
  },
}));

describe('RFQ Controller Integration Tests', () => {
  let req: Request;
  let res: ReturnType<typeof createMockResponse>;

  beforeEach(() => {
    // Reset all mocks before each test
    resetMocks();
    
    // Create fresh request and response for each test
    req = createMockRequest();
    res = createMockResponse();
    
    // Mock console methods to keep test output clean
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore all mocks after each test
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });
  
  afterAll(() => {
    // Clean up any remaining mocks
    jest.resetModules();
  });

  describe('getFilteredRFQs', () => {
    it('should return 400 if no filters are provided', async () => {
      // Act
      await getFilteredRFQs(req as Request, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'At least one filter parameter is required',
      });
    });

    it('should return 200 with filtered results when valid status filter is provided', async () => {
      // Arrange
      req.query = { status: 'submitted' };
      
      // Mock Prisma response
      const mockPrisma = require('@prisma/client').PrismaClient();
      mockPrisma.rFQ.findMany.mockResolvedValue([mockRFQ]);

      // Act
      await getFilteredRFQs(req as Request, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [mockRFQ],
      });
      expect(mockPrisma.rFQ.findMany).toHaveBeenCalledWith({
        where: { status: 'submitted' },
      });
    });

    it('should handle date range filters', async () => {
      // Arrange
      const startDate = '2023-01-01';
      const endDate = '2023-12-31';
      req.query = { startDate, endDate };
      
      // Mock Prisma response
      const mockPrisma = require('@prisma/client').PrismaClient();
      mockPrisma.rFQ.findMany.mockResolvedValue([mockRFQ]);

      // Act
      await getFilteredRFQs(req as Request, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [mockRFQ],
      });
      expect(mockPrisma.rFQ.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      });
    });

    it('should handle errors and call next with error', async () => {
      // Arrange
      req.query = { status: 'invalid' };
      const error = new Error('Database error');
      
      // Mock Prisma to throw an error
      const { PrismaClient } = require('@prisma/client');
      const mockPrisma = new PrismaClient();
      mockPrisma.rFQ.findMany.mockRejectedValue(error);

      // Act
      await getFilteredRFQs(req as Request, res, next);

      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
