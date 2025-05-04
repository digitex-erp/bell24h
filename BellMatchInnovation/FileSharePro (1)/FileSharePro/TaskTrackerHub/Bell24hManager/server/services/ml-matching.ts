import { db } from '../db';
import { rfqs, suppliers, rfqSuppliers, quotes } from '../../shared/schema';
import { eq, and, desc, gte, lte, not, isNull } from 'drizzle-orm';
import { generateRfqAnalysisWithGemini, SupplierMatchingResult } from './gemini';

// Types for enhanced supplier matching with explanations
interface FeatureContribution {
  featureName: string;
  contribution: number;  // -100 to 100
  explanation: string;
}

interface PerformanceMetrics {
  avgResponseTime: number;       // Average response time in hours
  acceptanceRate: number;        // Percentage of quotes accepted
  completionRate: number;        // Percentage of completed projects
  avgPriceCompetitiveness: number; // Lower is better (percentage deviation from avg)
  similarRfqsCount: number;      // Number of similar RFQs handled
  industrySpecificScore: number; // Industry-specific performance score
}

export interface EnhancedSupplier {
  id: number;
  userId: number;
  name: string;
  description: string | null;
  industry: string;
  rating: number | null;
  reviewCount: number | null;
  isVerified: boolean;
  createdAt: string;
  performanceMetrics: PerformanceMetrics;
}

export interface SupplierRecommendation {
  supplier: EnhancedSupplier;
  matchScore: number;
  matchExplanation: FeatureContribution[];
}

/**
 * Enhanced supplier matching with detailed explanations
 * Uses performance history and contextual analysis
 */
export async function enhancedSupplierMatching(
  rfq: typeof rfqs.$inferSelect,
  potentialSuppliers: (typeof suppliers.$inferSelect)[]
): Promise<SupplierRecommendation[]> {
  // Get performance metrics for all potential suppliers
  const supplierIds = potentialSuppliers.map(s => s.id);
  const performanceMetrics = await getPerformanceMetricsForSuppliers(supplierIds);

  // Enhance suppliers with performance metrics
  const enhancedSuppliers: EnhancedSupplier[] = potentialSuppliers.map(supplier => ({
    ...supplier,
    performanceMetrics: performanceMetrics[supplier.id] || createDefaultPerformanceMetrics()
  }));
  
  // Use Gemini API to analyze the RFQ text and match with suppliers
  try {
    // First try to get existing matches from the database
    const existingMatches = await db
      .select()
      .from(rfqSuppliers)
      .where(eq(rfqSuppliers.rfqId, rfq.id));
    
    if (existingMatches.length > 0) {
      // If matches already exist, enrich them with explanations
      const recommendations: SupplierRecommendation[] = [];
      
      for (const match of existingMatches) {
        const supplier = enhancedSuppliers.find(s => s.id === match.supplierId);
        if (!supplier) continue;
        
        const matchExplanation = await generateExplanationForMatch(rfq, supplier, match.matchScore);
        
        recommendations.push({
          supplier,
          matchScore: match.matchScore,
          matchExplanation
        });
      }
      
      return recommendations.sort((a, b) => b.matchScore - a.matchScore);
    }
    
    // If no existing matches, use Gemini to generate new ones
    const matchResults: SupplierMatchingResult[] = await generateRfqAnalysisWithGemini(rfq, enhancedSuppliers);
    
    // Save the matches to the database
    for (const result of matchResults) {
      await db.insert(rfqSuppliers).values({
        rfqId: rfq.id,
        supplierId: result.supplier.id,
        matchScore: result.matchScore,
        isSubmitted: false
      });
    }
    
    // Transform to the enhanced format with explanations
    const recommendations: SupplierRecommendation[] = [];
    
    for (const result of matchResults) {
      const supplier = enhancedSuppliers.find(s => s.id === result.supplier.id);
      if (!supplier) continue;
      
      const matchExplanation = await generateExplanationForMatch(rfq, supplier, result.matchScore);
      
      recommendations.push({
        supplier,
        matchScore: result.matchScore,
        matchExplanation
      });
    }
    
    return recommendations.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error('Error in enhanced supplier matching:', error);
    
    // Fallback to basic matching if Gemini API fails
    return enhancedSuppliers.map(supplier => ({
      supplier,
      matchScore: calculateBasicMatchScore(rfq, supplier),
      matchExplanation: generateFallbackExplanations(rfq, supplier)
    })).sort((a, b) => b.matchScore - a.matchScore);
  }
}

/**
 * Get supplier matching history and context for a specific RFQ-supplier pair
 */
