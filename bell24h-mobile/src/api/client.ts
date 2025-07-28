import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for authentication
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// RFQ API Functions
export const rfqAPI = {
  // Get all RFQs
  getAll: async () => {
    const response = await api.get('/rfq');
    return response.data;
  },

  // Get RFQ by ID
  getById: async (id: string) => {
    const response = await api.get(`/rfq/${id}`);
    return response.data;
  },

  // Create new RFQ
  create: async (rfqData: {
    title: string;
    description: string;
    requirements?: string[];
    category: string;
    budget?: number;
  }) => {
    const response = await api.post('/rfq', rfqData);
    return response.data;
  },

  // Submit voice RFQ
  submitVoice: async (audioBase64: string, languagePreference?: string) => {
    const response = await api.post('/rfq/voice', {
      audioBase64,
      languagePreference: languagePreference || 'en',
    });
    return response.data;
  },

  // Match suppliers for RFQ
  matchSuppliers: async (rfqId: string) => {
    const response = await api.post(`/rfq/${rfqId}/match`);
    return response.data;
  },

  // Submit proposal
  submitProposal: async (rfqId: string, proposalData: {
    proposal: string;
    price: number;
    deliveryTime: string;
    additionalNotes?: string;
  }) => {
    const response = await api.post(`/rfq/${rfqId}/proposal`, proposalData);
    return response.data;
  },

  // Evaluate proposals
  evaluateProposals: async (rfqId: string) => {
    const response = await api.post(`/rfq/${rfqId}/evaluate`);
    return response.data;
  },
};

// Wallet API Functions
export const walletAPI = {
  // Get wallet balance
  getBalance: async (userId: string) => {
    const response = await api.get(`/wallet/${userId}/balance`);
    return response.data;
  },

  // Deposit funds
  deposit: async (userId: string, amount: number) => {
    const response = await api.post(`/wallet/${userId}/deposit`, { amount });
    return response.data;
  },

  // Withdraw funds
  withdraw: async (userId: string, amount: number) => {
    const response = await api.post(`/wallet/${userId}/withdraw`, { amount });
    return response.data;
  },
};

// Escrow API Functions
export const escrowAPI = {
  // Create escrow
  create: async (escrowData: {
    buyerId: string;
    supplierId: string;
    amount: number;
    tradeId: string;
  }) => {
    const response = await api.post('/escrow/create', escrowData);
    return response.data;
  },

  // Release escrow
  release: async (escrowId: string) => {
    const response = await api.post(`/escrow/${escrowId}/release`);
    return response.data;
  },

  // Get escrow details
  getDetails: async (escrowId: string) => {
    const response = await api.get(`/escrow/${escrowId}`);
    return response.data;
  },
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

// Export all API functions
export default {
  rfq: rfqAPI,
  wallet: walletAPI,
  escrow: escrowAPI,
  health: healthAPI,
}; 