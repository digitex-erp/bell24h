
import { storage } from '../storage';
import { logger } from '../logger';

export interface BetaTester {
  id: number;
  type: 'supplier' | 'buyer';
  userId: number;
  startDate: Date;
  feedbackSubmitted: boolean;
  lastActive: Date;
  feedback?: Record<string, any>;
  useCase?: string;
  companySize?: string;
  industry?: string;
  features: {
    used: string[];
    requested: string[];
  };
  feedback?: Record<string, any>;
}

export const betaTestingService = {
  async trackTester(userId: number, type: 'supplier' | 'buyer'): Promise<BetaTester> {
    try {
      const tester = await storage.createBetaTester({
        userId,
        type,
        startDate: new Date(),
        feedbackSubmitted: false,
        lastActive: new Date(),
        features: {
          used: [],
          requested: []
        }
      });
      
      logger.info(`New beta tester registered: ${type} #${userId} at ${new Date().toISOString()}`);
      return tester;
    } catch (error) {
      logger.error('Error tracking beta tester:', error);
      throw error;
    }
  },

  async updateActivity(testerId: number): Promise<void> {
    try {
      await storage.updateBetaTesterActivity(testerId, new Date());
    } catch (error) {
      logger.error('Error updating tester activity:', error);
      throw error;
    }
  },

  async submitFeedback(testerId: number, feedback: any): Promise<void> {
    try {
      await storage.updateBetaTesterFeedback(testerId, feedback);
      logger.info(`Feedback submitted by tester #${testerId}`);
    } catch (error) {
      logger.error('Error submitting feedback:', error);
      throw error;
    }
  },

  async getBetaMetrics(): Promise<{
    totalSuppliers: number;
    totalBuyers: number;
    feedbackSubmitted: number;
    activeInLast24h: number;
  }> {
    try {
      const testers = await storage.getAllBetaTesters();
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      return {
        totalSuppliers: testers.filter(t => t.type === 'supplier').length,
        totalBuyers: testers.filter(t => t.type === 'buyer').length,
        feedbackSubmitted: testers.filter(t => t.feedbackSubmitted).length,
        activeInLast24h: testers.filter(t => t.lastActive > last24h).length
      };
    } catch (error) {
      logger.error('Error getting beta metrics:', error);
      throw error;
    }
  }
};
