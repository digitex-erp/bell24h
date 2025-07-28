import axios from 'axios';
import { Tariff } from '../types/tariff.js';

class TariffService {
  private baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  async getTariffs(): Promise<Tariff[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tariffs`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tariffs:', error);
      throw error;
    }
  }

  async getTariffById(id: string): Promise<Tariff> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/tariffs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tariff:', error);
      throw error;
    }
  }

  async subscribeToPlan(tariffId: string, options: {
    billingCycle: 'monthly' | 'yearly';
    quantity: number;
    currency: string;
    promoCode?: string;
  }): Promise<{
    subscriptionId: string;
    startDate: Date;
    endDate: Date;
    amount: number;
    currency: string;
  }> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/tariffs/${tariffId}/subscribe`, options);
      return response.data;
    } catch (error) {
      console.error('Error subscribing to plan:', error);
      throw error;
    }
  }

  async calculatePrice(tariffId: string, options: {
    billingCycle: 'monthly' | 'yearly';
    quantity: number;
    currency: string;
    promoCode?: string;
  }): Promise<{
    basePrice: number;
    discount: number;
    tax: number;
    total: number;
    currency: string;
  }> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/tariffs/${tariffId}/calculate`, options);
      return response.data;
    } catch (error) {
      console.error('Error calculating price:', error);
      throw error;
    }
  }

  async validatePromoCode(code: string): Promise<{
    valid: boolean;
    discountPercentage?: number;
    discountAmount?: number;
    currency?: string;
    expiryDate?: Date;
    message?: string;
  }> {
    try {
      const response = await axios.post(`${this.baseUrl}/api/tariffs/promo-code/validate`, { code });
      return response.data;
    } catch (error) {
      console.error('Error validating promo code:', error);
      throw error;
    }
  }

  async getCurrentSubscription(): Promise<{
    tariffId: string;
    subscriptionId: string;
    status: 'active' | 'cancelled' | 'expired';
    startDate: Date;
    endDate: Date;
    billingCycle: 'monthly' | 'yearly';
    quantity: number;
    amount: number;
    currency: string;
    autoRenew: boolean;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/api/subscriptions/current`);
      return response.data;
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string, reason?: string): Promise<void> {
    try {
      await axios.post(`${this.baseUrl}/api/subscriptions/${subscriptionId}/cancel`, { reason });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  async updateSubscription(subscriptionId: string, updates: {
    quantity?: number;
    billingCycle?: 'monthly' | 'yearly';
    autoRenew?: boolean;
  }): Promise<void> {
    try {
      await axios.patch(`${this.baseUrl}/api/subscriptions/${subscriptionId}`, updates);
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }
}

export const tariffService = new TariffService();
