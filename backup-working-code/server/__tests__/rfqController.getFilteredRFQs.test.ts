import { jest } from '@jest/globals';
import type { NextFunction } from 'express';
import { getFilteredRFQs } from '../controllers/rfqController';

// Mock the Prisma client
const mockPrisma = {
  rFQ: {
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
  },
  $disconnect: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

describe('getFilteredRFQs', () => {
  let req: any;
  let res: any;
  let next: jest.Mock<NextFunction>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Setup fresh request and response objects
    req = {
      query: {},
      params: {},
      body: {},
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    
    next = jest.fn();
  });

  afterAll(async () => {
    await mockPrisma.$disconnect();
  });

  it('should return 400 if no filters are provided', async () => {
    await getFilteredRFQs(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'At least one filter parameter is required',
    });
  });

  it('should filter by status', async () => {
    req.query = { status: 'submitted' };
    
    await getFilteredRFQs(req, res, next);
    
    expect(mockPrisma.rFQ.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: { in: ['submitted'] },
        },
      })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it('should handle date range filters', async () => {
    req.query = {
      creationDateStart: '2023-01-01',
      creationDateEnd: '2023-12-31',
    };
    
    await getFilteredRFQs(req, res, next);
    
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

  it('should handle errors', async () => {
    const error = new Error('Database error');
    mockPrisma.rFQ.findMany.mockRejectedValueOnce(error);
    req.query = { status: 'submitted' };
    
    await getFilteredRFQs(req, res, next);
    
    expect(next).toHaveBeenCalledWith(error);
  });
});
