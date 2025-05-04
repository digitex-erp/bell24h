/**
 * Escrow Wallet Service
 * 
 * This service manages escrow wallets for secure transactions between buyers and sellers.
 * It provides functions for creating escrow accounts, funding them, releasing payments,
 * and tracking transaction history using RazorpayX as the underlying payment infrastructure.
 */

import * as razorpayX from '../lib/razorpayX';
import { storage } from '../storage';

export interface EscrowFundingRequest {
  contractId: number;
  amount: number;
  buyerId: number;
  notes?: Record<string, string>;
}

export interface EscrowReleaseRequest {
  escrowAccountId: string;
  milestoneId: number;
  amount: number;
  releaseReference: string;
  notes?: Record<string, string>;
}

export interface EscrowRefundRequest {
  escrowAccountId: string;
  amount: number;
  reason: string;
  buyerId: number;
  notes?: Record<string, string>;
}

export interface EscrowContactDetails {
  name: string;
  email: string;
  contact?: string;
  type: 'vendor' | 'customer';
  referenceId: string;
}

export interface EscrowAccountDetails {
  name: string;
  description: string;
  contractId: number;
  buyerId: number;
  sellerId: number;
  notes?: Record<string, string>;
}

/**
 * Escrow Wallet Service class
 */
export class EscrowWalletService {
  /**
   * Create an escrow account for a contract
   * @param accountDetails Account details
   * @returns Created escrow account
   */
  async createEscrowAccount(accountDetails: EscrowAccountDetails) {
    try {
      // Check if contract exists
      const contract = await storage.getContract(accountDetails.contractId);
      
      if (!contract) {
        return {
          success: false,
          error: `Contract with ID ${accountDetails.contractId} not found`,
        };
      }
      
      // Check if contract already has an escrow account
      if (contract.hasEscrow && contract.escrowAccountId) {
        // Get the virtual account to check its status
        const existingVirtualAccount = await storage.getRazorpayVirtualAccountByRazorpayId(contract.escrowAccountId);
        
        if (existingVirtualAccount && existingVirtualAccount.status === 'active') {
          return {
            success: false,
            error: 'Contract already has an active escrow account',
            accountId: contract.escrowAccountId,
          };
        }
      }
      
      // Create the virtual escrow account in RazorpayX
      const virtualAccount = await razorpayX.createEscrowAccount(
        accountDetails.name,
        accountDetails.description,
        accountDetails.contractId,
        accountDetails.buyerId,
        accountDetails.sellerId,
        accountDetails.notes
      );
      
      // Return success with account ID
      return {
        success: true,
        message: 'Escrow account created successfully',
        accountId: virtualAccount.id,
        details: virtualAccount,
      };
    } catch (error) {
      console.error('Error creating escrow account:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating escrow account',
      };
    }
  }
  
  /**
   * Fund an escrow account for a contract
   * @param fundingRequest Funding request details
   * @returns Funding transaction details
   */
  async fundEscrowAccount(fundingRequest: EscrowFundingRequest) {
    try {
      // Check if contract exists
      const contract = await storage.getContract(fundingRequest.contractId);
      
      if (!contract) {
        return {
          success: false,
          error: `Contract with ID ${fundingRequest.contractId} not found`,
        };
      }
      
      // Check if contract has an escrow account
      if (!contract.hasEscrow || !contract.escrowAccountId) {
        return {
          success: false,
          error: 'Contract does not have an escrow account set up',
        };
      }
      
      // Get the virtual account details
      const virtualAccount = await storage.getRazorpayVirtualAccountByRazorpayId(contract.escrowAccountId);
      
      if (!virtualAccount) {
        return {
          success: false,
          error: 'Escrow account details not found in database',
        };
      }
      
      // Simulate a payment to the escrow account
      // In production, you would provide payment instructions to the buyer
      // and they would transfer funds directly to the virtual account
      const payment = await razorpayX.simulatePayment(
        contract.escrowAccountId,
        fundingRequest.amount,
        fundingRequest.notes
      );
      
      // Create an escrow transaction record
      const escrowTransaction = await storage.createEscrowTransaction({
        virtualAccountId: virtualAccount.id,
        contractId: fundingRequest.contractId,
        transactionType: 'funding',
        amount: fundingRequest.amount,
        status: 'completed',
        paymentId: null, // Will be updated after payment record is created
        payoutId: null,
        externalId: payment.id,
        externalReference: payment.id, // RazorpayX payment ID as reference
        senderType: 'buyer',
        receiverType: 'escrow',
        senderId: fundingRequest.buyerId,
        receiverId: virtualAccount.id,
        description: 'Initial funding of escrow account',
        metadata: payment,
      });
      
      // Create payment record in database
      const paymentRecord = await storage.createRazorpayPayment({
        virtualAccountId: virtualAccount.id,
        razorpayVirtualAccountId: contract.escrowAccountId,
        razorpayPaymentId: payment.id,
        amount: fundingRequest.amount,
        status: 'captured',
        method: payment.method || 'simulated',
        description: 'Escrow account funding',
        notes: fundingRequest.notes,
      });
      
      // Update the escrow transaction with the payment ID
      await storage.updateEscrowTransaction(escrowTransaction.id, {
        paymentId: paymentRecord.id,
      });
      
      // Update contract escrow status
      await storage.updateContract(fundingRequest.contractId, {
        escrowFunded: true,
        escrowAmount: (contract.escrowAmount || 0) + fundingRequest.amount,
      });
      
      // Create a wallet transaction record
      const walletTransaction = await storage.createWalletTransaction({
        userId: fundingRequest.buyerId,
        amount: fundingRequest.amount,
        type: 'escrow_funding',
        description: `Funding escrow account for contract #${fundingRequest.contractId}`,
        status: 'completed',
        contractId: fundingRequest.contractId,
        reference: payment.id,
      });
      
      // Return success with payment details
      return {
        success: true,
        message: 'Escrow account funded successfully',
        paymentId: payment.id,
        transactionId: escrowTransaction.id,
        walletTransactionId: walletTransaction.id,
      };
    } catch (error) {
      console.error('Error funding escrow account:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error funding escrow account',
      };
    }
  }
  
