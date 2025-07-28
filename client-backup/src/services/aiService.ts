import { ExplanationRequest, ExplanationResponse, ModelExplanation } from '../types/ai';
import { API_BASE_URL } from '../config';

/**
 * Service to interact with the AI microservice for explainability features
 */
class AIService {
  private readonly BASE_URL = `${API_BASE_URL}/api/ai`;

  /**
   * Get an explanation for a model prediction
   * @param request Explanation request data
   * @returns Promise with the explanation response
   */
  async getExplanation(request: ExplanationRequest): Promise<ModelExplanation> {
    const response = await fetch(`${this.BASE_URL}/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get explanation');
    }

    const data: ExplanationResponse = await response.json();
    
    if (!data.success || !data.explanation) {
      throw new Error(data.error || 'Failed to get explanation');
    }

    return data.explanation;
  }

  /**
   * Get the history of explanations for a model and/or instance
   * @param modelId Optional model ID to filter by
   * @param instanceId Optional instance ID to filter by
   * @returns Promise with the explanation history
   */
  async getExplanationHistory(modelId?: string, instanceId?: string): Promise<ModelExplanation[]> {
    const params = new URLSearchParams();
    if (modelId) params.append('modelId', modelId);
    if (instanceId) params.append('instanceId', instanceId);

    const response = await fetch(`${this.BASE_URL}/explanations?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get explanation history');
    }

    return await response.json();
  }

  /**
   * Delete an explanation from history
   * @param explanationId ID of the explanation to delete
   */
  async deleteExplanation(explanationId: string): Promise<void> {
    const response = await fetch(`${this.BASE_URL}/explanations/${explanationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete explanation');
    }
  }
}

// Create a singleton instance
export const aiService = new AIService();
