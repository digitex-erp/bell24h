import axios from 'axios';
import { z } from 'zod';
import { db } from '../../db';
import { invoices } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// KredX API configuration
const KREDX_API_BASE_URL = 'https://api.kredx.com/v1';

// API key should be stored in environment variables
// Use placeholder values if environment variables are not set
const KREDX_API_KEY = process.env.KREDX_API_KEY || 'YOUR_KREDX_API_KEY_PLACEHOLDER';
const KREDX_API_SECRET = process.env.KREDX_API_SECRET || 'YOUR_KREDX_API_SECRET_PLACEHOLDER';

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

class KredxService {
  private async makeRequest(endpoint: string, method: string, data?: any) {
    if (!KREDX_API_KEY || !KREDX_API_SECRET) {
      throw new Error('KredX API credentials not configured');
    }

    try {
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
      throw new Error(error.response?.data?.message || 'KredX API request failed');
    }
  }

  /**
   * Check if KredX integration is properly configured
   */
  async isConfigured() {
    // For development purposes, we'll return true when using placeholder values
    // In production, we would validate the API key by making a test call
    if (KREDX_API_KEY === 'YOUR_KREDX_API_KEY_PLACEHOLDER') {
      console.log('Using KredX API placeholder key');
      return true; // Allow development to proceed with mock data
    }
    
    return !!(KREDX_API_KEY && KREDX_API_SECRET);
  }

  /**
   * Get KredX account information and status
   */
  async getAccountStatus() {
    try {
      // In production, this would make a real API call to KredX
      // const accountInfo = await this.makeRequest('/account', 'GET');
      
      // Simplified response for development
      const accountInfo = {
        integrated: true,
        lastSyncTime: new Date().toISOString(),
        availableCredit: "1000000",
        totalDiscounted: "350000",
        averageDiscountRate: "0.125",
        status: "active"
      };
      
      return accountInfo;
    } catch (error) {
      console.error('Error fetching KredX account status:', error);
      return {
        integrated: false,
        error: error.message
      };
    }
  }

  /**
   * Create a new invoice discount request
   */
  async createInvoiceDiscount(data: z.infer<typeof invoiceDiscountSchema>) {
    try {
      const validated = invoiceDiscountSchema.parse(data);
      
      // In production, this would make a real API call to KredX
      // const discountResult = await this.makeRequest('/invoices/discount', 'POST', validated);
      
      // Simplified response for development
      const discountResult = {
        discountId: `dis_${Date.now()}`,
        status: 'pending',
        discountRate: 0.05,
        discountedAmount: validated.amount * 0.95,
        processingFee: validated.amount * 0.005,
        netAmount: validated.amount * 0.945,
        estimatedDepositDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        referenceId: `kredx_${Date.now()}`
      };
      
      // Update the invoice in the database with KredX reference ID
      await db.update(invoices)
        .set({
          status: 'discounted',
          discountRate: 0.05.toString(),
          discountedAmount: discountResult.discountedAmount.toString(),
          kredxReferenceId: discountResult.referenceId,
          updatedAt: new Date()
        })
        .where(eq(invoices.id, validated.invoiceId));
      
      return discountResult;
    } catch (error) {
      console.error('Error creating invoice discount:', error);
      throw new Error(error.message || 'Failed to create invoice discount');
    }
  }

  /**
   * Request early payment for a milestone through KredX
   */
  async requestEarlyPayment(data: z.infer<typeof earlyPaymentRequestSchema>) {
    try {
      const validated = earlyPaymentRequestSchema.parse(data);
      
      // Create a new invoice record for the milestone
      const [invoice] = await db.insert(invoices).values({
        supplierId: validated.supplierId,
        buyerId: validated.buyerId,
        amount: validated.amount.toString(),
        dueDate: new Date(validated.dueDate),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
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
      throw new Error(error.message || 'Failed to request early payment');
    }
  }

  /**
   * Get invoices for a supplier that are eligible for discounting
   */
  async getDiscountableInvoices(supplierId: number) {
    try {
      const pendingInvoices = await db.select().from(invoices)
        .where(eq(invoices.supplierId, supplierId))
        .where(eq(invoices.status, 'pending'));
      
      // Filter to only include invoices with due dates at least 15 days in the future
      const minDueDate = new Date();
      minDueDate.setDate(minDueDate.getDate() + 15);
      
      const discountableInvoices = pendingInvoices.filter(invoice => {
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
      const invoice = await db.query.invoices.findFirst({
        where: eq(invoices.id, invoiceId)
      });
      
      if (!invoice || !invoice.kredxReferenceId) {
        throw new Error('Invoice not found or not discounted');
      }
      
      // In production, this would make a real API call to KredX
      // const statusResult = await this.makeRequest(`/discounts/${invoice.kredxReferenceId}`, 'GET');
      
      // Simplified response for development
      const statusResult = {
        status: 'approved',
        discountRate: invoice.discountRate,
        discountedAmount: invoice.discountedAmount,
        processingDate: new Date().toISOString(),
        depositDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        referenceId: invoice.kredxReferenceId
      };
      
      return statusResult;
    } catch (error) {
      console.error('Error fetching discount status:', error);
      throw new Error(error.message || 'Failed to fetch discount status');
    }
  }
}

export const kredxService = new KredxService();