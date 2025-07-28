/**
 * KredX API Integration Service
 * 
 * This service manages the integration with KredX API for invoice financing
 * and milestone payments related to logistics shipments and contracts.
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { db } from '../../lib/db';
import { shipments } from '../../lib/db/schema/logistics';
import { eq } from 'drizzle-orm';

// KredX API response types
export interface KredXAuthResponse {
  token: string;
  expiresAt: string;
}

export interface KredXInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: KredXInvoiceStatus;
  buyerName: string;
  sellerName: string;
  description: string;
  discountRate?: number;
  discountedAmount?: number;
  createdAt: string;
  updatedAt: string;
  documentUrl?: string;
}

export enum KredXInvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FUNDED = 'FUNDED',
  CLOSED = 'CLOSED',
  EXPIRED = 'EXPIRED',
}

export interface KredXMilestonePayment {
  id: string;
  milestoneId: string;
  contractId: string;
  amount: number;
  currency: string;
  status: KredXPaymentStatus;
  releaseDate: string;
  releaseTrigger: 'MANUAL' | 'SCHEDULE' | 'EVENT';
  releasedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export enum KredXPaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface KredXDisbursement {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: KredXDisbursementStatus;
  accountName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
}

export enum KredXDisbursementStatus {
  INITIATED = 'INITIATED',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/**
 * KredX Service for invoice financing and milestone payments
 */
export class KredXService {
  private api: AxiosInstance;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;
  
  constructor() {
    const apiUrl = process.env.KREDX_API_URL || 'https://api.kredx.com/v1';
    const apiKey = process.env.KREDX_API_KEY;
    const apiSecret = process.env.KREDX_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      throw new Error('KredX API credentials are not configured');
    }
    
