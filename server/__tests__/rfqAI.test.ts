import { Request, Response } from 'express';
import { getRFQRecommendations, getRFQAcceptancePrediction } from '../controllers/aiController';
import { recommendSuppliersForRFQ, predictRFQAcceptance } from '../services/aiService';
import suppliers from '../data/suppliers';

// Mock Express request and response
const mockRequest = {} as Request;
const mockResponse = {
  json: jest.fn(),
  status: jest.fn().mockReturnThis(),
} as unknown as Response;

describe('RFQ AI Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Supplier Recommendations', () => {
    it('should recommend suppliers based on RFQ category and region', () => {
      const rfq = {
        category: 'Electronics',
        region: 'Asia',
        value: 10000,
        urgency: 'normal'
      };

      const recommended = recommendSuppliersForRFQ(rfq, suppliers);
      
      expect(recommended).toBeDefined();
      expect(Array.isArray(recommended)).toBe(true);
      expect(recommended.length).toBeLessThanOrEqual(5);
      recommended.forEach(supplier => {
        expect(supplier.category).toBe('Electronics');
        expect(supplier.region).toBe('Asia');
      });
    });

    it('should handle RFQ with no matching suppliers', () => {
      const rfq = {
        category: 'NonExistentCategory',
        region: 'NonExistentRegion',
        value: 10000,
        urgency: 'normal'
      };

      const recommended = recommendSuppliersForRFQ(rfq, suppliers);
      
      expect(recommended).toBeDefined();
      expect(Array.isArray(recommended)).toBe(true);
      expect(recommended.length).toBe(0);
    });

    it('should handle malformed RFQ data', () => {
      const rfq = {
        // Missing required fields
        value: 10000
      };

      const recommended = recommendSuppliersForRFQ(rfq as any, suppliers);
      
      expect(recommended).toBeDefined();
      expect(Array.isArray(recommended)).toBe(true);
      expect(recommended.length).toBe(0);
    });
  });

  describe('RFQ Acceptance Prediction', () => {
    it('should predict acceptance probability based on RFQ value and urgency', () => {
      const rfq = {
        category: 'Electronics',
        region: 'Asia',
        value: 15000,
        urgency: 'high'
      };

      const probability = predictRFQAcceptance(rfq);
      
      expect(probability).toBeDefined();
      expect(typeof probability).toBe('number');
      expect(probability).toBeGreaterThanOrEqual(0.1);
      expect(probability).toBeLessThanOrEqual(0.95);
    });

    it('should handle high-value RFQs', () => {
      const rfq = {
        category: 'Electronics',
        region: 'Asia',
        value: 100000,
        urgency: 'normal'
      };

      const probability = predictRFQAcceptance(rfq);
      
      expect(probability).toBeGreaterThan(0.7); // High value should increase probability
    });

    it('should handle high-urgency RFQs', () => {
      const rfq = {
        category: 'Electronics',
        region: 'Asia',
        value: 5000,
        urgency: 'high'
      };

      const probability = predictRFQAcceptance(rfq);
      
      expect(probability).toBeLessThan(0.7); // High urgency should decrease probability
    });
  });

  describe('AI Controller Endpoints', () => {
    it('should return supplier recommendations', () => {
      const rfq = {
        category: 'Electronics',
        region: 'Asia',
        value: 10000,
        urgency: 'normal'
      };

      mockRequest.body = rfq;
      getRFQRecommendations(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith({
        recommended: expect.any(Array)
      });
    });

    it('should return acceptance prediction', () => {
      const rfq = {
        category: 'Electronics',
        region: 'Asia',
        value: 10000,
        urgency: 'normal'
      };

      mockRequest.body = rfq;
      getRFQAcceptancePrediction(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith({
        probability: expect.any(Number)
      });
    });

    it('should handle invalid request data', () => {
      mockRequest.body = null;
      getRFQRecommendations(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid RFQ data'
      });
    });
  });
}); 