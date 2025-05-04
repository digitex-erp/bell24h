import axios from 'axios';
import crypto from 'crypto';
import { storage } from '../storage';
import { Invoice, InsertKredxTransaction } from '../../shared/schema';

// Interface for KredX API responses
interface KredXApiResponse {
  success: boolean;
  message: string;
  status?: string;
  currentStatus?: string;
  canDiscount?: boolean;
  invoice?: {
    id: string;
    invoiceNumber: string;
    amount: number;
    dueDate: string;
    status: string;
  };
  errorCode?: string;
  errorDetails?: string;
  lastKnownStatus?: string;
  referenceId?: string;
  error?: string;
  advanceAmount?: number;
  remainingAmount?: number;
  discountFee?: number;
  feePercentage?: number;
  totalAmount?: number;
  paymentStatus?: string;
  expectedCompletionDate?: string;
  details?: any;
  timeline?: TimelineEvent[];
}

interface TimelineEvent {
  timestamp: string;
  event: string;
  details: string;
}

interface KredXInvoiceCheck {
  invoiceNumber: string;
  buyerGST: string;
  sellerGST: string;
  amount: number;
  invoiceDate: string;
  dueDate: string;
}

interface KredXInvoiceSubmission extends KredXInvoiceCheck {
  buyerName: string;
  sellerName: string;
  buyerAddress: string;
  sellerAddress: string;
  description: string;
  invoiceDocument: string; // Base64 encoded or file URL
  additionalDocuments?: string[]; // Optional supporting documents
}

interface KredXDiscountRequest {
  invoiceId: string;
  discountPercentage?: number; // Optional, system will use default if not provided
  bankAccount?: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
}

interface KredXEarlyPaymentRequest {
  invoiceId: string;
  bankAccount: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
}

interface KredXVerifyInvoiceRequest {
  invoiceNumber: string;
  buyerGST: string;
  sellerGST: string;
  amount: number;
  invoiceDate: string;
}

interface KredXInvoiceDiscount {
  invoiceId: number;
  bankAccount: {
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    bankName: string;
  };
  discountPercentage?: number;
}

/**
 * KredX Service for invoice discounting
 * 
 * This service integrates with KredX's API to provide invoice discounting 
 * capabilities to suppliers in our platform.
 */