export async function getSupplierMatchingHistory(rfqId: number, supplierId: number) {
  // Get the RFQ and supplier details
  const [rfq] = await db.select().from(rfqs).where(eq(rfqs.id, rfqId));
  const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, supplierId));
  
  if (!rfq || !supplier) {
    return null;
  }
  
  // Get historical quotes by this supplier
  const quotes = await db
    .select()
    .from(rfqSuppliers)
    .where(eq(rfqSuppliers.supplierId, supplierId));
  
  // Get similar RFQs in the same industry
  const similarRfqs = await db
    .select()
    .from(rfqs)
    .where(
      and(
        eq(rfqs.industry, rfq.industry),
        not(eq(rfqs.id, rfqId))
      )
    )
    .limit(5);
  
  // Calculate previous match scores for similar RFQs
  const previousMatches = await db
    .select()
    .from(rfqSuppliers)
    .where(eq(rfqSuppliers.supplierId, supplierId));
  
  const previousMatchScores = previousMatches.map(match => match.matchScore);
  
  // Return the context
  return {
    rfq: {
      id: rfq.id,
      title: rfq.title,
      industry: rfq.industry
    },
    supplier: {
      id: supplier.id,
      name: supplier.name,
      industry: supplier.industry
    },
    performanceHistory: {
      totalQuotes: quotes.length,
      acceptedQuotes: quotes.filter(q => q.isSubmitted).length,
      averageQuotePrice: 0, // Would calculate from actual quotes
      previousMatchScores,
      similarRfqs: similarRfqs.map(r => ({
        id: r.id,
        title: r.title,
        industry: r.industry
      }))
    }
  };
}

// Helper functions

/**
 * Get performance metrics for a list of suppliers
 */
async function getPerformanceMetricsForSuppliers(supplierIds: number[]): Promise<Record<number, PerformanceMetrics>> {
  if (supplierIds.length === 0) {
    return {};
  }
  
  const result: Record<number, PerformanceMetrics> = {};
  
  // In a real implementation, this would query the database for actual metrics
  // Here we're creating sample metrics based on supplier IDs for demonstration
  
  for (const supplierId of supplierIds) {
    result[supplierId] = {
      avgResponseTime: 10 + (supplierId % 15), // 10-24 hours
      acceptanceRate: 65 + (supplierId % 30), // 65-95%
      completionRate: 70 + (supplierId % 25), // 70-95%
      avgPriceCompetitiveness: -5 + (supplierId % 15), // -5% to +10% from average
      similarRfqsCount: 5 + (supplierId % 20), // 5-25 similar RFQs
      industrySpecificScore: 70 + (supplierId % 25) // 70-95 industry score
    };
  }
  
  return result;
}

/**
 * Create default performance metrics for suppliers with no history
 */
function createDefaultPerformanceMetrics(): PerformanceMetrics {
  return {
    avgResponseTime: 0,
    acceptanceRate: 0,
    completionRate: 0,
    avgPriceCompetitiveness: 0,
    similarRfqsCount: 0,
    industrySpecificScore: 0
  };
}

/**
 * Generate detailed explanations for a supplier match
 */
async function generateExplanationForMatch(
  rfq: typeof rfqs.$inferSelect,
  supplier: EnhancedSupplier,
  matchScore: number
): Promise<FeatureContribution[]> {
  try {
    // In a real implementation, this would use Gemini API to generate explanations
    // Here we're creating sample explanations based on the supplier and RFQ
    
    const explanations: FeatureContribution[] = [
      {
        featureName: "Industry Experience",
        contribution: 25,
        explanation: `${supplier.name} specializes in the ${rfq.industry} industry, with strong expertise in related products.`
      },
      {
        featureName: "Response Time",
        contribution: supplier.performanceMetrics.avgResponseTime < 12 ? 15 : -10,
        explanation: supplier.performanceMetrics.avgResponseTime < 12 
          ? `Fast average response time of ${supplier.performanceMetrics.avgResponseTime} hours.`
          : `Slower average response time of ${supplier.performanceMetrics.avgResponseTime} hours.`
      },
      {
        featureName: "Success Rate",
        contribution: supplier.performanceMetrics.acceptanceRate > 80 ? 20 : 5,
        explanation: `${supplier.performanceMetrics.acceptanceRate}% success rate with previous RFQs.`
      },
      {
        featureName: "Price Competitiveness",
        contribution: supplier.performanceMetrics.avgPriceCompetitiveness < 0 ? 15 : -5,
        explanation: supplier.performanceMetrics.avgPriceCompetitiveness < 0
          ? `Typically offers prices ${Math.abs(supplier.performanceMetrics.avgPriceCompetitiveness)}% below market average.`
          : `Typically prices ${supplier.performanceMetrics.avgPriceCompetitiveness}% above market average.`
      },
      {
        featureName: "Similar Project Experience",
        contribution: supplier.performanceMetrics.similarRfqsCount > 10 ? 18 : 8,
        explanation: `Has completed ${supplier.performanceMetrics.similarRfqsCount} similar projects in this category.`
      }
    ];
    
    // Add verification status if applicable
    if (supplier.isVerified) {
      explanations.push({
        featureName: "Verified Status",
        contribution: 12,
        explanation: "Verified supplier with validated credentials and business information."
      });
    }
    
    return explanations;
  } catch (error) {
    console.error('Error generating match explanations:', error);
    return generateFallbackExplanations(rfq, supplier);
  }
}

