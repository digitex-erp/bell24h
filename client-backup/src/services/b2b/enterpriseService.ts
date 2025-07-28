import { EnterpriseUser, UserRole, UserStatus } from '../../types/user-roles.js';
import axios from 'axios';

export class EnterpriseService {
  private readonly baseUrl = process.env.API_BASE_URL || '';

  /**
   * Create a new enterprise account
   */
  async createEnterpriseAccount(data: {
    companyName: string;
    industry: string;
    contactPerson: string;
    email: string;
    phone: string;
    address: string;
    taxId: string;
    documents: File[];
  }) {
    const formData = new FormData();
    formData.append('companyName', data.companyName);
    formData.append('industry', data.industry);
    formData.append('contactPerson', data.contactPerson);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('address', data.address);
    formData.append('taxId', data.taxId);
    
    // Add documents
    data.documents.forEach((file, index) => {
      formData.append(`documents[${index}]`, file);
    });

    try {
      const response = await axios.post(`${this.baseUrl}/api/enterprise/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating enterprise account:', error);
      throw error;
    }
  }

  /**
   * Get enterprise dashboard data
   */
  async getDashboardData(enterpriseId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/enterprise/${enterpriseId}/dashboard`);
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  /**
   * Create bulk purchase order
   */
  async createBulkOrder(data: {
    products: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
      deliveryDate: string;
    }>;
    supplierId: string;
    paymentTerms: string;
    deliveryAddress: string;
    notes?: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/orders/bulk`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating bulk order:', error);
      throw error;
    }
  }

  /**
   * Get supplier verification status
   */
  async getSupplierVerification(supplierId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/suppliers/${supplierId}/verification`);
      return response.data;
    } catch (error) {
      console.error('Error fetching supplier verification:', error);
      throw error;
    }
  }

  /**
   * Create contract agreement
   */
  async createContract(data: {
    supplierId: string;
    terms: string;
    duration: number;
    pricingModel: string;
    paymentSchedule: string[];
    deliveryTerms: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/contracts`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  }

  /**
   * Process bulk payment
   */
  async processBulkPayment(data: {
    orderId: string;
    paymentMethod: string;
    amount: number;
    reference: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/payments/bulk`, data);
      return response.data;
    } catch (error) {
      console.error('Error processing bulk payment:', error);
      throw error;
    }
  }
}
