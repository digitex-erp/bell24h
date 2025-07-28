import { UserRole, UserStatus } from '../types/user-roles.js';
import axios from 'axios';

export class AuthService {
  private readonly baseUrl = process.env.API_BASE_URL || '';

  /**
   * Register new user
   */
  async register(data: {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    businessType?: string;
    companyName?: string;
    phone?: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/auth/register`, data);
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(data: {
    email: string;
    password: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/auth/login`, data);
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getProfile() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/auth/profile`);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(data: {
    language?: string;
    currency?: string;
    notificationPreferences?: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  }) {
    try {
      const response = await axios.patch(`${this.baseUrl}/api/auth/preferences`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * Get user role permissions
   */
  async getRolePermissions(role: UserRole) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/auth/permissions/${role}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      throw error;
    }
  }

  /**
   * Verify user account
   */
  async verifyAccount(token: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/api/auth/verify/${token}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying account:', error);
      throw error;
    }
  }

  /**
   * Reset password
   */
  async resetPassword(data: {
    email: string;
    token: string;
    newPassword: string;
  }) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/auth/reset-password`, data);
      return response.data;
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }
}
