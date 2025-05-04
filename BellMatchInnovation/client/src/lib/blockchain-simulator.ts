/**
 * Blockchain Transaction Simulator
 * 
 * This module simulates blockchain transactions without requiring a real blockchain connection.
 * It's designed for demonstration and testing purposes, allowing users to experience 
 * blockchain-based features without spending actual cryptocurrency.
 */

import { PaymentType, PaymentState, Payment, Dispute } from './blockchain';

// Simple ID generator function to replace uuid
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

// Mock wallet addresses for simulation
const MOCK_ADDRESSES = {
  user: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  platform: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
  supplier1: '0xbDA5747bFD65F08deb54cb465eB87D40e51B197E',
  supplier2: '0xdD2FD4581271e230360230F9337D5c0430Bf44C0',
  supplier3: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199'
};

// Storage for simulated blockchain state
interface SimulatedBlockchainState {
  balances: Record<string, string>; // Address -> ETH balance
  orders: Record<number, {
    balance: string;
    payments: number[];
  }>;
  payments: Record<number, Payment>;
  disputes: Record<number, Dispute>;
  nextPaymentId: number;
  transactions: Array<{
    id: string;
    from: string;
    to: string;
    amount: string;
    timestamp: Date;
    status: 'pending' | 'confirmed' | 'failed';
    type: string;
    hash: string;
    blockNumber?: number;
    gasUsed?: string;
  }>;
}

// Initialize simulation state
const state: SimulatedBlockchainState = {
  balances: {
    [MOCK_ADDRESSES.user]: '10.0', // 10 ETH
    [MOCK_ADDRESSES.platform]: '100.0',
    [MOCK_ADDRESSES.supplier1]: '5.0',
    [MOCK_ADDRESSES.supplier2]: '7.5',
    [MOCK_ADDRESSES.supplier3]: '3.0'
  },
  orders: {},
  payments: {},
  disputes: {},
  nextPaymentId: 1,
  transactions: []
};

// Helper to simulate network delay
const simulateDelay = async (minMs = 500, maxMs = 2000): Promise<void> => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise(resolve => setTimeout(resolve, delay));
};

