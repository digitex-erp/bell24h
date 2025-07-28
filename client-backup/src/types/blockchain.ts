/**
 * Types and interfaces for blockchain functionality in Bell24H
 */

// Smart Contract related types
export interface SmartContract {
  id: string;
  address: string;
  abi: any[];
  name: string;
  network: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'pending';
}

// Transaction types
export interface BlockchainTransaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string; // Using string for BigNumber values
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  gasUsed?: string;
  gasPrice?: string;
  networkFee?: string;
}

// Escrow types
export interface EscrowContract {
  id: string;
  contractAddress: string;
  buyerId: string;
  sellerId: string;
  amount: string;
  currency: string;
  createdAt: string;
  expiresAt: string;
  status: 'created' | 'funded' | 'released' | 'refunded' | 'disputed' | 'resolved';
  transactionHash?: string;
  releaseTxHash?: string;
  refundTxHash?: string;
  metadata?: Record<string, any>;
}

// Wallet types
export interface WalletDetails {
  address: string;
  balance: string;
  network: string;
  type: 'metamask' | 'walletconnect' | 'bell24h' | 'other';
  isConnected: boolean;
  lastUpdated: string;
}

// Escrow Service Response types
export interface EscrowCreateResponse {
  success: boolean;
  escrow?: EscrowContract;
  error?: string;
  transactionHash?: string;
}

export interface EscrowStatusResponse {
  success: boolean;
  status?: EscrowContract['status'];
  escrow?: EscrowContract;
  error?: string;
}

export interface EscrowOperationResponse {
  success: boolean;
  escrow?: EscrowContract;
  transactionHash?: string;
  error?: string;
}

// Request types
export interface CreateEscrowRequest {
  buyerId: string;
  sellerId: string;
  amount: string;
  currency: string;
  expiresInDays: number;
  metadata?: Record<string, any>;
}

export interface ReleaseEscrowRequest {
  escrowId: string;
  releaserAddress: string;
}

export interface RefundEscrowRequest {
  escrowId: string;
  refunderAddress: string;
}

export interface DisputeEscrowRequest {
  escrowId: string;
  reason: string;
  evidence?: string[];
  disputerAddress: string;
}
