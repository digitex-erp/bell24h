import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { AiRecommendation, BusinessMetric } from '../../hooks/use-procurement-context';
import { Sparkles, ChevronDown, ChevronUp, CheckCircle, ArrowRight } from 'lucide-react';

interface MetricRecommendationsProps {
  metric: BusinessMetric;
  recommendations: AiRecommendation[];
  onGenerateRecommendation?: (metricId: string) => Promise<void>;
  className?: string;
}

/**
 * Component for displaying AI-generated recommendations for a metric
 */
export const MetricRecommendations: React.FC<MetricRecommendationsProps> = ({
  metric,
  recommendations,
  onGenerateRecommendation,
  className = ''
}) => {
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Toggle expanded state for a recommendation
  const toggleExpand = (recommendationId: string) => {
    setExpandedRecommendation(current => current === recommendationId ? null : recommendationId);
  };

  // Handle generating a new recommendation
  const handleGenerateRecommendation = async () => {
    if (!onGenerateRecommendation) return;
    
    setIsGenerating(true);
    try {
      await onGenerateRecommendation(metric.id);
    } catch (error) {
      console.error('Error generating recommendation:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center">
          <Sparkles className="h-5 w-5 mr-2" />
          AI Recommendations
        </h3>
        {onGenerateRecommendation && (
          <button
            className="text-xs px-2 py-1 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={handleGenerateRecommendation}
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate New'}
          </button>
        )}
      </div>

      {recommendations.length === 0 ? (
        <div className="text-center py-6 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">
            No recommendations available for this metric yet.
            {onGenerateRecommendation && ' Click "Generate New" to create one.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map(recommendation => (
            <div
              key={recommendation.id}
              className="p-3 rounded-md border bg-card shadow-sm"
            >
              <div 
                className="flex items-start cursor-pointer"
                onClick={() => toggleExpand(recommendation.id)}
              >
                <div className="p-2 rounded-full bg-primary/10 mr-3 flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{recommendation.recommendation}</p>
                  <p className="text-xs text-muted-foreground">
                    {recommendation.category} • {formatDistanceToNow(recommendation.createdAt, { addSuffix: true })}
                  </p>
                </div>
                <button className="ml-2 p-1 text-muted-foreground hover:text-foreground rounded-full">
                  {expandedRecommendation === recommendation.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>
              
              {expandedRecommendation === recommendation.id && (
                <div className="mt-3 pl-12">
                  {recommendation.implementationSteps && (
                    <div className="mb-2">
                      <p className="text-xs font-medium mb-1">Implementation Steps:</p>
                      <ul className="text-xs space-y-1">
                        {recommendation.implementationSteps.map((step, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-3 w-3 text-green-600 mr-1 mt-0.5 flex-shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {recommendation.expectedImpact && (
                    <div>
                      <p className="text-xs font-medium mb-1">Expected Impact:</p>
                      <p className="text-xs flex items-center">
                        <ArrowRight className="h-3 w-3 text-blue-600 mr-1 flex-shrink-0" />
                        {recommendation.expectedImpact}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MetricRecommendations;