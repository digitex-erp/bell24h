import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SupplierRecommendation {
  id: number;
  rfqId: number;
  supplierId: number;
  matchScore: number;
  matchReason: string;
  matchFactors: Array<{
    factor: string;
    weight: number;
    score: number;
    explanation: string;
  }>;
  recommended: boolean;
  contacted: boolean;
  responded: boolean;
  createdAt: string;
  updatedAt: string;
  supplier?: {
    id: number;
    companyName: string;
    description: string;
    logo: string | null;
    categories: string[];
    verified: boolean;
    riskScore: number | null;
    riskGrade: string | null;
    location: string;
  };
}

interface FeedbackData {
  rfqId: number;
  supplierId: number;
  wasSuccessful: boolean;
  buyerFeedback?: number;
  supplierFeedback?: number;
  feedbackNotes?: string;
}

export function useSupplierMatch(rfqId?: number) {
  const [isGeneratingMatches, setIsGeneratingMatches] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to fetch supplier recommendations for an RFQ
  const recommendationsQuery = useQuery({
    queryKey: ['/api/supplier-recommendations', rfqId],
    queryFn: async () => {
      if (!rfqId) return [];
      const response = await apiRequest(`/api/supplier-recommendations/${rfqId}`);
      return response as SupplierRecommendation[];
    },
    enabled: !!rfqId,
  });

  // Mutation to generate new supplier matches
  const generateMatchesMutation = useMutation({
    mutationFn: async ({ id, useAdvancedAlgorithms = true }: { id: number, useAdvancedAlgorithms?: boolean }) => {
      setIsGeneratingMatches(true);
      const response = await apiRequest(`/api/supplier-matching/${id}`, {
        method: 'POST',
        data: { useAdvancedAlgorithms }
      });
      return response as SupplierRecommendation[];
    },
    onSuccess: (data) => {
      // Invalidate and refetch the recommendations
      queryClient.invalidateQueries({ queryKey: ['/api/supplier-recommendations', rfqId] });
      
      // Determine the message based on the recommendation quality
      const highQualityMatches = data.filter(match => match.matchScore >= 80).length;
      const totalMatches = data.length;
      
      let description = 'Supplier matches generated successfully';
      if (highQualityMatches > 0) {
        description = `Found ${totalMatches} suppliers including ${highQualityMatches} high-quality matches`;
      }
      
      toast({
        title: 'Success',
        description,
      });
      setIsGeneratingMatches(false);
    },
    onError: (error) => {
      console.error('Error generating matches:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate supplier matches',
        variant: 'destructive',
      });
      setIsGeneratingMatches(false);
    },
  });

  // Mutation to update historical match data
  const updateHistoricalMatchMutation = useMutation({
    mutationFn: async (data: FeedbackData) => {
      const response = await apiRequest('/api/supplier-matching/historical-feedback', {
        method: 'POST',
        data,
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Feedback Recorded',
        description: 'Your feedback has been recorded and will help improve future matches',
      });
    },
    onError: (error) => {
      console.error('Error recording feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to record feedback',
        variant: 'destructive',
      });
    },
  });

  // Function to notify users about new matches via WebSocket
  const notifyAboutMatches = async (rfqId: number, message: string) => {
    try {
      await apiRequest('/api/supplier-matching/notify', {
        method: 'POST',
        data: { rfqId, message },
      });
      return true;
    } catch (error) {
      console.error('Error sending match notification:', error);
      return false;
    }
  };

  // Generate explanation for why a supplier matched
  const generateMatchExplanation = (recommendation: SupplierRecommendation): string => {
    if (recommendation.matchReason) {
      return recommendation.matchReason;
    }

    if (recommendation.matchFactors && recommendation.matchFactors.length > 0) {
      // Sort factors by score * weight (descending)
      const sortedFactors = [...recommendation.matchFactors]
        .sort((a, b) => (b.score * b.weight) - (a.score * a.weight));

      // Take top 2 factors
      const topFactors = sortedFactors.slice(0, 2);
      
      return topFactors
        .map(f => f.explanation)
        .filter(e => e && e.length > 0)
        .join('. ') || 'This supplier is a match based on multiple factors.';
    }

    return `This supplier has a match score of ${recommendation.matchScore}%.`;
  };

  // Format match score as a percentage
  const formatMatchScore = (score: number): string => {
    return `${Math.round(score)}%`;
  };

  return {
    recommendations: recommendationsQuery.data || [],
    isLoading: recommendationsQuery.isLoading,
    isError: recommendationsQuery.isError,
    error: recommendationsQuery.error,
    isGeneratingMatches,
    generateMatches: (id: number, useAdvancedAlgorithms = true) => 
      generateMatchesMutation.mutate({ id, useAdvancedAlgorithms }),
    generateBasicMatches: (id: number) => 
      generateMatchesMutation.mutate({ id, useAdvancedAlgorithms: false }),
    generateAdvancedMatches: (id: number) => 
      generateMatchesMutation.mutate({ id, useAdvancedAlgorithms: true }),
    submitFeedback: (data: FeedbackData) => updateHistoricalMatchMutation.mutate(data),
    notifyAboutMatches,
    generateMatchExplanation,
    formatMatchScore,
    refetchRecommendations: recommendationsQuery.refetch,
    
    // Helper for visualizing match factors in UI
    getVisualMatchFactors: (recommendation: SupplierRecommendation) => {
      if (!recommendation.matchFactors || recommendation.matchFactors.length === 0) {
        return [];
      }
      
      // Sort factors by contribution (weight * score)
      return [...recommendation.matchFactors]
        .sort((a, b) => (b.weight * b.score) - (a.weight * a.score))
        .slice(0, 5) // Show top 5 factors
        .map(factor => ({
          name: factor.factor.replace(/_/g, ' '),
          score: factor.score,
          weight: factor.weight,
          contribution: (factor.score * factor.weight) / 100,
          explanation: factor.explanation
        }));
    },
    
    // Group recommendations by algorithm source
    groupRecommendationsByAlgorithm: (recommendations: SupplierRecommendation[]) => {
      const groups: Record<string, SupplierRecommendation[]> = {
        'AI Powered': [],
        'Collaborative': [],
        'Trending': [],
        'Feature Based': [],
        'Basic Match': []
      };
      
      recommendations.forEach(rec => {
        if (!rec.matchFactors || rec.matchFactors.length === 0) {
          groups['Basic Match'].push(rec);
          return;
        }
        
        // Find algorithm tags in the factors
        const hasAlgorithm = (prefix: string) => 
          rec.matchFactors.some(f => f.factor.startsWith(prefix));
        
        if (hasAlgorithm('algorithm_aiSemantic')) {
          groups['AI Powered'].push(rec);
        } else if (hasAlgorithm('algorithm_collaborative') || hasAlgorithm('similar_rfq')) {
          groups['Collaborative'].push(rec);
        } else if (hasAlgorithm('algorithm_timeSeries') || hasAlgorithm('feedback_trend')) {
          groups['Trending'].push(rec);
        } else if (hasAlgorithm('algorithm_featureBased')) {
          groups['Feature Based'].push(rec);
        } else {
          groups['Basic Match'].push(rec);
        }
      });
      
      return groups;
    }
  };
}