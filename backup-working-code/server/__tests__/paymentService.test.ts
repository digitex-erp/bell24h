import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import { PrismaClient } from '@prisma/client';
import { paymentService } from '../services/paymentService';
import { PaymentStatus } from '../models/PaymentModel';

// Mock Prisma client
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    payment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

describe('PaymentService', () => {
  let prisma: jest.Mocked<PrismaClient>;
  const mockPayment = {
    id: 'test-payment-id',
    paymentId: 'pay_123456789',
    orderId: 'order_123',
    userId: 'user_123',
    amount: 1000,
    currency: 'usd',
    status: 'pending' as PaymentStatus,
    provider: 'stripe' as const,
    providerData: {},
    metadata: {},
    verified: false,
    verifiedAt: null,
    lastVerifiedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeAll(() => {
    prisma = new PrismaClient() as jest.Mocked<PrismaClient>;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    jest.clearAllMocks();
  });

  describe('createPayment', () => {
    it('should create a new payment', async () => {
      const paymentData = {
        paymentId: 'pay_123456789',
        orderId: 'order_123',
        userId: 'user_123',
        amount: 1000,
        currency: 'usd',
        provider: 'stripe' as const,
        status: 'pending' as PaymentStatus,
      };

      (prisma.payment.create as jest.Mock).mockResolvedValue(mockPayment);

      const result = await paymentService.createPayment(paymentData);

      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          ...paymentData,
          verified: false,
        },
      });
      expect(result).toEqual(mockPayment);
    });
  });

  describe('getPaymentById', () => {
    it('should return a payment by id', async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(mockPayment);

      const result = await paymentService.getPaymentById('test-payment-id');

      expect(prisma.payment.findUnique).toHaveBeenCalledWith({
        where: { id: 'test-payment-id' },
      });
      expect(result).toEqual(mockPayment);
    });

    it('should return null if payment not found', async () => {
      (prisma.payment.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await paymentService.getPaymentById('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('getPaymentByPaymentId', () => {
    it('should return a payment by paymentId', async () => {
      (prisma.payment.findFirst as jest.Mock).mockResolvedValue(mockPayment);

      const result = await paymentService.getPaymentByPaymentId('pay_123456789');

      expect(prisma.payment.findFirst).toHaveBeenCalledWith({
        where: { paymentId: 'pay_123456789' },
      });
      expect(result).toEqual(mockPayment);
    });
  });

  describe('updatePayment', () => {
    it('should update a payment', async () => {
      const updatedData = {
        status: 'succeeded' as PaymentStatus,
        verified: true,
        verifiedAt: new Date(),
      };

      (prisma.payment.update as jest.Mock).mockResolvedValue({
        ...mockPayment,
        ...updatedData,
      });

      const result = await paymentService.updatePayment('test-payment-id', updatedData);

      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'test-payment-id' },
        data: {
          ...updatedData,
          updatedAt: expect.any(Date),
        },
      });
      expect(result.status).toBe('succeeded');
      expect(result.verified).toBe(true);
    });
  });

  describe('processPayment', () => {
    it('should process a payment successfully', async () => {
      const mockVerifyWithProvider = jest.spyOn(require('../utils/paymentUtils'), 'verifyWithProvider');
      
      mockVerifyWithProvider.mockResolvedValue({
        status: 'succeeded',
        verified: true,
      });

      (prisma.payment.findFirst as jest.Mock).mockResolvedValue(mockPayment);
      (prisma.payment.update as jest.Mock).mockImplementation(({ data }) => ({
        ...mockPayment,
        ...data,
      }));

      const result = await paymentService.processPayment('pay_123456789', {
        type: 'card',
        card: { last4: '4242' },
      });

      expect(mockVerifyWithProvider).toHaveBeenCalledWith('pay_123456789', 'stripe');
      expect(result.status).toBe('succeeded');
      expect(result.verified).toBe(true);
    });

    it('should handle payment processing failure', async () => {
      const mockVerifyWithProvider = jest.spyOn(require('../utils/paymentUtils'), 'verifyWithProvider');
      
      mockVerifyWithProvider.mockRejectedValue(new Error('Payment verification failed'));

      (prisma.payment.findFirst as jest.Mock).mockResolvedValue(mockPayment);
      (prisma.payment.update as jest.Mock).mockImplementation(({ data }) => ({
        ...mockPayment,
        ...data,
      }));

      await expect(
        paymentService.processPayment('pay_123456789', {
          type: 'card',
          card: { last4: '4242' },
        })
      ).rejects.toThrow('Payment verification failed');
    });
  });

  describe('refundPayment', () => {
    it('should process a refund successfully', async () => {
      (prisma.payment.findFirst as jest.Mock).mockResolvedValue({
        ...mockPayment,
        status: 'succeeded',
      });

      (prisma.payment.update as jest.Mock).mockImplementation(({ data }) => ({
        ...mockPayment,
        status: 'refunded',
        providerData: data.providerData,
      }));

      const result = await paymentService.refundPayment('pay_123456789', 500, 'Customer request');

      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: 'test-payment-id' },
        data: {
          status: 'refunded',
          providerData: {
            ...mockPayment.providerData,
            refund: {
              amount: 500,
              reason: 'Customer request',
              timestamp: expect.any(String),
            },
          },
          updatedAt: expect.any(Date),
        },
      });
      expect(result.status).toBe('refunded');
    });

    it('should throw error if payment not found', async () => {
      (prisma.payment.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(
        paymentService.refundPayment('non-existent-payment', 100)
      ).rejects.toThrow('Payment not found');
    });

    it('should throw error if payment not in succeeded state', async () => {
      (prisma.payment.findFirst as jest.Mock).mockResolvedValue({
        ...mockPayment,
        status: 'pending',
      });

      await expect(
        paymentService.refundPayment('pay_123456789', 100)
      ).rejects.toThrow('Only succeeded payments can be refunded');
    });
  });
});
