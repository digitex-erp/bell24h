import { ExplanationRequest, ExplanationResponse, ModelExplanation } from '../types/ai.js';

/**
 * Service for interacting with the AI explainability microservice (SHAP/LIME)
 * The microservice runs locally on port 8008 by default
 */

const API_BASE_URL = 'http://localhost:8008'; // Configurable for different environments

/**
 * Get a SHAP explanation for a model prediction
 */
export const getShapExplanation = async (request: ExplanationRequest): Promise<ExplanationResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/explain/shap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SHAP explanation request failed: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('SHAP explanation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Get a LIME explanation for a model prediction
 */
export const getLimeExplanation = async (request: ExplanationRequest): Promise<ExplanationResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/explain/lime`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`LIME explanation request failed: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error('LIME explanation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Get explanations for multiple instances (batch processing)
 */
export const getBatchExplanations = async (
  requests: ExplanationRequest[],
  type: 'shap' | 'lime' = 'shap'
): Promise<ExplanationResponse[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/explain/${type}/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Batch explanation request failed: ${error}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`${type.toUpperCase()} batch explanation error:`, error);
    return requests.map(() => ({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }));
  }
};

/**
 * Get historical explanations for a model
 */
export const getModelExplanations = async (
  modelId: string,
  limit = 10
): Promise<ModelExplanation[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/explanations/${modelId}?limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch model explanations');
    }

    const data = await response.json();
    return data.explanations || [];
  } catch (error) {
    console.error('Error fetching model explanations:', error);
    return [];
  }
};
