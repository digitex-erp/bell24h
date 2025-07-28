import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAuthToken } from './authService';

// Types
export interface AZRReasoningStep {
  step: number;
  rule: string;
  result: any;
  confidence?: number;
  impact?: 'high' | 'medium' | 'low';
}

export interface AZRExplanation {
  text: string;
  confidence: number;
  reasoningPath: AZRReasoningStep[];
  metadata: {
    modelType: string;
    timestamp: string;
    features?: Record<string, any>;
    featureImportances?: Record<string, number>;
    featureDescriptions?: Record<string, string>;
  };
}

export interface AZRRequestOptions {
  input: any;
  modelType: 'rfq_classification' | 'bid_pricing' | 'product_categorization' | 'supplier_risk' | 'esg_scoring';
  context?: Record<string, any>;
  ruleset?: string[];
  depth?: number;
}

class AZRService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || '/api/azr',
      timeout: 30000, // 30 seconds
    });

    // Add request interceptor for auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get an explanation from AZR
   */
  async getExplanation(options: AZRRequestOptions): Promise<AZRExplanation> {
    try {
      const response = await this.api.post<AZRExplanation>('/explain', {
        input: options.input,
        modelType: options.modelType,
        context: options.context || {},
        ruleset: options.ruleset || ['default'],
        depth: options.depth || 3,
      });

      return response.data;
    } catch (error) {
      console.error('AZR explanation error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to get explanation from AZR service'
      );
    }
  }

  /**
   * Get supplier risk score with explanation
   */
  async getSupplierRiskScore(supplierData: any): Promise<{
    score: number;
    explanation: string;
    reasoningPath: AZRReasoningStep[];
    riskFactors: Array<{
      factor: string;
      score: number;
      impact: 'high' | 'medium' | 'low';
    }>;
  }> {
    try {
      const response = await this.api.post('/supplier-risk', { supplierData });
      return response.data;
    } catch (error) {
      console.error('Supplier risk analysis error:', error);
      throw new Error(
        error.response?.data?.message || 'Failed to analyze supplier risk'
      );
    }
  }

  /**
   * Check if AZR service is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('AZR health check failed:', error);
      return false;
    }
  }
}

// Create a singleton instance
export const azrService = new AZRService();

export default azrService;