export class KredXService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private feePercentage: number = 0.5; // Standard fee is 0.5%

  constructor() {
    this.apiKey = process.env.KREDX_API_KEY || '';
    this.apiSecret = process.env.KREDX_API_SECRET || '';
    this.baseUrl = process.env.KREDX_API_URL || 'https://api.kredx.com/v1';
    
    if (!this.apiKey || !this.apiSecret) {
      console.warn('KredX API credentials not found. KredX service will not function properly.');
    }
  }

  /**
   * Check if KredX service is properly configured
   */
  async isConfigured(): Promise<boolean> {
    return !!this.apiKey && !!this.apiSecret;
  }

  /**
   * Generate HMAC signature for API authentication
   */
  private generateSignature(payload: any, timestamp: string): string {
    const stringToSign = JSON.stringify(payload) + timestamp;
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(stringToSign)
      .digest('hex');
  }

  /**
   * Send request to KredX API
   */
  private async sendRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    payload?: any
  ): Promise<KredXApiResponse> {
    try {
      const timestamp = new Date().toISOString();
      const signature = payload ? this.generateSignature(payload, timestamp) : '';
      
      const response = await axios({
        method,
        url: `${this.baseUrl}${endpoint}`,
        data: payload,
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey,
          'X-Timestamp': timestamp,
          'X-Signature': signature
        }
      });
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Return the API error response
        return error.response.data as KredXApiResponse;
      }
      
      // Return a generic error if something else went wrong
      return {
        success: false,
        message: `Failed to communicate with KredX API: ${(error as Error).message}`
      };
    }
  }

  /**
   * Get KredX account status
   */
  async getAccountStatus(): Promise<KredXApiResponse> {
    return this.sendRequest('/account/status', 'GET');
  }

  /**
   * Check if an invoice is eligible for discounting
   */
  async checkInvoiceEligibility(invoiceData: KredXInvoiceCheck): Promise<KredXApiResponse> {
    return this.sendRequest('/invoices/check-eligibility', 'POST', invoiceData);
  }

  /**
   * Submit an invoice for discounting
   */
  async submitInvoice(invoiceData: KredXInvoiceSubmission): Promise<KredXApiResponse> {
    return this.sendRequest('/invoices/submit', 'POST', invoiceData);
  }

  /**
   * Request invoice discounting (after submission)
   */
  async requestDiscount(discountData: KredXDiscountRequest): Promise<KredXApiResponse> {
    return this.sendRequest('/invoices/discount', 'POST', discountData);
  }

  /**
   * Get status of a submitted invoice
   */
  async getInvoiceStatus(invoiceId: string): Promise<KredXApiResponse> {
    return this.sendRequest(`/invoices/${invoiceId}/status`, 'GET');
  }

  /**
   * Get transaction details for a discounted invoice
   */
  async getTransactionDetails(transactionId: string): Promise<KredXApiResponse> {
    return this.sendRequest(`/transactions/${transactionId}`, 'GET');
  }

  /**
   * Cancel a discount request (if not yet processed)
   */
  async cancelDiscountRequest(invoiceId: string): Promise<KredXApiResponse> {
    return this.sendRequest(`/invoices/${invoiceId}/cancel`, 'POST');
  }

  /**
   * Get discountable invoices for a user
   */
  async getDiscountableInvoices(userId: number): Promise<Invoice[]> {
    try {
      // Get invoices where the user is the seller and invoice is in pending status
      const invoices = await storage.getInvoicesBySellerId(userId);
      const discountableInvoices = invoices.filter(invoice => 
        invoice.status === 'pending' && 
        !invoice.discountRequested && 
        new Date(invoice.dueDate) > new Date()
      );
      
      return discountableInvoices;
    } catch (error) {
      console.error("Error fetching discountable invoices:", error);
      return [];
    }
  }

  /**
   * Get invoices already submitted for discounting
   */
  async getDiscountedInvoices(userId: number): Promise<Invoice[]> {
    try {
      // Get invoices where the user is the seller and discount was requested
      const invoices = await storage.getInvoicesBySellerId(userId);
      const discountedInvoices = invoices.filter(invoice => 
        invoice.discountRequested && 
        invoice.kredxStatus !== null
      );
      
      return discountedInvoices;
    } catch (error) {
      console.error("Error fetching discounted invoices:", error);
      return [];
    }
  }

  /**
   * Get transaction history for an invoice
   */
  async getTransactionHistory(invoiceId: number): Promise<any[]> {
    try {
      // Get all KredX transactions related to this invoice
      const transactions = await storage.getKredxTransactionsByInvoiceId(invoiceId);
      
      // Format and return the transactions
      return transactions.map(tx => ({
        id: tx.id,
        type: tx.transactionType,
        status: tx.status,
        amount: tx.amount,
        fee: tx.fee,
        referenceId: tx.referenceId,
        timestamp: tx.createdAt,
      }));
    } catch (error) {
      console.error("Error fetching transaction history:", error);
      return [];
    }
  }

  /**
   * Verify invoice details with GST and KredX system
   */
  async verifyInvoice(invoiceId: number): Promise<{
    success: boolean;
    message: string;
    verificationDetails?: any;
  }> {
    try {
      // Get invoice details from storage
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return {
          success: false,
          message: 'Invoice not found'
        };
      }
      
      // Get buyer and seller details
      const buyer = await storage.getUser(invoice.buyerId);
      const seller = await storage.getUser(invoice.sellerId);
      
      if (!buyer || !seller) {
        return {
          success: false,
          message: 'Buyer or seller information not found'
        };
      }
      
      // Check if buyer and seller have GST numbers
      if (!buyer.gstNumber || !seller.gstNumber) {
        return {
          success: false,
          message: 'GST numbers are required for both buyer and seller'
        };
      }
      
      // Create verification request
      const verificationRequest: KredXVerifyInvoiceRequest = {
        invoiceNumber: invoice.invoiceNumber,
        buyerGST: buyer.gstNumber,
        sellerGST: seller.gstNumber,
        amount: invoice.amount,
        invoiceDate: new Date(invoice.issuedDate).toISOString().split('T')[0]
      };
      
      // Call KredX API to verify
      const verificationResult = await this.sendRequest('/invoices/verify', 'POST', verificationRequest);
      
      // Update invoice verification status
      await storage.updateInvoice(invoiceId, {
        verificationStatus: verificationResult.success ? 'verified' : 'rejected',
        kredxEligible: verificationResult.success && !!verificationResult.canDiscount
      });
      
      // Log verification attempt
      await storage.createKredxTransaction({
        invoiceId: invoiceId,
        transactionType: 'verification',
        status: verificationResult.success ? 'success' : 'failed',
        responseData: JSON.stringify(verificationResult)
      } as InsertKredxTransaction);
      
      return {
        success: verificationResult.success,
        message: verificationResult.message,
        verificationDetails: verificationResult
      };
    } catch (error) {
      console.error("Error verifying invoice:", error);
      return {
        success: false,
        message: `Verification failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Create invoice discount request
   */
  async createInvoiceDiscount(discountData: KredXInvoiceDiscount): Promise<{
    success: boolean;
    message: string;
    discountDetails?: any;
  }> {
    try {
      // Get invoice details from storage
      const invoice = await storage.getInvoice(discountData.invoiceId);
      
      if (!invoice) {
        return {
          success: false,
          message: 'Invoice not found'
        };
      }
      
      // Check if invoice is already in discounting process
      if (invoice.discountRequested) {
        return {
          success: false,
          message: 'Invoice has already been submitted for discounting'
        };
      }
      
      // Process invoice for discounting
      const discountResult = await this.processInvoiceForDiscounting(discountData.invoiceId);
      
      if (!discountResult.success) {
        return {
          success: false,
          message: discountResult.message
        };
      }
      
      // Update invoice discount status
      await storage.updateInvoice(discountData.invoiceId, {
        discountRequested: true,
        feePercentage: discountData.discountPercentage || this.feePercentage,
        discountFee: discountResult.discountFee,
        advanceAmount: discountResult.advanceAmount,
        remainingAmount: discountResult.remainingAmount
      });
      
      // Log discount transaction
      await storage.createKredxTransaction({
        invoiceId: discountData.invoiceId,
        transactionType: 'discounting',
        status: 'success',
        amount: invoice.amount,
        fee: discountResult.discountFee,
        referenceId: invoice.kredxReferenceId || undefined,
        responseData: JSON.stringify(discountResult)
      } as InsertKredxTransaction);
      
      return {
        success: true,
        message: 'Invoice submitted for discounting successfully',
        discountDetails: discountResult
      };
    } catch (error) {
      console.error("Error creating invoice discount:", error);
      return {
        success: false,
        message: `Discount request failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Request early payment for a discounted invoice
   */
  async requestEarlyPayment(paymentRequest: KredXEarlyPaymentRequest & { invoiceId: number }): Promise<{
    success: boolean;
    message: string;
    paymentDetails?: any;
  }> {
    try {
      // Get invoice details from storage
      const invoice = await storage.getInvoice(paymentRequest.invoiceId);
      
      if (!invoice) {
        return {
          success: false,
          message: 'Invoice not found'
        };
      }
      
      // Check if invoice is in discounting process
      if (!invoice.discountRequested || !invoice.kredxReferenceId) {
        return {
          success: false,
          message: 'Invoice has not been submitted for discounting'
        };
      }
      
      // Send early payment request to KredX
      const paymentResult = await this.sendRequest(
        `/invoices/${invoice.kredxInvoiceId}/payment`,
        'POST',
        {
          referenceId: invoice.kredxReferenceId,
          bankAccount: paymentRequest.bankAccount
        }
      );
      
      if (!paymentResult.success) {
        return {
          success: false,
          message: paymentResult.message
        };
      }
      
      // Update invoice payment status
      await storage.updateInvoice(paymentRequest.invoiceId, {
        status: 'paid',
        kredxStatus: 'payment_processed',
        earlyPaymentDate: new Date()
      });
      
      // Log payment transaction
      await storage.createKredxTransaction({
        invoiceId: paymentRequest.invoiceId,
        transactionType: 'payment',
        status: 'success',
        amount: paymentResult.advanceAmount || invoice.advanceAmount,
        fee: paymentResult.discountFee || invoice.discountFee,
        referenceId: invoice.kredxReferenceId,
        responseData: JSON.stringify(paymentResult)
      } as InsertKredxTransaction);
      
      return {
        success: true,
        message: 'Early payment processed successfully',
        paymentDetails: paymentResult
      };
    } catch (error) {
      console.error("Error requesting early payment:", error);
      return {
        success: false,
        message: `Payment request failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Process a new invoice for KredX integration
   * 1. Checks eligibility
   * 2. Submits the invoice if eligible
   * 3. Updates the invoice record with KredX status
   */
  async processInvoiceForDiscounting(invoiceId: number): Promise<{
    success: boolean;
    message: string;
    status: any;
    advanceAmount: any;
    remainingAmount: any;
    discountFee: any;
    feePercentage: any;
    totalAmount: number;
    lastUpdated: Date;
    paymentStatus: any;
    expectedCompletionDate: Date | null;
    details: any;
    timeline: TimelineEvent[];
    invoice: Invoice;
  }> {
    try {
      // Get invoice details from storage
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return {
          success: false,
          message: 'Invoice not found',
          status: 'error',
          advanceAmount: null,
          remainingAmount: null,
          discountFee: null,
          feePercentage: null,
          totalAmount: 0,
          lastUpdated: new Date(),
          paymentStatus: null,
          expectedCompletionDate: null,
          details: null,
          timeline: [],
          invoice: {} as Invoice
        };
      }
      
      // Get buyer and seller details
      const buyer = await storage.getUser(invoice.buyerId);
      const seller = await storage.getUser(invoice.sellerId);
      
      if (!buyer || !seller) {
        return {
          success: false,
          message: 'Buyer or seller information not found',
          status: 'error',
          advanceAmount: null,
          remainingAmount: null,
          discountFee: null,
          feePercentage: null,
          totalAmount: 0,
          lastUpdated: new Date(),
          paymentStatus: null,
          expectedCompletionDate: null,
          details: null,
          timeline: [],
          invoice: invoice
        };
      }
      
      // Check if buyer and seller have GST numbers
      if (!buyer.gstNumber || !seller.gstNumber) {
        return {
          success: false,
          message: 'GST numbers are required for both buyer and seller',
          status: 'error',
          advanceAmount: null,
          remainingAmount: null,
          discountFee: null,
          feePercentage: null,
          totalAmount: 0,
          lastUpdated: new Date(),
          paymentStatus: null,
          expectedCompletionDate: null,
          details: null,
          timeline: [],
          invoice: invoice
        };
      }
      
      // Check if the invoice is eligible
      const eligibilityCheck: KredXInvoiceCheck = {
        invoiceNumber: invoice.invoiceNumber,
        buyerGST: buyer.gstNumber,
        sellerGST: seller.gstNumber,
        amount: invoice.amount,
        invoiceDate: new Date(invoice.issuedDate).toISOString().split('T')[0],
        dueDate: new Date(invoice.dueDate).toISOString().split('T')[0]
      };
      
      const eligibilityResult = await this.checkInvoiceEligibility(eligibilityCheck);
      
      if (!eligibilityResult.success || !eligibilityResult.canDiscount) {
        // Update invoice with ineligibility reason
        await storage.updateInvoice(invoiceId, {
          kredxStatus: 'ineligible',
          kredxDetails: JSON.stringify(eligibilityResult)
        });
        
        return {
          success: false,
          message: eligibilityResult.message || 'Invoice is not eligible for discounting',
          status: 'ineligible',
          advanceAmount: null,
          remainingAmount: null,
          discountFee: null,
          feePercentage: null,
          totalAmount: 0,
          lastUpdated: new Date(),
          paymentStatus: null,
          expectedCompletionDate: null,
          details: eligibilityResult,
          timeline: [{
            timestamp: new Date().toISOString(),
            event: 'Eligibility Check Failed',
            details: eligibilityResult.message
          }],
          invoice: invoice
        };
      }
      
      // Invoice is eligible, prepare submission data
      // (Assuming fileUrl contains a publicly accessible URL for the invoice document)
      const invoiceSubmission: KredXInvoiceSubmission = {
        ...eligibilityCheck,
        buyerName: buyer.companyName,
        sellerName: seller.companyName,
        buyerAddress: buyer.location || 'Address not provided',
        sellerAddress: seller.location || 'Address not provided',
        description: invoice.notes || `Invoice ${invoice.invoiceNumber} for ${buyer.companyName}`,
        invoiceDocument: invoice.fileUrl || '' // This should be a valid document URL
      };
      
      // Submit the invoice
      const submissionResult = await this.submitInvoice(invoiceSubmission);
      
      if (!submissionResult.success) {
        // Update invoice with submission failure
        await storage.updateInvoice(invoiceId, {
          kredxStatus: 'submission_failed',
          kredxDetails: JSON.stringify(submissionResult)
        });
        
        return {
          success: false,
          message: submissionResult.message || 'Failed to submit invoice to KredX',
          status: 'submission_failed',
          advanceAmount: null,
          remainingAmount: null,
          discountFee: null,
          feePercentage: null,
          totalAmount: 0,
          lastUpdated: new Date(),
          paymentStatus: null,
          expectedCompletionDate: null,
          details: submissionResult,
          timeline: [{
            timestamp: new Date().toISOString(),
            event: 'Submission Failed',
            details: submissionResult.message
          }],
          invoice: invoice
        };
      }
      
      // Get the KredX invoice ID from the response
      const kredxInvoiceId = submissionResult.invoice?.id;
      
      if (!kredxInvoiceId) {
        return {
          success: false,
          message: 'No invoice ID returned from KredX',
          status: 'error',
          advanceAmount: null,
          remainingAmount: null,
          discountFee: null,
          feePercentage: null,
          totalAmount: 0,
          lastUpdated: new Date(),
          paymentStatus: null,
          expectedCompletionDate: null,
          details: submissionResult,
          timeline: [{
            timestamp: new Date().toISOString(),
            event: 'Submission Issue',
            details: 'No invoice ID returned from KredX'
          }],
          invoice: invoice
        };
      }
      
      // Request discounting of the invoice
      const discountRequest: KredXDiscountRequest = {
        invoiceId: kredxInvoiceId,
        // Standard fee percentage - can be adjusted based on business rules
        discountPercentage: this.feePercentage
      };
      
      const discountResult = await this.requestDiscount(discountRequest);
      
      // Update invoice with KredX details
      await storage.updateInvoice(invoiceId, {
        kredxStatus: discountResult.success ? 'discounting_requested' : 'discount_request_failed',
        kredxInvoiceId: kredxInvoiceId,
        kredxReferenceId: discountResult.referenceId || null,
        kredxDetails: JSON.stringify(discountResult)
      });
      
      // Calculate expected completion date (typically 2-3 business days from now)
      const expectedCompletionDate = new Date();
      expectedCompletionDate.setDate(expectedCompletionDate.getDate() + 3);
      
      // Create timeline events
      const timeline: TimelineEvent[] = [
        {
          timestamp: new Date().toISOString(),
          event: 'Invoice Submitted',
          details: 'Invoice successfully submitted to KredX'
        }
      ];
      
      if (discountResult.success) {
        timeline.push({
          timestamp: new Date().toISOString(),
          event: 'Discount Requested',
          details: `Discount requested with ${this.feePercentage}% fee`
        });
      } else {
        timeline.push({
          timestamp: new Date().toISOString(),
          event: 'Discount Request Failed',
          details: discountResult.message || 'Unknown error'
        });
      }
      
      // Return comprehensive status update
      return {
        success: discountResult.success,
        message: discountResult.message,
        status: discountResult.status || discountResult.currentStatus || 'processing',
        advanceAmount: discountResult.advanceAmount || (discountResult.success ? invoice.amount * 0.85 : null),
        remainingAmount: discountResult.remainingAmount || (discountResult.success ? invoice.amount * 0.145 : null),
        discountFee: discountResult.discountFee || (discountResult.success ? invoice.amount * this.feePercentage / 100 : null),
        feePercentage: discountResult.feePercentage || this.feePercentage,
        totalAmount: invoice.amount,
        lastUpdated: new Date(),
        paymentStatus: discountResult.paymentStatus || 'pending',
        expectedCompletionDate: discountResult.expectedCompletionDate ? new Date(discountResult.expectedCompletionDate) : expectedCompletionDate,
        details: discountResult,
        timeline,
        invoice
      };
    } catch (error) {
      console.error('Error processing invoice for discounting:', error);
      return {
        success: false,
        message: `Error processing invoice: ${(error as Error).message}`,
        status: 'error',
        advanceAmount: null,
        remainingAmount: null,
        discountFee: null,
        feePercentage: null,
        totalAmount: 0,
        lastUpdated: new Date(),
        paymentStatus: null,
        expectedCompletionDate: null,
        details: { error: (error as Error).message },
        timeline: [{
          timestamp: new Date().toISOString(),
          event: 'Processing Error',
          details: (error as Error).message
        }],
        invoice: {} as Invoice
      };
    }
  }

  /**
   * Get the current status of a discounted invoice
   */
  async getDiscountStatus(invoiceId: number): Promise<{
    success: boolean;
    message: string;
    status: string;
    currentStatus?: string;
    paymentStatus?: string;
    lastUpdated: Date;
    timeline: TimelineEvent[];
    details: any;
    invoice: Invoice;
  }> {
    try {
      // Get invoice details from storage
      const invoice = await storage.getInvoice(invoiceId);
      
      if (!invoice) {
        return {
          success: false,
          message: 'Invoice not found',
          status: 'error',
          lastUpdated: new Date(),
          timeline: [],
          details: null,
          invoice: {} as Invoice
        };
      }
      
      // Check if invoice has KredX integration
      if (!invoice.kredxInvoiceId) {
        return {
          success: false,
          message: 'Invoice has not been submitted to KredX',
          status: 'not_submitted',
          lastUpdated: new Date(),
          timeline: [],
          details: null,
          invoice
        };
      }
      
      // Get status from KredX API
      const statusResult = await this.getInvoiceStatus(invoice.kredxInvoiceId);
      
      // Update invoice with latest status
      if (statusResult.success) {
        await storage.updateInvoice(invoiceId, {
          kredxStatus: statusResult.status || statusResult.currentStatus || 'unknown',
          kredxDetails: JSON.stringify(statusResult)
        });
      }
      
      // Create timeline based on status history or current status
      const timeline: TimelineEvent[] = [];
      
      if (statusResult.timeline && Array.isArray(statusResult.timeline)) {
        // If KredX API returns a timeline, use it
        timeline.push(...statusResult.timeline);
      } else {
        // Otherwise create a single event with the current status
        timeline.push({
          timestamp: new Date().toISOString(),
          event: 'Status Update',
          details: statusResult.message || `Current status: ${statusResult.status || statusResult.currentStatus || 'unknown'}`
        });
      }
      
      return {
        success: statusResult.success,
        message: statusResult.message,
        status: statusResult.status || statusResult.currentStatus || 'unknown',
        currentStatus: statusResult.currentStatus,
        paymentStatus: statusResult.paymentStatus,
        lastUpdated: new Date(),
        timeline,
        details: statusResult,
        invoice
      };
    } catch (error) {
      console.error('Error getting discount status:', error);
      return {
        success: false,
        message: `Error getting discount status: ${(error as Error).message}`,
        status: 'error',
        lastUpdated: new Date(),
        timeline: [{
          timestamp: new Date().toISOString(),
          event: 'Status Check Error',
          details: (error as Error).message
        }],
        details: { error: (error as Error).message },
        invoice: {} as Invoice
      };
    }
  }
}

export const kredxService = new KredXService();

export const kredxService = new KredXService();