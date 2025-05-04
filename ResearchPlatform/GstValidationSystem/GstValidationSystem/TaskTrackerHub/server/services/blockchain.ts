import { ethers } from 'ethers';
import { log } from '../vite';
import RFQContractABI from '../../contracts/abis/RFQContract.json';
import TokenContractABI from '../../contracts/abis/Bell24Token.json';
import EscrowPaymentABI from '../../contracts/abis/EscrowPayment.json';
import DocumentStorageABI from '../../contracts/abis/DocumentStorage.json';
import { createHash } from 'crypto';

/**
 * Environment variables for blockchain configuration
 * Set these in your .env file or environment
 */
const PROVIDER_URL = process.env.PROVIDER_URL || 'https://rpc-mainnet.maticvigil.com';
const CHAIN_ID = process.env.CHAIN_ID || '0x89'; // Default to Polygon
const PRIVATE_KEY = process.env.BLOCKCHAIN_PRIVATE_KEY || '';
const BELL24_WALLET_ADDRESS = process.env.BELL24_WALLET_ADDRESS || '';

/**
 * Smart contract addresses
 * Set these in your .env file or environment
 */
const CONTRACT_ADDRESSES = {
  RFQ: process.env.RFQ_CONTRACT_ADDRESS || '',
  TOKEN: process.env.TOKEN_CONTRACT_ADDRESS || '',
  ESCROW: process.env.ESCROW_CONTRACT_ADDRESS || '',
  DOCUMENT: process.env.DOCUMENT_STORAGE_ADDRESS || ''
};

/**
 * ABIs for smart contracts
 */
const CONTRACT_ABIS = {
  RFQ: RFQContractABI,
  TOKEN: TokenContractABI,
  ESCROW: EscrowPaymentABI,
  DOCUMENT: DocumentStorageABI
};

/**
 * Service for interacting with blockchain smart contracts
 */
class BlockchainService {
  private provider: ethers.JsonRpcProvider | null = null;
  private wallet: ethers.Wallet | null = null;
  private contracts: Record<string, ethers.Contract | null> = {
    RFQ: null,
    TOKEN: null,
    ESCROW: null,
    DOCUMENT: null
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
      if (PRIVATE_KEY) {
        this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);
        log('Blockchain wallet initialized', 'blockchain');
      } else {
        log('WARNING: Private key not provided, running in read-only mode', 'blockchain');
      }
      
      // Initialize contracts
      this.initializeContracts();
      
