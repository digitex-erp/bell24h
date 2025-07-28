/**
 * M1Exchange API Integration Service
 * 
 * This service manages the integration with M1Exchange API for supply chain financing
 * and financial services related to logistics shipments and trades.
 */

import axios, { AxiosInstance } from 'axios';
import { db } from '../../lib/db';
import { shipments } from '../../lib/db/schema/logistics';
import { eq } from 'drizzle-orm';

// M1Exchange API response types
export interface M1ExchangeAuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface M1ExchangeInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: M1ExchangeInvoiceStatus;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  description: string;
  poNumber?: string;
  discountRate?: number;
  discountedAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export enum M1ExchangeInvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FUNDED = 'FUNDED',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  EXPIRED = 'EXPIRED',
}

export interface M1ExchangeSupplyChainFinancing {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  status: M1ExchangeFinancingStatus;
  interestRate: number;
  tenure: number; // in days
  financierId: string;
  financierName: string;
  requestedDate: string;
  approvedDate?: string;
  fundedDate?: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export enum M1ExchangeFinancingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  FUNDED = 'FUNDED',
  REPAID = 'REPAID',
  OVERDUE = 'OVERDUE',
  DEFAULTED = 'DEFAULTED',
}

export interface M1ExchangeEntity {
  id: string;
  name: string;
  type: 'BUYER' | 'SELLER' | 'FINANCIER';
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxId: string;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

export interface M1ExchangePayment {
  id: string;
  invoiceId: string;
  financingId?: string;
  amount: number;
  currency: string;
  status: M1ExchangePaymentStatus;
  payerId: string;
  payerName: string;
  payeeId: string;
  payeeName: string;
  paymentDate: string;
  referenceNumber: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export enum M1ExchangePaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

/**
 * M1Exchange Service for supply chain financing and financial services
 */
export class M1ExchangeService {
  private api: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiresAt: Date | null = null;
  
  constructor() {
    const apiUrl = process.env.M1EXCHANGE_API_URL || 'https://api.m1exchange.com/v1';
    const apiKey = process.env.M1EXCHANGE_API_KEY;
    
    if (!apiKey) {
      throw new Error('M1Exchange API credentials are not configured');
    }
    
    this.api = axios.create({
      baseURL: apiUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-Key': apiKey,
      },
    });
    
