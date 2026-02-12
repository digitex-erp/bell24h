/**
 * Pricing Experiment Service for Bell24H
 * Manages A/B testing and pricing experiments using RevenueCat
 */

export interface PricingVariation {
  identifier: string;
  displayName: string;
  price: number;
  discount?: number;
  features: string[];
  isControl?: boolean;
}

export interface ExperimentResult {
  variation: string;
  conversionRate: number;
  revenue: number;
  sampleSize: number;
  confidence: number;
  isWinner?: boolean;
}

export class PricingExperimentService {
  private experiments: Map<string, PricingVariation[]> = new Map();
  private results: Map<string, ExperimentResult[]> = new Map();

  constructor() {
    this.initializeDefaultExperiments();
  }

  /**
   * Initialize default pricing experiments
   */
  private initializeDefaultExperiments() {
    // Pro plan pricing experiment
    this.experiments.set('pro-pricing-v1', [
      {
        identifier: 'bell24h_pro_monthly_control',
        displayName: 'Pro Monthly',
        price: 2999,
        isControl: true,
        features: ['Unlimited RFQs', 'AI Matching', 'Voice RFQ', 'Priority Support']
      },
      {
        identifier: 'bell24h_pro_monthly_variant_a',
        displayName: 'Pro Monthly',
        price: 2499,
        discount: 16.7,
        features: ['Unlimited RFQs', 'AI Matching', 'Voice RFQ', 'Priority Support']
      },
      {
        identifier: 'bell24h_pro_monthly_variant_b',
        displayName: 'Pro Monthly',
        price: 3499,
        features: ['Unlimited RFQs', 'AI Matching', 'Voice RFQ', 'Priority Support', 'Advanced Analytics']
      }
    ]);

    // Enterprise plan pricing experiment
    this.experiments.set('enterprise-pricing-v1', [
      {
        identifier: 'bell24h_enterprise_yearly_control',
        displayName: 'Enterprise Yearly',
        price: 299999,
        isControl: true,
        features: ['Custom AI Models', 'API Access', 'Dedicated Support', 'White Label']
      },
      {
        identifier: 'bell24h_enterprise_yearly_variant_a',
        displayName: 'Enterprise Yearly',
        price: 249999,
        discount: 16.7,
        features: ['Custom AI Models', 'API Access', 'Dedicated Support', 'White Label']
      }
    ]);
  }

  /**
   * Get pricing variation for A/B test
   */
  async runABTest(experimentId: string, userId: string): Promise<PricingVariation> {
    const variations = this.experiments.get(experimentId);
    if (!variations) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    // Simple hash-based assignment for consistent user experience
    const hash = this.hashString(`${userId}-${experimentId}`);
    const variationIndex = hash % variations.length;
    const variation = variations[variationIndex];

    console.log(`Assigned user ${userId} to variation ${variation.identifier} in experiment ${experimentId}`);

    // Store assignment for tracking
    await this.trackAssignment(experimentId, variation.identifier, userId);

    return variation;
  }

  /**
   * Track conversion for pricing experiment
   */
  async trackConversion(experimentId: string, variation: string, userId: string, revenue: number): Promise<void> {
    const experimentResults = this.results.get(experimentId) || [];
    
    const existingResult = experimentResults.find(r => r.variation === variation);
    if (existingResult) {
      existingResult.conversionRate = (existingResult.conversionRate * existingResult.sampleSize + 1) / (existingResult.sampleSize + 1);
      existingResult.revenue += revenue;
      existingResult.sampleSize += 1;
    } else {
      experimentResults.push({
        variation,
        conversionRate: 1, // First conversion
        revenue,
        sampleSize: 1,
        confidence: 0.5
      });
    }

    this.results.set(experimentId, experimentResults);

    // Update RevenueCat attributes for segmentation
    await this.updateRevenueCatAttributes(userId, experimentId, variation, true);

    console.log(`Tracked conversion for user ${userId} in variation ${variation} of experiment ${experimentId}`);
  }