      this.isInitialized = true;
      log('Blockchain service initialized', 'blockchain');
    } catch (error: any) {
      log(`Error initializing blockchain service: ${error?.message || 'Unknown error'}`, 'blockchain');
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
            log(`Contract ${contractKey} initialized at ${address}`, 'blockchain');
          } catch (contractError: any) {
            log(`Error initializing ${contractKey} contract: ${contractError?.message || 'Unknown error'}`, 'blockchain');
          }
        } else {
          log(`Contract ${contractKey} configuration incomplete, address: ${address ? 'yes' : 'no'}, ABI: ${abi ? 'yes' : 'no'}`, 'blockchain');
        }
      });
    } catch (error: any) {
      log(`Error setting up contracts: ${error?.message || 'Unknown error'}`, 'blockchain');
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
      log(`Error getting token balance: ${error?.message || 'Unknown error'}`, 'blockchain');
      
      // Return a zero balance with error for graceful degradation
      return {
        balance: '0',
        success: false,
        error: error?.message || 'Unknown error'
      };
    }
  }
  
  /**
   * Create an RFQ on the blockchain
   * @param rfqNumber RFQ identifier
   * @param product Product being requested
   * @param quantity Quantity requested
   * @param dueDate Due date as timestamp
   * @param description RFQ description
   * @param documentHash Hash of RFQ document
   * @returns Transaction result
   */
  public async createRFQ(
    rfqNumber: string,
    product: string,
    quantity: string,
    dueDate: number,
    description: string,
    documentHash: string
  ): Promise<{ txHash?: string; success: boolean; error?: string }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain service not initialized');
      }
      
      if (!this.wallet) {
        throw new Error('Wallet not available for transactions');
      }
      
      if (!this.contracts.RFQ) {
        throw new Error('RFQ contract not initialized');
      }
      
      // Create RFQ transaction
      const tx = await this.contracts.RFQ.createRFQ(
        rfqNumber,
        product,
        quantity,
        dueDate,
        description,
        documentHash
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      log(`RFQ created on blockchain: ${receipt.hash}`, 'blockchain');
      
      return {
        txHash: receipt.hash,
        success: true
      };
    } catch (error: any) {
      log(`Error creating RFQ: ${error?.message || 'Unknown error'}`, 'blockchain');
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }
  
  /**
   * Submit a quote on the blockchain
   * @param rfqId RFQ ID
   * @param price Quote price
   * @param deliveryTime Delivery time description
   * @param documentHash Hash of quote document
   * @returns Transaction result
   */
  public async submitQuote(
    rfqId: number,
    price: number,
    deliveryTime: string,
    documentHash: string
  ): Promise<{ txHash?: string; success: boolean; error?: string }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain service not initialized');
      }
      
      if (!this.wallet) {
        throw new Error('Wallet not available for transactions');
      }
      
      if (!this.contracts.RFQ) {
        throw new Error('RFQ contract not initialized');
      }
      
      // Convert price to Wei
      const priceWei = ethers.parseEther(price.toString());
      
      // Submit quote transaction
      const tx = await this.contracts.RFQ.submitQuote(
        rfqId,
        priceWei,
        deliveryTime,
        documentHash
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      log(`Quote submitted on blockchain: ${receipt.hash}`, 'blockchain');
      
      return {
        txHash: receipt.hash,
        success: true
      };
    } catch (error: any) {
      log(`Error submitting quote: ${error?.message || 'Unknown error'}`, 'blockchain');
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }
  
  /**
   * Create an escrow payment on the blockchain
   * @param rfqId RFQ ID
   * @param supplier Supplier wallet address
   * @param amount Payment amount
   * @param paymentType Payment type (0=full, 1=milestone)
   * @param milestoneNumber Milestone number if applicable
   * @param totalMilestones Total milestones if applicable
   * @param documentHash Hash of payment document
   * @param ethAmount Amount of ETH to send with transaction
   * @returns Transaction result
   */
  public async createPayment(
    rfqId: number,
    supplier: string,
    amount: number,
    paymentType: number,
    milestoneNumber: number,
    totalMilestones: number,
    documentHash: string,
    ethAmount: number
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
      
      // Convert amounts to Wei
      const amountWei = ethers.parseEther(amount.toString());
      const ethAmountWei = ethers.parseEther(ethAmount.toString());
      
      // Create payment transaction
      const tx = await this.contracts.ESCROW.createPayment(
        rfqId,
        supplier,
        amountWei,
        paymentType,
        milestoneNumber,
        totalMilestones,
        documentHash,
        { value: ethAmountWei }
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      log(`Payment created on blockchain: ${receipt.hash}`, 'blockchain');
      
      return {
        txHash: receipt.hash,
        success: true
      };
    } catch (error: any) {
      log(`Error creating payment: ${error?.message || 'Unknown error'}`, 'blockchain');
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }
  
  /**
   * Store document hash on blockchain
   * @param content Document content
   * @param ipfsHash IPFS hash where document is stored
   * @param referenceId Reference ID (RFQ ID, Quote ID, etc.)
   * @param documentType Document type (0=RFQ, 1=Quote, etc.)
   * @param description Document description
   * @returns Transaction result
   */
  public async storeDocument(
    content: string,
    ipfsHash: string,
    referenceId: number,
    documentType: number,
    description: string
  ): Promise<{ contentHash: string; txHash?: string; success: boolean; error?: string }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain service not initialized');
      }
      
      if (!this.wallet) {
        throw new Error('Wallet not available for transactions');
      }
      
      if (!this.contracts.DOCUMENT) {
        throw new Error('Document contract not initialized');
      }
      
      // Create content hash
      const contentHash = this.createContentHash(content);
      
      // Store document transaction
      const tx = await this.contracts.DOCUMENT.storeDocument(
        contentHash,
        ipfsHash,
        referenceId,
        documentType,
        description
      );
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      log(`Document stored on blockchain: ${receipt.hash}`, 'blockchain');
      
      return {
        contentHash,
        txHash: receipt.hash,
        success: true
      };
    } catch (error: any) {
      log(`Error storing document: ${error?.message || 'Unknown error'}`, 'blockchain');
      return { 
        contentHash: this.createContentHash(content),
        success: false, 
        error: error?.message || 'Unknown error' 
      };
    }
  }
  
  /**
   * Verify document on blockchain
   * @param contentHash Content hash to verify
   * @returns Transaction result
   */
  public async verifyDocument(contentHash: string): Promise<{ txHash?: string; success: boolean; error?: string }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain service not initialized');
      }
      
      if (!this.wallet) {
        throw new Error('Wallet not available for transactions');
      }
      
      if (!this.contracts.DOCUMENT) {
        throw new Error('Document contract not initialized');
      }
      
      // Verify document transaction
      const tx = await this.contracts.DOCUMENT.verifyDocument(contentHash);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      log(`Document verified on blockchain: ${receipt.hash}`, 'blockchain');
      
      return {
        txHash: receipt.hash,
        success: true
      };
    } catch (error: any) {
      log(`Error verifying document: ${error?.message || 'Unknown error'}`, 'blockchain');
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }
  
  /**
   * Check document on blockchain
   * @param contentHash Content hash to check
   * @returns Document status
   */
  public async checkDocument(contentHash: string): Promise<{ 
    exists: boolean;
    verified: boolean;
    ipfsHash?: string;
    success: boolean;
    error?: string
  }> {
    try {
      if (!this.isInitialized) {
        throw new Error('Blockchain service not initialized');
      }
      
      if (!this.contracts.DOCUMENT) {
        throw new Error('Document contract not initialized');
      }
      
      // Check document
      const result = await this.contracts.DOCUMENT.checkDocument(contentHash);
      
      return {
        exists: result.exists,
        verified: result.verified,
        ipfsHash: result.ipfsHash,
        success: true
      };
    } catch (error: any) {
      log(`Error checking document: ${error?.message || 'Unknown error'}`, 'blockchain');
      return {
        exists: false,
        verified: false,
        success: false,
        error: error?.message || 'Unknown error'
      };
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
}

// Export singleton instance
const blockchainService = new BlockchainService();
export default blockchainService;