  /**
   * Release payment from escrow account to seller
   * @param releaseRequest Release request details
   * @returns Release transaction details
   */
  async releaseMilestonePayment(releaseRequest: EscrowReleaseRequest) {
    try {
      // Get the milestone details
      const milestone = await storage.getMilestone(releaseRequest.milestoneId);
      
      if (!milestone) {
        return {
          success: false,
          error: `Milestone with ID ${releaseRequest.milestoneId} not found`,
        };
      }
      
      // Get the contract
      const contract = await storage.getContract(milestone.contractId);
      
      if (!contract) {
        return {
          success: false,
          error: 'Contract not found for this milestone',
        };
      }
      
      // Check if contract has a funded escrow account
      if (!contract.hasEscrow || !contract.escrowFunded || !contract.escrowAccountId) {
        return {
          success: false,
          error: 'Contract does not have a funded escrow account',
        };
      }
      
      // Check if milestone is already paid
      if (milestone.status === 'paid') {
        return {
          success: false,
          error: 'Milestone has already been paid',
        };
      }
      
      // Get the virtual account details
      const virtualAccount = await storage.getRazorpayVirtualAccountByRazorpayId(contract.escrowAccountId);
      
      if (!virtualAccount) {
        return {
          success: false,
          error: 'Escrow account details not found in database',
        };
      }
      
      // Check if escrow has sufficient balance
      if (virtualAccount.balance < releaseRequest.amount) {
        return {
          success: false,
          error: `Insufficient balance in escrow account. Available: ${virtualAccount.balance}, Required: ${releaseRequest.amount}`,
        };
      }
      
      // Get seller's fund account
      const sellerFundAccount = await storage.getRazorpayFundAccountByUserId(milestone.sellerId);
      
      if (!sellerFundAccount) {
        return {
          success: false,
          error: 'Seller does not have a registered fund account for receiving payments',
        };
      }
      
      // Create payout to seller's fund account
      const payout = await razorpayX.createPayout(
        sellerFundAccount.razorpayFundAccountId,
        releaseRequest.amount,
        releaseRequest.releaseReference,
        'milestone_payment',
        {
          ...releaseRequest.notes,
          milestone_id: releaseRequest.milestoneId.toString(),
          contract_id: milestone.contractId.toString(),
        }
      );
      
      // Create payout record in database
      const payoutRecord = await storage.createRazorpayPayout({
        virtualAccountId: virtualAccount.id,
        fundAccountId: sellerFundAccount.id,
        razorpayVirtualAccountId: contract.escrowAccountId,
        razorpayFundAccountId: sellerFundAccount.razorpayFundAccountId,
        razorpayPayoutId: payout.id,
        amount: releaseRequest.amount,
        currency: 'INR',
        purpose: 'milestone_payment',
        status: payout.status,
        milestoneId: releaseRequest.milestoneId,
        reference: releaseRequest.releaseReference,
        notes: releaseRequest.notes,
      });
      
      // Create an escrow transaction record
      const escrowTransaction = await storage.createEscrowTransaction({
        virtualAccountId: virtualAccount.id,
        contractId: milestone.contractId,
        milestoneId: releaseRequest.milestoneId,
        transactionType: 'payment_release',
        amount: releaseRequest.amount,
        status: 'completed',
        paymentId: null,
        payoutId: payoutRecord.id,
        externalId: payout.id,
        externalReference: releaseRequest.releaseReference,
        senderType: 'escrow',
        receiverType: 'seller',
        senderId: virtualAccount.id,
        receiverId: milestone.sellerId,
        description: `Payment release for milestone #${milestone.milestoneNumber}`,
        metadata: payout,
      });
      
      // Update milestone status to paid
      await storage.updateMilestone(releaseRequest.milestoneId, {
        status: 'paid',
        paidAt: new Date(),
        escrowPayoutId: payout.id,
        escrowTransactionId: escrowTransaction.id.toString(),
      });
      
      // Update virtual account balance
      await storage.updateRazorpayVirtualAccount(virtualAccount.id, {
        balance: virtualAccount.balance - releaseRequest.amount,
      });
      
      // Create a wallet transaction record for the seller
      const walletTransaction = await storage.createWalletTransaction({
        userId: milestone.sellerId,
        amount: releaseRequest.amount,
        type: 'milestone_payment',
        description: `Milestone payment received for contract #${milestone.contractId}`,
        status: 'completed',
        contractId: milestone.contractId,
        milestoneId: releaseRequest.milestoneId,
        reference: payout.id,
      });
      
      // Return success with payout details
      return {
        success: true,
        message: 'Milestone payment released successfully',
        payoutId: payout.id,
        transactionId: escrowTransaction.id,
        walletTransactionId: walletTransaction.id,
      };
    } catch (error) {
      console.error('Error releasing milestone payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error releasing milestone payment',
      };
    }
  }
  