    this.api = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    // Add request interceptor to handle authentication
    this.api.interceptors.request.use(
      async (config) => {
        // Check if token is valid or needs refresh
        if (!this.token || !this.tokenExpiry || new Date() >= this.tokenExpiry) {
          await this.authenticate(apiKey, apiSecret);
        }
        
        // Add the token to the request headers
        if (this.token) {
          config.headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Add response interceptor to handle errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // Handle specific API errors
          const statusCode = error.response.status;
          const errorData = error.response.data;
          
          if (statusCode === 401) {
            // Token expired or invalid, clear token to force re-authentication
            this.token = null;
            this.tokenExpiry = null;
          }
          
          console.error(`KredX API Error (${statusCode}):`, errorData);
        } else if (error.request) {
          // Request was made but no response received
          console.error('KredX API No Response:', error.request);
        } else {
          // Something happened in setting up the request
          console.error('KredX API Request Setup Error:', error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Authenticate with KredX API
   */
  private async authenticate(apiKey: string, apiSecret: string): Promise<void> {
    try {
      const response = await axios.post<KredXAuthResponse>(
        `${this.api.defaults.baseURL}/auth/token`,
        {
          apiKey,
          apiSecret,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
      
      this.token = response.data.token;
      this.tokenExpiry = new Date(response.data.expiresAt);
      
      console.log(`KredX API authenticated successfully. Token expires at ${this.tokenExpiry.toISOString()}`);
    } catch (error) {
      console.error('KredX API authentication failed:', error);
      throw new Error('Failed to authenticate with KredX API');
    }
  }
  
  /**
   * Create a new invoice for financing
   */
  public async createInvoice(data: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    amount: number;
    currency: string;
    buyerName: string;
    sellerName: string;
    description: string;
    documentUrl?: string;
  }): Promise<KredXInvoice> {
    try {
      const response = await this.api.post<KredXInvoice>('/invoices', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create KredX invoice:', error);
      throw error;
    }
  }
  
  /**
   * Get invoice details
   */
  public async getInvoice(invoiceId: string): Promise<KredXInvoice> {
    try {
      const response = await this.api.get<KredXInvoice>(`/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get KredX invoice ${invoiceId}:`, error);
      throw error;
    }
  }
  
  /**
   * List invoices with optional filters
   */
  public async listInvoices(params?: {
    status?: KredXInvoiceStatus;
    fromDate?: string;
    toDate?: string;
    sellerName?: string;
    buyerName?: string;
    page?: number;
    limit?: number;
  }): Promise<KredXInvoice[]> {
    try {
      const response = await this.api.get<KredXInvoice[]>('/invoices', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to list KredX invoices:', error);
      throw error;
    }
  }
  
  /**
   * Update invoice status
   */
  public async updateInvoiceStatus(
    invoiceId: string,
    status: KredXInvoiceStatus
  ): Promise<KredXInvoice> {
    try {
      const response = await this.api.patch<KredXInvoice>(`/invoices/${invoiceId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to update KredX invoice ${invoiceId} status:`, error);
      throw error;
    }
  }
  
  /**
   * Submit invoice for financing
   */
  public async submitInvoiceForFinancing(
    invoiceId: string,
    data: {
      requestedAmount?: number;
      discountRate?: number;
      additionalDocuments?: { name: string; url: string }[];
    }
  ): Promise<KredXInvoice> {
    try {
      const response = await this.api.post<KredXInvoice>(
        `/invoices/${invoiceId}/finance`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to submit KredX invoice ${invoiceId} for financing:`, error);
      throw error;
    }
  }
  
  /**
   * Create milestone payment
   */
  public async createMilestonePayment(data: {
    milestoneId: string;
    contractId: string;
    amount: number;
    currency: string;
    releaseDate: string;
    releaseTrigger: 'MANUAL' | 'SCHEDULE' | 'EVENT';
  }): Promise<KredXMilestonePayment> {
    try {
      const response = await this.api.post<KredXMilestonePayment>('/milestone-payments', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create KredX milestone payment:', error);
      throw error;
    }
  }
  
  /**
   * Get milestone payment details
   */
  public async getMilestonePayment(paymentId: string): Promise<KredXMilestonePayment> {
    try {
      const response = await this.api.get<KredXMilestonePayment>(`/milestone-payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get KredX milestone payment ${paymentId}:`, error);
      throw error;
    }
  }
  
  /**
   * List milestone payments
   */
  public async listMilestonePayments(params?: {
    contractId?: string;
    status?: KredXPaymentStatus;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<KredXMilestonePayment[]> {
    try {
      const response = await this.api.get<KredXMilestonePayment[]>('/milestone-payments', {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to list KredX milestone payments:', error);
      throw error;
    }
  }
  
  /**
   * Release milestone payment
   */
  public async releaseMilestonePayment(
    paymentId: string,
    data: {
      releaseNotes?: string;
      releasedBy: string;
    }
  ): Promise<KredXMilestonePayment> {
    try {
      const response = await this.api.post<KredXMilestonePayment>(
        `/milestone-payments/${paymentId}/release`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to release KredX milestone payment ${paymentId}:`, error);
      throw error;
    }
  }
  
  /**
   * Cancel milestone payment
   */
  public async cancelMilestonePayment(
    paymentId: string,
    data: {
      cancellationReason: string;
      cancelledBy: string;
    }
  ): Promise<KredXMilestonePayment> {
    try {
      const response = await this.api.post<KredXMilestonePayment>(
        `/milestone-payments/${paymentId}/cancel`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to cancel KredX milestone payment ${paymentId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get disbursement details
   */
  public async getDisbursement(disbursementId: string): Promise<KredXDisbursement> {
    try {
      const response = await this.api.get<KredXDisbursement>(`/disbursements/${disbursementId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get KredX disbursement ${disbursementId}:`, error);
      throw error;
    }
  }
  
  /**
   * List disbursements
   */
  public async listDisbursements(params?: {
    paymentId?: string;
    status?: KredXDisbursementStatus;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<KredXDisbursement[]> {
    try {
      const response = await this.api.get<KredXDisbursement[]>('/disbursements', {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to list KredX disbursements:', error);
      throw error;
    }
  }
  
  /**
   * Create shipment invoice and submit for financing
   * This is a convenience method that combines multiple KredX API calls
   */
  public async createShipmentInvoiceForFinancing(
    shipmentId: number,
    data: {
      invoiceNumber: string;
      dueDate: string;
      discountRate?: number;
      additionalDocuments?: { name: string; url: string }[];
    }
  ): Promise<KredXInvoice> {
    try {
      // Fetch shipment details
      const shipmentResult = await db.select().from(shipments).where(eq(shipments.id, shipmentId)).limit(1);
      
      if (shipmentResult.length === 0) {
        throw new Error(`Shipment not found with ID: ${shipmentId}`);
      }
      
      const shipment = shipmentResult[0];
      
      // Create invoice
      const invoiceData = {
        invoiceNumber: data.invoiceNumber,
        invoiceDate: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
        dueDate: data.dueDate,
        amount: 0, // We'll calculate this from packages
        currency: 'INR', // Default currency
        buyerName: shipment.deliveryContactName,
        sellerName: shipment.pickupContactName,
        description: `Shipment ${shipment.orderId} from ${shipment.pickupCity} to ${shipment.deliveryCity}`,
      };
      
      // Fetch packages to calculate total amount
      const packagesResult = await db.query.shipmentPackages.findMany({
        where: eq(db.query.shipmentPackages.shipmentId, shipmentId),
      });
      
      if (packagesResult.length > 0) {
        // Calculate total value of all packages
        invoiceData.amount = packagesResult.reduce((sum, pkg) => sum + Number(pkg.value), 0);
        
        // Use the currency of the first package (assuming all packages have same currency)
        invoiceData.currency = packagesResult[0].currency;
      }
      
      // Create the invoice
      const invoice = await this.createInvoice(invoiceData);
      
      // Submit the invoice for financing
      return await this.submitInvoiceForFinancing(invoice.id, {
        discountRate: data.discountRate,
        additionalDocuments: data.additionalDocuments,
      });
    } catch (error) {
      console.error(`Failed to create and finance shipment invoice for shipment ${shipmentId}:`, error);
      throw error;
    }
  }
  
  /**
   * Create milestone payment for shipment delivery
   * This links a shipment to a milestone payment for automatic release upon delivery
   */
  public async createShipmentMilestonePayment(
    shipmentId: number,
    data: {
      contractId: string;
      milestoneId: string;
      amount: number;
      currency?: string;
      releaseDate?: string; // Optional, will use estimated delivery date if not provided
    }
  ): Promise<KredXMilestonePayment> {
    try {
      // Fetch shipment details
      const shipmentResult = await db.select().from(shipments).where(eq(shipments.id, shipmentId)).limit(1);
      
      if (shipmentResult.length === 0) {
        throw new Error(`Shipment not found with ID: ${shipmentId}`);
      }
      
      const shipment = shipmentResult[0];
      
      // Create milestone payment with shipment as trigger
      const paymentData = {
        milestoneId: data.milestoneId,
        contractId: data.contractId,
        amount: data.amount,
        currency: data.currency || 'INR',
        releaseDate: data.releaseDate || (shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toISOString() : new Date().toISOString()),
        releaseTrigger: 'EVENT' as const, // We'll trigger this when shipment is delivered
      };
      
      return await this.createMilestonePayment(paymentData);
    } catch (error) {
      console.error(`Failed to create milestone payment for shipment ${shipmentId}:`, error);
      throw error;
    }
  }
  
  /**
   * Release payment when shipment is delivered
   * This should be called when a shipment status changes to DELIVERED
   */
  public async releasePaymentForDeliveredShipment(
    shipmentId: number,
    paymentId: string,
    releasedBy: string
  ): Promise<KredXMilestonePayment> {
    try {
      // Fetch shipment details to verify it's delivered
      const shipmentResult = await db.select().from(shipments).where(eq(shipments.id, shipmentId)).limit(1);
      
      if (shipmentResult.length === 0) {
        throw new Error(`Shipment not found with ID: ${shipmentId}`);
      }
      
      const shipment = shipmentResult[0];
      
      // Verify shipment is delivered
      if (shipment.status !== 'DELIVERED') {
        throw new Error(`Cannot release payment for shipment ${shipmentId} as it is not delivered yet`);
      }
      
      // Release the payment
      return await this.releaseMilestonePayment(paymentId, {
        releaseNotes: `Auto-released for delivered shipment ${shipmentId} with tracking number ${shipment.trackingNumber}`,
        releasedBy,
      });
    } catch (error) {
      console.error(`Failed to release payment for delivered shipment ${shipmentId}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const kredxService = new KredXService();
