/**
 * Perplexity Service for Bell24H AI explainability
 * 
 * This service provides client-side methods to interact with the perplexity API
 * for AI model explainability and monitoring.
 */

import axios from 'axios';

// Base API URL
const API_URL = '/api/perplexity';

// Types for API responses
export interface PerplexityResult {
  perplexity: number;
  normalized_perplexity: number;
  tokens: number;
  complexity_category: 'low' | 'medium' | 'high' | 'very-high';
  interpretation: string;
}

export interface Feature {
  name: string;
  value: any;
  importance: number;
  description?: string;
}

export interface ExplanationResult {
  prediction: any;
  baseValue: number;
  features: Feature[];
  perplexity?: {
    score: number;
    normalizedScore: number;
    tokens: number;
    category: string;
    interpretation: string;
  };
  modelConfidence?: number;
  dataQualityScore?: number;
}

export interface FullExplanationResult {
  shap: ExplanationResult;
  lime: ExplanationResult;
  perplexity: {
    score: number;
    normalizedScore: number;
    tokens: number;
    category: string;
    interpretation: string;
  };
  combinedConfidence: number;
  dataQualitySummary: string;
}

export interface ModelValidationResult {
  validation: {
    average_perplexity: number;
    pass_rate: number;
    samples_tested: number;
    samples_failed: number;
    threshold: number;
  };
  samples_results: {
    sample_index: number;
    perplexity: number;
    normalized_perplexity: number;
    complexity_category: string;
    passed: boolean;
  }[];
}

/**
 * Calculate perplexity for a single text input
 * 
 * @param text - Text input to analyze
 * @param modelName - Name of the model to use
 * @returns Perplexity calculation result
 */
export const calculatePerplexity = async (
  text: string,
  modelName: 'default' | 'rfq' | 'product' = 'default'
): Promise<PerplexityResult> => {
  try {
    const response = await axios.post(`${API_URL}/calculate`, {
      text,
      model_name: modelName
    });
    
    return response.data;
  } catch (error) {
    console.error('Error calculating perplexity:', error);
    throw error;
  }
};

/**
 * Calculate perplexity for multiple text inputs
 * 
 * @param texts - Array of text inputs
 * @param modelName - Name of the model to use
 * @returns Array of perplexity results
 */
export const calculateBatchPerplexity = async (
  texts: string[],
  modelName: 'default' | 'rfq' | 'product' = 'default'
): Promise<PerplexityResult[]> => {
  try {
    const response = await axios.post(`${API_URL}/batch-calculate`, {
      texts,
      model_name: modelName
    });
    
    return response.data.results;
  } catch (error) {
    console.error('Error calculating batch perplexity:', error);
    throw error;
  }
};

/**
 * Get SHAP-based explanation for a text input
 * 
 * @param text - Text input to explain
 * @param modelType - Type of model to explain
 * @returns SHAP explanation result
 */
export const getShapExplanation = async (
  text: string,
  modelType: 'rfq_classification' | 'bid_pricing' | 'product_categorization' = 'rfq_classification'
): Promise<ExplanationResult> => {
  try {
    const response = await axios.post(`${API_URL}/explain/shap`, {
      text,
      model_type: modelType
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting SHAP explanation:', error);
    throw error;
  }
};

/**
 * Get LIME-based explanation for a text input
 * 
 * @param text - Text input to explain
 * @param modelType - Type of model to explain
 * @returns LIME explanation result
 */
export const getLimeExplanation = async (
  text: string,
  modelType: 'rfq_classification' | 'bid_pricing' | 'product_categorization' = 'rfq_classification'
): Promise<ExplanationResult> => {
  try {
    const response = await axios.post(`${API_URL}/explain/lime`, {
      text,
      model_type: modelType
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting LIME explanation:', error);
    throw error;
  }
};

/**
 * Get full model explanation (SHAP + LIME + perplexity)
 * 
 * @param text - Text input to explain
 * @param modelType - Type of model to explain
 * @returns Combined explanation result
 */
export const getFullExplanation = async (
  text: string,
  modelType: 'rfq_classification' | 'bid_pricing' | 'product_categorization' = 'rfq_classification'
): Promise<FullExplanationResult> => {
  try {
    const response = await axios.post(`${API_URL}/explain/full`, {
      text,
      model_type: modelType
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting full explanation:', error);
    throw error;
  }
};

/**
 * Validate model performance using perplexity
 * 
 * @param samples - Array of text samples
 * @param modelName - Name of the model to validate
 * @param threshold - Maximum acceptable perplexity
 * @returns Model validation results
 */
export const validateModel = async (
  samples: string[],
  modelName: 'default' | 'rfq' | 'product' = 'default',
  threshold: number = 50
): Promise<ModelValidationResult> => {
  try {
    const response = await axios.post(`${API_URL}/validate-model`, {
      samples,
      model_name: modelName,
      threshold
    });
    
    return response.data;
  } catch (error) {
    console.error('Error validating model:', error);
    throw error;
  }
};

export default {
  calculatePerplexity,
  calculateBatchPerplexity,
  getShapExplanation,
  getLimeExplanation,
  getFullExplanation,
  validateModel
};
