import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { InfoIcon, CheckCircleIcon, XCircleIcon, PlusCircleIcon } from 'lucide-react';
import { SupplierRecommendationTooltip } from './SupplierRecommendationTooltip';
import type { SupplierRecommendation } from '@/hooks/useSupplierRecommendations';
import { 
  getScaleByScore, 
  getDurationByConfidence, 
  getStaggerDelay, 
  getContributionAnimationClass,
  getMatchScoreAnimationClass,
  animationClasses,
  getDelayClass,
  getDurationClass
} from '@/lib/animations';

interface SupplierRecommendationCardProps {
  recommendation: SupplierRecommendation;
  onSelect?: () => void;
  selected?: boolean;
  rfqSubmitted?: boolean;
  rank?: number;
}

export const SupplierRecommendationCard: React.FC<SupplierRecommendationCardProps> = ({
  recommendation,
  onSelect,
  selected = false,
  rfqSubmitted = false,
  rank
}) => {
  const { supplier, matchScore, matchExplanation } = recommendation;
  const [animated, setAnimated] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Calculate animation properties based on match score and confidence
  const avgConfidence = matchExplanation.reduce((acc, curr) => acc + Math.abs(curr.contribution), 0) / 
                        matchExplanation.length || 0.5;
  
  const animationDuration = getDurationByConfidence(avgConfidence);
  const animationDelay = getStaggerDelay(supplier.id % 10); // Use supplier ID for consistent staggering

  // Add animation once component is mounted
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Top 3 match reasons from feature contributions
  const topReasons = [...matchExplanation]
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 3);

  // Set background color based on match score
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'bg-green-100 border-green-200';
    if (score >= 60) return 'bg-blue-50 border-blue-100';
    if (score >= 40) return 'bg-yellow-50 border-yellow-100';
    return 'bg-gray-50 border-gray-100';
  };
  
  // Get animation classes for the card
  const getCardAnimationClasses = () => {
    if (!animated) return 'opacity-0 translate-y-4';
    return `${animationClasses.fadeIn} ${animationClasses.slideInUp} ${getDelayClass(animationDelay)}`;
  };

  return (
    <SupplierRecommendationTooltip
      supplierName={supplier.name}
      supplierRating={supplier.rating || undefined}
      matchScore={matchScore}
      isVerified={supplier.isVerified}
      featureContributions={matchExplanation}
      performanceMetrics={supplier.performanceMetrics}
    >
      <Card 
        className={`mb-4 cursor-pointer transition-all duration-500 hover:shadow-md ${getScoreColorClass(matchScore)} ${
          selected ? 'ring-2 ring-primary' : ''
        } ${getCardAnimationClasses()} ${getDurationClass(animationDuration)} relative`}
        onClick={onSelect}
        style={{ transform: `scale(${selected ? 1.02 : 1})` }}
      >
        {rank && rank <= 3 && (
          <div 
            className={`absolute -top-2 -left-2 w-8 h-8 rounded-full flex items-center justify-center 
            ${rank === 1 ? 'bg-amber-500' : rank === 2 ? 'bg-slate-400' : 'bg-amber-800'} 
            text-white font-bold text-sm z-10 shadow-md border-2 border-white
            ${animated ? animationClasses.pulse : 'opacity-0'}`}
          >
            #{rank}
          </div>
        )}
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-semibold text-base ${animated ? animationClasses.slideInLeft : 'opacity-0'} ${getDelayClass(animationDelay + 100)}`}>
                  {rank && rank > 3 && (
                    <span className="text-gray-500 text-xs font-normal mr-1.5">
                      #{rank}
                    </span>
                  )}
                  {supplier.name}
                </h3>
                {supplier.isVerified && (
                  <Badge 
                    variant="outline" 
                    className={`bg-green-50 text-green-700 border-green-200 ${animated ? animationClasses.fadeInScale : 'opacity-0'} ${getDelayClass(animationDelay + 300)}`}
                  >
                    <CheckCircleIcon size={14} className="mr-1" /> Verified
                  </Badge>
                )}
              </div>
              
              <div className={`text-sm text-gray-500 mb-3 line-clamp-2 ${animated ? animationClasses.fadeIn : 'opacity-0'} ${getDelayClass(animationDelay + 200)}`}>
                {supplier.description || 'No description available'}
              </div>
              
              <div className="mb-3">
                <div className={`flex justify-between mb-1 text-sm ${animated ? animationClasses.fadeIn : 'opacity-0'} ${getDelayClass(animationDelay + 250)}`}>
                  <span className="font-medium">Match Score</span>
                  <span className={`font-semibold ${getMatchScoreAnimationClass(matchScore)}`}>
                    {matchScore}%
                  </span>
                </div>
                <div className={`${animated ? animationClasses.barGrow : 'opacity-0'} ${getDelayClass(animationDelay + 300)}`}>
                  <Progress value={matchScore} className="h-2" />
                </div>
              </div>

              {topReasons.length > 0 && (
                <div className={`mt-2 space-y-1 ${animated ? animationClasses.fadeIn : 'opacity-0'} ${getDelayClass(animationDelay + 350)}`}>
                  {topReasons.map((reason, index) => (
                    <div 
                      key={index} 
                      className={`flex items-start text-xs text-gray-600 ${animated ? animationClasses.slideInRight : 'opacity-0'} ${getDelayClass(animationDelay + 400 + index * 100)}`}
                    >
                      <CheckCircleIcon size={14} className="mr-1 mt-0.5 text-green-500" />
                      <span className={`line-clamp-1 ${getContributionAnimationClass(reason.contribution * 100)}`}>
                        {reason.explanation}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end ml-4">
              {supplier.rating && (
                <div 
                  className={`flex items-center mb-2 bg-amber-50 text-amber-800 px-2 py-1 rounded text-sm 
                  ${animated ? animationClasses.fadeInScale : 'opacity-0'} ${getDelayClass(animationDelay + 300)}`}
                >
                  <span className="font-semibold mr-1">{supplier.rating.toFixed(1)}</span>
                  <span className={`text-amber-400 ${animationClasses.pulse}`}>★</span>
                </div>
              )}
              
              <Button 
                variant={selected ? "default" : "outline"}
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.();
                }}
                disabled={rfqSubmitted}
                className={`mt-2 transition-transform ${selected ? 'scale-105' : ''} 
                  ${animated ? animationClasses.fadeIn : 'opacity-0'} ${getDelayClass(animationDelay + 450)}`}
              >
                {selected ? (
                  <>
                    <CheckCircleIcon size={16} className={`mr-1 ${animationClasses.wiggle}`} /> Selected
                  </>
                ) : (
                  <>
                    <PlusCircleIcon size={16} className="mr-1" /> Select
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Performance metrics highlights */}
          <div 
            className={`grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600 
            ${animated ? animationClasses.fadeIn : 'opacity-0'} ${getDelayClass(animationDelay + 500)}`}
          >
            {supplier.performanceMetrics.avgResponseTime > 0 && (
              <div 
                className={`flex items-center ${animated ? animationClasses.slideInLeft : 'opacity-0'} 
                ${getDelayClass(animationDelay + 550)}`}
              >
                <span className="font-medium mr-1">Response Time:</span>
                <span 
                  className={supplier.performanceMetrics.avgResponseTime < 12 ? 'text-green-500 font-medium' : ''}
                >
                  {supplier.performanceMetrics.avgResponseTime < 24
                    ? `${Math.round(supplier.performanceMetrics.avgResponseTime)} hrs`
                    : `${Math.round(supplier.performanceMetrics.avgResponseTime / 24)} days`}
                </span>
              </div>
            )}
            
            {supplier.performanceMetrics.acceptanceRate > 0 && (
              <div 
                className={`flex items-center ${animated ? animationClasses.slideInRight : 'opacity-0'} 
                ${getDelayClass(animationDelay + 600)}`}
              >
                <span className="font-medium mr-1">Success Rate:</span>
                <span 
                  className={supplier.performanceMetrics.acceptanceRate > 80 ? 'text-green-500 font-medium' : ''}
                >
                  {supplier.performanceMetrics.acceptanceRate.toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </SupplierRecommendationTooltip>
  );
};