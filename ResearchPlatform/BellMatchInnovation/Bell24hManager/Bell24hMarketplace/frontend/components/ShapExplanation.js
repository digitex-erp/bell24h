import { useState } from 'react';

export default function ShapExplanation({ shapValues }) {
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Sort SHAP values by absolute magnitude
  const sortedShapValues = [...shapValues].sort((a, b) => 
    Math.abs(b.value) - Math.abs(a.value)
  );
  
  // Get top 5 most influential features
  const topFeatures = sortedShapValues.slice(0, 5);
  
  // Calculate max absolute value for scaling bar widths
  const maxAbsValue = Math.max(...topFeatures.map(item => Math.abs(item.value)));
  
  // Helper function to get bar width percentage
  const getBarWidth = (value) => {
    return `${(Math.abs(value) / maxAbsValue) * 100}%`;
  };
  
  // Helper function to get color based on impact (positive/negative)
  const getBarColor = (value) => {
    return value > 0 ? 'bg-green-500' : 'bg-red-500';
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setShowExplanation(!showExplanation)}
        className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
      >
        <svg 
          className="mr-1.5 h-5 w-5" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
            clipRule="evenodd" 
          />
        </svg>
        {showExplanation ? 'Hide AI match explanation' : 'Why this match?'}
      </button>
      
      {showExplanation && (
        <div className="mt-3 bg-gray-50 p-3 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Top factors influencing this match:
          </h4>
          <div className="space-y-2">
            {topFeatures.map((feature, index) => (
              <div key={index} className="text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{feature.name}</span>
                  <span className={feature.value > 0 ? 'text-green-600' : 'text-red-600'}>
                    {feature.value > 0 ? '+' : ''}{feature.value.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${getBarColor(feature.value)} h-2 rounded-full`}
                    style={{ width: getBarWidth(feature.value) }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{feature.explanation}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-gray-500">
            AI match scores are based on multiple factors including prior performance, price competitiveness, 
            delivery time, and GST compliance. Positive values indicate features that increase match quality, 
            while negative values indicate potential concerns.
          </p>
        </div>
      )}
    </div>
  );
}