  /**
   * Process a refund from escrow account back to buyer
   * @param refundRequest Refund request details
   * @returns Refund transaction details
   */
  async processRefund(refundRequest: EscrowRefundRequest) {
    try {
      // Get the virtual account details
      const virtualAccount = await storage.getRazorpayVirtualAccountByRazorpayId(refundRequest.escrowAccountId);
      
      if (!virtualAccount) {
        return {
          success: false,
          error: 'Escrow account details not found in database',
        };
      }
      
      // Get the contract
      const contract = await storage.getContract(virtualAccount.contractId);
      
      if (!contract) {
        return {
          success: false,
          error: 'Contract not found for this escrow account',
        };
      }
      
      // Check if escrow has sufficient balance
      if (virtualAccount.balance < refundRequest.amount) {
        return {
          success: false,
          error: `Insufficient balance in escrow account. Available: ${virtualAccount.balance}, Required: ${refundRequest.amount}`,
        };
      }
      
      // Get buyer's fund account
      const buyerFundAccount = await storage.getRazorpayFundAccountByUserId(refundRequest.buyerId);
      
      if (!buyerFundAccount) {
        return {
          success: false,
          error: 'Buyer does not have a registered fund account for receiving refunds',
        };
      }
      
      // Create payout to buyer's fund account
      const payout = await razorpayX.createPayout(
        buyerFundAccount.razorpayFundAccountId,
        refundRequest.amount,
        `refund_${Date.now()}`,
        'refund',
        {
          ...refundRequest.notes,
          reason: refundRequest.reason,
          contract_id: virtualAccount.contractId.toString(),
        }
      );
      
      // Create payout record in database
      const payoutRecord = await storage.createRazorpayPayout({
        virtualAccountId: virtualAccount.id,
        fundAccountId: buyerFundAccount.id,
        razorpayVirtualAccountId: refundRequest.escrowAccountId,
        razorpayFundAccountId: buyerFundAccount.razorpayFundAccountId,
        razorpayPayoutId: payout.id,
        amount: refundRequest.amount,
        currency: 'INR',
        purpose: 'refund',
        status: payout.status,
        reference: `refund_${Date.now()}`,
        notes: {
          ...refundRequest.notes,
          reason: refundRequest.reason,
        },
      });
      
      // Create an escrow transaction record
      const escrowTransaction = await storage.createEscrowTransaction({
        virtualAccountId: virtualAccount.id,
        contractId: virtualAccount.contractId,
        transactionType: 'refund',
        amount: refundRequest.amount,
        status: 'completed',
        paymentId: null,
        payoutId: payoutRecord.id,
        externalId: payout.id,
        externalReference: `refund_${Date.now()}`,
        senderType: 'escrow',
        receiverType: 'buyer',
        senderId: virtualAccount.id,
        receiverId: refundRequest.buyerId,
        description: `Refund to buyer: ${refundRequest.reason}`,
        metadata: payout,
      });
      
      // Update virtual account balance
      await storage.updateRazorpayVirtualAccount(virtualAccount.id, {
        balance: virtualAccount.balance - refundRequest.amount,
      });
      
      // Create a wallet transaction record for the buyer
      const walletTransaction = await storage.createWalletTransaction({
        userId: refundRequest.buyerId,
        amount: refundRequest.amount,
        type: 'refund',
        description: `Refund received from escrow account for contract #${virtualAccount.contractId}`,
        status: 'completed',
        contractId: virtualAccount.contractId,
        reference: payout.id,
      });
      
      // Return success with payout details
      return {
        success: true,
        message: 'Refund processed successfully',
        payoutId: payout.id,
        transactionId: escrowTransaction.id,
        walletTransactionId: walletTransaction.id,
      };
    } catch (error) {
      console.error('Error processing refund:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error processing refund',
      };
    }
  }
  
