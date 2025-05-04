import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Types for the recommendation data
export interface FeatureContribution {
  featureName: string;
  contribution: number;
  explanation: string;
}

export interface PerformanceMetrics {
  avgResponseTime: number;
  acceptanceRate: number;
  completionRate: number;
  avgPriceCompetitiveness: number;
  similarRfqsCount: number;
  industrySpecificScore: number;
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

export interface SupplierRecommendationsResponse {
  rfq: {
    id: number;
    title: string;
    description: string;
    industry: string;
  };
  recommendations: SupplierRecommendation[];
}

export interface SupplierContextResponse {
  rfq: {
    id: number;
    title: string;
    industry: string;
  };
  supplier: {
    id: number;
    name: string;
    industry: string;
  };
  performanceHistory: {
    totalQuotes: number;
    acceptedQuotes: number;
    averageQuotePrice: number;
    previousMatchScores: number[];
    similarRfqs: {
      id: number;
      title: string;
      industry: string;
    }[];
  };
}

/**
 * Hook to fetch supplier recommendations for an RFQ
 */
export function useSupplierRecommendations(rfqId: number | null) {
  return useQuery({
    queryKey: ['/api/rfq', rfqId, 'supplier-recommendations'],
    queryFn: () => 
      apiRequest<SupplierRecommendationsResponse>(`/api/rfq/${rfqId}/supplier-recommendations`),
    enabled: !!rfqId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch additional context for a specific supplier-RFQ match
 */
export function useSupplierMatchContext(rfqId: number | null, supplierId: number | null) {
  return useQuery({
    queryKey: ['/api/rfq', rfqId, 'supplier', supplierId, 'context'],
    queryFn: () => 
      apiRequest<SupplierContextResponse>(`/api/rfq/${rfqId}/supplier/${supplierId}/context`),
    enabled: !!rfqId && !!supplierId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}