
import { describe, it, expect, beforeEach } from 'vitest';
import { BetaTestingService } from '../../../server/services/beta-testing';
import { db } from '../../../server/db';

describe('Beta Testing Service', () => {
  let service: BetaTestingService;

  beforeEach(async () => {
    service = new BetaTestingService();
    await db.betaTesters.deleteMany({});
  });

  it('should track new beta testers', async () => {
    const tester = await service.trackBetaTester({
      userId: 1,
      type: 'supplier',
      region: 'Tier-2'
    });
    
    expect(tester).toBeDefined();
    expect(tester.userId).toBe(1);
    expect(tester.type).toBe('supplier');
  });

  it('should collect feedback', async () => {
    const feedback = await service.submitFeedback({
      userId: 1,
      rating: 5,
      features: ['RFQ Creation', 'Voice Assistant'],
      comments: 'Great platform!'
    });
    
    expect(feedback.saved).toBe(true);
  });

  it('should generate metrics report', async () => {
    const metrics = await service.getBetaMetrics();
    
    expect(metrics).toHaveProperty('totalTesters');
    expect(metrics).toHaveProperty('averageRating');
    expect(metrics).toHaveProperty('topFeatures');
  });
});
