import { ethers } from 'ethers';

// ABI for the Bell24hEscrow contract
const escrowAbi = [
  // Events
  "event PaymentCreated(uint256 indexed id, uint256 indexed orderId, address buyer, address supplier, uint256 amount, uint8 paymentType)",
  "event PaymentFunded(uint256 indexed id, uint256 amount)",
  "event PaymentReleased(uint256 indexed id, address supplier, uint256 amount)",
  "event PaymentRefunded(uint256 indexed id, address buyer, uint256 amount)",
  "event DisputeCreated(uint256 indexed paymentId, string reason)",
  "event DisputeResolved(uint256 indexed paymentId, string resolution)",
  
  // View functions
  "function getBalance(uint256 _orderId) view returns (uint256)",
  "function getOrderPayments(uint256 _orderId) view returns (uint256[] memory)",
  "function getPayment(uint256 _paymentId) view returns (uint256 id, uint256 orderId, address buyer, address supplier, uint256 amount, uint8 state, uint8 paymentType, uint256 milestoneNumber, uint256 totalMilestones, uint256 createdAt, string memory documentHash)",
  "function getDispute(uint256 _paymentId) view returns (uint256 paymentId, string memory reason, string memory evidence, bool resolved, string memory resolution, uint256 createdAt, uint256 resolvedAt)",
  
  // State-changing functions
  "function createPayment(uint256 _orderId, address _supplier, uint256 _amount, uint8 _paymentType, uint256 _milestoneNumber, uint256 _totalMilestones, string memory _documentHash) returns (uint256)",
  "function fundPayment(uint256 _paymentId) payable",
  "function deposit(uint256 _orderId) payable",
  "function releasePayment(uint256 _paymentId)",
  "function release(uint256 _orderId, address _supplier)",
  "function refundPayment(uint256 _paymentId)",
  "function createDispute(uint256 _paymentId, string memory _reason, string memory _evidence)",
];

// Types
export enum PaymentState {
  Created,
  Funded,
  Released,
  Refunded,
  Disputed,
  Resolved
}

export enum PaymentType {
  FullPayment,
  Milestone
}

export interface Payment {
  id: number;
  orderId: number;
  buyer: string;
  supplier: string;
  amount: string;
  state: PaymentState;
  paymentType: PaymentType;
  milestoneNumber: number;
  totalMilestones: number;
  createdAt: Date;
  documentHash: string;
}

export interface Dispute {
  paymentId: number;
  reason: string;
  evidence: string;
  resolved: boolean;
  resolution: string;
  createdAt: Date;
  resolvedAt: Date | null;
}

/**
 * Blockchain service for interacting with the Bell24hEscrow contract
 */
class BlockchainService {
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;
  private escrowContract: ethers.Contract | null = null;
  private escrowAddress: string = '';
  private chainId: number = 0;
  private connected: boolean = false;
  
  /**
   * Initialize the blockchain service
   */
  constructor() {
    this.escrowAddress = import.meta.env.VITE_ESCROW_CONTRACT_ADDRESS || '';
    this.chainId = parseInt(import.meta.env.VITE_BLOCKCHAIN_CHAIN_ID || '137');
  }
  
