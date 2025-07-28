import { jest } from '@jest/globals';
import type { NextFunction } from 'express';
import { getFilteredRFQs, createRFQ, getRFQ, updateRFQ, listBuyerRFQs } from '../controllers/rfqController';
import { createMockRequest, createMockResponse, mockPrisma, mockRFQ, resetMocks } from './test-utils';

// Mock the Prisma client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

describe('RFQ Controller - Comprehensive Tests', () => {
  let req: any;
  let res: any;
  let next: jest.Mock<NextFunction>;

  beforeEach(() => {
    resetMocks();
    req = createMockRequest();
    res = createMockResponse();
    next = jest.fn();
  });

  afterAll(async () => {
    await mockPrisma.$disconnect();
  });

  describe('getFilteredRFQs', () => {
    it('should return 400 if no filters are provided', async () => {
      await getFilteredRFQs(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'At least one filter parameter is required',
      });
    });

    it('should apply status filter', async () => {
      req.query = { status: 'submitted' };
      
      await getFilteredRFQs(req, res, next);
      
      expect(mockPrisma.rFQ.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { in: ['submitted'] },
          }),
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

  describe('createRFQ', () => {
    it('should create a new RFQ', async () => {
      const newRFQ = { ...mockRFQ, id: 'new-rfq-id' };
      req.body = newRFQ;
      mockPrisma.rFQ.create.mockResolvedValueOnce(newRFQ);
      
      await createRFQ(req, res, next);
      
      expect(mockPrisma.rFQ.create).toHaveBeenCalledWith({
        data: newRFQ,
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: newRFQ,
      });
    });

    it('should handle creation errors', async () => {
      const error = new Error('Creation failed');
      req.body = mockRFQ;
      mockPrisma.rFQ.create.mockRejectedValueOnce(error);
      
      await createRFQ(req, res, next);
      
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getRFQ', () => {
    it('should get an RFQ by ID', async () => {
      req.params = { id: 'test-id-123' };
      
      await getRFQ(req, res, next);
      
      expect(mockPrisma.rFQ.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRFQ,
      });
    });

    it('should return 404 if RFQ not found', async () => {
      req.params = { id: 'non-existent-id' };
      mockPrisma.rFQ.findUnique.mockResolvedValueOnce(null);
      
      await getRFQ(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'RFQ not found',
      });
    });
  });

  describe('updateRFQ', () => {
    it('should update an existing RFQ', async () => {
      const updatedRFQ = { ...mockRFQ, status: 'in_progress' };
      req.params = { id: 'test-id-123' };
      req.body = { status: 'in_progress' };
      mockPrisma.rFQ.update.mockResolvedValueOnce(updatedRFQ);
      
      await updateRFQ(req, res, next);
      
      expect(mockPrisma.rFQ.update).toHaveBeenCalledWith({
        where: { id: 'test-id-123' },
        data: { status: 'in_progress' },
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedRFQ,
      });
    });
  });

  describe('listBuyerRFQs', () => {
    it('should list RFQs for a buyer', async () => {
      const buyerId = 'buyer-123';
      req.params = { buyerId };
      
      await listBuyerRFQs(req, res, next);
      
      expect(mockPrisma.rFQ.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { buyerId },
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
