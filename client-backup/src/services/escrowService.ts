import { blockchainService } from './blockchainService.js';
import { 
  EscrowContract, 
  CreateEscrowRequest, 
  EscrowCreateResponse, 
  EscrowStatusResponse, 
  EscrowOperationResponse,
  ReleaseEscrowRequest,
  RefundEscrowRequest,
  DisputeEscrowRequest
} from '../types/blockchain.js';

// Mock escrow contract ABI, this would be replaced with the actual ABI
const ESCROW_ABI = [
  'function createEscrow(address buyer, address seller, uint256 amount, uint256 expiresAt) payable returns (uint256 escrowId)',
  'function releaseEscrow(uint256 escrowId) returns (bool)',
  'function refundEscrow(uint256 escrowId) returns (bool)',
  'function disputeEscrow(uint256 escrowId, string reason) returns (bool)',
  'function getEscrow(uint256 escrowId) view returns (address buyer, address seller, uint256 amount, uint256 createdAt, uint256 expiresAt, uint8 status)',
  'function resolveDispute(uint256 escrowId, address recipient, uint256 buyerAmount, uint256 sellerAmount) returns (bool)'
];

// Escrow contract address per network (for demo purposes)
const ESCROW_CONTRACTS = {
  // Sample addresses, these would be replaced with the actual deployed contracts
  'mainnet': '0x8901B8Fe4BB26ffBD7CEbe13E2761E0D7Ad67F11',
  'mumbai': '0xF47B7B7e7600E8a0C61d6eC94A2C7F07c7917AbE',
  'localhost': '0x5FbDB2315678afecb367f032d93F642f64180aa3'
};

// Enum for escrow status codes from smart contract
enum EscrowStatus {
  CREATED = 0,
  FUNDED = 1,
  RELEASED = 2,
  REFUNDED = 3,
  DISPUTED = 4,
  RESOLVED = 5
}

// Helper to convert numeric status to string status
const mapEscrowStatus = (status: number): EscrowContract['status'] => {
  const statusMap: Record<number, EscrowContract['status']> = {
    [EscrowStatus.CREATED]: 'created',
    [EscrowStatus.FUNDED]: 'funded',
    [EscrowStatus.RELEASED]: 'released',
    [EscrowStatus.REFUNDED]: 'refunded',
    [EscrowStatus.DISPUTED]: 'disputed',
    [EscrowStatus.RESOLVED]: 'resolved'
  };
  return statusMap[status] || 'created';
};

class EscrowService {
  private static instance: EscrowService;
  
  // In-memory cache of recent escrows (for demo purposes)
  private escrowCache: Map<string, EscrowContract> = new Map();
  
  private constructor() {}
  
  public static getInstance(): EscrowService {
    if (!EscrowService.instance) {
      EscrowService.instance = new EscrowService();
    }
    return EscrowService.instance;
  }
  
  /**
   * Get the appropriate escrow contract address based on the current network
   */
  private async getEscrowContractAddress(): Promise<string> {
    const { chainId } = await blockchainService.connect();
    
    // Map chainId to network name (simplified version)
    let network = 'localhost';
    if (chainId === 1n) network = 'mainnet';
    else if (chainId === 80001n) network = 'mumbai';
    
    return ESCROW_CONTRACTS[network as keyof typeof ESCROW_CONTRACTS];
  }
  
