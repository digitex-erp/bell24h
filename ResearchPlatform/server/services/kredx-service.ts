import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import { db } from '../db';
import { kredxInvoices } from '@shared/schema';
import { eq } from 'drizzle-orm';

// KredX API configuration
const KREDX_API_BASE_URL = process.env.KREDX_API_BASE_URL || 'https://api.kredx.com/v1';

// API key should be stored in environment variables
const KREDX_API_KEY = process.env.KREDX_API_KEY || 'YOUR_KREDX_API_KEY_PLACEHOLDER';
const KREDX_API_SECRET = process.env.KREDX_API_SECRET || 'YOUR_KREDX_API_SECRET_PLACEHOLDER';

// Flag to determine if using real credentials or placeholders
const USING_PLACEHOLDER_CREDENTIALS = 
  KREDX_API_KEY === 'YOUR_KREDX_API_KEY_PLACEHOLDER' || 
  KREDX_API_SECRET === 'YOUR_KREDX_API_SECRET_PLACEHOLDER';

// Validation schemas for KredX API requests
const invoiceDiscountSchema = z.object({
  invoiceId: z.number().int().positive(),
  amount: z.number().positive(),
  dueDate: z.string().datetime(),
  buyerName: z.string().min(1),
  buyerEmail: z.string().email(),
  invoiceReference: z.string().min(1)
});

const earlyPaymentRequestSchema = z.object({
  milestoneId: z.number().int().positive(),
  amount: z.number().positive(),
  dueDate: z.string().datetime(),
  buyerId: z.number().int().positive(),
  supplierId: z.number().int().positive(),
  description: z.string().min(1)
});

