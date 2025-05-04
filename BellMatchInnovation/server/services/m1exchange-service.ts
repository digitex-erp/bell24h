import axios from 'axios';
import { db } from '../../db';
import { m1exchangeTransactions, milestonePayments, suppliers, users } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

/**
 * M1 Exchange Service - Handles communication with M1 Exchange API
 * 
 * This service provides functionality for invoice factoring and early payments
 * through M1 Exchange's financial services platform.
 */

// Configuration for M1 Exchange API
const M1_EXCHANGE_API_URL = process.env.M1_EXCHANGE_API_URL || 'https://api.m1exchange.in';
const M1_EXCHANGE_API_KEY = process.env.M1_EXCHANGE_API_KEY;
const M1_EXCHANGE_API_SECRET = process.env.M1_EXCHANGE_API_SECRET;

// Base request function with error handling
const makeRequest = async (endpoint: string, method: string = 'GET', data?: any) => {
  try {
    // If no API credentials, use mock mode
    const isMockMode = !M1_EXCHANGE_API_KEY || !M1_EXCHANGE_API_SECRET;
    
    if (isMockMode) {
      console.log(`M1 Exchange mock mode: ${method} ${endpoint}`, data);
      return { 
        mockMode: true,
        endpoint,
        method,
        data: data || {},
        timestamp: new Date().toISOString()
      };
    }
    
    const url = `${M1_EXCHANGE_API_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${M1_EXCHANGE_API_KEY}`,
      'X-API-Secret': M1_EXCHANGE_API_SECRET
    };
    
    const response = await axios({
      method,
      url,
      headers,
      data
    });
    
    return response.data;
  } catch (error) {
    console.error(`M1 Exchange API error (${method} ${endpoint}):`, error);
    throw error;
  }
};

/**
 * Check the connection status to M1 Exchange
 * 
 * @returns Status object indicating the connection state
 */
export const checkM1ExchangeStatus = async () => {
  try {
    // If no API credentials, respond with mock status
    if (!M1_EXCHANGE_API_KEY || !M1_EXCHANGE_API_SECRET) {
      return {
        status: 'connected',
        message: 'M1 Exchange service is running in simulation mode',
        timestamp: new Date().toISOString()
      };
    }
    
    // Make real API call
    const response = await makeRequest('/v1/status');
    return {
      status: 'connected',
      message: response.message || 'M1 Exchange service is connected',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Unable to connect to M1 Exchange service',
      error: error.message
    };
  }
};

/**
 * Request early payment for a milestone
 * 
 * @param milestoneId ID of the milestone to request early payment for
 * @param supplierId ID of the supplier requesting early payment
 * @returns Transaction details
 */
export const requestEarlyPayment = async (milestoneId: number, supplierId: number) => {
  try {
    // 1. Get the milestone details from the database
    const milestone = await db.query.milestonePayments.findFirst({
      where: eq(milestonePayments.id, milestoneId)
    });
    
    if (!milestone) {
      throw new Error('Milestone not found');
    }
    
    if (!milestone.approved) {
      throw new Error('Milestone must be approved before requesting early payment');
    }
    
    if (milestone.released) {
      throw new Error('Payment for this milestone has already been released');
    }
    
    // 2. Get supplier details
    const supplier = await db.query.suppliers.findFirst({
      where: eq(suppliers.id, supplierId)
    });
    
    if (!supplier) {
      throw new Error('Supplier not found');
    }
    
    // 3. Generate a unique transaction ID
    const transactionId = `M1-${uuidv4().substring(0, 8)}`;
    
    // 4. Calculate the discount rate and discounted amount (simulated)
    // In real implementation, this would come from the M1 Exchange API
    const originalAmount = milestone.amount;
    const discountRate = "3.5%"; // Simulated discount rate
    const discountFactor = 0.035; // 3.5%
    const discountedAmount = parseFloat(originalAmount) * (1 - discountFactor);
    
    // 5. Request early payment from M1 Exchange API (or simulate)
    const apiResponse = await makeRequest('/v1/early-payments', 'POST', {
      transactionId,
      milestoneId,
      supplierId,
      originalAmount,
      discountRate
    });
    
    // 6. Store the transaction in the database
    const [newTransaction] = await db.insert(m1exchangeTransactions).values({
      milestoneId,
      transactionId,
      originalAmount,
      discountedAmount: discountedAmount.toString(),
      discountRate,
      status: 'pending',
      supplierId,
      buyerId: milestone.userId,
    }).returning();
    
    // 7. Calculate estimated payment date (7 days from now for example)
    const today = new Date();
    const estimatedPaymentDate = new Date(today.setDate(today.getDate() + 7));
    
    return {
      transactionId,
      originalAmount,
      discountedAmount: discountedAmount.toFixed(2),
      discountRate,
      status: 'pending',
      estimatedPaymentDate: estimatedPaymentDate.toISOString(),
      message: 'Early payment request submitted successfully'
    };
  } catch (error) {
    console.error('Error requesting early payment:', error);
    throw error;
  }
};