    // Add request interceptor to handle authentication
    this.api.interceptors.request.use(
      async (config) => {
        // Check if token is valid or needs refresh
        if (!this.accessToken || !this.tokenExpiresAt || new Date() >= this.tokenExpiresAt) {
          if (this.refreshToken) {
            await this.refreshAccessToken();
          } else {
            await this.authenticate();
          }
        }
        
        // Add the token to the request headers
        if (this.accessToken) {
          config.headers['Authorization'] = `Bearer ${this.accessToken}`;
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
      async (error) => {
        if (error.response) {
          // Handle specific API errors
          const statusCode = error.response.status;
          const errorData = error.response.data;
          
          if (statusCode === 401) {
            // Token expired, try to refresh token
            if (this.refreshToken) {
              try {
                await this.refreshAccessToken();
                // Retry the original request with the new token
                const originalRequest = error.config;
                originalRequest.headers['Authorization'] = `Bearer ${this.accessToken}`;
                return axios(originalRequest);
              } catch (refreshError) {
                // Failed to refresh token, need to re-authenticate
                this.accessToken = null;
                this.refreshToken = null;
                this.tokenExpiresAt = null;
              }
            }
          }
          
          console.error(`M1Exchange API Error (${statusCode}):`, errorData);
        } else if (error.request) {
          // Request was made but no response received
          console.error('M1Exchange API No Response:', error.request);
        } else {
          // Something happened in setting up the request
          console.error('M1Exchange API Request Setup Error:', error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  /**
   * Authenticate with M1Exchange API
   */
  private async authenticate(): Promise<void> {
    try {
      const response = await axios.post<M1ExchangeAuthResponse>(
        `${this.api.defaults.baseURL}/auth/login`,
        {
          username: process.env.M1EXCHANGE_USERNAME,
          password: process.env.M1EXCHANGE_PASSWORD,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-API-Key': process.env.M1EXCHANGE_API_KEY,
          },
        }
      );
      
      this.accessToken = response.data.accessToken;
      this.refreshToken = response.data.refreshToken;
      // Calculate token expiry time (subtract 5 minutes for safety margin)
      this.tokenExpiresAt = new Date(Date.now() + (response.data.expiresIn * 1000) - 300000);
      
      console.log(`M1Exchange API authenticated successfully. Token expires at ${this.tokenExpiresAt.toISOString()}`);
    } catch (error) {
      console.error('M1Exchange API authentication failed:', error);
      throw new Error('Failed to authenticate with M1Exchange API');
    }
  }
  
  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    try {
      const response = await axios.post<M1ExchangeAuthResponse>(
        `${this.api.defaults.baseURL}/auth/refresh`,
        {
          refreshToken: this.refreshToken,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-API-Key': process.env.M1EXCHANGE_API_KEY,
          },
        }
      );
      
      this.accessToken = response.data.accessToken;
      this.refreshToken = response.data.refreshToken;
      // Calculate token expiry time (subtract 5 minutes for safety margin)
      this.tokenExpiresAt = new Date(Date.now() + (response.data.expiresIn * 1000) - 300000);
      
      console.log(`M1Exchange API token refreshed successfully. Token expires at ${this.tokenExpiresAt.toISOString()}`);
    } catch (error) {
      console.error('M1Exchange API token refresh failed:', error);
      // Clear tokens to force full re-authentication on next request
      this.accessToken = null;
      this.refreshToken = null;
      this.tokenExpiresAt = null;
      throw new Error('Failed to refresh M1Exchange API token');
    }
  }
  
  /**
   * Create a new invoice
   */
  public async createInvoice(data: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    amount: number;
    currency: string;
    buyerId: string;
    sellerId: string;
    description: string;
    poNumber?: string;
  }): Promise<M1ExchangeInvoice> {
    try {
      const response = await this.api.post<M1ExchangeInvoice>('/invoices', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create M1Exchange invoice:', error);
      throw error;
    }
  }
  
  /**
   * Get invoice details
   */
  public async getInvoice(invoiceId: string): Promise<M1ExchangeInvoice> {
    try {
      const response = await this.api.get<M1ExchangeInvoice>(`/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get M1Exchange invoice ${invoiceId}:`, error);
      throw error;
    }
  }
  
  /**
   * List invoices with optional filters
   */
  public async listInvoices(params?: {
    status?: M1ExchangeInvoiceStatus;
    buyerId?: string;
    sellerId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<M1ExchangeInvoice[]> {
    try {
      const response = await this.api.get<M1ExchangeInvoice[]>('/invoices', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to list M1Exchange invoices:', error);
      throw error;
    }
  }
  
  /**
   * Update invoice status
   */
  public async updateInvoiceStatus(
    invoiceId: string,
    status: M1ExchangeInvoiceStatus
  ): Promise<M1ExchangeInvoice> {
    try {
      const response = await this.api.patch<M1ExchangeInvoice>(`/invoices/${invoiceId}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to update M1Exchange invoice ${invoiceId} status:`, error);
      throw error;
    }
  }
  
  /**
   * Request financing for an invoice
   */
  public async requestInvoiceFinancing(
    invoiceId: string,
    data: {
      amount: number;
      tenure: number; // in days
      financierId?: string; // if not specified, will be offered to all financiers
    }
  ): Promise<M1ExchangeSupplyChainFinancing> {
    try {
      const response = await this.api.post<M1ExchangeSupplyChainFinancing>(
        `/invoices/${invoiceId}/finance`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(`Failed to request financing for M1Exchange invoice ${invoiceId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get financing details
   */
  public async getFinancing(financingId: string): Promise<M1ExchangeSupplyChainFinancing> {
    try {
      const response = await this.api.get<M1ExchangeSupplyChainFinancing>(`/financings/${financingId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get M1Exchange financing ${financingId}:`, error);
      throw error;
    }
  }
  
  /**
   * List financings with optional filters
   */
  public async listFinancings(params?: {
    status?: M1ExchangeFinancingStatus;
    invoiceId?: string;
    financierId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<M1ExchangeSupplyChainFinancing[]> {
    try {
      const response = await this.api.get<M1ExchangeSupplyChainFinancing[]>('/financings', {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to list M1Exchange financings:', error);
      throw error;
    }
  }
  
  /**
   * Create a payment
   */
  public async createPayment(data: {
    invoiceId: string;
    financingId?: string;
    amount: number;
    currency: string;
    payerId: string;
    payeeId: string;
    paymentDate: string;
    referenceNumber: string;
    description: string;
  }): Promise<M1ExchangePayment> {
    try {
      const response = await this.api.post<M1ExchangePayment>('/payments', data);
      return response.data;
    } catch (error) {
      console.error('Failed to create M1Exchange payment:', error);
      throw error;
    }
  }
  
  /**
   * Get payment details
   */
  public async getPayment(paymentId: string): Promise<M1ExchangePayment> {
    try {
      const response = await this.api.get<M1ExchangePayment>(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get M1Exchange payment ${paymentId}:`, error);
      throw error;
    }
  }
  
  /**
   * List payments with optional filters
   */
  public async listPayments(params?: {
    status?: M1ExchangePaymentStatus;
    invoiceId?: string;
    financingId?: string;
    payerId?: string;
    payeeId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<M1ExchangePayment[]> {
    try {
      const response = await this.api.get<M1ExchangePayment[]>('/payments', {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to list M1Exchange payments:', error);
      throw error;
    }
  }
  
  /**
   * Get entity details
   */
  public async getEntity(entityId: string): Promise<M1ExchangeEntity> {
    try {
      const response = await this.api.get<M1ExchangeEntity>(`/entities/${entityId}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to get M1Exchange entity ${entityId}:`, error);
      throw error;
    }
  }
  
  /**
   * List entities with optional filters
   */
  public async listEntities(params?: {
    type?: 'BUYER' | 'SELLER' | 'FINANCIER';
    kycStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
    page?: number;
    limit?: number;
  }): Promise<M1ExchangeEntity[]> {
    try {
      const response = await this.api.get<M1ExchangeEntity[]>('/entities', {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to list M1Exchange entities:', error);
      throw error;
    }
  }
  
  /**
   * Create a shipment invoice and request financing
   * This is a convenience method that combines multiple M1Exchange API calls
   */
  public async createShipmentInvoiceAndRequestFinancing(
    shipmentId: number,
    data: {
      invoiceNumber: string;
      dueDate: string;
      buyerId: string;
      sellerId: string;
      tenure: number; // in days
      financierId?: string;
      poNumber?: string;
    }
  ): Promise<M1ExchangeSupplyChainFinancing> {
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
        buyerId: data.buyerId,
        sellerId: data.sellerId,
        description: `Shipment ${shipment.orderId} from ${shipment.pickupCity} to ${shipment.deliveryCity}`,
        poNumber: data.poNumber,
      };
      
      // Fetch packages to calculate total amount
      const packagesResult = await db.query.shipmentPackages.findMany({
        where: eq(db.query.shipmentPackages.shipmentId, shipmentId),
      });
      
      if (packagesResult.length > 0) {
        // Calculate total value of all packages
        invoiceData.amount = packagesResult.reduce((sum, pkg) => sum + Number(pkg.value), 0);
        
        // Use the currency of the first package (assuming all packages have same currency)
        if (packagesResult[0].currency) {
          invoiceData.currency = packagesResult[0].currency;
        }
      }
      
      // Create the invoice
      const invoice = await this.createInvoice(invoiceData);
      
      // Request financing for the invoice
      return await this.requestInvoiceFinancing(invoice.id, {
        amount: invoiceData.amount,
        tenure: data.tenure,
        financierId: data.financierId,
      });
    } catch (error) {
      console.error(`Failed to create invoice and request financing for shipment ${shipmentId}:`, error);
      throw error;
    }
  }
  
  /**
   * Create payment for a delivered shipment
   * This should be called when a shipment status changes to DELIVERED
   */
  public async createPaymentForDeliveredShipment(
    shipmentId: number,
    data: {
      invoiceId: string;
      financingId?: string;
      payerId: string;
      payeeId: string;
      referenceNumber: string;
    }
  ): Promise<M1ExchangePayment> {
    try {
      // Fetch shipment details to verify it's delivered
      const shipmentResult = await db.select().from(shipments).where(eq(shipments.id, shipmentId)).limit(1);
      
      if (shipmentResult.length === 0) {
        throw new Error(`Shipment not found with ID: ${shipmentId}`);
      }
      
      const shipment = shipmentResult[0];
      
      // Verify shipment is delivered
      if (shipment.status !== 'DELIVERED') {
        throw new Error(`Cannot create payment for shipment ${shipmentId} as it is not delivered yet`);
      }
      
      // Get invoice details to get the amount
      const invoice = await this.getInvoice(data.invoiceId);
      
      // Create the payment
      return await this.createPayment({
        invoiceId: data.invoiceId,
        financingId: data.financingId,
        amount: invoice.amount,
        currency: invoice.currency,
        payerId: data.payerId,
        payeeId: data.payeeId,
        paymentDate: new Date().toISOString(),
        referenceNumber: data.referenceNumber,
        description: `Payment for delivered shipment ${shipmentId} with tracking number ${shipment.trackingNumber}`,
      });
    } catch (error) {
      console.error(`Failed to create payment for delivered shipment ${shipmentId}:`, error);
      throw error;
    }
  }
}

// Export a singleton instance
export const m1exchangeService = new M1ExchangeService();
