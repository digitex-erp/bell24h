import { ConsumerUser, UserRole, UserStatus } from '../../types/user-roles.js';
import axios from 'axios';

export class ConsumerService {
  private readonly baseUrl = process.env.API_BASE_URL || '';

  /**
   * Create consumer account
   */
  async createAccount(data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    preferences: {
      notification: boolean;
      currency: string;
      language: string;
    };
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/consumer/register`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating consumer account:', error);
      throw error;
    }
  }

  /**
   * Add product to cart
   */
  async addToCart(data: {
    productId: string;
    quantity: number;
    options?: Record<string, any>;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/cart`, data);
      return response.data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  /**
   * Get cart contents
   */
  async getCart() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/cart`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  }

  /**
   * Place order
   */
  async placeOrder(data: {
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice: number;
    }>;
    shippingAddress: string;
    paymentMethod: string;
    deliverySlot?: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/orders`, data);
      return response.data;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  /**
   * Submit product review
   */
  async submitReview(data: {
    productId: string;
    rating: number;
    comment: string;
    images?: File[];
  }) {
    const formData = new FormData();
    formData.append('productId', data.productId);
    formData.append('rating', data.rating.toString());
    formData.append('comment', data.comment);

    if (data.images) {
      data.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    }

    try {
      const response = await axios.post(`${this.baseUrl}/api/reviews`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  }

  /**
   * Get order history
   */
  async getOrderHistory() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/orders/history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
  }

  /**
   * Get product ratings and reviews
   */
  async getProductReviews(productId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/products/${productId}/reviews`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  }
}
