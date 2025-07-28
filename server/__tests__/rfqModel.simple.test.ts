import { jest } from '@jest/globals';

// Mock the Prisma client
const mockPrisma = {
  rFQ: {
    create: jest.fn().mockResolvedValue({ id: 'test-id' }),
    findUnique: jest.fn().mockResolvedValue({ id: 'test-id' }),
  },
};

// Mock the Prisma client module
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

// Import the RFQ model after setting up the mocks
import { RFQ } from '../models/RFQModel';

describe('RFQ Model - Simple Test', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an RFQ', async () => {
    const rfqData = {
      productId: 'prod-123',
      productName: 'Test Product',
      quantity: 10,
      buyerId: 'buyer-123',
      buyerName: 'Test Buyer',
      buyerEmail: 'buyer@example.com',
      buyerCompany: 'Test Company',
    };

    const result = await RFQ.create(rfqData);
    
    expect(mockPrisma.rFQ.create).toHaveBeenCalledWith({
      data: {
        ...rfqData,
        status: 'draft',
        expiryDate: expect.any(Date),
      },
    });
    expect(result).toBeDefined();
  });

  it('should find an RFQ by ID', async () => {
    const rfqId = 'test-id';
    await RFQ.findById(rfqId);
    
    expect(mockPrisma.rFQ.findUnique).toHaveBeenCalledWith({
      where: { id: rfqId },
      include: {
        product: true,
        buyer: true,
        supplier: true,
        quotes: true,
      },
    });
  });
});
