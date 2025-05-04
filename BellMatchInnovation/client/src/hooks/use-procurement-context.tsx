import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '../lib/queryClient';

// Types for the business context
export interface KeyMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  isImportant?: boolean;
  category?: string;
  lastUpdated?: Date;
}

export interface MarketInsight {
  id: string;
  title: string;
  description: string;
  category: string;
  source: string;
  publishedDate: Date;
  relevance: number;
}

export interface CategoryTrend {
  id: string;
  category: string;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  priceChange: number;
  demandChange: number;
  supplyChange: number;
  riskLevel: 'low' | 'medium' | 'high';
  predictedTrend: 'up' | 'down' | 'stable';
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  category: string;
  createdAt: Date;
  isRead: boolean;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
  priority: number;
  implementedAt?: Date;
}

/**
 * Procurement Context Hook
 * 
 * Provides business context for the procurement process including market insights,
 * key metrics, category trends, and recommendations.
 */
export function useProcurementContext(userId?: number | null) {
  // State for the business context
  const [businessContext, setBusinessContext] = useState<{
    keyMetrics: KeyMetric[];
    marketInsights: MarketInsight[];
    categoryTrends: CategoryTrend[];
    recommendations: Recommendation[];
    alerts: Alert[];
  }>({
    keyMetrics: [],
    marketInsights: [],
    categoryTrends: [],
    recommendations: [],
    alerts: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load business context
  const loadBusinessContext = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, we would make API calls to fetch this data
      // For demo purposes, we'll populate with realistic mock data
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Key metrics
      const keyMetrics: KeyMetric[] = [
        {
          id: '1',
          name: 'Average Order Value',
          value: 5280,
          unit: 'USD',
          trend: 'up',
          changePercentage: 4.2,
          isImportant: true,
          category: 'Finance',
          lastUpdated: new Date(Date.now() - 86400000) // 1 day ago
        },
        {
          id: '2',
          name: 'Supplier On-Time Delivery',
          value: 94.8,
          unit: '%',
          trend: 'up',
          changePercentage: 1.2,
          isImportant: true,
          category: 'Performance',
          lastUpdated: new Date(Date.now() - 172800000) // 2 days ago
        },
        {
          id: '3',
          name: 'Spend Under Management',
          value: 78.3,
          unit: '%',
          trend: 'up',
          changePercentage: 5.7,
          category: 'Finance',
          lastUpdated: new Date(Date.now() - 259200000) // 3 days ago
        },
        {
          id: '4',
          name: 'Supplier Defect Rate',
          value: 1.7,
          unit: '%',
          trend: 'down',
          changePercentage: -0.5,
          category: 'Quality',
          lastUpdated: new Date(Date.now() - 345600000) // 4 days ago
        },
        {
          id: '5',
          name: 'Average Lead Time',
          value: 18,
          unit: 'days',
          trend: 'stable',
          changePercentage: 0,
          category: 'Logistics',
          lastUpdated: new Date(Date.now() - 432000000) // 5 days ago
        },
        {
          id: '6',
          name: 'Procurement Cost Savings',
          value: 12.4,
          unit: '%',
          trend: 'up',
          changePercentage: 3.1,
          isImportant: true,
          category: 'Finance',
          lastUpdated: new Date(Date.now() - 518400000) // 6 days ago
        }
      ];
      
      // Market insights
      const marketInsights: MarketInsight[] = [
        {
          id: '1',
          title: 'Semiconductor Shortages Expected to Continue',
          description: 'Global semiconductor shortages are projected to continue through Q3 2025, affecting pricing and availability of electronic components.',
          category: 'Electronics',
          source: 'Industry Analysis Report',
          publishedDate: new Date(Date.now() - 259200000), // 3 days ago
          relevance: 0.9
        },
        {
          id: '2',
          title: 'Steel Prices Stabilizing After Volatility',
          description: 'After 18 months of extreme volatility, global steel prices are showing signs of stabilization, with regional variations diminishing.',
          category: 'Raw Materials',
          source: 'Commodity Market Report',
          publishedDate: new Date(Date.now() - 345600000), // 4 days ago
          relevance: 0.85
        },
        {
          id: '3',
          title: 'Logistics Costs Rising Due to Fuel Surcharges',
          description: 'Transportation providers are implementing fuel surcharges, increasing logistics costs by an average of 8-12% compared to Q1.',
          category: 'Logistics',
          source: 'Transportation Index',
          publishedDate: new Date(Date.now() - 432000000), // 5 days ago
          relevance: 0.9
        },
        {
          id: '4',
          title: 'Sustainable Packaging Demand Growing 25% YoY',
          description: 'Corporate sustainability initiatives are driving significant growth in demand for eco-friendly packaging solutions across all industries.',
          category: 'Packaging',
          source: 'Sustainability Report',
          publishedDate: new Date(Date.now() - 518400000), // 6 days ago
          relevance: 0.75
        },
        {
          id: '5',
          title: 'IT Services Moving to Outcome-Based Pricing',
          description: 'The IT services market is rapidly shifting toward outcome-based pricing models rather than traditional time and materials contracts.',
          category: 'IT Services',
          source: 'Technology Procurement Review',
          publishedDate: new Date(Date.now() - 604800000), // 7 days ago
          relevance: 0.8
        }
      ];
      
      // Category trends
      const categoryTrends: CategoryTrend[] = [
        {
          id: '1',
          category: 'Office Supplies',
          trend: 'stable',
          changePercentage: 0.2,
          priceChange: 0.5,
          demandChange: -2.1,
          supplyChange: 1.5,
          riskLevel: 'low',
          predictedTrend: 'stable'
        },
        {
          id: '2',
          category: 'IT Equipment',
          trend: 'up',
          changePercentage: 7.3,
          priceChange: 5.2,
          demandChange: 12.5,
          supplyChange: -2.0,
          riskLevel: 'medium',
          predictedTrend: 'up'
        },
        {
          id: '3',
          category: 'Professional Services',
          trend: 'up',
          changePercentage: 4.1,
          priceChange: 6.5,
          demandChange: 8.0,
          supplyChange: 3.0,
          riskLevel: 'low',
          predictedTrend: 'up'
        },
        {
          id: '4',
          category: 'Logistics',
          trend: 'up',
          changePercentage: 8.5,
          priceChange: 9.8,
          demandChange: 3.2,
          supplyChange: -1.5,
          riskLevel: 'high',
          predictedTrend: 'up'
        },
        {
          id: '5',
          category: 'Raw Materials',
          trend: 'down',
          changePercentage: -3.2,
          priceChange: -5.0,
          demandChange: 1.5,
          supplyChange: 7.0,
          riskLevel: 'medium',
          predictedTrend: 'stable'
        },
        {
          id: '6',
          category: 'Software',
          trend: 'up',
          changePercentage: 6.7,
          priceChange: 4.5,
          demandChange: 15.0,
          supplyChange: 8.0,
          riskLevel: 'low',
          predictedTrend: 'up'
        },
        {
          id: '7',
          category: 'Maintenance',
          trend: 'stable',
          changePercentage: 1.1,
          priceChange: 2.3,
          demandChange: 0.5,
          supplyChange: 1.0,
          riskLevel: 'low',
          predictedTrend: 'stable'
        }
      ];
      
      // Recommendations
      const recommendations: Recommendation[] = [
        {
          id: '1',
          title: 'Consolidate Office Supplies Vendors',
          description: 'Reduce the number of office supplies vendors from 12 to 3-4 strategic suppliers to improve pricing and streamline ordering.',
          category: 'Office Supplies',
          impact: 'medium',
          effort: 'low',
          priority: 7
        },
        {
          id: '2',
          title: 'Implement IT Hardware Standards',
          description: 'Standardize on 3-5 laptop/desktop configurations to reduce procurement complexity and improve support efficiency.',
          category: 'IT Equipment',
          impact: 'high',
          effort: 'medium',
          priority: 8
        },
        {
          id: '3',
          title: 'Negotiate Logistics Volume Discounts',
          description: 'Consolidate shipping volumes to qualify for higher tier discounts with primary carriers.',
          category: 'Logistics',
          impact: 'high',
          effort: 'medium',
          priority: 9
        },
        {
          id: '4',
          title: 'Switch to Subscription Software Licensing',
          description: 'Move from perpetual to subscription licensing models for better budget predictability and reduced upfront costs.',
          category: 'Software',
          impact: 'medium',
          effort: 'high',
          priority: 6
        },
        {
          id: '5',
          title: 'Implement Early Payment Discounts',
          description: 'Negotiate early payment discount terms with key suppliers to improve cash flow and reduce costs.',
          category: 'Finance',
          impact: 'high',
          effort: 'low',
          priority: 9
        }
      ];
      
      // Alerts
      const alerts: Alert[] = [
        {
          id: '1',
          title: 'IT Equipment Price Increases',
          description: 'Major hardware suppliers have announced 7-10% price increases effective next month due to component shortages.',
          severity: 'warning',
          category: 'IT Equipment',
          createdAt: new Date(Date.now() - 172800000), // 2 days ago
          isRead: false
        },
        {
          id: '2',
          title: 'New Sustainable Packaging Options',
          description: 'Three new certified sustainable packaging suppliers have been added to the approved vendor list.',
          severity: 'info',
          category: 'Packaging',
          createdAt: new Date(Date.now() - 345600000), // 4 days ago
          isRead: true
        },
        {
          id: '3',
          title: 'Critical Shipping Delays',
          description: 'Port congestion is causing 2-3 week delays for international shipments from Asia.',
          severity: 'critical',
          category: 'Logistics',
          createdAt: new Date(Date.now() - 86400000), // 1 day ago
          isRead: false
        }
      ];
      
      // Update state with fetched data
      setBusinessContext({
        keyMetrics,
        marketInsights,
        categoryTrends,
        recommendations,
        alerts
      });
    } catch (err) {
      console.error('Error loading business context:', err);
      setError('Failed to load business context. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Load business context on mount
  useEffect(() => {
    loadBusinessContext();
  }, [loadBusinessContext]);
  
  // Get trending categories
  const getTrendingCategories = useCallback((): string[] => {
    // Sort by changePercentage descending and take top 5
    return businessContext.categoryTrends
      .sort((a, b) => b.changePercentage - a.changePercentage)
      .slice(0, 5)
      .map(trend => trend.category);
  }, [businessContext.categoryTrends]);
  
  // Get insights for a category
  const getInsightsForCategory = useCallback((category: string): MarketInsight[] => {
    return businessContext.marketInsights
      .filter(insight => insight.category === category)
      .sort((a, b) => b.relevance - a.relevance);
  }, [businessContext.marketInsights]);
  
  // Get metrics for a category
  const getMetricsForCategory = useCallback((category: string): KeyMetric[] => {
    return businessContext.keyMetrics
      .filter(metric => metric.category === category);
  }, [businessContext.keyMetrics]);
  
  // Get recommendations for a category
  const getRecommendationsForCategory = useCallback((category: string): Recommendation[] => {
    return businessContext.recommendations
      .filter(recommendation => recommendation.category === category)
      .sort((a, b) => b.priority - a.priority);
  }, [businessContext.recommendations]);
  
  // Get alerts for a category
  const getAlertsForCategory = useCallback((category: string): Alert[] => {
    return businessContext.alerts
      .filter(alert => alert.category === category)
      .sort((a, b) => {
        // Sort by read status (unread first) then by severity
        if (a.isRead !== b.isRead) {
          return a.isRead ? 1 : -1;
        }
        
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      });
  }, [businessContext.alerts]);
  
  // Mark alert as read
  const markAlertAsRead = useCallback(async (alertId: string): Promise<boolean> => {
    try {
      // In a real app, we would make an API call
      // For demo, we'll just update the local state
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setBusinessContext(prevContext => ({
        ...prevContext,
        alerts: prevContext.alerts.map(alert => 
          alert.id === alertId ? { ...alert, isRead: true } : alert
        )
      }));
      
      return true;
    } catch (err) {
      console.error('Error marking alert as read:', err);
      return false;
    }
  }, []);
  
  // Mark recommendation as implemented
  const markRecommendationAsImplemented = useCallback(async (
    recommendationId: string
  ): Promise<boolean> => {
    try {
      // In a real app, we would make an API call
      // For demo, we'll just update the local state
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setBusinessContext(prevContext => ({
        ...prevContext,
        recommendations: prevContext.recommendations.map(recommendation => 
          recommendation.id === recommendationId 
            ? { ...recommendation, implementedAt: new Date() } 
            : recommendation
        )
      }));
      
      return true;
    } catch (err) {
      console.error('Error marking recommendation as implemented:', err);
      return false;
    }
  }, []);
  
  return {
    ...businessContext,
    isLoading,
    error,
    loadBusinessContext,
    getTrendingCategories,
    getInsightsForCategory,
    getMetricsForCategory,
    getRecommendationsForCategory,
    getAlertsForCategory,
    markAlertAsRead,
    markRecommendationAsImplemented
  };
}