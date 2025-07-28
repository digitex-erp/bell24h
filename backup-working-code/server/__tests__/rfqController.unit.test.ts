import { Request, Response, NextFunction } from 'express';
import { getFilteredRFQs } from '../controllers/rfqController';

// Mock Express request/response objects
const mockRequest = (query = {}) => ({
  query,
});

const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res as Response;
};

const mockNext = jest.fn() as NextFunction;

// Mock Prisma client
const mockPrisma = {
  rFQ: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

// Mock the Express response object
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

// Mock the Express next function
const mockNext = jest.fn() as NextFunction;

describe('RFQ Controller Unit Tests', () => {
  // Sample test data
  const mockRFQs = [
    {
      id: '1',
      productName: 'Test Product',
      status: 'submitted',
      buyerName: 'Test Buyer',
      productCategory: 'Electronics',
      price: 1000,
      assignedUser: 'user1@example.com',
      supplierRiskScore: 75,
      location: 'New York',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFilteredRFQs', () => {
    it('should filter RFQs by status', async () => {
      // Mock Prisma response
      mockPrisma.rFQ.findMany.mockResolvedValueOnce(mockRFQs);
      mockPrisma.rFQ.count.mockResolvedValueOnce(1);

      const req = {
        query: { status: 'submitted' }
      } as unknown as Request;

      const res = mockResponse();

      // Inject the mock Prisma client
      await getFilteredRFQs(req, res, mockNext, mockPrisma);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockRFQs,
          pagination: expect.objectContaining({
            total: 1,
            page: 1,
            limit: 10,
            totalPages: 1
          })
        })
      );
      
      expect(mockPrisma.rFQ.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { in: ['submitted'] },
          }),
        })
      );
    });

    it('should handle pagination', async () => {
      // Mock Prisma response
      mockPrisma.rFQ.findMany.mockResolvedValueOnce(mockRFQs);
      mockPrisma.rFQ.count.mockResolvedValueOnce(15);

      const req = {
        query: {
          page: '2',
          limit: '5'
        }
      } as unknown as Request;

      const res = mockResponse();

      // Inject the mock Prisma client
      await getFilteredRFQs(req, res, mockNext, mockPrisma);

      expect(mockPrisma.rFQ.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5,
          take: 5,
        })
      );
    });

    it('should handle database errors', async () => {
      // Mock Prisma to throw an error
      const error = new Error('Database error');
      mockPrisma.rFQ.findMany.mockRejectedValueOnce(error);

      const req = { query: {} } as unknown as Request;
      const res = mockResponse();
      const next = jest.fn();

      // Inject the mock Prisma client
      await getFilteredRFQs(req, res, next, mockPrisma);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
