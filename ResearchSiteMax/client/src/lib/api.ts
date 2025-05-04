import { apiRequest } from '@/lib/queryClient';

/**
 * API utility functions for Bell24h.com
 * This file provides a centralized collection of API calls
 */

// RFQ related API calls
export const rfqApi = {
  /**
   * Get RFQs for the current user
   */
  getRfqs: async () => {
    const response = await apiRequest('GET', '/api/rfqs');
    return response.json();
  },
  
  /**
   * Get a specific RFQ by id
   */
  getRfq: async (id: number) => {
    const response = await apiRequest('GET', `/api/rfqs/${id}`);
    return response.json();
  },
  
  /**
   * Create a new RFQ
   */
  createRfq: async (data: any) => {
    const response = await apiRequest('POST', '/api/rfqs', data);
    return response.json();
  },
  
  /**
   * Upload a voice recording for RFQ creation
   */
  uploadVoiceRfq: async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice_rfq.webm');
    
    const response = await fetch('/api/rfqs/voice', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to process voice RFQ');
    }
    
    return response.json();
  },
  
  /**
   * Upload a video for RFQ
   */
  uploadVideoRfq: async (videoBlob: Blob) => {
    const formData = new FormData();
    formData.append('video', videoBlob, 'video_rfq.mp4');
    
    const response = await fetch('/api/rfqs/video-upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload video');
    }
    
    return response.json();
  }
};

// Supplier related API calls
export const supplierApi = {
  /**
   * Get all suppliers
   */
  getAllSuppliers: async () => {
    const response = await apiRequest('GET', '/api/suppliers');
    return response.json();
  },
  
  /**
   * Get top suppliers (highest rated)
   */
  getTopSuppliers: async () => {
    const response = await apiRequest('GET', '/api/suppliers/top');
    return response.json();
  },
  
  /**
   * Create or update supplier profile
   */
  updateSupplierProfile: async (data: any) => {
    const response = await apiRequest('POST', '/api/suppliers', data);
    return response.json();
  },
  
  /**
   * Calculate supplier risk score
   */
  calculateRiskScore: async (supplierData: any) => {
    const response = await apiRequest('POST', '/api/suppliers/risk-score', supplierData);
    return response.json();
  }
};

// Wallet and payment related API calls
export const walletApi = {
  /**
   * Get wallet transactions
   */
  getTransactions: async () => {
    const response = await apiRequest('GET', '/api/wallet/transactions');
    return response.json();
  },
  
  /**
   * Create a new transaction
   */
  createTransaction: async (data: any) => {
    const response = await apiRequest('POST', '/api/wallet/transactions', data);
    return response.json();
  }
};

// Market analytics API calls
export const marketApi = {
  /**
   * Get market trends for a specific industry
   */
  getMarketTrends: async (industry: string) => {
    const response = await apiRequest('GET', `/api/market/trends/${industry}`);
    return response.json();
  },
  
  /**
   * Get dashboard statistics
   */
  getDashboardStats: async () => {
    const response = await apiRequest('GET', '/api/dashboard/stats');
    return response.json();
  }
};

// Messaging related API calls
export const messageApi = {
  /**
   * Get messages for the current user
   */
  getMessages: async () => {
    const response = await apiRequest('GET', '/api/messages');
    return response.json();
  },
  
  /**
   * Send a message
   */
  sendMessage: async (data: any) => {
    const response = await apiRequest('POST', '/api/messages', data);
    return response.json();
  },
  
  /**
   * Mark messages as read
   */
  markAsRead: async (messageIds: number[]) => {
    const response = await apiRequest('POST', '/api/messages/read', { messageIds });
    return response.json();
  }
};

// User and authentication related API calls
export const userApi = {
  /**
   * Get current user
   */
  getCurrentUser: async () => {
    const response = await apiRequest('GET', '/api/auth/user');
    return response.json();
  },
  
  /**
   * Update user profile
   */
  updateProfile: async (data: any) => {
    const response = await apiRequest('PUT', '/api/user/profile', data);
    return response.json();
  },
  
  /**
   * Update password
   */
  updatePassword: async (data: any) => {
    const response = await apiRequest('PUT', '/api/user/password', data);
    return response.json();
  },
  
  /**
   * Validate GST number
   */
  validateGST: async (gstNumber: string) => {
    const response = await apiRequest('POST', '/api/gst/validate', { gstNumber });
    return response.json();
  }
};
