import { ethers } from 'ethers';
import { createHash } from 'crypto';
import EscrowPaymentABI from '@contracts/abis/EscrowPayment.json';
import Bell24TokenABI from '@contracts/abis/Bell24Token.json';

/**
 * Environment variables for blockchain configuration
 * Set these in your .env file or environment
 */
const PROVIDER_URL = process.env.PROVIDER_URL || 'https://rpc-mumbai.maticvigil.com'; // Mumbai testnet by default
const BLOCKCHAIN_PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY || '';
const BELL24_WALLET_ADDRESS = process.env.BELL24_WALLET_ADDRESS || '';

/**
 * Smart contract addresses
 * Set these in your .env file or environment
 */
const CONTRACT_ADDRESSES = {
  TOKEN: process.env.TOKEN_CONTRACT_ADDRESS || '',
  ESCROW: process.env.ESCROW_CONTRACT_ADDRESS || '',
};

/**
 * ABIs for smart contracts
 */
const CONTRACT_ABIS = {
  TOKEN: Bell24TokenABI,
  ESCROW: EscrowPaymentABI,
};

/**
 * Service for interacting with blockchain smart contracts
 * for payment escrow and token transactions
 */
export class BlockchainService {
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private contracts: Record<string, ethers.Contract | null> = {
    TOKEN: null,
    ESCROW: null
  };
  private isInitialized = false;
  
  constructor() {
    this.initialize();
  }
  
  /**
   * Initialize the blockchain service
   */
  private initialize() {
    try {
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(PROVIDER_URL);
      
      // Initialize wallet if private key is available
      if (BLOCKCHAIN_PRIVATE_KEY) {
        this.wallet = new ethers.Wallet(BLOCKCHAIN_PRIVATE_KEY, this.provider);
        console.log('Blockchain wallet initialized');
      } else {
        console.log('WARNING: Private key not provided, running in read-only mode');
      }
      
      // Initialize contracts
      this.initializeContracts();
      
      this.isInitialized = true;
      console.log('Blockchain service initialized');
    } catch (error: any) {
      console.error(`Error initializing blockchain service: ${error?.message || 'Unknown error'}`);
      this.isInitialized = false;
    }
  }
  
  /**
   * Initialize smart contract instances
   */
  private initializeContracts() {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }
      
      // Signer for transactions (wallet or provider for read-only)
      const signer = this.wallet || this.provider;
      