export class KredxService {
  private async makeRequest(endpoint: string, method: string, data?: any) {
    if (!KREDX_API_KEY || !KREDX_API_SECRET) {
      throw new Error('KredX API credentials not configured');
    }

    try {
      // If using placeholder credentials, return mock responses based on the endpoint
      if (USING_PLACEHOLDER_CREDENTIALS) {
        console.log(`Using placeholder KredX credentials for ${method} ${endpoint}`);
        return this.getMockResponse(endpoint, method, data);
      }

      // Use real API with actual credentials
      const response = await axios({
        method,
        url: `${KREDX_API_BASE_URL}${endpoint}`,
        data,
        headers: {
          'Authorization': `Basic ${Buffer.from(`${KREDX_API_KEY}:${KREDX_API_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('KredX API error:', error);
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.response?.data 
        ? (axiosError.response.data as any).message 
        : 'KredX API request failed';
      throw new Error(errorMessage);
    }
  }
  
  /**
   * Generate mock responses for development when using placeholder credentials
   * This allows development to continue without real API keys
   */
  private getMockResponse(endpoint: string, method: string, data?: any): any {
    // Generate a mock KredX API response based on the endpoint and method
    const timestamp = new Date().toISOString();
    const transactionId = `mock-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Account status endpoint
    if (endpoint === '/account' && method === 'GET') {
      return {
        accountId: 'MOCK-ACCOUNT-123',
        status: 'active',
        name: 'Bell24h Placeholder Account',
        balance: 500000,
        activeDiscounts: 12,
        availableCredit: 475000,
        createdAt: '2023-01-15T09:30:00Z'
      };
    }
    
    // Invoice discount endpoint
    if (endpoint === '/invoices/discount' && method === 'POST' && data) {
      const amount = data.amount;
      const discountRate = 0.08 + (Math.random() * 0.05); // 8-13% discount rate
      const discountedAmount = amount * (1 - discountRate);
      
      return {
        discountId: `DISC-${transactionId}`,
        invoiceId: data.invoiceId,
        originalAmount: amount,
        discountedAmount: discountedAmount.toFixed(2),
        discountRate: (discountRate * 100).toFixed(2),
        transactionDate: timestamp,
        status: 'approved',
        paymentDate: timestamp,
        settlementAccount: 'MOCK-ACCOUNT-123'
      };
    }
    
    // Bulk discount endpoint
    if (endpoint === '/invoices/bulk-discount' && method === 'POST' && data?.invoices) {
      const discountedAmounts: Record<string, number> = {};
      const invoiceIds: number[] = [];
      
      data.invoices.forEach((inv: any) => {
        const discountRate = 0.07 + (Math.random() * 0.06); // 7-13% discount rate
        const discountedAmount = inv.amount * (1 - discountRate);
        discountedAmounts[inv.invoiceId] = parseFloat(discountedAmount.toFixed(2));
        invoiceIds.push(inv.invoiceId);
      });
      
      return {
        bulkDiscountId: `BULK-${transactionId}`,
        invoiceIds: invoiceIds,
        discountedAmounts: discountedAmounts,
        transactionDate: timestamp,
        status: 'approved'
      };
    }
    
    // Discount status endpoint
    if (endpoint.startsWith('/discounts/') && method === 'GET') {
      const invoiceNumber = endpoint.split('/').pop();
      return {
        discountId: `DISC-${transactionId}`,
        invoiceNumber: invoiceNumber,
        status: 'completed',
        originalAmount: 25000,
        discountedAmount: 22750,
        discountRate: 9,
        transactionDate: timestamp,
        settledDate: timestamp
      };
    }
    
    // Calculate discount endpoint
    if (endpoint === '/calculate-discount' && method === 'POST' && data) {
      const amount = data.amount;
      const daysUntilDue = data.daysUntilDue || 30;
      
      // Calculate mock discount rate based on days until due
      let discountRate = 0;
      if (daysUntilDue <= 7) {
        discountRate = 0.12 + (Math.random() * 0.03); // 12-15%
      } else if (daysUntilDue <= 14) {
        discountRate = 0.09 + (Math.random() * 0.03); // 9-12%
      } else if (daysUntilDue <= 30) {
        discountRate = 0.06 + (Math.random() * 0.03); // 6-9%
      } else {
        discountRate = 0.04 + (Math.random() * 0.03); // 4-7%
      }
      
      const discountedAmount = amount * (1 - discountRate);
      const fee = amount * (discountRate * 0.2); // 20% of discount as fee
      
      return {
        amount: amount,
        discountedAmount: discountedAmount.toFixed(2),
        discountRate: (discountRate * 100).toFixed(2),
        fee: fee.toFixed(2),
        netSavings: (amount - discountedAmount - fee).toFixed(2),
        daysToPayment: daysUntilDue,
        calculatedAt: timestamp
      };
    }
    
    // Default generic response
    return {
      success: true,
      mockResponse: true,
      timestamp: timestamp,
      message: `Mock response for ${method} ${endpoint}`,
      data: data || null
    };
  }

  /**
   * Check if KredX integration is properly configured
   */
  async isConfigured() {
    try {
      if (!KREDX_API_KEY || !KREDX_API_SECRET) {
        return false;
      }
      
      // If using placeholder credentials, we still return true
      // so that development can continue without actual API keys
      if (USING_PLACEHOLDER_CREDENTIALS) {
        console.log('Using placeholder KredX credentials for configuration check');
        return true;
      }
      
      // Make a test call to the API to verify credentials
      const accountInfo = await this.makeRequest('/account', 'GET');
      return !!accountInfo;
    } catch (error) {
      console.error('KredX configuration check failed:', error);
      return false;
    }
  }

  /**
   * Get KredX account information and status
   */
  async getAccountStatus() {
    try {
      if (!await this.isConfigured()) {
        return {
          integrated: false,
          error: 'KredX API credentials not configured'
        };
      }
      
      const accountInfo = await this.makeRequest('/account', 'GET');
      
      return {
        integrated: true,
        ...accountInfo
      };
    } catch (error) {
      console.error('Error fetching KredX account status:', error);
      return {
        integrated: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create a new invoice discount request
   */
  async createInvoiceDiscount(data: z.infer<typeof invoiceDiscountSchema>) {
    try {
      const validated = invoiceDiscountSchema.parse(data);
      
      // Call KredX API to create invoice discount
      const discountResult = await this.makeRequest('/invoices/discount', 'POST', validated);
      
      // Update the invoice in the database with KredX reference ID
      await db.update(kredxInvoices)
        .set({
          status: 'discounted',
          discountedAmount: discountResult.discountedAmount.toString(),
        })
        .where(eq(kredxInvoices.id, validated.invoiceId));
      
      return discountResult;
    } catch (error) {
      console.error('Error creating invoice discount:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create invoice discount');
    }
  }

  /**
   * Request early payment for a milestone through KredX
   */
  async requestEarlyPayment(data: z.infer<typeof earlyPaymentRequestSchema>) {
    try {
      const validated = earlyPaymentRequestSchema.parse(data);
      
      // Create a new invoice record for the milestone
      const [invoice] = await db.insert(kredxInvoices).values({
        userId: validated.supplierId,
        invoiceNumber: `MILESTONE-${validated.milestoneId}-${Date.now()}`,
        amount: validated.amount.toString(),
        dueDate: validated.dueDate,
        status: 'pending',
      }).returning();
      
      // Then request discounting through KredX
      const discountResult = await this.createInvoiceDiscount({
        invoiceId: invoice.id,
        amount: validated.amount,
        dueDate: validated.dueDate,
        buyerName: 'Bell24h Client', // This would be fetched from the user record
        buyerEmail: 'finance@bell24h.com', // This would be fetched from the user record
        invoiceReference: `milestone-${validated.milestoneId}`
      });
      
      return {
        invoice,
        discountResult
      };
    } catch (error) {
      console.error('Error requesting early payment:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to request early payment');
    }
  }

  /**
   * Get invoices for a supplier that are eligible for discounting
   */
  async getDiscountableInvoices(userId: number) {
    try {
      // Get pending invoices for the user
      const pendingInvoices = await db.select().from(kredxInvoices)
        .where(eq(kredxInvoices.userId, userId))
        .where(eq(kredxInvoices.status, 'pending'));
      
      // Filter to only include invoices with due dates at least 15 days in the future
      const minDueDate = new Date();
      minDueDate.setDate(minDueDate.getDate() + 15);
      
      const discountableInvoices = pendingInvoices.filter((invoice: any) => {
        if (!invoice.dueDate) return false;
        const dueDate = new Date(invoice.dueDate);
        return dueDate > minDueDate;
      });
      
      return discountableInvoices;
    } catch (error) {
      console.error('Error fetching discountable invoices:', error);
      throw new Error('Failed to fetch discountable invoices');
    }
  }

  /**
   * Get the status of a discounted invoice
   */
  async getDiscountStatus(invoiceId: number) {
    try {
      const invoices = await db.select().from(kredxInvoices)
        .where(eq(kredxInvoices.id, invoiceId));
        
      if (invoices.length === 0) {
        throw new Error('Invoice not found');
      }
      
      const invoice = invoices[0];
      
      if (invoice.status !== 'discounted') {
        throw new Error('Invoice not discounted');
      }
      
      // In production environment, call KredX API to get status
      const statusResult = await this.makeRequest(`/discounts/${invoice.invoiceNumber}`, 'GET');
      
      return {
        ...statusResult,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber
      };
    } catch (error) {
      console.error('Error fetching discount status:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch discount status');
    }
  }
  
  /**
   * Calculate discount rates and fees for an invoice
   */
  async calculateDiscountRates(amount: number, dueDate: string) {
    try {
      // Calculate days to due date
      const dueDateObj = new Date(dueDate);
      const now = new Date();
      const daysUntilDue = Math.ceil((dueDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      // Call KredX API to get calculated rates
      const calculationResult = await this.makeRequest('/calculate-discount', 'POST', {
        amount,
        daysUntilDue
      });
      
      return calculationResult;
    } catch (error) {
      console.error('Error calculating discount rates:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to calculate discount rates');
    }
  }
  
  /**
   * Get transaction history for a user
   */
  async getTransactionHistory(userId: number) {
    try {
      const invoices = await db.select().from(kredxInvoices)
        .where(eq(kredxInvoices.userId, userId));
      
      const transactionHistory = invoices.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        discountedAmount: invoice.discountedAmount || '0',
        status: invoice.status,
        dueDate: invoice.dueDate,
        createdAt: invoice.createdAt
      }));
      
      return transactionHistory;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw new Error('Failed to fetch transaction history');
    }
  }

  /**
   * Create a bulk invoice discount request for multiple invoices
   */
  async createBulkInvoiceDiscount(invoiceIds: number[]) {
    try {
      if (invoiceIds.length === 0) {
        throw new Error('No invoice IDs provided');
      }
      
      // Get all the invoices
      const invoices = await db.select().from(kredxInvoices)
        .where(eq(kredxInvoices.status, 'pending'));
      
      const filteredInvoices = invoices.filter(inv => invoiceIds.includes(inv.id));
      
      if (filteredInvoices.length === 0) {
        throw new Error('No valid invoices found with the provided IDs');
      }
      
      // Format data for KredX API
      const bulkDiscountData = {
        invoices: filteredInvoices.map(invoice => ({
          invoiceId: invoice.id,
          amount: parseFloat(invoice.amount),
          dueDate: invoice.dueDate || '',
          buyerName: 'Bell24h Client', // Would be fetched from user records
          buyerEmail: 'finance@bell24h.com', // Would be fetched from user records
          invoiceReference: invoice.invoiceNumber
        }))
      };
      
      // Call KredX API to create bulk discount
      const bulkDiscountResult = await this.makeRequest('/invoices/bulk-discount', 'POST', bulkDiscountData);
      
      // Update all invoices in the database
      for (const invoice of filteredInvoices) {
        const discountAmount = bulkDiscountResult.discountedAmounts[invoice.id.toString()];
        await db.update(kredxInvoices)
          .set({
            status: 'discounted',
            discountedAmount: discountAmount ? discountAmount.toString() : '0',
          })
          .where(eq(kredxInvoices.id, invoice.id));
      }
      
      return bulkDiscountResult;
    } catch (error) {
      console.error('Error creating bulk invoice discount:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create bulk invoice discount');
    }
  }
  
  /**
   * Get analytics and metrics for KredX discount activity
   */
  async getDiscountAnalytics(userId?: number, startDate?: Date, endDate?: Date) {
    try {
      let queryResult = await db.select().from(kredxInvoices);
      
      // Filter results after query
      let invoices = queryResult;
      
      if (userId) {
        invoices = invoices.filter(inv => inv.userId === userId);
      }
      
      if (startDate) {
        invoices = invoices.filter(inv => {
          if (!inv.createdAt) return false;
          const created = new Date(inv.createdAt);
          return created >= startDate;
        });
      }
      
      if (endDate) {
        invoices = invoices.filter(inv => {
          if (!inv.createdAt) return false;
          const created = new Date(inv.createdAt);
          return created <= endDate;
        });
      }
      
      // Calculate analytics metrics
      let totalDiscountedAmount = 0;
      let totalOriginalAmount = 0;
      let discountedInvoices = 0;
      let pendingInvoices = 0;
      
      for (const invoice of invoices) {
        const originalAmount = parseFloat(invoice.amount);
        totalOriginalAmount += originalAmount;
        
        if (invoice.status === 'discounted' && invoice.discountedAmount) {
          const discountedAmount = parseFloat(invoice.discountedAmount);
          totalDiscountedAmount += discountedAmount;
          discountedInvoices++;
        } else if (invoice.status === 'pending') {
          pendingInvoices++;
        }
      }
      
      const averageDiscountRate = discountedInvoices > 0 
        ? ((totalOriginalAmount - totalDiscountedAmount) / totalOriginalAmount) * 100 
        : 0;
      
      return {
        totalInvoices: invoices.length,
        discountedInvoices,
        pendingInvoices,
        totalOriginalAmount,
        totalDiscountedAmount,
        averageDiscountRate,
        potentialSavings: totalOriginalAmount - totalDiscountedAmount,
        invoices: invoices.map(invoice => ({
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          amount: invoice.amount,
          discountedAmount: invoice.discountedAmount || '0',
          status: invoice.status,
          discount: invoice.discountedAmount 
            ? ((parseFloat(invoice.amount) - parseFloat(invoice.discountedAmount)) / parseFloat(invoice.amount)) * 100 
            : 0,
          dueDate: invoice.dueDate,
          createdAt: invoice.createdAt
        }))
      };
    } catch (error) {
      console.error('Error generating discount analytics:', error);
      throw new Error('Failed to generate discount analytics');
    }
  }

  /**
   * Get best discount options for a specific invoice
   */
  async getBestDiscountOptions(invoiceId: number) {
    try {
      const invoices = await db.select().from(kredxInvoices)
        .where(eq(kredxInvoices.id, invoiceId));
        
      if (invoices.length === 0) {
        throw new Error('Invoice not found');
      }
      
      const invoice = invoices[0];
      
      if (invoice.status !== 'pending') {
        throw new Error('Invoice is not eligible for discounting');
      }
      
      const amount = parseFloat(invoice.amount);
      
      if (!invoice.dueDate) {
        throw new Error('Invoice has no due date');
      }
      
      const dueDate = new Date(invoice.dueDate);
      const now = new Date();
      
      // Calculate options for different timeframes
      const options = [];
      
      // Options at 7 days
      const sevenDayDate = new Date(now);
      sevenDayDate.setDate(sevenDayDate.getDate() + 7);
      if (sevenDayDate < dueDate) {
        const sevenDayRate = await this.calculateDiscountRates(amount, sevenDayDate.toISOString());
        options.push({
          label: '7 days',
          discountedAmount: sevenDayRate.discountedAmount,
          savings: amount - sevenDayRate.discountedAmount,
          discountRate: sevenDayRate.discountRate
        });
      }
      
      // Options at 14 days
      const fourteenDayDate = new Date(now);
      fourteenDayDate.setDate(fourteenDayDate.getDate() + 14);
      if (fourteenDayDate < dueDate) {
        const fourteenDayRate = await this.calculateDiscountRates(amount, fourteenDayDate.toISOString());
        options.push({
          label: '14 days',
          discountedAmount: fourteenDayRate.discountedAmount,
          savings: amount - fourteenDayRate.discountedAmount,
          discountRate: fourteenDayRate.discountRate
        });
      }
      
      // Options at 30 days
      const thirtyDayDate = new Date(now);
      thirtyDayDate.setDate(thirtyDayDate.getDate() + 30);
      if (thirtyDayDate < dueDate) {
        const thirtyDayRate = await this.calculateDiscountRates(amount, thirtyDayDate.toISOString());
        options.push({
          label: '30 days',
          discountedAmount: thirtyDayRate.discountedAmount,
          savings: amount - thirtyDayRate.discountedAmount,
          discountRate: thirtyDayRate.discountRate
        });
      }
      
      // Options at due date (no discount)
      options.push({
        label: 'Full term',
        discountedAmount: amount,
        savings: 0,
        discountRate: 0
      });
      
      return {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        originalAmount: amount,
        dueDate: invoice.dueDate,
        options
      };
    } catch (error) {
      console.error('Error calculating discount options:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to calculate discount options');
    }
  }
  
  /**
   * Get dashboard statistics for KredX activity
   */
  async getDashboardStats(userId?: number) {
    try {
      let queryResult = await db.select().from(kredxInvoices);
      
      // Filter results after query
      let invoices = queryResult;
      
      if (userId) {
        invoices = invoices.filter(inv => inv.userId === userId);
      }
      
      // Current month filter
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      // Previous month filter
      const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      
      // Calculate savings
      let totalSavings = 0;
      let currentMonthSavings = 0;
      let prevMonthSavings = 0;
      
      for (const invoice of invoices) {
        if (invoice.status === 'discounted' && invoice.discountedAmount) {
          const savings = parseFloat(invoice.amount) - parseFloat(invoice.discountedAmount);
          totalSavings += savings;
          
          if (!invoice.createdAt) continue;
          
          const createdAt = new Date(invoice.createdAt);
          if (createdAt >= monthStart && createdAt <= monthEnd) {
            currentMonthSavings += savings;
          } else if (createdAt >= prevMonthStart && createdAt <= prevMonthEnd) {
            prevMonthSavings += savings;
          }
        }
      }
      
      // Calculate month-over-month change
      const savingsChange = prevMonthSavings > 0 
        ? ((currentMonthSavings - prevMonthSavings) / prevMonthSavings) * 100 
        : (currentMonthSavings > 0 ? 100 : 0);
      
      // Calculate pending eligible invoices total
      const pendingInvoices = invoices.filter(invoice => invoice.status === 'pending');
      const pendingAmount = pendingInvoices.reduce((total, invoice) => total + parseFloat(invoice.amount), 0);
      
      // Calculate potential savings for pending invoices (estimate at 10% discount)
      const potentialSavings = pendingAmount * 0.1;
      
      return {
        totalInvoices: invoices.length,
        totalSavings,
        currentMonthSavings,
        savingsChange,
        pendingInvoices: pendingInvoices.length,
        pendingAmount,
        potentialSavings,
        recentDiscounts: invoices
          .filter(inv => inv.status === 'discounted' && inv.discountedAmount)
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 5)
          .map(inv => ({
            id: inv.id,
            invoiceNumber: inv.invoiceNumber,
            originalAmount: parseFloat(inv.amount),
            discountedAmount: parseFloat(inv.discountedAmount || '0'),
            savings: parseFloat(inv.amount) - parseFloat(inv.discountedAmount || '0'),
            createdAt: inv.createdAt
          }))
      };
    } catch (error) {
      console.error('Error generating dashboard stats:', error);
      throw new Error('Failed to generate dashboard stats');
    }
  }
}

export const kredxService = new KredxService();