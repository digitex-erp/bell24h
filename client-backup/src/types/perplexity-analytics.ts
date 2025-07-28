/**
 * Types for enhanced perplexity analytics features
 */

// Temporal analysis types
export interface TemporalTrend {
  period: string;
  averagePerplexity: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
  significantTerms: string[];
}

// Competitive intelligence types
export interface CompetitiveInsight {
  term: string;
  frequency: number;
  uniqueness: number;
  emergingScore: number;
  businessValue: number;
}

// Market segmentation types
export interface MarketSegment {
  id: string;
  name: string;
  size: number;
  averagePerplexity: number;
  averageDealSize?: number;
  keyTerms: string[];
  growthRate?: number;
}

// Success prediction types
export interface SuccessFactor {
  factor: string;
  impact: number;
}

export interface SuccessPrediction {
  entityId: string;
  entityType: 'rfq' | 'bid' | 'product';
  probability: number;
  confidenceScore: number;
  keyFactors: SuccessFactor[];
  recommendedActions: string[];
}

// Text improvement types
export interface PerplexityRecommendation {
  originalText: string;
  improvedText: string;
  originalPerplexity: number;
  improvedPerplexity: number;
  improvementRationale: string;
  businessImpact: string;
}

// Customer profile types
export interface CustomerPerplexityProfile {
  customerId: string;
  preferredComplexity: 'low' | 'medium' | 'high' | 'very-high';
  industrySpecificTerms: string[];
  responseRate: number;
  engagementScore: number;
  communicationPreferences: {
    detailLevel: 'minimal' | 'moderate' | 'detailed';
    formalityLevel: 'casual' | 'neutral' | 'formal';
    technicalLevel: 'basic' | 'moderate' | 'advanced';
  };
}

// Multilingual analysis types
export interface MultilingualAnalysisResult {
  perplexity: number;
  normalizedScore: number;
  detectedLanguage: string;
  translationConfidence: number;
  keyTerms: { term: string; confidence: number }[];
}