  /**
   * Get escrow account details
   * @param accountId Escrow account ID
   * @returns Account details with transactions
   */
  async getEscrowAccountDetails(accountId: string) {
    try {
      // Get the virtual account from database
      const virtualAccount = await storage.getRazorpayVirtualAccountByRazorpayId(accountId);
      
      if (!virtualAccount) {
        return {
          success: false,
          error: `Escrow account with ID ${accountId} not found in database`,
        };
      }
      
      // Get virtual account details from RazorpayX (for the most up-to-date information)
      const razorpayAccount = await razorpayX.getVirtualAccount(accountId);
      
      // Calculate balance by fetching all payments and computing total
      // Note: In production, you might want to store and update this balance locally
      // to avoid making too many API calls to RazorpayX
      const balance = await razorpayX.calculateVirtualAccountBalance(accountId);
      
      // Update local balance (for consistency)
      await storage.updateRazorpayVirtualAccount(virtualAccount.id, {
        balance,
      });
      
      // Get associated contract
      const contract = await storage.getContract(virtualAccount.contractId);
      
      // Get all transactions for this account
      const transactions = await storage.getEscrowTransactionsByVirtualAccountId(virtualAccount.id);
      
      // Map transactions to a more readable format
      const formattedTransactions = await Promise.all(transactions.map(async (transaction) => {
        let paymentDetails = null;
        let payoutDetails = null;
        
        if (transaction.paymentId) {
          paymentDetails = await storage.getRazorpayPayment(transaction.paymentId);
        }
        
        if (transaction.payoutId) {
          payoutDetails = await storage.getRazorpayPayout(transaction.payoutId);
        }
        
        return {
          id: transaction.id,
          type: transaction.transactionType,
          amount: transaction.amount,
          status: transaction.status,
          sender: {
            type: transaction.senderType,
            id: transaction.senderId,
          },
          receiver: {
            type: transaction.receiverType,
            id: transaction.receiverId,
          },
          description: transaction.description,
          reference: transaction.externalReference,
          payment: paymentDetails,
          payout: payoutDetails,
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt,
        };
      }));
      
      return {
        success: true,
        account: {
          id: virtualAccount.id,
          razorpayId: accountId,
          name: virtualAccount.name,
          description: virtualAccount.description,
          status: virtualAccount.status,
          balance,
          contractId: virtualAccount.contractId,
          buyerId: virtualAccount.buyerId,
          sellerId: virtualAccount.sellerId,
          createdAt: virtualAccount.createdAt,
          closedAt: virtualAccount.closedAt,
        },
        razorpayDetails: razorpayAccount,
        contract,
        transactions: formattedTransactions,
      };
    } catch (error) {
      console.error('Error getting escrow account details:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting escrow account details',
      };
    }
  }
  
