import { PrismaClient, PaymentGateway } from '@prisma/client';
import { EscrowService } from '../services/escrowService.new';
import { walletService } from '../services/walletService';

// Create a type for our mocked wallet service
type MockWalletService = {
  createTransaction: jest.Mock;
  toggleEscrow: jest.Mock;
};

// Mock the PrismaClient and WalletService
jest.mock('@prisma/client', () => {
  const mockPrismaClient: Record<string, any> = {
    $transaction: jest.fn((callback: Function) => callback(mockPrismaClient)),
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    escrowHold: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    wallet: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };
  
  // Mock the Prisma constructor
  const mockConstructor = jest.fn(() => mockPrismaClient);
  
  return {
    PrismaClient: mockConstructor,
    PaymentGateway: {
      RAZORPAY: 'RAZORPAY',
      STRIPE: 'STRIPE',
    },
    TransactionStatus: {
      PENDING: 'PENDING',
      COMPLETED: 'COMPLETED',
      FAILED: 'FAILED',
    },
    TransactionType: {
      ESCROW_HOLD: 'ESCROW_HOLD',
      ESCROW_RELEASE: 'ESCROW_RELEASE',
      ESCROW_REFUND: 'ESCROW_REFUND',
    },
  };
});

jest.mock('../services/walletService', () => {
  return {
    walletService: {
      createTransaction: jest.fn().mockResolvedValue({ id: 'mock-transaction-id', amount: 1000 }),
      toggleEscrow: jest.fn(),
    },
  };
});

