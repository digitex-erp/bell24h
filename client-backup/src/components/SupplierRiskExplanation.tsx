import React, { useState, useEffect } from 'react';
import { FeatureImportanceChart } from './FeatureImportanceChart';
import { PerplexityChart } from './PerplexityChart';

interface SupplierRiskExplanationProps {
  supplierId: number;
  showDetails?: boolean;
}

interface Feature {
  name: string;
  value: any;
  importance: number;
  description?: string;
}

interface ExplanationData {
  supplierId: number;
  riskScore: number;
  explanation: {
    shap?: {
      features: Feature[];
      modelConfidence?: number;
    };
    lime?: {
      features: Feature[];
    };
    perplexity?: {
      score: number;
      normalizedScore: number;
      category: string;
      interpretation: string;
    };
    combinedConfidence?: number;
    dataQualitySummary?: string;
  };
}

/**
 * SupplierRiskExplanation Component
 * 
 * Displays supplier risk score with SHAP/LIME explainability visualizations
 * using the Neon-powered supplier risk API.
 */
export const SupplierRiskExplanation: React.FC<SupplierRiskExplanationProps> = ({ 
  supplierId,
  showDetails = true
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExplanationData | null>(null);
  const [activeTab, setActiveTab] = useState<'shap' | 'lime' | 'perplexity'>('shap');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/supplier-risk-neon/${supplierId}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Error fetching supplier risk data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [supplierId]);

  if (loading) {
    return <div className="p-4 text-center">Loading supplier risk analysis...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        <h3 className="font-bold">Error loading risk analysis</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return <div className="p-4 text-center">No risk data available</div>;
  }

  // Get features based on active tab
  const features = activeTab === 'shap' 
    ? data.explanation.shap?.features 
    : activeTab === 'lime' 
      ? data.explanation.lime?.features 
      : [];

  // Format risk score as percentage
  const riskScorePercent = Math.round(data.riskScore * 100);
  
  // Determine risk level
  const getRiskLevel = (score: number) => {
    if (score < 0.3) return { label: 'Low Risk', color: 'bg-green-500' };
    if (score < 0.7) return { label: 'Medium Risk', color: 'bg-yellow-500' };
    return { label: 'High Risk', color: 'bg-red-500' };
  };
  
  const riskLevel = getRiskLevel(data.riskScore);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Supplier Risk Analysis</h2>
        <div className="flex items-center">
          <span className="mr-2">Risk Score:</span>
          <span className={`px-3 py-1 rounded-full text-white font-bold ${riskLevel.color}`}>
            {riskScorePercent}% - {riskLevel.label}
          </span>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('shap')}
            className={`py-2 px-4 font-medium ${
              activeTab === 'shap'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            SHAP Analysis
          </button>
          <button
            onClick={() => setActiveTab('lime')}
            className={`py-2 px-4 font-medium ${
              activeTab === 'lime'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            disabled={!data.explanation.lime?.features?.length}
          >
            LIME Analysis
          </button>
          <button
            onClick={() => setActiveTab('perplexity')}
            className={`py-2 px-4 font-medium ${
              activeTab === 'perplexity'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            disabled={!data.explanation.perplexity}
          >
            Perplexity Analysis
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      <div className="mb-6">
        {activeTab === 'shap' && data.explanation.shap && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Feature Importance</h3>
              <p className="text-gray-600 mb-4">
                SHAP values show how each feature contributes to the risk score prediction.
                Positive values (blue) decrease risk, negative values (red) increase risk.
              </p>
              
              {features && features.length > 0 ? (
                <FeatureImportanceChart 
                  features={features} 
                  modelType="risk"
                />
              ) : (
                <p>No feature importance data available</p>
              )}
            </div>
            
            {data.explanation.shap.modelConfidence !== undefined && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <span className="font-medium">Model Confidence:</span>{' '}
                {Math.round(data.explanation.shap.modelConfidence * 100)}%
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'lime' && data.explanation.lime && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Local Interpretable Explanations</h3>
              <p className="text-gray-600 mb-4">
                LIME creates a local approximation of the model to explain individual predictions.
              </p>
              
              {data.explanation.lime.features && data.explanation.lime.features.length > 0 ? (
                <FeatureImportanceChart 
                  features={data.explanation.lime.features} 
                  modelType="risk"
                />
              ) : (
                <p>No LIME explanation data available</p>
              )}
            </div>
          </div>
        )}
        
        {activeTab === 'perplexity' && data.explanation.perplexity && (
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Text Complexity Analysis</h3>
              <p className="text-gray-600 mb-4">
                Perplexity measures how complex or predictable the supplier data is.
                Lower perplexity indicates more predictable text.
              </p>
              
              <PerplexityChart 
                score={data.explanation.perplexity.normalizedScore}
                category={data.explanation.perplexity.category}
              />
              
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium mb-2">Interpretation</h4>
                <p>{data.explanation.perplexity.interpretation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Data quality summary */}
      {showDetails && data.explanation.dataQualitySummary && (
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h3 className="font-semibold mb-2">Data Quality Assessment</h3>
          <p>{data.explanation.dataQualitySummary}</p>
        </div>
      )}
      
      {/* Action buttons */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={() => window.location.href = `/suppliers/${supplierId}`}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md mr-2 hover:bg-gray-300"
        >
          View Supplier
        </button>
        <button
          onClick={async () => {
            try {
              await fetch(`/api/supplier-risk-neon/${supplierId}/recalculate`, {
                method: 'POST'
              });
              window.location.reload();
            } catch (err) {
              console.error('Error recalculating risk:', err);
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Recalculate Risk
        </button>
      </div>
    </div>
  );
};

export default SupplierRiskExplanation;
