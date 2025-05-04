import { Rfq, Supplier } from '../../shared/schema';
import { calculateSupplierMatchesWithGemini, generateRfqImage } from './gemini';

// This represents a scored supplier with its matching score
export interface ScoredSupplier {
  supplier: Supplier;
  matchScore: number;
}

/**
 * Calculate supplier matches for an RFQ using AI-powered matching algorithm
 * Now uses Google's Gemini AI service for more sophisticated matching
 */
export async function calculateSupplierMatches(rfq: Rfq, suppliers: Supplier[]): Promise<ScoredSupplier[]> {
  try {
    // Use Gemini AI for advanced matching
    const geminiResults = await calculateSupplierMatchesWithGemini(rfq, suppliers);
    
    // If we got valid results, use them
    if (geminiResults && geminiResults.length > 0) {
      return geminiResults;
    }
    
    // Fall back to basic matching if Gemini didn't return valid results
    return calculateBasicSupplierMatches(rfq, suppliers);
  } catch (error) {
    console.error('Error in AI supplier matching:', error);
    // Fall back to basic matching on error
    return calculateBasicSupplierMatches(rfq, suppliers);
  }
}

/**
 * Basic matching algorithm as a fallback if the AI API fails
 */
function calculateBasicSupplierMatches(rfq: Rfq, suppliers: Supplier[]): ScoredSupplier[] {
  // Scoring factors:
  // 1. Industry match (primary criterion)
  // 2. Supplier rating (higher rating gets more weight)
  // 3. Verification status (verified suppliers get a bonus)
  
  const scoredSuppliers: ScoredSupplier[] = suppliers.map(supplier => {
    let score = 0;
    
    // Industry match (0-50 points)
    if (supplier.industry === rfq.industry) {
      score += 50;
    } else {
      return { supplier, matchScore: 0 }; // No industry match means no match at all
    }
    
    // Supplier rating (0-30 points)
    if (supplier.rating) {
      // Scale from 0-5 to 0-30
      score += (supplier.rating / 5) * 30;
    }
    
    // Verification status (0-20 points)
    if (supplier.isVerified) {
      score += 20;
    }
    
    return { supplier, matchScore: score };
  });
  
  // Filter out any suppliers with a score of 0 and sort by highest score
  return scoredSuppliers
    .filter(item => item.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Generate an image for an RFQ using Gemini AI
 */
export async function generateRfqImageWithAI(rfq: Rfq): Promise<string | null> {
  try {
    return await generateRfqImage(rfq);
  } catch (error) {
    console.error('Error generating RFQ image:', error);
    return null;
  }
}
import shap from 'shap';
import { SupplierData, RecommendationExplanation } from '../types';

export class SupplierRecommendationExplainer {
  private modelFeatures = [
    'responseTime',
    'qualityScore',
    'deliveryReliability',
    'priceCompetitiveness',
    'industryExperience'
  ];

  async explainRecommendation(
    supplier: SupplierData,
    similarSuppliers: SupplierData[]
  ): Promise<RecommendationExplanation> {
    const explainer = new shap.KernelExplainer(this.predictFunction);
    const shapValues = await explainer.shap_values(supplier);
    
    return {
      featureImportance: this.modelFeatures.map((feature, index) => ({
        feature,
        importance: Math.abs(shapValues[index]),
        contribution: shapValues[index]
      })),
      localExplanation: this.generateLocalExplanation(shapValues),
      confidenceScore: this.calculateConfidenceScore(shapValues)
    };
  }

  private predictFunction(supplier: SupplierData): number {
    // Simplified scoring function
    return (
      supplier.responseTime * 0.2 +
      supplier.qualityScore * 0.3 +
      supplier.deliveryReliability * 0.2 +
      supplier.priceCompetitiveness * 0.2 +
      supplier.industryExperience * 0.1
    );
  }

  private generateLocalExplanation(shapValues: number[]): string {
    const topFactors = this.modelFeatures
      .map((feature, index) => ({ feature, value: shapValues[index] }))
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 3);

    return `This supplier is recommended primarily because of their ${
      topFactors.map(f => f.feature).join(', ')
    }`;
  }

  private calculateConfidenceScore(shapValues: number[]): number {
    const totalImpact = shapValues.reduce((sum, val) => sum + Math.abs(val), 0);
    return Math.min(totalImpact / this.modelFeatures.length, 1);
  }
}