describe('EscrowService', () => {
  let escrowService: EscrowService;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let mockWalletService: MockWalletService;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Initialize mocks
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    mockWalletService = walletService as unknown as MockWalletService;
    
    // Create escrow service with mocked dependencies
    escrowService = new EscrowService(mockPrisma);
    
    // Default mock implementations
    (mockPrisma.wallet.findUnique as jest.Mock).mockResolvedValue({
      id: 'wallet-1',
      userId: 'user-1',
      balance: 10000,
      escrowBalance: 0,
      currency: 'INR',
      isEscrowEnabled: false,
      escrowThreshold: 5000,
      status: 'active',
    });
    
    (mockPrisma.user.findUnique as jest.Mock).mockImplementation((args) => {
      const id = args.where.id;
      if (id === 'buyer-1') {
        return Promise.resolve({ id: 'buyer-1', name: 'Test Buyer', email: 'buyer@example.com' });
      } else if (id === 'seller-1') {
        return Promise.resolve({ id: 'seller-1', name: 'Test Seller', email: 'seller@example.com' });
      }
      return Promise.resolve(null);
    });
    
    (mockPrisma.wallet.findMany as jest.Mock).mockResolvedValue([
      {
        id: 'seller-wallet-1',
        userId: 'seller-1',
        balance: 5000,
        currency: 'INR',
        isEscrowEnabled: true,
        status: 'active',
      }
    ]);
    
    (mockPrisma.escrowHold.create as jest.Mock).mockResolvedValue({
      id: 'escrow-1',
      walletId: 'wallet-1',
      amount: 1000,
      currency: 'INR',
      status: 'ACTIVE',
      buyerId: 'buyer-1',
      sellerId: 'seller-1',
      sellerWalletId: 'seller-wallet-1',
      gateway: PaymentGateway.RAZORPAY,
      createdAt: new Date(),
      releasedAt: null,
      transactions: [],
      buyer: { id: 'buyer-1', name: 'Test Buyer', email: 'buyer@example.com' },
      seller: { id: 'seller-1', name: 'Test Seller', email: 'seller@example.com' },
      wallet: { id: 'wallet-1', balance: 10000, escrowBalance: 1000 },
    });
  });
  
  describe('checkEscrowRules', () => {
    it('should throw an error if wallet is not found', async () => {
      // Setup
      (mockPrisma.wallet.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Test & Assert
      await expect(escrowService.checkEscrowRules({
        walletId: 'non-existent-wallet',
        amount: 1000,
      })).rejects.toThrow('Wallet not found for escrow rule check');
    });
    
    it('should require escrow if wallet has isEscrowEnabled set to true', async () => {
      // Setup
      (mockPrisma.wallet.findUnique as jest.Mock).mockResolvedValue({
        id: 'wallet-1',
        isEscrowEnabled: true,
        escrowThreshold: 5000,
      });
      
      // Test
      const result = await escrowService.checkEscrowRules({
        walletId: 'wallet-1',
        amount: 1000,
      });
      
      // Assert
      expect(result.isEscrowRequired).toBe(true);
      expect(result.reason).toBe('MANUAL_ESCROW_ENABLED');
    });
    
    it('should require escrow if amount exceeds threshold', async () => {
      // Setup
      (mockPrisma.wallet.findUnique as jest.Mock).mockResolvedValue({
        id: 'wallet-1',
        isEscrowEnabled: false,
        escrowThreshold: 5000,
      });
      
      // Test
      const result = await escrowService.checkEscrowRules({
        walletId: 'wallet-1',
        amount: 6000, // Above threshold
      });
      
      // Assert
      expect(result.isEscrowRequired).toBe(true);
      expect(result.reason).toBe('AMOUNT_THRESHOLD');
    });
    
    it('should require escrow for high-risk order types', async () => {
      // Setup
      (mockPrisma.wallet.findUnique as jest.Mock).mockResolvedValue({
        id: 'wallet-1',
        isEscrowEnabled: false,
        escrowThreshold: 5000,
        highRiskOrderTypes: ['INTERNATIONAL', 'CUSTOM'],
      });
      
      // Test
      const result = await escrowService.checkEscrowRules({
        walletId: 'wallet-1',
        amount: 1000, // Below threshold
        orderType: 'INTERNATIONAL',
      });
      
      // Assert
      expect(result.isEscrowRequired).toBe(true);
      expect(result.reason).toBe('HIGH_RISK_ORDER_TYPE');
    });
    
    it('should not require escrow if all rules pass', async () => {
      // Setup
      (mockPrisma.wallet.findUnique as jest.Mock).mockResolvedValue({
        id: 'wallet-1',
        isEscrowEnabled: false,
        escrowThreshold: 5000,
        highRiskOrderTypes: ['INTERNATIONAL'],
      });
      
      // Test
      const result = await escrowService.checkEscrowRules({
        walletId: 'wallet-1',
        amount: 1000, // Below threshold
        orderType: 'STANDARD',
      });
      
      // Assert
      expect(result.isEscrowRequired).toBe(false);
      expect(result.reason).toBeUndefined();
    });
  });
  
  describe('createEscrowHold', () => {
    it('should throw an error if wallet is not found', async () => {
      // Setup
      (mockPrisma.wallet.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Test & Assert
      await expect(escrowService.createEscrowHold({
        walletId: 'non-existent-wallet',
        amount: 1000,
        currency: 'INR',
        gateway: PaymentGateway.RAZORPAY,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      })).rejects.toThrow('Wallet not found');
    });
    
    it('should throw an error if wallet has insufficient balance', async () => {
      // Setup
      (mockPrisma.wallet.findUnique as jest.Mock).mockResolvedValue({
        id: 'wallet-1',
        balance: 500, // Less than amount
        escrowBalance: 0,
      });
      
      // Test & Assert
      await expect(escrowService.createEscrowHold({
        walletId: 'wallet-1',
        amount: 1000,
        currency: 'INR',
        gateway: PaymentGateway.RAZORPAY,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      })).rejects.toThrow('Insufficient balance for escrow hold');
    });
    
    it('should throw an error if buyer or seller is not found', async () => {
      // Setup
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Test & Assert
      await expect(escrowService.createEscrowHold({
        walletId: 'wallet-1',
        amount: 1000,
        currency: 'INR',
        gateway: PaymentGateway.RAZORPAY,
        buyerId: 'non-existent-buyer',
        sellerId: 'non-existent-seller',
      })).rejects.toThrow('Buyer or seller not found');
    });
    
    it('should throw an error if no active seller wallets are found', async () => {
      // Setup
      (mockPrisma.wallet.findMany as jest.Mock).mockResolvedValue([]);
      
      // Test & Assert
      await expect(escrowService.createEscrowHold({
        walletId: 'wallet-1',
        amount: 1000,
        currency: 'INR',
        gateway: PaymentGateway.RAZORPAY,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
      })).rejects.toThrow('No active seller wallets found');
    });
    
    it('should successfully create an escrow hold with explicitly provided seller wallet', async () => {
      // Test
      const result = await escrowService.createEscrowHold({
        walletId: 'wallet-1',
        amount: 1000,
        currency: 'INR',
        gateway: PaymentGateway.RAZORPAY,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        sellerWalletId: 'seller-wallet-1', // Explicitly specified
      });
      
      // Assert
      expect(mockPrisma.escrowHold.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            walletId: 'wallet-1',
            amount: 1000,
            currency: 'INR',
            buyerId: 'buyer-1',
            sellerId: 'seller-1',
            sellerWalletId: 'seller-wallet-1',
          }),
        })
      );
      expect(result).toHaveProperty('id', 'escrow-1');
      expect(result).toHaveProperty('sellerWalletId', 'seller-wallet-1');
    });
    
    it('should auto-select a matching seller wallet if not explicitly provided', async () => {
      // Setup: Multiple seller wallets
      (mockPrisma.wallet.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'seller-wallet-1',
          userId: 'seller-1',
          currency: 'USD', // Different currency
          isEscrowEnabled: true,
          status: 'active',
        },
        {
          id: 'seller-wallet-2',
          userId: 'seller-1',
          currency: 'INR', // Matching currency
          isEscrowEnabled: true,
          status: 'active',
        },
      ]);
      
      // Test
      const result = await escrowService.createEscrowHold({
        walletId: 'wallet-1',
        amount: 1000,
        currency: 'INR',
        gateway: PaymentGateway.RAZORPAY,
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        // No sellerWalletId provided - should auto-select
      });
      
      // Assert
      // Verify the result contains expected data
      expect(result).toBeDefined();
      expect(result.id).toBe('escrow-1');
      
      // Verify the correct method was called with expected arguments
      expect(mockPrisma.escrowHold.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            sellerWalletId: 'seller-wallet-2', // Should select this wallet (matching currency)
          }),
        })
      );
    });
  });
  
  describe('releaseEscrow', () => {
    beforeEach(() => {
      // Setup for releaseEscrow tests
      (mockPrisma.escrowHold.findUnique as jest.Mock).mockResolvedValue({
        id: 'escrow-1',
        walletId: 'wallet-1',
        sellerWalletId: 'seller-wallet-1',
        amount: 1000,
        currency: 'INR',
        status: 'ACTIVE',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        metadata: {},
      });
    });
    
    it('should throw an error if escrow hold is not found', async () => {
      // Setup
      (mockPrisma.escrowHold.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Test & Assert
      await expect(escrowService.releaseEscrow({
        escrowHoldId: 'non-existent-escrow',
      })).rejects.toThrow('Escrow hold not found');
    });
    
    it('should throw an error if escrow hold is not active', async () => {
      // Setup
      (mockPrisma.escrowHold.findUnique as jest.Mock).mockResolvedValue({
        id: 'escrow-1',
        status: 'RELEASED',
      });
      
      // Test & Assert
      await expect(escrowService.releaseEscrow({
        escrowHoldId: 'escrow-1',
      })).rejects.toThrow('Escrow hold is not active');
    });
    
    it('should successfully release an escrow hold', async () => {
      // Setup
      (mockPrisma.escrowHold.update as jest.Mock).mockResolvedValue({
        id: 'escrow-1',
        status: 'RELEASED',
        releasedAt: expect.any(Date),
      });
      
      // Test
      const result = await escrowService.releaseEscrow({
        escrowHoldId: 'escrow-1',
      });
      
      // Assert
      expect(mockPrisma.escrowHold.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'escrow-1' },
          data: expect.objectContaining({
            status: 'RELEASED',
            releasedAt: expect.any(Date),
          }),
        })
      );
      expect(result).toHaveProperty('status', 'RELEASED');
    });
  });
  
  describe('refundEscrow', () => {
    beforeEach(() => {
      // Setup for refundEscrow tests
      (mockPrisma.escrowHold.findUnique as jest.Mock).mockResolvedValue({
        id: 'escrow-1',
        walletId: 'wallet-1',
        amount: 1000,
        currency: 'INR',
        status: 'ACTIVE',
        buyerId: 'buyer-1',
        sellerId: 'seller-1',
        metadata: {},
      });
    });
    
    it('should throw an error if escrow hold is not found', async () => {
      // Setup
      (mockPrisma.escrowHold.findUnique as jest.Mock).mockResolvedValue(null);
      
      // Test & Assert
      await expect(escrowService.refundEscrow({
        escrowHoldId: 'non-existent-escrow',
      })).rejects.toThrow('Escrow hold not found');
    });
    
    it('should throw an error if escrow hold is not active', async () => {
      // Setup
      (mockPrisma.escrowHold.findUnique as jest.Mock).mockResolvedValue({
        id: 'escrow-1',
        status: 'REFUNDED',
      });
      
      // Test & Assert
      await expect(escrowService.refundEscrow({
        escrowHoldId: 'escrow-1',
      })).rejects.toThrow('Escrow hold is not active');
    });
    
    it('should successfully refund an escrow hold', async () => {
      // Setup
      (mockPrisma.escrowHold.update as jest.Mock).mockResolvedValue({
        id: 'escrow-1',
        status: 'REFUNDED',
        refundedAt: expect.any(Date),
      });
      
      // Test
      const result = await escrowService.refundEscrow({
        escrowHoldId: 'escrow-1',
        reason: 'Order cancelled',
      });
      
      // Assert
      expect(mockPrisma.escrowHold.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'escrow-1' },
          data: expect.objectContaining({
            status: 'REFUNDED',
            refundedAt: expect.any(Date),
            metadata: expect.objectContaining({
              refundReason: 'Order cancelled',
            }),
          }),
        })
      );
      expect(result).toHaveProperty('status', 'REFUNDED');
    });
  });
});
