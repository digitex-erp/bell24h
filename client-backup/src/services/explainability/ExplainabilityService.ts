import { Explanation, ExplanationResponse } from '../../types/explainability';

export const explainabilityService = {
  getExplanations: jest.fn().mockResolvedValue({
    items: [
      {
        id: '1',
        timestamp: '2024-01-01T00:00:00Z',
        model: 'test-model',
        confidence: 0.95,
        summary: 'Test explanation',
        features: {
          'feature1': 0.8,
          'feature2': 0.6
        }
      }
    ],
    total: 1,
    page: 1,
    pageSize: 10
  } as ExplanationResponse),

  getExplanation: jest.fn().mockResolvedValue({
    id: '1',
    timestamp: '2024-01-01T00:00:00Z',
    model: 'test-model',
    confidence: 0.95,
    summary: 'Test explanation',
    features: {
      'feature1': 0.8,
      'feature2': 0.6
    }
  } as Explanation),

  deleteExplanation: jest.fn().mockResolvedValue({ success: true }),

  generateExplanation: jest.fn().mockResolvedValue({
    id: '2',
    timestamp: new Date().toISOString(),
    model: 'test-model',
    confidence: 0.85,
    summary: 'Generated explanation',
    features: {
      'feature1': 0.7,
      'feature2': 0.5
    }
  } as Explanation)
}; 