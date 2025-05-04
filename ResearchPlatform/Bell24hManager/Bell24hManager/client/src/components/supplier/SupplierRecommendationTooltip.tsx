import React, { useState, useEffect } from 'react';
import {
  CheckCircleIcon,
  InfoIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import type { FeatureContribution, PerformanceMetrics } from '@/hooks/useSupplierRecommendations';
import { 
  getContributionAnimationClass,
  animationClasses,
  getDelayClass,
  getDurationClass
} from '@/lib/animations';

interface SupplierRecommendationProps {
  supplierName: string;
  supplierRating?: number;
  matchScore: number;
  isVerified: boolean;
  featureContributions: FeatureContribution[];
  performanceMetrics: PerformanceMetrics;
  children: React.ReactNode;
}

export const SupplierRecommendationTooltip: React.FC<SupplierRecommendationProps> = ({
  supplierName,
  supplierRating,
  matchScore,
  isVerified,
  featureContributions,
  performanceMetrics,
  children
}) => {
  // Animation state
  const [tooltipVisible, setTooltipVisible] = useState(false);
  
  // Sort contributions by their impact (positive or negative)
  const sortedFeatures = [...featureContributions].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  
  // Animation effect on tooltip open
  useEffect(() => {
    if (tooltipVisible) {
      // Reset animation when tooltip opens
      setTooltipVisible(true);
    }
  }, [tooltipVisible]);
  
  const formatMetricLabel = (name: string) => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };
  
  const formatMetricValue = (name: keyof PerformanceMetrics, value: number): string => {
    switch (name) {
      case 'avgResponseTime':
        return value < 24 ? `${value.toFixed(0)} hours` : `${(value / 24).toFixed(1)} days`;
      case 'acceptanceRate':
      case 'completionRate':
        return `${value.toFixed(0)}%`;
      case 'avgPriceCompetitiveness':
        // Lower is better for price competitiveness (% below average)
        return value < 0 ? `${Math.abs(value).toFixed(0)}% below avg` : `${value.toFixed(0)}% above avg`;
      case 'similarRfqsCount':
        return value.toString();
      case 'industrySpecificScore':
        return `${value.toFixed(0)}/100`;
      default:
        return value.toString();
    }
  };
  
  // Get animation class for contribution value
  const getContributionClass = (contribution: number) => {
    const baseClass = 'flex items-center';
    return `${baseClass} ${contribution > 0 ? animationClasses.positiveHighlight : animationClasses.negativeHighlight}`;
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300} onOpenChange={setTooltipVisible}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          className="w-80 p-0 bg-white border shadow-lg rounded-lg overflow-hidden animate-fade-in-scale" 
          side="right"
        >
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className={animationClasses.slideInLeft}>
                <h3 className="font-semibold text-lg">{supplierName}</h3>
                {isVerified && (
                  <div className={`flex items-center text-green-600 text-sm ${animationClasses.fadeIn} ${getDelayClass(150)}`}>
                    <CheckCircleIcon size={14} className={`mr-1 ${animationClasses.pulse}`} />
                    <span>Verified Supplier</span>
                  </div>
                )}
              </div>
              {supplierRating && (
                <div className={`flex items-center bg-amber-50 text-amber-800 px-2 py-1 rounded ${animationClasses.fadeInScale} ${getDelayClass(200)}`}>
                  <span className="font-bold mr-1">{supplierRating.toFixed(1)}</span>
                  <StarIcon size={14} className={`fill-amber-400 text-amber-400 ${animationClasses.pulse}`} />
                </div>
              )}
            </div>
            
            <div className={`mb-4 ${animationClasses.fadeIn} ${getDelayClass(250)}`}>
              <div className="flex justify-between mb-1">
                <span className="font-medium">Match Score</span>
                <span className={`font-semibold ${matchScore >= 80 ? 'text-green-600' : matchScore >= 60 ? 'text-blue-600' : 'text-gray-600'}`}>
                  {matchScore}%
                </span>
              </div>
              <div className={animationClasses.barGrow}>
                <Progress value={matchScore} className="h-2.5" />
              </div>
            </div>
            
            <div className={`border-t border-gray-100 pt-3 mb-4 ${animationClasses.fadeIn} ${getDelayClass(300)}`}>
              <h4 className="font-medium mb-2 text-sm">Key Match Factors</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {sortedFeatures.slice(0, 5).map((feature, idx) => (
                  <div 
                    key={idx} 
                    className={`text-sm ${animationClasses.slideInRight} ${getDelayClass(350 + idx * 50)}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{feature.featureName}</span>
                      <div className={getContributionClass(feature.contribution)}>
                        {feature.contribution > 0 ? (
                          <ArrowUpIcon size={14} className={`text-green-500 mr-1 ${animationClasses.slideInUp}`} />
                        ) : (
                          <ArrowDownIcon size={14} className={`text-red-500 mr-1 ${animationClasses.slideInUp}`} />
                        )}
                        <span className={feature.contribution > 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                          {feature.contribution > 0 ? "+" : ""}{feature.contribution}%
                        </span>
                      </div>
                    </div>
                    <p className={`text-xs text-gray-600 ${getContributionAnimationClass(feature.contribution * 100)}`}>
                      {feature.explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className={`border-t border-gray-100 pt-3 ${animationClasses.fadeIn} ${getDelayClass(600)}`}>
              <h4 className="font-medium mb-2 text-sm">Performance Metrics</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {Object.entries(performanceMetrics).map(([key, value], idx) => (
                  <div 
                    key={key} 
                    className={`text-xs ${idx % 2 === 0 ? animationClasses.slideInLeft : animationClasses.slideInRight} ${getDelayClass(650 + idx * 40)}`}
                  >
                    <div className="text-gray-500">{formatMetricLabel(key)}</div>
                    <div className="font-medium">
                      {formatMetricValue(key as keyof PerformanceMetrics, value)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Simplified version for smaller hover cards
export const SimpleSupplierTooltip: React.FC<{
  supplier: {
    name: string;
    industry: string;
    isVerified?: boolean;
    description?: string | null;
  };
  children: React.ReactNode;
}> = ({ supplier, children }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  
  return (
    <TooltipProvider>
      <Tooltip onOpenChange={setTooltipVisible}>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent className="w-64 p-3 animate-fade-in-scale">
          <div className={`mb-1 flex items-center gap-1 ${animationClasses.slideInLeft}`}>
            <h4 className="font-semibold">{supplier.name}</h4>
            {supplier.isVerified && (
              <CheckCircleIcon 
                size={14} 
                className={`text-green-500 ${animationClasses.pulse}`} 
              />
            )}
          </div>
          <div className={`text-xs text-gray-500 mb-2 ${animationClasses.fadeIn} ${getDelayClass(100)}`}>
            {supplier.industry}
          </div>
          {supplier.description && (
            <p className={`text-sm line-clamp-2 ${animationClasses.slideInUp} ${getDelayClass(150)}`}>
              {supplier.description}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
import React from 'react';
import { Tooltip } from '../ui/tooltip';
import { Progress } from '../ui/progress';

interface FeatureImportance {
  feature: string;
  importance: number;
  contribution: number;
}

interface ExplanationProps {
  featureImportance: FeatureImportance[];
  localExplanation: string;
  confidenceScore: number;
}

export const SupplierRecommendationTooltip: React.FC<ExplanationProps> = ({
  featureImportance,
  localExplanation,
  confidenceScore
}) => {
  return (
    <div className="p-4 max-w-md">
      <h3 className="font-semibold mb-2">Why this recommendation?</h3>
      <p className="text-sm text-gray-600 mb-4">{localExplanation}</p>
      
      <div className="space-y-3">
        {featureImportance.map(({ feature, importance, contribution }) => (
          <div key={feature}>
            <div className="flex justify-between text-sm">
              <span>{feature}</span>
              <span className={contribution > 0 ? 'text-green-600' : 'text-red-600'}>
                {contribution > 0 ? '+' : ''}{Math.round(contribution * 100)}%
              </span>
            </div>
            <Progress value={importance * 100} className="h-2" />
          </div>
        ))}
      </div>
      
      <div className="mt-4 flex items-center">
        <span className="text-sm mr-2">Confidence Score:</span>
        <span className="font-semibold">{Math.round(confidenceScore * 100)}%</span>
      </div>
    </div>
  );
};
