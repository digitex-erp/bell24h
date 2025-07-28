import { RFQ, RFQResponse } from '../../types/rfq';
import { categories } from '../../config/categories';

class RFQService {
  private baseUrl = '/api/rfq';

  async getCategories() {
    return categories;
  }

  async getRFQs(category?: string) {
    try {
      const response = await fetch(`${this.baseUrl}${category ? `?category=${category}` : ''}`);
      if (!response.ok) throw new Error('Failed to fetch RFQs');
      return await response.json();
    } catch (error) {
      console.error('Error fetching RFQs:', error);
      throw error;
    }
  }

  async getRFQById(id: string) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`);
      if (!response.ok) throw new Error('Failed to fetch RFQ');
      return await response.json();
    } catch (error) {
      console.error('Error fetching RFQ:', error);
      throw error;
    }
  }

  async createRFQ(rfq: Omit<RFQ, 'id' | 'createdAt' | 'updatedAt' | 'responses'>) {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rfq),
      });
      if (!response.ok) throw new Error('Failed to create RFQ');
      return await response.json();
    } catch (error) {
      console.error('Error creating RFQ:', error);
      throw error;
    }
  }

  async respondToRFQ(rfqId: string, response: Omit<RFQResponse, 'id' | 'rfqId' | 'createdAt'>) {
    try {
      const response = await fetch(`${this.baseUrl}/${rfqId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(response),
      });
      if (!response.ok) throw new Error('Failed to submit response');
      return await response.json();
    } catch (error) {
      console.error('Error submitting response:', error);
      throw error;
    }
  }

  async getMockupRFQs(category?: string) {
    if (category) {
      const categoryConfig = categories.find(c => c.id === category);
      return categoryConfig?.mockupRFQs || [];
    }
    return categories.flatMap(c => c.mockupRFQs);
  }
}

export const rfqService = new RFQService(); 