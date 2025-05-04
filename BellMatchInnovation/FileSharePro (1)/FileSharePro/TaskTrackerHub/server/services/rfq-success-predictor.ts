
import * as tf from '@tensorflow/tfjs-node';
import { storage } from '../storage';
import { log } from '../vite';

export interface RFQSuccessPredictionInput {
  estimatedValue: number;
  complexity: number;
  urgency: number;
  categories: string[];
  supplierCount?: number;
  marketDemand?: number;
}

export interface RFQSuccessPredictionResult {
  successRate: number;
  confidence: number;
  factors: string[];
  recommendations: string[];
}

class RFQSuccessPredictor {
  private model: tf.LayersModel | null = null;

  constructor() {
    this.initializeModel();
  }

  private async initializeModel() {
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ units: 64, activation: 'relu', inputShape: [6] }),
        tf.layers.dense({ units: 32, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });
  }

  private async preprocessInput(input: RFQSuccessPredictionInput): Promise<tf.Tensor> {
    const features = [
      input.estimatedValue / 1000000, // Normalize value
      input.complexity,
      input.urgency,
      input.categories.length,
      input.supplierCount || await this.estimateSupplierCount(input.categories),
      input.marketDemand || await this.estimateMarketDemand(input.categories)
    ];

    return tf.tensor2d([features]);
  }

  private async estimateSupplierCount(categories: string[]): Promise<number> {
    const suppliers = await storage.getSuppliers();
    const matchingSuppliers = suppliers.filter(supplier => 
      supplier.categories?.some(cat => categories.includes(cat))
    );
    return matchingSuppliers.length / suppliers.length;
  }

  private async estimateMarketDemand(categories: string[]): Promise<number> {
    // For now return a default value, can be enhanced with real market data
    return 0.7;
  }

  public async predictSuccess(input: RFQSuccessPredictionInput): Promise<RFQSuccessPredictionResult> {
    try {
      log("Predicting RFQ success rate", "rfq-prediction");
      const features = await this.preprocessInput(input);
      const prediction = this.model?.predict(features) as tf.Tensor;
      const successRate = (await prediction.data())[0];

      const factors = this.analyzeFactors(input);
      const recommendations = this.generateRecommendations(input, successRate);
      const confidence = this.calculateConfidence(input);

      return {
        successRate,
        confidence,
        factors,
        recommendations
      };
    } catch (error) {
      log(`Error predicting RFQ success: ${error}`, "rfq-prediction");
      throw error;
    }
  }

  private analyzeFactors(input: RFQSuccessPredictionInput): string[] {
    const factors = [];
    
    if (input.estimatedValue > 100000) {
      factors.push('High value RFQ');
    }
    
    if (input.urgency > 0.7) {
      factors.push('High urgency requirement');
    }
    
    if (input.categories.length > 2) {
      factors.push('Multi-category RFQ');
    }

    return factors;
  }

  private generateRecommendations(input: RFQSuccessPredictionInput, successRate: number): string[] {
    const recommendations = [];

    if (successRate < 0.5) {
      if (input.urgency > 0.7) {
        recommendations.push('Consider extending the timeline to attract more suppliers');
      }
      if (input.categories.length > 3) {
        recommendations.push('Try focusing on fewer categories to improve match quality');
      }
    }

    return recommendations;
  }

  private calculateConfidence(input: RFQSuccessPredictionInput): number {
    let confidence = 0.7; // Base confidence
    
    if (input.categories.length > 0) {
      confidence += 0.1;
    }
    
    if (input.marketDemand && input.marketDemand > 0.5) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1);
  }
}

export const rfqSuccessPredictor = new RFQSuccessPredictor();
export default rfqSuccessPredictor;
