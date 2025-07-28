import axios from 'axios';

export interface InternationalRFQ {
  id?: string;
  productName: string;
  quantity: number;
  description: string;
  targetCountry: string;
  currency: string;
  budget: number;
  paymentMethod: string;
  shippingPreference: string;
  attachments?: File[];
  status?: 'pending' | 'reviewing' | 'accepted' | 'rejected';
  createdAt?: Date;
  updatedAt?: Date;
}

class InternationalRFQService {
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  async createRFQ(rfq: InternationalRFQ, attachments?: File[]): Promise<InternationalRFQ> {
    try {
      const formData = new FormData();
      formData.append('rfq', JSON.stringify(rfq));

      if (attachments) {
        attachments.forEach((file) => {
          formData.append('attachments', file);
        });
      }

      const response = await axios.post(`${this.baseUrl}/api/international/rfq`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error creating international RFQ:', error);
      throw error;
    }
  }

  async getRFQs(filters?: {
    status?: string;
    country?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<InternationalRFQ[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/international/rfq`, {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching international RFQs:', error);
      throw error;
    }
  }

  async getRFQById(id: string): Promise<InternationalRFQ> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/international/rfq/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching international RFQ:', error);
      throw error;
    }
  }

  async updateRFQStatus(id: string, status: InternationalRFQ['status']): Promise<InternationalRFQ> {
    try {
      const response = await axios.patch(`${this.baseUrl}/api/international/rfq/${id}/status`, {
        status,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating international RFQ status:', error);
      throw error;
    }
  }

  async deleteRFQ(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/api/international/rfq/${id}`);
    } catch (error) {
      console.error('Error deleting international RFQ:', error);
      throw error;
    }
  }

  async getAttachment(rfqId: string, attachmentId: string): Promise<Blob> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/international/rfq/${rfqId}/attachments/${attachmentId}`,
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching attachment:', error);
      throw error;
    }
  }

  async validateInternationalRFQ(rfq: Partial<InternationalRFQ>): Promise<{
    valid: boolean;
    errors?: string[];
  }> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/international/rfq/validate`, rfq);
      return response.data;
    } catch (error) {
      console.error('Error validating international RFQ:', error);
      throw error;
    }
  }
}

export const internationalRFQService = new InternationalRFQService();