  /**
   * Get experiment results and analytics
   */
  async getExperimentResults(experimentId: string): Promise<ExperimentResult[]> {
    const results = this.results.get(experimentId) || [];
    
    // Calculate statistical significance and confidence intervals
    return results.map(result => ({
      ...result,
      confidence: this.calculateConfidence(result.sampleSize, result.conversionRate),
      isWinner: this.isWinner(result, results)
    }));
  }

  /**
   * Update RevenueCat attributes for experiment tracking
   */
  private async updateRevenueCatAttributes(
    userId: string, 
    experimentId: string, 
    variation: string, 
    converted: boolean = false
  ): Promise<void> {
    const attributes = {
      [`experiment_${experimentId}`]: variation,
      [`experiment_${experimentId}_converted`]: converted.toString(),
      [`experiment_${experimentId}_timestamp`]: new Date().toISOString()
    };

    // In a real implementation, this would call RevenueCat's setAttributes API
    // For now, we'll store it in our database
    console.log('Updating RevenueCat attributes:', attributes);

    // Store in database for later sync
    try {
      // This would be a database call in production
      console.log(`Stored experiment attributes for user ${userId}:`, attributes);
    } catch (error) {
      console.error('Failed to store experiment attributes:', error);
    }
  }

  /**
   * Track user assignment to experiment variation
   */
  private async trackAssignment(experimentId: string, variation: string, userId: string): Promise<void> {
    // Store assignment in database for analytics
    const assignment = {
      userId,
      experimentId,
      variation,
      assignedAt: new Date().toISOString()
    };

    console.log('Tracked experiment assignment:', assignment);
  }

  /**
   * Calculate confidence interval for conversion rate
   */
  private calculateConfidence(sampleSize: number, conversionRate: number): number {
    if (sampleSize < 30) return 0.5; // Not enough data
    
    // Simple confidence calculation using normal approximation
    const z = 1.96; // 95% confidence interval
    const marginOfError = z * Math.sqrt((conversionRate * (1 - conversionRate)) / sampleSize);
    
    return Math.min(0.99, Math.max(0.5, 1 - marginOfError));
  }

  /**
   * Determine if a variation is the winner
   */
  private isWinner(result: ExperimentResult, allResults: ExperimentResult[]): boolean {
    if (result.sampleSize < 100) return false; // Need sufficient sample size
    
    const control = allResults.find(r => r.variation.includes('control'));
    if (!control) return false;
    
    // Winner if conversion rate is significantly higher than control
    return result.conversionRate > control.conversionRate * 1.1 && result.confidence > 0.9;
  }

  /**
   * Simple hash function for user assignment
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get all active experiments
   */
  getActiveExperiments(): string[] {
    return Array.from(this.experiments.keys());
  }

  /**
   * Create new pricing experiment
   */
  createExperiment(experimentId: string, variations: PricingVariation[]): void {
    if (variations.length < 2) {
      throw new Error('Experiment must have at least 2 variations');
    }

    if (!variations.some(v => v.isControl)) {
      throw new Error('Experiment must have a control variation');
    }

    this.experiments.set(experimentId, variations);
    console.log(`Created new experiment: ${experimentId} with ${variations.length} variations`);
  }

  /**
   * End experiment and declare winner
   */
  async endExperiment(experimentId: string, winnerVariation?: string): Promise<ExperimentResult> {
    const results = await this.getExperimentResults(experimentId);
    
    let winner = results.find(r => r.isWinner);
    if (!winner && winnerVariation) {
      winner = results.find(r => r.variation === winnerVariation);
    }
    
    if (!winner) {
      winner = results.reduce((prev, current) => 
        prev.conversionRate > current.conversionRate ? prev : current
      );
    }

    console.log(`Ended experiment ${experimentId}. Winner: ${winner.variation} with ${winner.conversionRate * 100}% conversion rate`);

    // Store experiment results for future reference
    const experimentData = {
      experimentId,
      winner: winner.variation,
      results,
      endedAt: new Date().toISOString()
    };

    console.log('Experiment ended:', experimentData);

    return winner;
  }
}

// Export singleton instance
export const pricingExperimentService = new PricingExperimentService();