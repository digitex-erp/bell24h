/**
 * API Utilities for Bell24H
 * 
 * This file provides centralized API functions for all Bell24H features
 * including RFQs, suppliers, wallet transactions, and market analytics.
 */

import { queryClient } from './queryClient';
import { buildApiUrl, getApiConfig, isTestMode } from './api-config';

// Helper function for API requests
export const apiRequest = async (method: string, endpoint: string, data?: any) => {
  const config = getApiConfig();
  const fullUrl = endpoint.startsWith('http') ? endpoint : buildApiUrl(endpoint);
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      // Add auth token if available
      ...(localStorage.getItem('token') ? { 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
      } : {})
    },
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  // Log API calls in test mode for easier debugging
  if (isTestMode()) {
    console.log(`[TEST API] ${method} ${fullUrl}`, data || '');
  }

  return fetch(fullUrl, options);
};

/**
 * API utility functions for Bell24H.com
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

// Perplexity API calls for the advanced dashboard
export const perplexityApi = {
  /**
   * Analyze text and get perplexity metrics
   */
  analyzeText: async (text: string, entityType: string, modelType: string) => {
    const response = await apiRequest('POST', '/api/perplexity/analyze', { 
      text, entityType, modelType 
    });
    return response.json();
  },
  
  /**
   * Get temporal trends for perplexity analysis
   */
  getTemporalTrends: async (entityType: string, timeframe: string) => {
    const response = await apiRequest('GET', `/api/perplexity/trends/${entityType}?timeframe=${timeframe}`);
    return response.json();
  },
  
  /**
   * Get competitive insights from perplexity analysis
   */
  getCompetitiveInsights: async (entityType: string) => {
    const response = await apiRequest('GET', `/api/perplexity/competitive/${entityType}`);
    return response.json();
  },
  
  /**
   * Get market segmentation based on perplexity analysis
   */
  getMarketSegmentation: async (criteria: string) => {
    const response = await apiRequest('GET', `/api/perplexity/segments?criteria=${criteria}`);
    return response.json();
  },
  
  /**
   * Get success predictions based on perplexity scores
   */
  getSuccessPrediction: async (entityId: string, entityType: string) => {
    const response = await apiRequest('GET', `/api/perplexity/predict/${entityType}/${entityId}`);
    return response.json();
  },
  
  /**
   * Get improvement recommendations for text
   */
  getImprovements: async (text: string, targetAudience: string) => {
    const response = await apiRequest('POST', '/api/perplexity/improve', { 
      text, targetAudience 
    });
    return response.json();
  },
  
  /**
   * Get multilingual analysis of text
   */
  getMultilingualAnalysis: async (text: string, languageCode: string) => {
    const response = await apiRequest('POST', '/api/perplexity/multilingual', { 
      text, languageCode 
    });
    return response.json();
  },
  
  /**
   * Get customer perplexity profile
   */
  getCustomerProfile: async (customerId: string) => {
    const response = await apiRequest('GET', `/api/perplexity/customer/${customerId}`);
    return response.json();
  },
  
  /**
   * Subscribe to real-time perplexity notifications 
   */
  subscribeToUpdates: async (entityTypes: string[]) => {
    const response = await apiRequest('POST', '/api/perplexity-realtime/subscribe', { 
      entityTypes 
    });
    return response.json();
  },

  /**
   * Test API connection to verify connectivity
   */
  testApiConnection: async () => {
    const response = await apiRequest('GET', '/api/perplexity/test');
    return response.json();
  },

  /**
   * Generate a custom PDF report with visualizations
   */
  generateCustomReport: async (data: any) => {
    const response = await apiRequest('POST', '/api/perplexity/report', data);
    return response.json();
  }
};