  /**
   * Create a new escrow contract between buyer and seller
   */
  public async createEscrow(request: CreateEscrowRequest): Promise<EscrowCreateResponse> {
    try {
      // Connect to wallet
      const { address } = await blockchainService.connect();
      
      // Get contract address for current network
      const contractAddress = await this.getEscrowContractAddress();
      
      // Calculate expiry time in seconds from now
      const expiresAt = Math.floor(Date.now() / 1000) + (request.expiresInDays * 86400);
      
      // Call contract method to create escrow
      const result = await blockchainService.callContractMethod(
        contractAddress,
        ESCROW_ABI,
        'createEscrow',
        [
          request.buyerId, 
          request.sellerId,
          request.amount, // amount in smallest unit (wei, satoshi, etc.)
          expiresAt
        ],
        {
          value: request.amount // If ETH escrow, send the value with the transaction
        }
      );
      
      // Create escrow object
      const escrowId = `escrow_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const newEscrow: EscrowContract = {
        id: escrowId,
        contractAddress,
        buyerId: request.buyerId,
        sellerId: request.sellerId,
        amount: request.amount,
        currency: request.currency,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(expiresAt * 1000).toISOString(),
        status: 'funded', // Assuming it's immediately funded since we're sending value
        transactionHash: result.transactionHash,
        metadata: request.metadata
      };
      
      // Cache the escrow
      this.escrowCache.set(escrowId, newEscrow);
      
      return {
        success: true,
        escrow: newEscrow,
        transactionHash: result.transactionHash
      };
    } catch (error: any) {
      console.error('Failed to create escrow:', error);
      return {
        success: false,
        error: error.message || 'Failed to create escrow'
      };
    }
  }
  
  /**
   * Get the status of an escrow by ID
   */
  public async getEscrowStatus(escrowId: string): Promise<EscrowStatusResponse> {
    try {
      // First check cache
      if (this.escrowCache.has(escrowId)) {
        return {
          success: true,
          escrow: this.escrowCache.get(escrowId),
          status: this.escrowCache.get(escrowId)?.status
        };
      }
      
      // If not in cache, fetch from blockchain
      const contractAddress = await this.getEscrowContractAddress();
      
      // This is a simplified version - in reality, you'd need to map the escrowId to the actual 
      // on-chain identifier, which might require an additional mapping or API call
      const result = await blockchainService.callContractMethod(
        contractAddress,
        ESCROW_ABI,
        'getEscrow',
        [escrowId.split('_')[1]] // Assuming the ID format includes the actual numeric ID
      );
      
      // Parse the result
      const [buyer, seller, amount, createdAt, expiresAt, statusCode] = result;
      
      const escrow: EscrowContract = {
        id: escrowId,
        contractAddress,
        buyerId: buyer,
        sellerId: seller,
        amount: amount.toString(),
        currency: 'ETH', // Assuming ETH for simplicity
        createdAt: new Date(Number(createdAt) * 1000).toISOString(),
        expiresAt: new Date(Number(expiresAt) * 1000).toISOString(),
        status: mapEscrowStatus(statusCode)
      };
      
      // Update cache
      this.escrowCache.set(escrowId, escrow);
      
      return {
        success: true,
        escrow,
        status: escrow.status
      };
    } catch (error: any) {
      console.error('Failed to get escrow status:', error);
      return {
        success: false,
        error: error.message || 'Failed to get escrow status'
      };
    }
  }
  
  /**
   * Release funds from escrow to the seller
   */
  public async releaseEscrow(request: ReleaseEscrowRequest): Promise<EscrowOperationResponse> {
    try {
      // Verify the caller is authorized (would be more robust in production)
      await blockchainService.connect();
      
      const contractAddress = await this.getEscrowContractAddress();
      
      // Call release method
      const result = await blockchainService.callContractMethod(
        contractAddress,
        ESCROW_ABI,
        'releaseEscrow',
        [request.escrowId.split('_')[1]] // Extract numeric ID
      );
      
      // Update the cached escrow if it exists
      if (this.escrowCache.has(request.escrowId)) {
        const escrow = this.escrowCache.get(request.escrowId)!;
        escrow.status = 'released';
        escrow.releaseTxHash = result.transactionHash;
        this.escrowCache.set(request.escrowId, escrow);
        
        return {
          success: true,
          escrow,
          transactionHash: result.transactionHash
        };
      }
      
      // If escrow wasn't cached, fetch the updated state
      const statusResponse = await this.getEscrowStatus(request.escrowId);
      if (!statusResponse.success) {
        throw new Error(statusResponse.error);
      }
      
      return {
        success: true,
        escrow: statusResponse.escrow,
        transactionHash: result.transactionHash
      };
    } catch (error: any) {
      console.error('Failed to release escrow:', error);
      return {
        success: false,
        error: error.message || 'Failed to release escrow'
      };
    }
  }
  
  /**
   * Refund funds from escrow to the buyer
   */
  public async refundEscrow(request: RefundEscrowRequest): Promise<EscrowOperationResponse> {
    try {
      // Similar to releaseEscrow
      await blockchainService.connect();
      
      const contractAddress = await this.getEscrowContractAddress();
      
      const result = await blockchainService.callContractMethod(
        contractAddress,
        ESCROW_ABI,
        'refundEscrow',
        [request.escrowId.split('_')[1]]
      );
      
      // Update cache
      if (this.escrowCache.has(request.escrowId)) {
        const escrow = this.escrowCache.get(request.escrowId)!;
        escrow.status = 'refunded';
        escrow.refundTxHash = result.transactionHash;
        this.escrowCache.set(request.escrowId, escrow);
        
        return {
          success: true,
          escrow,
          transactionHash: result.transactionHash
        };
      }
      
      // Fetch updated state
      const statusResponse = await this.getEscrowStatus(request.escrowId);
      if (!statusResponse.success) {
        throw new Error(statusResponse.error);
      }
      
      return {
        success: true,
        escrow: statusResponse.escrow,
        transactionHash: result.transactionHash
      };
    } catch (error: any) {
      console.error('Failed to refund escrow:', error);
      return {
        success: false,
        error: error.message || 'Failed to refund escrow'
      };
    }
  }
  
  /**
   * Open a dispute for an escrow
   */
  public async disputeEscrow(request: DisputeEscrowRequest): Promise<EscrowOperationResponse> {
    try {
      await blockchainService.connect();
      
      const contractAddress = await this.getEscrowContractAddress();
      
      const result = await blockchainService.callContractMethod(
        contractAddress,
        ESCROW_ABI,
        'disputeEscrow',
        [
          request.escrowId.split('_')[1],
          request.reason
        ]
      );
      
      // Update cache
      if (this.escrowCache.has(request.escrowId)) {
        const escrow = this.escrowCache.get(request.escrowId)!;
        escrow.status = 'disputed';
        this.escrowCache.set(request.escrowId, escrow);
        
        return {
          success: true,
          escrow,
          transactionHash: result.transactionHash
        };
      }
      
      // Fetch updated state
      const statusResponse = await this.getEscrowStatus(request.escrowId);
      if (!statusResponse.success) {
        throw new Error(statusResponse.error);
      }
      
      return {
        success: true,
        escrow: statusResponse.escrow,
        transactionHash: result.transactionHash
      };
    } catch (error: any) {
      console.error('Failed to dispute escrow:', error);
      return {
        success: false,
        error: error.message || 'Failed to dispute escrow'
      };
    }
  }
  
  /**
   * List all escrows for a user
   */
  public async getUserEscrows(userId: string): Promise<EscrowContract[]> {
    // For demo purposes, filter from cache
    // In production, you'd query an API or index events from the blockchain
    return Array.from(this.escrowCache.values())
      .filter(escrow => escrow.buyerId === userId || escrow.sellerId === userId);
  }
}

export const escrowService = EscrowService.getInstance();