/**
 * Get transaction details for a specific transaction ID
 * 
 * @param transactionId The M1 Exchange transaction ID
 * @returns Transaction details
 */
export const getTransactionById = async (transactionId: string) => {
  try {
    // Get the transaction from the database
    const transaction = await db.query.m1exchangeTransactions.findFirst({
      where: eq(m1exchangeTransactions.transactionId, transactionId)
    });
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    // In real implementation, we'd check the latest status from the API
    // For simulation, we'll just return the stored transaction
    return transaction;
  } catch (error) {
    console.error('Error getting transaction details:', error);
    throw error;
  }
};

/**
 * Get all transactions for a supplier
 * 
 * @param supplierId The supplier ID
 * @returns List of transactions
 */
export const getSupplierTransactions = async (supplierId: number) => {
  try {
    // Get all transactions for the supplier from the database
    const transactions = await db.query.m1exchangeTransactions.findMany({
      where: eq(m1exchangeTransactions.supplierId, supplierId),
      orderBy: (m1exchangeTransactions, { desc }) => [desc(m1exchangeTransactions.createdAt)]
    });
    
    // Enhance with milestone info if available
    const enhancedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        const milestone = await db.query.milestonePayments.findFirst({
          where: eq(milestonePayments.id, transaction.milestoneId)
        });
        
        return {
          ...transaction,
          milestone: milestone ? {
            id: milestone.id,
            title: milestone.title
          } : undefined
        };
      })
    );
    
    return {
      transactions: enhancedTransactions,
      count: transactions.length
    };
  } catch (error) {
    console.error('Error getting supplier transactions:', error);
    throw error;
  }
};

/**
 * Update transaction status (e.g., from pending to completed)
 * 
 * @param transactionId The transaction ID
 * @param newStatus The new status
 * @returns Updated transaction
 */
export const updateTransactionStatus = async (transactionId: string, newStatus: string) => {
  try {
    // Update the transaction status in the database
    const [updatedTransaction] = await db
      .update(m1exchangeTransactions)
      .set({ 
        status: newStatus, 
        updatedAt: new Date(),
        ...(newStatus === 'completed' ? { paymentDate: new Date() } : {})
      })
      .where(eq(m1exchangeTransactions.transactionId, transactionId))
      .returning();
    
    if (!updatedTransaction) {
      throw new Error('Transaction not found or could not be updated');
    }
    
    return updatedTransaction;
  } catch (error) {
    console.error('Error updating transaction status:', error);
    throw error;
  }
};

/**
 * Generate a payment report for transactions in a date range
 * 
 * @param startDate Start date for the report
 * @param endDate End date for the report
 * @returns Report data
 */
export const generatePaymentReport = async (startDate: string, endDate: string) => {
  try {
    // Placeholder for report generation logic
    const startDateTime = new Date(startDate);
    const endDateTime = new Date(endDate);
    
    // Get transactions in the date range
    const transactions = await db.query.m1exchangeTransactions.findMany({
      where: and(
        m1exchangeTransactions.createdAt >= startDateTime,
        m1exchangeTransactions.createdAt <= endDateTime
      )
    });
    
    // Calculate statistics
    const totalTransactions = transactions.length;
    const totalOriginalAmount = transactions.reduce(
      (sum, tx) => sum + parseFloat(tx.originalAmount), 
      0
    );
    const totalDiscountedAmount = transactions.reduce(
      (sum, tx) => sum + parseFloat(tx.discountedAmount), 
      0
    );
    const averageDiscount = 
      transactions.length > 0 
        ? (1 - (totalDiscountedAmount / totalOriginalAmount)) * 100 
        : 0;
    
    return {
      startDate,
      endDate,
      totalTransactions,
      totalOriginalAmount: totalOriginalAmount.toFixed(2),
      totalDiscountedAmount: totalDiscountedAmount.toFixed(2),
      averageDiscount: averageDiscount.toFixed(2) + '%',
      transactions
    };
  } catch (error) {
    console.error('Error generating payment report:', error);
    throw error;
  }
};