
import { describe, it, expect } from 'vitest';
import { betaTestingService } from '../../../server/services/beta-testing';

describe('Beta Testing Service Integration', () => {
  it('should track beta testers', async () => {
    const tester = await betaTestingService.trackTester(1, 'supplier');
    expect(tester.userId).toBe(1);
    expect(tester.type).toBe('supplier');
  });

  it('should collect feedback', async () => {
    const feedback = {
      rating: 5,
      comments: 'Great platform!',
      features: {
        used: ['RFQ Creation', 'Supplier Matching'],
        requested: ['Mobile App']
      }
    };
    
    await betaTestingService.submitFeedback(1, feedback);
    const metrics = await betaTestingService.getBetaMetrics();
    expect(metrics.feedbackSubmitted).toBeGreaterThan(0);
  });
});
