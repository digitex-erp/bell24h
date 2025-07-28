import { AIDecision, AIRequestContext, ModelType, AIError } from '@/types/ai';
import { Analysis, AnalysisResponse } from '../../types/ai';

/**
 * Service for handling AI-related API calls
 */
class AIService {
  private static instance: AIService;
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_AI_API_URL || '/api/ai';
  }

  /**
   * Get the singleton instance of AIService
   */
  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  /**
   * Analyze data using the specified AI model
   */
  public async analyze<T = any>(
    modelType: ModelType,
    context: AIRequestContext
  ): Promise<AIDecision<T>> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          modelType,
          context,
        }),
      });

      if (!response.ok) {
        const error: AIError = await response.json().catch(() => ({
          code: 'invalid_json',
          message: 'Failed to parse error response',
        }));
        throw new Error(error.message || 'AI analysis failed');
      }

      return await response.json();
    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw error instanceof Error 
        ? error 
        : new Error('An unknown error occurred during AI analysis');
    }
  }

  /**
   * Get model explanation (SHAP/LIME)
   */
  public async getExplanation(
    modelId: string,
    instanceId: string,
    explainabilityType: 'shap' | 'lime',
    features: Record<string, any>
  ) {
    try {
      const response = await fetch(`${this.baseUrl}/explain/${explainabilityType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          modelId,
          instanceId,
          features,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get explanation: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Explanation Error:', error);
      throw error;
    }
  }

  /**
   * Get analysis history for a user
   */
  public async getAnalysisHistory(limit: number = 10, offset: number = 0) {
    try {
      const response = await fetch(
        `${this.baseUrl}/history?limit=${limit}&offset=${offset}`, 
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch analysis history');
      }

      return await response.json();
    } catch (error) {
      console.error('History Fetch Error:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const aiService = AIService.getInstance();

export const aiServiceMock = {
  analyze: jest.fn().mockResolvedValue({
    decision: 'approve',
    confidence: 0.85,
    reasoning: 'Test reasoning',
    timestamp: new Date().toISOString()
  } as Analysis),

  getAnalysis: jest.fn().mockResolvedValue({
    items: [
      {
        id: '1',
        timestamp: '2024-01-01T00:00:00Z',
        decision: 'approve',
        confidence: 0.85,
        reasoning: 'Test reasoning'
      }
    ],
    total: 1,
    page: 1,
    pageSize: 10
  } as AnalysisResponse),

  getAnalysisById: jest.fn().mockResolvedValue({
    id: '1',
    timestamp: '2024-01-01T00:00:00Z',
    decision: 'approve',
    confidence: 0.85,
    reasoning: 'Test reasoning'
  } as Analysis)
};
