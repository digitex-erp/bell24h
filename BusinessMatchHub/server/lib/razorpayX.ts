/**
 * RazorpayX Integration for Escrow Wallet Service
 * 
 * This module provides integration with RazorpayX for managing the escrow wallet system.
 * It handles contact creation, account creation, fund transfers, and payment tracking.
 */

import crypto from 'crypto';
import { storage } from '../storage';
import { type RazorpayContact, type RazorpayFundAccount } from '../../shared/schema';

// RazorpayX API credentials from environment variables
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

// Validate that credentials are available
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.error('RazorpayX API credentials not found in environment variables');
}

// Base URL for RazorpayX API
const RAZORPAY_API_URL = 'https://api.razorpay.com/v1';

// Helper for making authenticated API requests to RazorpayX
async function makeRequest(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any
) {
  const url = `${RAZORPAY_API_URL}${endpoint}`;
  const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      ...(data && { body: JSON.stringify(data) }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`RazorpayX API error (${response.status}): ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error in RazorpayX API call to ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Create a RazorpayX contact for a user
 * @param userData User data for contact creation
 * @returns Created contact
 */
export async function createContact(userData: {
  name: string;
  email: string;
  contact?: string;
  type: 'vendor' | 'customer';
  referenceId: string;
  notes?: Record<string, string>;
}) {
  try {
    // Create contact in RazorpayX
    const contact = await makeRequest('POST', '/contacts', {
      name: userData.name,
      email: userData.email,
      contact: userData.contact,
      type: userData.type,
      reference_id: userData.referenceId,
      notes: userData.notes || {},
    });

    // Store contact in database
    await storage.createRazorpayContact({
      userId: parseInt(userData.referenceId), // Assuming referenceId is the userId
      razorpayContactId: contact.id,
      name: userData.name,
      email: userData.email,
      contact: userData.contact || null,
      type: userData.type,
      referenceId: userData.referenceId,
      notes: userData.notes || {},
      active: true,
    });

    return contact;
  } catch (error) {
    console.error('Error creating RazorpayX contact:', error);
    throw error;
  }
}

/**
 * Create a fund account for a contact
 * @param contactId RazorpayX contact ID
 * @param accountData Account information
 * @returns Created fund account
 */
export async function createFundAccount(
  contactId: string,
  accountData: {
    accountType: 'bank_account' | 'vpa' | 'card';
    bankAccount?: {
      name: string;
      ifsc: string;
      accountNumber: string;
    };
    vpa?: {
      address: string;
    };
    card?: {
      last4: string;
      network: string;
    };
    userId: number;
  }
) {
  try {
    let accountDetails: any = {};

    if (accountData.accountType === 'bank_account' && accountData.bankAccount) {
      accountDetails = {
        account_type: 'bank_account',
        bank_account: {
          name: accountData.bankAccount.name,
          ifsc: accountData.bankAccount.ifsc,
          account_number: accountData.bankAccount.accountNumber,
        },
      };
    } else if (accountData.accountType === 'vpa' && accountData.vpa) {
      accountDetails = {
        account_type: 'vpa',
        vpa: {
          address: accountData.vpa.address,
        },
      };
    } else if (accountData.accountType === 'card' && accountData.card) {
      accountDetails = {
        account_type: 'card',
        card: {
          last4: accountData.card.last4,
          network: accountData.card.network,
        },
      };
    } else {
      throw new Error('Invalid account details provided');
    }

    // Create fund account in RazorpayX
    const fundAccount = await makeRequest('POST', '/fund_accounts', {
      contact_id: contactId,
      ...accountDetails,
    });

    // Get contact from database
    const contact = await storage.getRazorpayContactByRazorpayId(contactId);

    if (!contact) {
      throw new Error(`Contact with Razorpay ID ${contactId} not found in database`);
    }

    // Store fund account in database
    await storage.createRazorpayFundAccount({
      userId: accountData.userId,
      contactId: contact.id,
      razorpayContactId: contactId,
      razorpayFundAccountId: fundAccount.id,
      accountType: accountData.accountType,
      accountDetails: accountDetails,
      active: true,
    });

    return fundAccount;
  } catch (error) {
    console.error('Error creating RazorpayX fund account:', error);
    throw error;
  }
}

/**
 * Create a virtual escrow account for a contract
 * @param name Account name
 * @param description Account description
 * @param notes Additional metadata
 * @returns Created virtual account
 */
export async function createEscrowAccount(
  name: string,
  description: string,
  contractId: number,
  buyerId: number,
  sellerId: number,
  notes: Record<string, string> = {}
) {
  try {
    // Create virtual account in RazorpayX
    const virtualAccount = await makeRequest('POST', '/virtual_accounts', {
      receivers: {
        types: ['bank_account'],
      },
      description,
      customer_id: null, // We're not using Razorpay Customers for this
      notes: {
        ...notes,
        contract_id: contractId.toString(),
        buyer_id: buyerId.toString(),
        seller_id: sellerId.toString(),
      },
    });

    // Store virtual account in database
    await storage.createRazorpayVirtualAccount({
      contractId,
      razorpayVirtualAccountId: virtualAccount.id,
      name,
      description,
      status: virtualAccount.status,
      buyerId,
      sellerId,
      receiverId: sellerId, // Default receiver is the seller
      balance: 0,
      notes,
      metadata: virtualAccount,
    });

    // Update contract with escrow account info
    await storage.updateContract(contractId, {
      escrowAccountId: virtualAccount.id,
      hasEscrow: true,
    });

    return virtualAccount;
  } catch (error) {
    console.error('Error creating RazorpayX virtual account:', error);
    throw error;
  }
}

/**
 * Create a payout from escrow account to fund account
 * @param fundAccountId Recipient fund account ID
 * @param amount Amount to transfer in paisa (100 paisa = 1 INR)
 * @param reference Unique reference ID for this payout
 * @param purpose Purpose of the payout (e.g., "milestone", "refund")
 * @param notes Additional metadata
 * @returns Created payout
 */
export async function createPayout(
  fundAccountId: string,
  amount: number,
  reference: string,
  purpose: string,
  notes: Record<string, string> = {}
) {
  try {
    // Create payout in RazorpayX
    const payout = await makeRequest('POST', '/payouts', {
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER, // Your RazorpayX account number
      fund_account_id: fundAccountId,
      amount,
      currency: 'INR',
      mode: 'IMPS', // IMPS, NEFT, RTGS, or FT
      purpose,
      queue_if_low_balance: true,
      reference_id: reference,
      narration: `Payment for ${purpose}`,
      notes,
    });

    return payout;
  } catch (error) {
    console.error('Error creating RazorpayX payout:', error);
    throw error;
  }
}

/**
 * Get all virtual accounts
 * @returns List of virtual accounts
 */
export async function getVirtualAccounts(from?: string, to?: string, count = 10, skip = 0) {
  try {
    let endpoint = `/virtual_accounts?count=${count}&skip=${skip}`;
    
    if (from) {
      endpoint += `&from=${from}`;
    }
    
    if (to) {
      endpoint += `&to=${to}`;
    }
    
    return await makeRequest('GET', endpoint);
  } catch (error) {
    console.error('Error fetching RazorpayX virtual accounts:', error);
    throw error;
  }
}

/**
 * Get details of a virtual account
 * @param accountId Virtual account ID
 * @returns Virtual account details
 */
export async function getVirtualAccount(accountId: string) {
  try {
    return await makeRequest('GET', `/virtual_accounts/${accountId}`);
  } catch (error) {
    console.error(`Error fetching RazorpayX virtual account ${accountId}:`, error);
    throw error;
  }
}

/**
 * Get payout details
 * @param payoutId Payout ID
 * @returns Payout details
 */
export async function getPayout(payoutId: string) {
  try {
    return await makeRequest('GET', `/payouts/${payoutId}`);
  } catch (error) {
    console.error(`Error fetching RazorpayX payout ${payoutId}:`, error);
    throw error;
  }
}

/**
 * Get all payments for a virtual account
 * @param accountId Virtual account ID
 * @returns List of payments
 */
export async function getVirtualAccountPayments(accountId: string) {
  try {
    return await makeRequest('GET', `/virtual_accounts/${accountId}/payments`);
  } catch (error) {
    console.error(`Error fetching payments for virtual account ${accountId}:`, error);
    throw error;
  }
}

/**
 * Calculate the balance of a virtual account by summing all received payments
 * @param accountId Virtual account ID
 * @returns Account balance in paisa
 */
export async function calculateVirtualAccountBalance(accountId: string) {
  try {
    const payments = await getVirtualAccountPayments(accountId);
    
    // Sum up all successful payments
    const balance = payments.items
      .filter((payment: any) => payment.status === 'captured')
      .reduce((sum: number, payment: any) => sum + payment.amount, 0);
    
    return balance;
  } catch (error) {
    console.error(`Error calculating balance for virtual account ${accountId}:`, error);
    throw error;
  }
}

/**
 * Verify webhook signature from Razorpay
 * @param payload Webhook payload as string
 * @param signature Signature received in X-Razorpay-Signature header
 * @returns Boolean indicating whether signature is valid
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  try {
    if (!RAZORPAY_KEY_SECRET) {
      console.error('Missing RAZORPAY_KEY_SECRET for signature verification');
      return false;
    }
    
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch (error) {
    console.error('Error verifying RazorpayX webhook signature:', error);
    return false;
  }
}

/**
 * Simulate a payment to a virtual account (for testing only)
 * @param accountId Virtual account ID
 * @param amount Amount to pay in paisa
 * @param notes Additional notes
 * @returns Simulated payment response
 */
export async function simulatePayment(accountId: string, amount: number, notes: Record<string, string> = {}) {
  try {
    // In a test environment, we can simulate a payment using RazorpayX's test mode
    // For production, this function should be removed or made inaccessible
    
    // This will fail in production, but we'll leave it here for demonstration
    // In a real implementation, you would add funds directly or simulate with DB updates
    const payment = await makeRequest('POST', '/virtual_accounts/payments/simulate', {
      virtual_account_id: accountId,
      amount,
      notes,
    });
    
    return payment;
  } catch (error) {
    console.error(`Error simulating payment to virtual account ${accountId}:`, error);
    
    // Fallback for test environments
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.log('Creating simulated payment in database for testing purposes');
      
      // Get the virtual account details
      const virtualAccount = await storage.getRazorpayVirtualAccountByRazorpayId(accountId);
      
      if (!virtualAccount) {
        throw new Error(`Virtual account ${accountId} not found in database`);
      }
      
      // Create a simulated payment record in the database
      const paymentId = `pay_sim_${Date.now()}`;
      
      await storage.createRazorpayPayment({
        virtualAccountId: virtualAccount.id,
        razorpayVirtualAccountId: accountId,
        razorpayPaymentId: paymentId,
        amount,
        status: 'captured',
        method: 'test_simulation',
        description: 'Simulated payment for testing',
        notes,
      });
      
      // Update the virtual account balance
      await storage.updateRazorpayVirtualAccount(virtualAccount.id, {
        balance: virtualAccount.balance + amount,
      });
      
      // Update the contract's escrow funded status if this is the first payment
      if (virtualAccount.balance === 0) {
        await storage.updateContract(virtualAccount.contractId, {
          escrowFunded: true,
          escrowAmount: amount,
        });
      } else {
        // If additional funds, update the total escrow amount
        const contract = await storage.getContract(virtualAccount.contractId);
        if (contract) {
          await storage.updateContract(virtualAccount.contractId, {
            escrowAmount: (contract.escrowAmount || 0) + amount,
          });
        }
      }
      
      // Create a wallet transaction record
      await storage.createWalletTransaction({
        userId: virtualAccount.buyerId,
        amount,
        type: 'escrow_funding',
        description: 'Funding escrow account (simulated)',
        status: 'completed',
        contractId: virtualAccount.contractId,
        reference: paymentId,
      });
      
      return {
        id: paymentId,
        entity: 'payment',
        amount,
        status: 'captured',
        method: 'test_simulation',
        description: 'Simulated payment for testing',
        virtual_account_id: accountId,
        simulated: true,
      };
    }
    
    throw error;
  }
}

/**
 * Close a virtual account
 * @param accountId Virtual account ID
 * @returns Closure response
 */
export async function closeVirtualAccount(accountId: string) {
  try {
    const result = await makeRequest('POST', `/virtual_accounts/${accountId}/close`, {});
    
    // Update virtual account status in database
    const virtualAccount = await storage.getRazorpayVirtualAccountByRazorpayId(accountId);
    
    if (virtualAccount) {
      await storage.updateRazorpayVirtualAccount(virtualAccount.id, {
        status: 'closed',
        closedAt: new Date(),
      });
    }
    
    return result;
  } catch (error) {
    console.error(`Error closing virtual account ${accountId}:`, error);
    throw error;
  }
}