// Generate a random transaction hash
const generateTxHash = (): string => {
  return '0x' + Array.from({length: 64}, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

// Record a transaction in the ledger
const recordTransaction = (
  from: string, 
  to: string, 
  amount: string, 
  type: string
): string => {
  const txHash = generateTxHash();
  const blockNumber = Math.floor(Math.random() * 1000000) + 14000000;
  const gasUsed = (Math.random() * 0.001).toFixed(6);
  
  state.transactions.push({
    id: generateId(),
    from,
    to,
    amount,
    timestamp: new Date(),
    status: 'confirmed',
    type,
    hash: txHash,
    blockNumber,
    gasUsed
  });
  
  return txHash;
};

// Transfer simulated ETH between addresses
const transferETH = (from: string, to: string, amount: string): boolean => {
  const fromBalance = parseFloat(state.balances[from] || '0');
  const amountValue = parseFloat(amount);
  
  // Check sufficient balance
  if (fromBalance < amountValue) {
    return false;
  }
  
  // Update balances
  state.balances[from] = (fromBalance - amountValue).toString();
  state.balances[to] = (parseFloat(state.balances[to] || '0') + amountValue).toString();
  
  return true;
};

/**
 * Blockchain Simulator Service
 */
class BlockchainSimulatorService {
  private userAddress: string = MOCK_ADDRESSES.user;
  private platformAddress: string = MOCK_ADDRESSES.platform;
  private feeRate: number = 25; // 2.5%
  
  /**
   * Get a list of mock addresses for testing
   */
  public getMockAddresses(): typeof MOCK_ADDRESSES {
    return {...MOCK_ADDRESSES};
  }
  
  /**
   * Simulate connecting a wallet
   */
  public async connectWallet(): Promise<string> {
    await simulateDelay(500, 1500);
    return this.userAddress;
  }
  
  /**
   * Get simulated ETH balance for an address
   */
  public async getAddressBalance(address: string): Promise<string> {
    await simulateDelay(300, 800);
    return state.balances[address] || '0';
  }
  
  /**
   * Get simulated balance for an order
   */
  public async getOrderBalance(orderId: number): Promise<string> {
    await simulateDelay(300, 800);
    return state.orders[orderId]?.balance || '0';
  }
  
  /**
   * Simulate a deposit to an order
   */
  public async deposit(orderId: number, amount: string): Promise<string> {
    await simulateDelay();
    
    // Create order record if it doesn't exist
    if (!state.orders[orderId]) {
      state.orders[orderId] = {
        balance: '0',
        payments: []
      };
    }
    
    // Transfer ETH to the platform address
    if (!transferETH(this.userAddress, this.platformAddress, amount)) {
      throw new Error('Insufficient balance');
    }
    
    // Update order balance
    const currentBalance = parseFloat(state.orders[orderId].balance);
    state.orders[orderId].balance = (currentBalance + parseFloat(amount)).toString();
    
    // Record the transaction
    const txHash = recordTransaction(
      this.userAddress,
      this.platformAddress,
      amount,
      `Deposit to Order #${orderId}`
    );
    
    return txHash;
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
    await simulateDelay();
    
    const paymentId = state.nextPaymentId++;
    
    // Create the payment
    const payment: Payment = {
      id: paymentId,
      orderId,
      buyer: this.userAddress,
      supplier: supplierAddress,
      amount,
      state: PaymentState.Created,
      paymentType,
      milestoneNumber,
      totalMilestones,
      createdAt: new Date(),
      documentHash
    };
    
    // Store the payment
    state.payments[paymentId] = payment;
    
    // Create order record if it doesn't exist
    if (!state.orders[orderId]) {
      state.orders[orderId] = {
        balance: '0',
        payments: []
      };
    }
    
    // Add payment to order
    state.orders[orderId].payments.push(paymentId);
    
    return paymentId;
  }
  
  /**
   * Fund a payment
   */
  public async fundPayment(paymentId: number, amount: string): Promise<string> {
    await simulateDelay();
    
    const payment = state.payments[paymentId];
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    if (payment.state !== PaymentState.Created) {
      throw new Error('Payment cannot be funded in its current state');
    }
    
    // Transfer ETH to the platform address
    if (!transferETH(this.userAddress, this.platformAddress, amount)) {
      throw new Error('Insufficient balance');
    }
    
    // Update payment state
    payment.state = PaymentState.Funded;
    
    // Update order balance
    const orderId = payment.orderId;
    const currentBalance = parseFloat(state.orders[orderId]?.balance || '0');
    state.orders[orderId] = state.orders[orderId] || { balance: '0', payments: [] };
    state.orders[orderId].balance = (currentBalance + parseFloat(amount)).toString();
    
    // Record the transaction
    const txHash = recordTransaction(
      this.userAddress,
      this.platformAddress,
      amount,
      `Fund Payment #${paymentId}`
    );
    
    return txHash;
  }
  
  /**
   * Release a payment to the supplier
   */
  public async releasePayment(paymentId: number): Promise<string> {
    await simulateDelay();
    
    const payment = state.payments[paymentId];
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    if (payment.state !== PaymentState.Funded) {
      throw new Error('Payment cannot be released in its current state');
    }
    
    // Calculate fee
    const amount = parseFloat(payment.amount);
    const feeAmount = (amount * this.feeRate) / 1000;
    const supplierAmount = amount - feeAmount;
    
    // Update order balance
    const orderId = payment.orderId;
    const currentBalance = parseFloat(state.orders[orderId]?.balance || '0');
    if (currentBalance < amount) {
      throw new Error('Insufficient order balance');
    }
    state.orders[orderId].balance = (currentBalance - amount).toString();
    
    // Transfer ETH from platform to supplier and platform fee collector
    transferETH(
      this.platformAddress, 
      payment.supplier, 
      supplierAmount.toString()
    );
    
    // Update payment state
    payment.state = PaymentState.Released;
    
    // Record the transaction
    const txHash = recordTransaction(
      this.platformAddress,
      payment.supplier,
      supplierAmount.toString(),
      `Release Payment #${paymentId}`
    );
    
    return txHash;
  }
  
  /**
   * Release all funds in an order to a supplier
   */
  public async releaseToSupplier(orderId: number, supplierAddress: string): Promise<string> {
    await simulateDelay();
    
    // Check order exists and has balance
    if (!state.orders[orderId]) {
      throw new Error('Order not found');
    }
    
    const balance = parseFloat(state.orders[orderId].balance);
    if (balance <= 0) {
      throw new Error('Order has no balance to release');
    }
    
    // Calculate fee
    const feeAmount = (balance * this.feeRate) / 1000;
    const supplierAmount = balance - feeAmount;
    
    // Update order balance
    state.orders[orderId].balance = '0';
    
    // Transfer ETH from platform to supplier
    transferETH(
      this.platformAddress, 
      supplierAddress, 
      supplierAmount.toString()
    );
    
    // Record the transaction
    const txHash = recordTransaction(
      this.platformAddress,
      supplierAddress,
      supplierAmount.toString(),
      `Release Order #${orderId} Funds`
    );
    
    return txHash;
  }
  
  /**
   * Create a dispute for a payment
   */
  public async createDispute(paymentId: number, reason: string, evidence: string): Promise<void> {
    await simulateDelay();
    
    const payment = state.payments[paymentId];
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    if (payment.state !== PaymentState.Funded) {
      throw new Error('Payment must be in Funded state to create a dispute');
    }
    
    // Update payment state
    payment.state = PaymentState.Disputed;
    
    // Create dispute
    state.disputes[paymentId] = {
      paymentId,
      reason,
      evidence,
      resolved: false,
      resolution: '',
      createdAt: new Date(),
      resolvedAt: null
    };
  }
  
  /**
   * Get all payments for an order
   */
  public async getOrderPayments(orderId: number): Promise<number[]> {
    await simulateDelay(200, 500);
    return state.orders[orderId]?.payments || [];
  }
  
  /**
   * Get payment details
   */
  public async getPayment(paymentId: number): Promise<Payment> {
    await simulateDelay(200, 500);
    const payment = state.payments[paymentId];
    if (!payment) {
      throw new Error('Payment not found');
    }
    return {...payment};
  }
  
  /**
   * Get dispute details
   */
  public async getDispute(paymentId: number): Promise<Dispute> {
    await simulateDelay(200, 500);
    const dispute = state.disputes[paymentId];
    if (!dispute) {
      throw new Error('Dispute not found');
    }
    return {...dispute};
  }
  
  /**
   * Get transaction history
   */
  public async getTransactionHistory(): Promise<typeof state.transactions> {
    await simulateDelay(300, 800);
    return [...state.transactions];
  }
  
  /**
   * Reset simulation state (for testing)
   */
  public resetSimulation(): void {
    // Reset balances
    state.balances = {
      [MOCK_ADDRESSES.user]: '10.0',
      [MOCK_ADDRESSES.platform]: '100.0',
      [MOCK_ADDRESSES.supplier1]: '5.0',
      [MOCK_ADDRESSES.supplier2]: '7.5',
      [MOCK_ADDRESSES.supplier3]: '3.0'
    };
    
    // Reset other state
    state.orders = {};
    state.payments = {};
    state.disputes = {};
    state.nextPaymentId = 1;
    state.transactions = [];
  }
}

// Export singleton instance
export const blockchainSimulator = new BlockchainSimulatorService();