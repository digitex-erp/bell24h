import { jest } from '@jest/globals';
import { RFQ } from '../models/RFQModel';

// Mock the Prisma client
const mockPrisma = {
  rFQ: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

// Mock the Prisma client module
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

describe('RFQ Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new RFQ with default values', async () => {
      const rfqData = {
        productId: 'prod-123',
        productName: 'Test Product',
        quantity: 10,
        buyerId: 'buyer-123',
        buyerName: 'Test Buyer',
        buyerEmail: 'buyer@example.com',
        buyerCompany: 'Test Company',
      };

      const expectedRFQ = {
        ...rfqData,
        id: 'rfq-123',
        status: 'draft',
        expiryDate: expect.any(Date),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.rFQ.create.mockResolvedValue(expectedRFQ);

      const result = await RFQ.create(rfqData);

      expect(mockPrisma.rFQ.create).toHaveBeenCalledWith({
        data: {
          ...rfqData,
          status: 'draft',
          expiryDate: expect.any(Date),
        },
      });
      expect(result).toEqual(expectedRFQ);
    });
  });

  describe('findById', () => {
    it('should find an RFQ by ID with related data', async () => {
      const rfqId = 'rfq-123';
      const expectedRFQ = {
        id: rfqId,
        product: { id: 'prod-123', name: 'Test Product' },
        buyer: { id: 'buyer-123', name: 'Test Buyer' },
        quotes: [],
      };

      mockPrisma.rFQ.findUnique.mockResolvedValue(expectedRFQ);

      const result = await RFQ.findById(rfqId);

      expect(mockPrisma.rFQ.findUnique).toHaveBeenCalledWith({
        where: { id: rfqId },
        include: {
          product: true,
          buyer: true,
          supplier: true,
          quotes: true,
        },
      });
      expect(result).toEqual(expectedRFQ);
    });
  });

  describe('update', () => {
    it('should update an existing RFQ', async () => {
      const rfqId = 'rfq-123';
      const updateData = {
        status: 'submitted',
        notes: 'Updated notes',
      };

      const updatedRFQ = {
        id: rfqId,
        status: 'submitted',
        notes: 'Updated notes',
        updatedAt: new Date(),
      };

      mockPrisma.rFQ.update.mockResolvedValue(updatedRFQ);

      const result = await RFQ.update(rfqId, updateData);

      expect(mockPrisma.rFQ.update).toHaveBeenCalledWith({
        where: { id: rfqId },
        data: updateData,
      });
      expect(result).toEqual(updatedRFQ);
    });
  });

  describe('listByBuyer', () => {
    it('should list RFQs for a buyer with pagination', async () => {
      const buyerId = 'buyer-123';
      const page = 1;
      const limit = 10;
      
      const mockRFQs = [
        { id: 'rfq-1', buyerId, status: 'submitted' },
        { id: 'rfq-2', buyerId, status: 'draft' },
      ];

      mockPrisma.rFQ.findMany.mockResolvedValue(mockRFQs);
      mockPrisma.rFQ.count.mockResolvedValue(2);

      const result = await RFQ.listByBuyer(buyerId, { page, limit });

      expect(mockPrisma.rFQ.findMany).toHaveBeenCalledWith({
        where: { buyerId },
        skip: 0,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: true,
          quotes: {
            orderBy: { createdAt: 'asc' },
            take: 1,
          },
        },
      });
      expect(result).toEqual({
        data: mockRFQs,
        pagination: {
          total: 2,
          page,
          totalPages: 1,
          limit,
        },
      });
    });
  });
});
