
import * as shap from 'shap';
import * as tf from '@tensorflow/tfjs';
import { SupplierData, ExplanationResult } from '../../shared/types';

export class SupplierExplainabilityService {
  async explainRecommendation(supplier: SupplierData, features: any[]): Promise<ExplanationResult> {
    const modelWrapper = async (x: any[]) => {
      const tensor = tf.tensor(x);
      return this.getModelPredictions(tensor.arraySync());
    };

    const explainer = new shap.KernelExplainer(modelWrapper);
    const shapValues = await explainer.shap_values(features);

    const featureImportance = this.calculateFeatureImportance(shapValues);
    
    return {
      overallScore: supplier.matchScore,
      featureContributions: featureImportance,
      topFactors: this.getTopFactors(featureImportance)
    };
  }

  private getModelPredictions(features: any[]): number[] {
    // Model prediction logic here
    return features.map(f => this.calculateScore(f));
  }

  private calculateFeatureImportance(shapValues: number[][]): Record<string, number> {
    const featureNames = [
      'industryMatch',
      'locationScore',
      'deliveryPerformance',
      'qualityScore',
      'priceCompetitiveness'
    ];

    return Object.fromEntries(
      shapValues[0].map((value, i) => [featureNames[i], Math.abs(value)])
    );
  }

  private getTopFactors(featureImportance: Record<string, number>): string[] {
    return Object.entries(featureImportance)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([feature]) => feature);
  }

  private calculateScore(features: any): number {
    return Object.values(features).reduce((sum: number, val: number) => sum + val, 0) / 
           Object.values(features).length;
  }
}
