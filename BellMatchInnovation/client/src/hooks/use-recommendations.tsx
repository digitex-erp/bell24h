import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Recommendation {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  budget: string | null;
  deadline: string | null;
  matchReason?: string;
  relevanceScore?: number;
  preferenceFactors?: {
    categoryMatch: number;
    budgetMatch: number;
    supplierTypeMatch: number;
    businessScaleMatch: number;
    qualityMatch: number;
  };
}

export function useRecommendations(userId: number, limit: number = 5) {
  const { 
    data: recommendations, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ["/api/recommendations/rfqs/personalized", userId, limit],
    queryFn: async () => {
      if (!userId) {
        return [];
      }
      
      try {
        const params = new URLSearchParams();
        params.append("userId", userId.toString());
        params.append("limit", limit.toString());
        
        const response = await apiRequest<Recommendation[]>(
          `/api/recommendations/rfqs/personalized?${params.toString()}`
        );
        
        return response;
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        throw error;
      }
    },
    enabled: Boolean(userId) && userId > 0
  });

  return {
    recommendations: recommendations || [],
    isLoading,
    isError,
    error,
    refetch
  };
}

export function useTrendingRecommendations(limit: number = 5, userId?: number) {
  const { 
    data: trendingRfqs, 
    isLoading, 
    isError,
    error 
  } = useQuery({
    queryKey: ["/api/recommendations/rfqs/trending", limit, userId],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        params.append("limit", limit.toString());
        if (userId) {
          params.append("userId", userId.toString());
        }
        
        const response = await apiRequest<any[]>(
          `/api/recommendations/rfqs/trending?${params.toString()}`
        );
        
        return response;
      } catch (error) {
        console.error("Error fetching trending RFQs:", error);
        throw error;
      }
    }
  });

  return {
    trendingRfqs: trendingRfqs || [],
    isLoading,
    isError,
    error
  };
}