  /**
   * Get escrow accounts for a user (either as buyer or seller)
   * @param userId User ID
   * @returns List of escrow accounts
   */
  async getUserEscrowAccounts(userId: number) {
    try {
      // Get all virtual accounts where user is either buyer or seller
      const virtualAccounts = await storage.getRazorpayVirtualAccountsByUserId(userId);
      
      if (!virtualAccounts || virtualAccounts.length === 0) {
        return {
          success: true,
          accounts: [],
        };
      }
      
      // Map accounts to a more readable format
      const formattedAccounts = await Promise.all(virtualAccounts.map(async (account) => {
        const contract = await storage.getContract(account.contractId);
        
        return {
          id: account.id,
          razorpayId: account.razorpayVirtualAccountId,
          name: account.name,
          description: account.description,
          status: account.status,
          balance: account.balance,
          contractId: account.contractId,
          contract,
          buyerId: account.buyerId,
          sellerId: account.sellerId,
          createdAt: account.createdAt,
          closedAt: account.closedAt,
        };
      }));
      
      return {
        success: true,
        accounts: formattedAccounts,
      };
    } catch (error) {
      console.error('Error getting user escrow accounts:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting user escrow accounts',
      };
    }
  }
  
  /**
   * Get transaction details
   * @param transactionId Transaction ID
   * @returns Transaction details with related payout info
   */
  async getTransactionDetails(transactionId: number) {
    try {
      // Get the transaction
      const transaction = await storage.getEscrowTransaction(transactionId);
      
      if (!transaction) {
        return {
          success: false,
          error: `Transaction with ID ${transactionId} not found`,
        };
      }
      
      // Get virtual account
      const virtualAccount = await storage.getRazorpayVirtualAccount(transaction.virtualAccountId);
      
      if (!virtualAccount) {
        return {
          success: false,
          error: 'Escrow account not found for this transaction',
        };
      }
      
      // Get payment details if available
      let payment = null;
      if (transaction.paymentId) {
        payment = await storage.getRazorpayPayment(transaction.paymentId);
      }
      
      // Get payout details if available
      let payout = null;
      if (transaction.payoutId) {
        payout = await storage.getRazorpayPayout(transaction.payoutId);
      }
      
      // Get milestone details if available
      let milestone = null;
      if (transaction.milestoneId) {
        milestone = await storage.getMilestone(transaction.milestoneId);
      }
      
      // Get contract details
      const contract = await storage.getContract(transaction.contractId);
      
      return {
        success: true,
        transaction: {
          id: transaction.id,
          type: transaction.transactionType,
          amount: transaction.amount,
          status: transaction.status,
          reference: transaction.externalReference,
          description: transaction.description,
          sender: {
            type: transaction.senderType,
            id: transaction.senderId,
          },
          receiver: {
            type: transaction.receiverType,
            id: transaction.receiverId,
          },
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt,
        },
        payment,
        payout,
        milestone,
        contract,
        account: virtualAccount,
      };
    } catch (error) {
      console.error('Error getting transaction details:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error getting transaction details',
      };
    }
  }
  
  /**
   * Update transaction status from webhook
   * @param transactionId Transaction ID
   * @param status New status
   * @param externalData External data from webhook
   * @returns Updated transaction
   */
  async updateTransactionStatus(transactionId: number, status: string, externalData?: any) {
    try {
      // Update transaction status
      const transaction = await storage.updateEscrowTransaction(transactionId, {
        status,
        ...(status === 'completed' && { completedAt: new Date() }),
        ...(externalData && { metadata: externalData }),
      });
      
      // If this is a payout transaction that's completed, update milestone status
      if (transaction && transaction.transactionType === 'payment_release' && status === 'completed' && transaction.milestoneId) {
        await storage.updateMilestone(transaction.milestoneId, {
          status: 'paid',
          paidAt: new Date(),
        });
      }
      
      // If this is a funding transaction that's completed, update contract escrow status
      if (transaction && transaction.transactionType === 'funding' && status === 'completed') {
        await storage.updateContract(transaction.contractId, {
          escrowFunded: true,
        });
      }
      
      return {
        success: true,
        transaction,
      };
    } catch (error) {
      console.error('Error updating transaction status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error updating transaction status',
      };
    }
  }
  
  /**
   * Simulate a payment to test the escrow flow (only in test mode)
   * @param accountId Escrow account ID
   * @param amount Amount to pay
   * @returns Payment result
   */
  async simulatePayment(accountId: string, amount: number) {
    if (process.env.NODE_ENV === 'production') {
      return {
        success: false,
        error: 'Simulated payments are not available in production mode',
      };
    }
    
    try {
      const payment = await razorpayX.simulatePayment(accountId, amount);
      
      return {
        success: true,
        payment,
      };
    } catch (error) {
      console.error('Error simulating payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error simulating payment',
      };
    }
  }
}

// Create a singleton instance for the whole application
export const escrowWalletService = new EscrowWalletService();