  /**
   * Check if MetaMask is available
   */
  public isMetaMaskAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  }
  
  /**
   * Connect to MetaMask
   */
  public async connectWallet(): Promise<string | null> {
    if (!this.isMetaMaskAvailable()) {
      throw new Error('MetaMask is not available');
    }
    
    try {
      this.provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get the connected chain ID
      const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
      const currentChainId = parseInt(chainIdHex, 16);
      
      // Check if we're on the correct network
      if (currentChainId !== this.chainId) {
        try {
          // Try to switch to the correct network
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${this.chainId.toString(16)}` }],
          });
        } catch (switchError: any) {
          // If the network doesn't exist, this error code indicates that
          if (switchError.code === 4902) {
            throw new Error(`Please add the network with chain ID ${this.chainId} to your MetaMask`);
          }
          throw switchError;
        }
      }
      
      this.signer = this.provider.getSigner();
      this.escrowContract = new ethers.Contract(this.escrowAddress, escrowAbi, this.signer);
      this.connected = true;
      
      return accounts[0];
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }
  
  /**
   * Check if wallet is connected
   */
  public isConnected(): boolean {
    return this.connected;
  }
  
  /**
   * Get the current account
   */
  public async getAccount(): Promise<string | null> {
    if (!this.provider) return null;
    
    try {
      const accounts = await this.provider.listAccounts();
      return accounts[0] || null;
    } catch (error) {
      console.error('Error getting account:', error);
      return null;
    }
  }
  
  /**
   * Create a new payment
   */
  public async createPayment(
    orderId: number,
    supplierAddress: string,
    amount: string,
    paymentType: PaymentType,
    milestoneNumber: number = 0,
    totalMilestones: number = 0,
    documentHash: string = ''
  ): Promise<number> {
    if (!this.escrowContract || !this.signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const tx = await this.escrowContract.createPayment(
        orderId,
        supplierAddress,
        ethers.utils.parseEther(amount),
        paymentType,
        milestoneNumber,
        totalMilestones,
        documentHash
      );
      
      const receipt = await tx.wait();
      
      // Find the PaymentCreated event
      const event = receipt.events?.find(e => e.event === 'PaymentCreated');
      if (!event) throw new Error('Payment creation event not found');
      
      // Return the payment ID
      return event.args?.id.toNumber();
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }
  
  /**
   * Fund a payment
   */
  public async fundPayment(paymentId: number, amount: string): Promise<void> {
    if (!this.escrowContract || !this.signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const tx = await this.escrowContract.fundPayment(paymentId, {
        value: ethers.utils.parseEther(amount)
      });
      
      await tx.wait();
    } catch (error) {
      console.error('Error funding payment:', error);
      throw error;
    }
  }
  
  /**
   * Make a direct deposit for an order
   */
  public async deposit(orderId: number, amount: string): Promise<void> {
    if (!this.escrowContract || !this.signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const tx = await this.escrowContract.deposit(orderId, {
        value: ethers.utils.parseEther(amount)
      });
      
      await tx.wait();
    } catch (error) {
      console.error('Error depositing:', error);
      throw error;
    }
  }
  
  /**
   * Release a payment
   */
  public async releasePayment(paymentId: number): Promise<void> {
    if (!this.escrowContract || !this.signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const tx = await this.escrowContract.releasePayment(paymentId);
      await tx.wait();
    } catch (error) {
      console.error('Error releasing payment:', error);
      throw error;
    }
  }
  
  /**
   * Release funds to supplier
   */
  public async release(orderId: number, supplierAddress: string): Promise<void> {
    if (!this.escrowContract || !this.signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const tx = await this.escrowContract.release(orderId, supplierAddress);
      await tx.wait();
    } catch (error) {
      console.error('Error releasing funds:', error);
      throw error;
    }
  }
  
  /**
   * Create a dispute
   */
  public async createDispute(paymentId: number, reason: string, evidence: string): Promise<void> {
    if (!this.escrowContract || !this.signer) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const tx = await this.escrowContract.createDispute(paymentId, reason, evidence);
      await tx.wait();
    } catch (error) {
      console.error('Error creating dispute:', error);
      throw error;
    }
  }
  
  /**
   * Get balance for an order
   */
  public async getBalance(orderId: number): Promise<string> {
    if (!this.escrowContract) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const balance = await this.escrowContract.getBalance(orderId);
      return ethers.utils.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }
  
  /**
   * Get payment details
   */
  public async getPayment(paymentId: number): Promise<Payment> {
    if (!this.escrowContract) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const result = await this.escrowContract.getPayment(paymentId);
      
      return {
        id: result.id.toNumber(),
        orderId: result.orderId.toNumber(),
        buyer: result.buyer,
        supplier: result.supplier,
        amount: ethers.utils.formatEther(result.amount),
        state: result.state,
        paymentType: result.paymentType,
        milestoneNumber: result.milestoneNumber.toNumber(),
        totalMilestones: result.totalMilestones.toNumber(),
        createdAt: new Date(result.createdAt.toNumber() * 1000),
        documentHash: result.documentHash
      };
    } catch (error) {
      console.error('Error getting payment:', error);
      throw error;
    }
  }
  
  /**
   * Get dispute details
   */
  public async getDispute(paymentId: number): Promise<Dispute> {
    if (!this.escrowContract) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const result = await this.escrowContract.getDispute(paymentId);
      
      return {
        paymentId: result.paymentId.toNumber(),
        reason: result.reason,
        evidence: result.evidence,
        resolved: result.resolved,
        resolution: result.resolution,
        createdAt: new Date(result.createdAt.toNumber() * 1000),
        resolvedAt: result.resolvedAt.toNumber() > 0 
          ? new Date(result.resolvedAt.toNumber() * 1000) 
          : null
      };
    } catch (error) {
      console.error('Error getting dispute:', error);
      throw error;
    }
  }
  
  /**
   * Get all payments for an order
   */
  public async getOrderPayments(orderId: number): Promise<number[]> {
    if (!this.escrowContract) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const paymentIds = await this.escrowContract.getOrderPayments(orderId);
      return paymentIds.map(id => id.toNumber());
    } catch (error) {
      console.error('Error getting order payments:', error);
      throw error;
    }
  }
}

// Create a singleton instance
export const blockchainService = new BlockchainService();