/**
 * Calculate a basic match score when AI services are unavailable
 */
function calculateBasicMatchScore(
  rfq: typeof rfqs.$inferSelect,
  supplier: EnhancedSupplier
): number {
  let score = 0;
  
  // Industry match
  if (rfq.industry === supplier.industry) {
    score += 40;
  }
  
  // Performance metrics
  if (supplier.performanceMetrics.acceptanceRate > 80) score += 15;
  if (supplier.performanceMetrics.completionRate > 85) score += 15;
  if (supplier.performanceMetrics.avgResponseTime < 12) score += 10;
  if (supplier.performanceMetrics.avgPriceCompetitiveness < 0) score += 10;
  if (supplier.performanceMetrics.similarRfqsCount > 10) score += 10;
  
  // Verification bonus
  if (supplier.isVerified) score += 10;
  
  // Rating bonus
  if (supplier.rating && supplier.rating > 4) score += 10;
  
  return Math.min(Math.max(score, 0), 100); // Ensure score is between 0-100
}

/**
 * Generate fallback explanations when AI services are unavailable
 */
function generateFallbackExplanations(
  rfq: typeof rfqs.$inferSelect,
  supplier: EnhancedSupplier
): FeatureContribution[] {
  const explanations: FeatureContribution[] = [];
  
  // Industry match
  if (rfq.industry === supplier.industry) {
    explanations.push({
      featureName: "Industry Match",
      contribution: 40,
      explanation: `Direct match with the ${rfq.industry} industry requirements.`
    });
  }
  
  // Performance metrics
  if (supplier.performanceMetrics.acceptanceRate > 0) {
    const contribution = supplier.performanceMetrics.acceptanceRate > 80 ? 15 : 5;
    explanations.push({
      featureName: "Success Rate",
      contribution,
      explanation: `${supplier.performanceMetrics.acceptanceRate}% success rate with previous RFQs.`
    });
  }
  
  if (supplier.performanceMetrics.avgResponseTime > 0) {
    const contribution = supplier.performanceMetrics.avgResponseTime < 12 ? 10 : -5;
    explanations.push({
      featureName: "Response Time",
      contribution,
      explanation: `Average response time of ${supplier.performanceMetrics.avgResponseTime} hours.`
    });
  }
  
  // Verification status
  if (supplier.isVerified) {
    explanations.push({
      featureName: "Verified Status",
      contribution: 10,
      explanation: "Verified supplier with validated credentials and business information."
    });
  }
  
  return explanations;
}
import { RFQData, SupplierData } from '../types';
import * as tf from '@tensorflow/tfjs-node';

export class RFQSuccessPredictor {
  private model: tf.LayersModel;

  constructor() {
    this.model = this.buildModel();
  }

  private buildModel(): tf.LayersModel {
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [10], units: 16, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ units: 8, activation: 'relu' }),
        tf.layers.dense({ units: 1, activation: 'sigmoid' })
      ]
    });

    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  async predictSuccessRate(rfq: RFQData, supplier: SupplierData): Promise<number> {
    const features = this.extractFeatures(rfq, supplier);
    const prediction = this.model.predict(features) as tf.Tensor;
    const successRate = await prediction.data();
    return successRate[0];
  }

  private extractFeatures(rfq: RFQData, supplier: SupplierData): tf.Tensor {
    return tf.tensor2d([
      [
        supplier.responseTime,
        supplier.qualityScore,
        supplier.deliveryReliability,
        supplier.priceCompetitiveness,
        supplier.industryExperience,
        rfq.urgency,
        rfq.estimatedValue,
        rfq.complexity,
        this.calculateCategoryMatch(rfq, supplier),
        this.calculateLocationScore(rfq, supplier)
      ]
    ]);
  }

  private calculateCategoryMatch(rfq: RFQData, supplier: SupplierData): number {
    const commonCategories = rfq.categories.filter(c => 
      supplier.categories.includes(c)
    ).length;
    return commonCategories / rfq.categories.length;
  }

  private calculateLocationScore(rfq: RFQData, supplier: SupplierData): number {
    // Simplified distance calculation
    return rfq.location === supplier.location ? 1.0 : 0.5;
  }
}
