// Simple test for getFilteredRFQs function
import { jest } from '@jest/globals';
import type { NextFunction } from 'express';

// Mock the Prisma client
const mockPrisma = {
  rFQ: {
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
  },
  $disconnect: jest.fn(),
};

// Mock the Prisma client module
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

// Import the controller after setting up the mock
import { getFilteredRFQs } from '../controllers/rfqController';

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
    
    expect(mockPrisma.rFQ.findMany).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