      // Initialize each contract if address is available
      Object.keys(CONTRACT_ADDRESSES).forEach(key => {
        const contractKey = key as keyof typeof CONTRACT_ADDRESSES;
        const address = CONTRACT_ADDRESSES[contractKey];
        const abi = CONTRACT_ABIS[contractKey];
        
        if (address && abi) {
          try {
            this.contracts[contractKey] = new ethers.Contract(address, abi, signer);
            console.log(`Contract ${contractKey} initialized at ${address}`);
          } catch (contractError: any) {
            console.error(`Error initializing ${contractKey} contract: ${contractError?.message || 'Unknown error'}`);
          }
        } else {
          console.log(`Contract ${contractKey} configuration incomplete, address: ${address ? 'yes' : 'no'}, ABI: ${abi ? 'yes' : 'no'}`);
        }
      });
    } catch (error: any) {
      console.error(`Error setting up contracts: ${error?.message || 'Unknown error'}`);
    }
  }
  
  /**
   * Check if blockchain service is initialized
   * @returns True if service is initialized
   */
  public isServiceInitialized(): boolean {
    return this.isInitialized;
  }
  
  /**
   * Check if service is in read-only mode (no wallet)
   * @returns True if in read-only mode
   */
  public isReadOnly(): boolean {
    return this.isInitialized && !this.wallet;
  }
  
  /**
   * Get token balance for an address
   * @param address Wallet address to check balance
   * @returns Balance information
   */
  public async getTokenBalance(address: string): Promise<{ balance: string; success: boolean; error?: string }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain service not initialized');
      }
      
      if (!this.contracts.TOKEN) {
        throw new Error('Token contract not initialized');
      }
      
      const balanceWei = await this.contracts.TOKEN.balanceOf(address);
      const balance = ethers.formatEther(balanceWei);
      
      return {
        balance,
        success: true
      };
    } catch (error: any) {
      console.error(`Error getting token balance: ${error?.message || 'Unknown error'}`);
      
      // Return a zero balance with error for graceful degradation
      return {
        balance: '0',
        success: false,
        error: error?.message || 'Unknown error'
      };
    }
  }
  
  /**
   * Create an escrow payment on the blockchain
   * @param orderId Order ID in the system
   * @param supplier Supplier wallet address
   * @param amount Payment amount
   * @param paymentType Payment type (0=full, 1=milestone)
   * @param milestoneNumber Milestone number if applicable
   * @param totalMilestones Total milestones if applicable
   * @param description Payment description
   * @returns Transaction result
   */
  public async createEscrowPayment(
    orderId: number,
    supplier: string,
    amount: number,
    paymentType: number,
    milestoneNumber: number,
    totalMilestones: number,
    description: string
  ): Promise<{ txHash?: string; success: boolean; error?: string }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain service not initialized');
      }
      
      if (!this.wallet) {
        throw new Error('Wallet not available for transactions');
      }
      
      if (!this.contracts.ESCROW) {
        throw new Error('Escrow contract not initialized');
      }
      
      // Create a document hash from the description
      const documentHash = this.createContentHash(description);
      
      // Convert amount to Wei
      const amountWei = ethers.parseEther(amount.toString());
      
      // Create payment transaction
      const tx = await this.contracts.ESCROW.createPayment(
        orderId,
        supplier,
        amountWei,
        paymentType,
        milestoneNumber,
        totalMilestones,
        documentHash
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      console.log(`Payment created on blockchain: ${receipt.hash}`);
      
      return {
        txHash: receipt.hash,
        success: true
      };
    } catch (error: any) {
      console.error(`Error creating payment: ${error?.message || 'Unknown error'}`);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  /**
   * Release an escrow payment
   * @param paymentId ID of the payment in the escrow contract
   * @returns Transaction result
   */
  public async releaseEscrowPayment(
    paymentId: number
  ): Promise<{ txHash?: string; success: boolean; error?: string }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain service not initialized');
      }
      
      if (!this.wallet) {
        throw new Error('Wallet not available for transactions');
      }
      
      if (!this.contracts.ESCROW) {
        throw new Error('Escrow contract not initialized');
      }
      
      // Release payment transaction
      const tx = await this.contracts.ESCROW.releasePayment(paymentId);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      console.log(`Payment released on blockchain: ${receipt.hash}`);
      
      return {
        txHash: receipt.hash,
        success: true
      };
    } catch (error: any) {
      console.error(`Error releasing payment: ${error?.message || 'Unknown error'}`);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }
  
  /**
   * Get payment details
   * @param paymentId ID of the payment in the escrow contract
   * @returns Payment information
   */
  public async getPaymentDetails(paymentId: number): Promise<{
    payment?: any;
    success: boolean;
    error?: string;
  }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain service not initialized');
      }
      
      if (!this.contracts.ESCROW) {
        throw new Error('Escrow contract not initialized');
      }
      
      // Get payment details
      const payment = await this.contracts.ESCROW.getPayment(paymentId);
      
      return {
        payment: {
          id: Number(payment.id),
          orderId: Number(payment.rfqId),
          buyer: payment.buyer,
          supplier: payment.supplier,
          amount: ethers.formatEther(payment.amount),
          paymentType: Number(payment.paymentType),
          milestoneNumber: Number(payment.milestoneNumber),
          totalMilestones: Number(payment.totalMilestones),
          documentHash: payment.documentHash,
          released: payment.released,
          createdAt: new Date(Number(payment.createdAt) * 1000)
        },
        success: true
      };
    } catch (error: any) {
      console.error(`Error getting payment details: ${error?.message || 'Unknown error'}`);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }
  
  /**
   * Create a content hash for a document
   * @param content Document content
   * @returns Content hash
   */
  public createContentHash(content: string): string {
    return '0x' + createHash('sha256').update(content).digest('hex');
  }
  
  /**
   * Get payment information by order ID
   * @param orderId ID of the order in the system
   * @returns Payment IDs
   */
  public async getPaymentsByOrderId(orderId: number): Promise<{
    paymentIds?: number[];
    success: boolean;
    error?: string;
  }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain service not initialized');
      }
      
      if (!this.contracts.ESCROW) {
        throw new Error('Escrow contract not initialized');
      }
      
      // Get payment IDs
      const paymentIds = await this.contracts.ESCROW.getPaymentsByRfq(orderId);
      
      return {
        paymentIds: paymentIds.map((id: ethers.BigNumberish) => Number(id)),
        success: true
      };
    } catch (error: any) {
      console.error(`Error getting payments by order ID: ${error?.message || 'Unknown error'}`);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }
  
  /**
   * Get payment information by user address
   * @param userAddress User's blockchain wallet address
   * @returns Payment IDs
   */
  public async getPaymentsByUser(userAddress: string): Promise<{
    paymentIds?: number[];
    success: boolean;
    error?: string;
  }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain service not initialized');
      }
      
      if (!this.contracts.ESCROW) {
        throw new Error('Escrow contract not initialized');
      }
      
      // Get payment IDs
      const paymentIds = await this.contracts.ESCROW.getPaymentsByUser(userAddress);
      
      return {
        paymentIds: paymentIds.map((id: ethers.BigNumberish) => Number(id)),
        success: true
      };
    } catch (error: any) {
      console.error(`Error getting payments by user: ${error?.message || 'Unknown error'}`);
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }
  
  /**
   * Get the bell24h platform wallet address
   * @returns Bell24h wallet address
   */
  public getBell24hWalletAddress(): string {
    return BELL24_WALLET_ADDRESS;
  }
  
  /**
   * Get status of blockchain integration
   * @returns Status object
   */
  public getStatus(): {
    initialized: boolean;
    readOnly: boolean;
    networkUrl: string;
    contractsInitialized: {
      TOKEN: boolean;
      ESCROW: boolean;
    };
  } {
    return {
      initialized: this.isInitialized,
      readOnly: this.isReadOnly(),
      networkUrl: PROVIDER_URL,
      contractsInitialized: {
        TOKEN: !!this.contracts.TOKEN,
        ESCROW: !!this.contracts.ESCROW
      }
    };
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();