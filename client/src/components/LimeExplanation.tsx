'use client';

import React, { useState, useEffect } from 'react';
import { Lightbulb, Info, CheckCircle, XCircle, AlertTriangle, Target, Zap } from 'lucide-react';

interface LimeExplanation {
  feature: string;
  value: string | number;
  weight: number;
  explanation: string;
  category: string;
  confidence: number;
}

interface LimeExplanationProps {
  explanations: LimeExplanation[];
  prediction: string;
  confidence: number;
  onFeatureClick?: (feature: string) => void;
}

export const LimeExplanation: React.FC<LimeExplanationProps> = ({
  explanations,
  prediction,
  confidence,
  onFeatureClick
}) => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'weight' | 'confidence'>('weight');

  // Sort explanations by selected criteria
  const sortedExplanations = [...explanations].sort((a, b) => {
    if (sortBy === 'weight') {
      return Math.abs(b.weight) - Math.abs(a.weight);
    }
    return b.confidence - a.confidence;
  });

  const getWeightColor = (weight: number) => {
    if (weight > 0.1) return 'text-green-600 bg-green-100';
    if (weight < -0.1) return 'text-red-600 bg-red-100';
    return 'text-gray-600 bg-gray-100';
  };

  const getWeightIcon = (weight: number) => {
    if (weight > 0.1) return <CheckCircle className="w-4 h-4" />;
    if (weight < -0.1) return <XCircle className="w-4 h-4" />;
    return <AlertTriangle className="w-4 h-4" />;
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'financial': return <Target className="w-4 h-4" />;
      case 'compliance': return <Zap className="w-4 h-4" />;
      case 'performance': return <Target className="w-4 h-4" />;
      case 'reliability': return <CheckCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.8) return 'text-green-600';
    if (confidence > 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6" data-testid="lime-explanation">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Lightbulb className="w-6 h-6 text-yellow-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">LIME Explanation</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'weight' | 'confidence')}
            className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="weight">Impact Weight</option>
            <option value="confidence">Confidence</option>
          </select>
        </div>
      </div>

      {/* Prediction Summary */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">AI Prediction</h4>
            <p className="text-lg font-semibold text-blue-600">{prediction}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Confidence</p>
            <p className={`text-lg font-semibold ${getConfidenceColor(confidence)}`}>
              {(confidence * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Feature Explanations */}
      <div className="space-y-3">
        {sortedExplanations.map((explanation, index) => (
          <div
            key={index}
            data-testid="lime-feature"
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              selectedFeature === explanation.feature
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => {
              setSelectedFeature(selectedFeature === explanation.feature ? null : explanation.feature);
              onFeatureClick?.(explanation.feature);
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getWeightColor(explanation.weight)}`}>
                    {getWeightIcon(explanation.weight)}
                    <span className="ml-1">
                      {explanation.weight > 0 ? 'Supports' : explanation.weight < 0 ? 'Opposes' : 'Neutral'}
                    </span>
                  </span>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 flex items-center">
                    {getCategoryIcon(explanation.category)}
                    <span className="ml-1">{explanation.category}</span>
                  </span>
                  <span className={`text-xs font-medium ${getConfidenceColor(explanation.confidence)}`}>
                    {(explanation.confidence * 100).toFixed(0)}% confident
                  </span>
                </div>
                
                <h4 className="font-medium text-gray-900 mb-1">{explanation.feature}</h4>
                <p className="text-sm text-gray-600 mb-2">Value: {explanation.value}</p>
                <p className="text-sm text-gray-700">{explanation.explanation}</p>
              </div>
              
              <div className="ml-4 text-right">
                <div className="text-sm font-medium text-gray-900" data-testid="feature-weight">
                  {explanation.weight > 0 ? '+' : ''}{explanation.weight.toFixed(3)}
                </div>
                <div className="text-xs text-gray-500">Weight</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Feature Details */}
      {selectedFeature && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg" data-testid="detailed-analysis">
          <h4 className="font-medium text-gray-900 mb-3">Detailed Analysis</h4>
          {(() => {
            const feature = explanations.find(e => e.feature === selectedFeature);
            if (!feature) return null;
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Feature:</span>
                  <p className="font-medium">{feature.feature}</p>
                </div>
                <div>
                  <span className="text-gray-600">Value:</span>
                  <p className="font-medium">{feature.value}</p>
                </div>
                <div>
                  <span className="text-gray-600">Impact Weight:</span>
                  <p className="font-medium">{feature.weight.toFixed(4)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Confidence:</span>
                  <p className="font-medium">{(feature.confidence * 100).toFixed(1)}%</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-gray-600">Explanation:</span>
                  <p className="font-medium mt-1">{feature.explanation}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>LIME (Local Interpretable Model-agnostic Explanations) shows how individual features influence the AI prediction for this specific supplier.</p>
      </div>
    </div>
  );
};

export default LimeExplanation;
