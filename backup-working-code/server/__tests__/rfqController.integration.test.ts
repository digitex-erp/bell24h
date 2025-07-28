import request from 'supertest';
import { app } from '../src/server.js';

// Mock Prisma client
jest.mock('@prisma/client', () => {
  const mockRFQ = {
    findMany: jest.fn(),
    count: jest.fn(),
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      rFQ: mockRFQ,
      $disconnect: jest.fn(),
    })),
    prisma: {
      rFQ: mockRFQ,
    },
  };
});

// Import after setting up the mock
const { prisma } = require('@prisma/client');

describe('RFQ Controller Integration Tests', () => {
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

  describe('GET /api/rfq/filter', () => {
    it('should return RFQs filtered by status', async () => {
      // Mock Prisma response
      (prisma.rFQ.findMany as jest.Mock).mockResolvedValueOnce(mockRFQs);
      (prisma.rFQ.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app)
        .get('/api/rfq/filter')
        .query({ status: 'submitted' });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        success: true,
        data: expect.any(Array),
        pagination: expect.any(Object)
      });
      expect(prisma.rFQ.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { in: ['submitted'] },
          }),
        })
      );
    });

    it('should filter RFQs by date range', async () => {
      // Mock Prisma response
      (prisma.rFQ.findMany as jest.Mock).mockResolvedValueOnce(mockRFQs);
      (prisma.rFQ.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app)
        .get('/api/rfq/filter')
        .query({
          creationDateStart: '2023-01-01',
          creationDateEnd: '2023-12-31',
        });

      expect(response.status).toBe(200);
      expect(prisma.rFQ.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: expect.any(Date),
              lte: expect.any(Date),
            },
          }),
        })
      );
    });

    it('should handle pagination', async () => {
      // Mock Prisma response
      (prisma.rFQ.findMany as jest.Mock).mockResolvedValueOnce(mockRFQs);
      (prisma.rFQ.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app)
        .get('/api/rfq/filter')
        .query({
          page: '2',
          limit: '10',
        });

      expect(response.status).toBe(200);
      expect(prisma.rFQ.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });

    it('should return 500 on database error', async () => {
      // Mock Prisma to throw an error
      (prisma.rFQ.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB Error'));

      const response = await request(app).get('/api/rfq/filter');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('message', 'Internal server error');
    });
  });
});
