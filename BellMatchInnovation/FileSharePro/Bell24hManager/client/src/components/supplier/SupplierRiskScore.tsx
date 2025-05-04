
import React from 'react';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Alert } from '../ui/alert';
import { Badge } from '../ui/badge';
import { RiskScore, RiskFactor } from '@/types';

interface SupplierRiskScoreProps {
  riskScore: RiskScore;
}

export const SupplierRiskScore: React.FC<SupplierRiskScoreProps> = ({ riskScore }) => {
  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MODERATE': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'SEVERE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFactorColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold">Supplier Risk Assessment</h3>
          <p className="text-sm text-gray-500">Updated {new Date(riskScore.timestamp).toLocaleDateString()}</p>
        </div>
        <Badge className={`${getRiskLevelColor(riskScore.riskLevel)} text-xs font-semibold`}>
          {riskScore.riskLevel} RISK
        </Badge>
      </div>

      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium">Overall Risk Score</span>
          <span className={`text-sm font-semibold ${getFactorColor(riskScore.score)}`}>
            {Math.round(riskScore.score)}%
          </span>
        </div>
        <Progress value={riskScore.score} className="h-2" />
      </div>

      <div className="space-y-4">
        {riskScore.factors.map((factor: RiskFactor) => (
          <div key={factor.name} className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">{factor.name}</span>
              <span className={`text-sm font-semibold ${getFactorColor(factor.score)}`}>
                {Math.round(factor.score)}%
              </span>
            </div>
            <Progress value={factor.score} className="h-1.5 mb-2" />
            <div className="space-y-1">
              {factor.insights.map((insight, i) => (
                <p key={i} className="text-xs text-gray-500">{insight}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {riskScore.recommendations.length > 0 && (
        <div className="mt-6">
          <Alert variant="warning">
            <h4 className="font-semibold mb-2">Recommendations</h4>
            <ul className="text-sm space-y-1">
              {riskScore.recommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </Alert>
        </div>
      )}
    </Card>
  );
};
