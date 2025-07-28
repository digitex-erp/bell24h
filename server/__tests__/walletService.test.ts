import { PrismaClient, PaymentGateway, TransactionStatus, TransactionType } from '@prisma/client';
import { WalletService } from '../services/walletService';

jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    $transaction: jest.fn((cb: any) => cb(mockPrismaClient)),
    wallet: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
    PaymentGateway: { RAZORPAY: 'RAZORPAY', STRIPE: 'STRIPE' },
    TransactionStatus: { COMPLETED: 'COMPLETED', HELD_IN_ESCROW: 'HELD_IN_ESCROW' },
    TransactionType: {
      DEPOSIT: 'DEPOSIT', REFUND: 'REFUND', ESCROW_RELEASE: 'ESCROW_RELEASE', ESCROW_REFUND: 'ESCROW_REFUND', WITHDRAWAL: 'WITHDRAWAL', PAYMENT: 'PAYMENT', ESCROW_HOLD: 'ESCROW_HOLD', FEE: 'FEE', ADJUSTMENT: 'ADJUSTMENT',
    },
  };
});

describe('WalletService', () => {
  let service: WalletService;
  let mockPrisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient();
    service = new WalletService(mockPrisma);
  });

  describe('createWallet', () => {
    it('should create a wallet with default INR for IN', async () => {
      (mockPrisma.wallet.create as jest.Mock).mockResolvedValue({ id: 'w1', currency: 'INR', country: 'IN', status: 'active' });
      const wallet = await service.createWallet('user1', 'IN', 'test@example.com');
      expect(wallet).toHaveProperty('currency', 'INR');
      expect(mockPrisma.wallet.create).toHaveBeenCalled();
    });
    it('should create a wallet with USD for US', async () => {
      (mockPrisma.wallet.create as jest.Mock).mockResolvedValue({ id: 'w2', currency: 'USD', country: 'US', status: 'active' });
      const wallet = await service.createWallet('user2', 'US', 'test@example.com');
      expect(wallet).toHaveProperty('currency', 'USD');
    });
  });

  describe('getWallet', () => {
    it('should fetch wallet by userId', async () => {
      (mockPrisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: 'w1', userId: 'user1' });
      const wallet = await service.getWallet('user1');
      expect(wallet).toHaveProperty('userId', 'user1');
    });
  });

  describe('getWalletById', () => {
    it('should fetch wallet by id', async () => {
      (mockPrisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: 'w1', userId: 'user1' });
      const wallet = await service.getWalletById('w1');
      expect(wallet).toHaveProperty('id', 'w1');
    });
  });

  describe('createTransaction', () => {
    it('should throw if wallet not found', async () => {
      (mockPrisma.wallet.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.createTransaction('bad-id', { amount: 100, type: 'DEPOSIT', status: 'COMPLETED' })).rejects.toThrow();
    });
    it('should create a transaction and update balance for deposit', async () => {
      (mockPrisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: 'w1', balance: 100 });
      (mockPrisma.transaction.create as jest.Mock).mockResolvedValue({ id: 't1', amount: 100, type: 'DEPOSIT' });
      (mockPrisma.wallet.update as jest.Mock).mockResolvedValue({ id: 'w1', balance: 200 });
      const tx = await service.createTransaction('w1', { amount: 100, type: 'DEPOSIT', status: 'COMPLETED' });
      expect(tx).toHaveProperty('id', 't1');
      expect(mockPrisma.wallet.update).toHaveBeenCalled();
    });
  });

  describe('createTransaction (withdrawal)', () => {
    it('should decrement balance for withdrawal', async () => {
      (mockPrisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: 'w1', balance: 200 });
      (mockPrisma.transaction.create as jest.Mock).mockResolvedValue({ id: 't2', amount: 50, type: 'WITHDRAWAL' });
      (mockPrisma.wallet.update as jest.Mock).mockResolvedValue({ id: 'w1', balance: 150 });
      const tx = await service.createTransaction('w1', { amount: 50, type: 'WITHDRAWAL', status: 'COMPLETED' });
      expect(tx).toHaveProperty('id', 't2');
      expect(mockPrisma.wallet.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ balance: { decrement: 50 } }) }));
    });
  });

  describe('createTransaction (escrow-related)', () => {
    it('should increment balance for ESCROW_RELEASE', async () => {
      (mockPrisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: 'w1', balance: 100 });
      (mockPrisma.transaction.create as jest.Mock).mockResolvedValue({ id: 't3', amount: 75, type: 'ESCROW_RELEASE' });
      (mockPrisma.wallet.update as jest.Mock).mockResolvedValue({ id: 'w1', balance: 175 });
      const tx = await service.createTransaction('w1', { amount: 75, type: 'ESCROW_RELEASE', status: 'COMPLETED' });
      expect(tx).toHaveProperty('id', 't3');
      expect(mockPrisma.wallet.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ balance: { increment: 75 } }) }));
    });
    it('should increment balance for ESCROW_REFUND', async () => {
      (mockPrisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: 'w1', balance: 100 });
      (mockPrisma.transaction.create as jest.Mock).mockResolvedValue({ id: 't4', amount: 30, type: 'ESCROW_REFUND' });
      (mockPrisma.wallet.update as jest.Mock).mockResolvedValue({ id: 'w1', balance: 130 });
      const tx = await service.createTransaction('w1', { amount: 30, type: 'ESCROW_REFUND', status: 'COMPLETED' });
      expect(tx).toHaveProperty('id', 't4');
      expect(mockPrisma.wallet.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ balance: { increment: 30 } }) }));
    });
  });

  describe('createWallet gateway logic', () => {
    it('should initialize Stripe customer for US wallet', async () => {
      (mockPrisma.wallet.create as jest.Mock).mockResolvedValue({ id: 'w3', currency: 'USD', country: 'US', status: 'active', gateway: 'STRIPE' });
      // Mock initializeStripeCustomer
      service['initializeStripeCustomer'] = jest.fn().mockResolvedValue(true);
      await service.createWallet('user3', 'US', 'stripe@example.com');
      expect(service['initializeStripeCustomer']).toHaveBeenCalled();
    });
    it('should initialize Razorpay contact for IN wallet', async () => {
      (mockPrisma.wallet.create as jest.Mock).mockResolvedValue({ id: 'w4', currency: 'INR', country: 'IN', status: 'active', gateway: 'RAZORPAY' });
      // Mock initializeRazorpayContact
      service['initializeRazorpayContact'] = jest.fn().mockResolvedValue(true);
      await service.createWallet('user4', 'IN', 'razor@example.com', '9999999999');
      expect(service['initializeRazorpayContact']).toHaveBeenCalled();
    });
  });

  describe('error scenarios', () => {
    it('should throw if createWallet fails', async () => {
      (mockPrisma.wallet.create as jest.Mock).mockRejectedValue(new Error('DB error'));
      await expect(service.createWallet('user5', 'IN')).rejects.toThrow('DB error');
    });
    it('should throw if createTransaction fails internally', async () => {
      (mockPrisma.wallet.findUnique as jest.Mock).mockResolvedValue({ id: 'w6', balance: 100 });
      (mockPrisma.transaction.create as jest.Mock).mockRejectedValue(new Error('Transaction error'));
      await expect(service.createTransaction('w6', { amount: 10, type: 'DEPOSIT', status: 'COMPLETED' })).rejects.toThrow('Transaction error');
    });
  });
});
