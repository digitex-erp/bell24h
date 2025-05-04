
import React from 'react';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Tooltip } from '../ui/tooltip';
import { InfoIcon } from 'lucide-react';

interface FeatureContribution {
  feature: string;
  importance: number;
  description: string;
}

interface ExplanationProps {
  overallScore: number;
  featureContributions: FeatureContribution[];
}

const featureDescriptions: Record<string, string> = {
  industryMatch: 'How well the supplier\'s industry aligns with your requirements',
  locationScore: 'Geographical proximity and logistics efficiency',
  deliveryPerformance: 'Historical delivery reliability and timeliness',
  qualityScore: 'Product quality and consistency metrics',
  priceCompetitiveness: 'Price comparison with market averages'
};

export const SupplierExplanation: React.FC<ExplanationProps> = ({
  overallScore,
  featureContributions
}) => {
  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          Match Explanation
          <Tooltip content="Why this supplier was recommended">
            <InfoIcon className="w-4 h-4 text-gray-400" />
          </Tooltip>
        </h3>
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Progress value={overallScore * 100} className="h-2" />
            </div>
            <span className="text-sm font-medium">{Math.round(overallScore * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {featureContributions.map((contribution) => (
          <div key={contribution.feature} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{contribution.feature}</span>
              <span className="text-sm text-gray-500">
                {Math.round(contribution.importance * 100)}%
              </span>
            </div>
            <Tooltip content={featureDescriptions[contribution.feature]}>
              <Progress value={contribution.importance * 100} className="h-1" />
            </Tooltip>
          </div>
        ))}
      </div>
    </Card>
  );
};
