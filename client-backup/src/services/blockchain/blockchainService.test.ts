import { ethers } from 'ethers';
import { BlockchainService } from './blockchainService';
import { Escrow__factory } from '../../../contracts/typechain-types';

// Mock ethers provider and signer
jest.mock('ethers', () => ({
  ethers: {
    providers: {
      Web3Provider: jest.fn().mockImplementation(() => ({
        getSigner: jest.fn().mockReturnValue({
          getAddress: jest.fn().mockResolvedValue('0x123'),
          signMessage: jest.fn().mockResolvedValue('0x456'),
        }),
      })),
    },
    Contract: jest.fn(),
  },
}));

// Mock Escrow contract
jest.mock('../../../contracts/typechain-types', () => ({
  Escrow__factory: {
    connect: jest.fn().mockReturnValue({
      createTransaction: jest.fn(),
      releaseFunds: jest.fn(),
      refund: jest.fn(),
      raiseDispute: jest.fn(),
      resolveDispute: jest.fn(),
      on: jest.fn(),
    }),
  },
}));

describe('BlockchainService', () => {
  let blockchainService: BlockchainService;
  let mockProvider: any;
  let mockSigner: any;
  let mockContract: any;

  beforeEach(() => {
    mockProvider = new ethers.providers.Web3Provider(window.ethereum);
    mockSigner = mockProvider.getSigner();
    mockContract = Escrow__factory.connect('0x123', mockSigner);
    blockchainService = new BlockchainService();
  });

  describe('connectWallet', () => {
    it('should connect to wallet successfully', async () => {
      const result = await blockchainService.connectWallet();
      expect(result).toBe(true);
      expect(mockProvider.getSigner).toHaveBeenCalled();
    });

    it('should handle wallet connection error', async () => {
      jest.spyOn(mockProvider, 'getSigner').mockRejectedValueOnce(new Error('Connection failed'));
      await expect(blockchainService.connectWallet()).rejects.toThrow('Connection failed');
    });
  });

  describe('createTransaction', () => {
    it('should create transaction successfully', async () => {
      const amount = ethers.utils.parseEther('1.0');
      const supplierAddress = '0x456';

      await blockchainService.createTransaction(supplierAddress, amount);

      expect(mockContract.createTransaction).toHaveBeenCalledWith(
        supplierAddress,
        { value: amount }
      );
    });

    it('should handle transaction creation error', async () => {
      jest.spyOn(mockContract, 'createTransaction').mockRejectedValueOnce(
        new Error('Transaction failed')
      );

      await expect(
        blockchainService.createTransaction('0x456', ethers.utils.parseEther('1.0'))
      ).rejects.toThrow('Transaction failed');
    });
  });

  describe('releaseFunds', () => {
    it('should release funds successfully', async () => {
      const transactionId = 1;
      await blockchainService.releaseFunds(transactionId);
      expect(mockContract.releaseFunds).toHaveBeenCalledWith(transactionId);
    });

    it('should handle fund release error', async () => {
      jest.spyOn(mockContract, 'releaseFunds').mockRejectedValueOnce(
        new Error('Release failed')
      );

      await expect(blockchainService.releaseFunds(1)).rejects.toThrow('Release failed');
    });
  });

  describe('refund', () => {
    it('should process refund successfully', async () => {
      const transactionId = 1;
      await blockchainService.refund(transactionId);
      expect(mockContract.refund).toHaveBeenCalledWith(transactionId);
    });

    it('should handle refund error', async () => {
      jest.spyOn(mockContract, 'refund').mockRejectedValueOnce(
        new Error('Refund failed')
      );

      await expect(blockchainService.refund(1)).rejects.toThrow('Refund failed');
    });
  });

  describe('raiseDispute', () => {
    it('should raise dispute successfully', async () => {
      const transactionId = 1;
      const reason = 'Test dispute';
      await blockchainService.raiseDispute(transactionId, reason);
      expect(mockContract.raiseDispute).toHaveBeenCalledWith(transactionId, reason);
    });

    it('should handle dispute raising error', async () => {
      jest.spyOn(mockContract, 'raiseDispute').mockRejectedValueOnce(
        new Error('Dispute failed')
      );

      await expect(
        blockchainService.raiseDispute(1, 'Test dispute')
      ).rejects.toThrow('Dispute failed');
    });
  });

  describe('resolveDispute', () => {
    it('should resolve dispute successfully', async () => {
      const transactionId = 1;
      const releaseFunds = true;
      await blockchainService.resolveDispute(transactionId, releaseFunds);
      expect(mockContract.resolveDispute).toHaveBeenCalledWith(transactionId, releaseFunds);
    });

    it('should handle dispute resolution error', async () => {
      jest.spyOn(mockContract, 'resolveDispute').mockRejectedValueOnce(
        new Error('Resolution failed')
      );

      await expect(
        blockchainService.resolveDispute(1, true)
      ).rejects.toThrow('Resolution failed');
    });
  });

  describe('event listeners', () => {
    it('should set up transaction event listeners', () => {
      blockchainService.setupEventListeners();
      expect(mockContract.on).toHaveBeenCalledWith('TransactionCreated', expect.any(Function));
      expect(mockContract.on).toHaveBeenCalledWith('FundsReleased', expect.any(Function));
      expect(mockContract.on).toHaveBeenCalledWith('DisputeRaised', expect.any(Function));
      expect(mockContract.on).toHaveBeenCalledWith('DisputeResolved', expect.any(Function));
    });

    it('should handle transaction created event', () => {
      const callback = jest.fn();
      blockchainService.onTransactionCreated(callback);

      const mockEvent = {
        transactionId: 1,
        buyer: '0x123',
        supplier: '0x456',
        amount: ethers.utils.parseEther('1.0'),
      };

      const eventHandler = mockContract.on.mock.calls[0][1];
      eventHandler(mockEvent);

      expect(callback).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle funds released event', () => {
      const callback = jest.fn();
      blockchainService.onFundsReleased(callback);

      const mockEvent = {
        transactionId: 1,
        buyer: '0x123',
        supplier: '0x456',
        amount: ethers.utils.parseEther('1.0'),
      };

      const eventHandler = mockContract.on.mock.calls[1][1];
      eventHandler(mockEvent);

      expect(callback).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle dispute raised event', () => {
      const callback = jest.fn();
      blockchainService.onDisputeRaised(callback);

      const mockEvent = {
        transactionId: 1,
        buyer: '0x123',
        supplier: '0x456',
        reason: 'Test dispute',
      };

      const eventHandler = mockContract.on.mock.calls[2][1];
      eventHandler(mockEvent);

      expect(callback).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle dispute resolved event', () => {
      const callback = jest.fn();
      blockchainService.onDisputeResolved(callback);

      const mockEvent = {
        transactionId: 1,
        buyer: '0x123',
        supplier: '0x456',
        fundsReleased: true,
      };

      const eventHandler = mockContract.on.mock.calls[3][1];
      eventHandler(mockEvent);

      expect(callback).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      jest.spyOn(mockProvider, 'getSigner').mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(blockchainService.connectWallet()).rejects.toThrow('Network error');
    });

    it('should handle contract interaction errors', async () => {
      jest.spyOn(mockContract, 'createTransaction').mockRejectedValueOnce(
        new Error('Contract interaction failed')
      );

      await expect(
        blockchainService.createTransaction('0x456', ethers.utils.parseEther('1.0'))
      ).rejects.toThrow('Contract interaction failed');
    });

    it('should handle invalid transaction amounts', async () => {
      await expect(
        blockchainService.createTransaction('0x456', ethers.utils.parseEther('0'))
      ).rejects.toThrow('Amount must be greater than 0');
    });

    it('should handle invalid addresses', async () => {
      await expect(
        blockchainService.createTransaction('invalid-address', ethers.utils.parseEther('1.0'))
      ).rejects.toThrow('Invalid address');
    });
  });
}); 