'use client';
import { AlertCircle, Brain, Loader2, Target } from 'lucide-react';
import { useState } from 'react';

interface ExplanationData {
  supplier_id: string;
  supplier_name: string;
  match_score: number;
  explanations: {
    shap?: any;
    lime?: any;
  };
}

export default function AIMatchingPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [explanations, setExplanations] = useState<ExplanationData[]>([]);
  const [error, setError] = useState('');

  const sampleRFQ = {
    rfq_id: 'RFQ-001',
    title: 'Industrial IoT Sensors Required',
    description: 'Need 500 units of industrial IoT sensors for smart manufacturing',
    category: 'Electronics',
    budget_min: 400000,
    budget_max: 600000,
    quantity: 500,
    urgency: 'medium',
    location: 'Mumbai',
    specifications: ['IoT enabled', 'Industrial grade', 'Temperature sensors'],
  };

  const sampleSuppliers = [
    {
      supplier_id: 'SUP-001',
      name: 'TechSensors India',
      category_expertise: ['Electronics', 'IoT', 'Sensors'],
      rating: 4.8,
      location: 'Mumbai',
      price_range: 'medium',
      delivery_capability: 'fast',
      certifications: ['ISO 9001', 'CE'],
      past_performance: 92,
    },
    {
      supplier_id: 'SUP-002',
      name: 'SmartDevices Corp',
      category_expertise: ['Electronics', 'Smart Devices'],
      rating: 4.2,
      location: 'Delhi',
      price_range: 'low',
      delivery_capability: 'medium',
      certifications: ['ISO 9001'],
      past_performance: 78,
    },
    {
      supplier_id: 'SUP-003',
      name: 'Premium IoT Solutions',
      category_expertise: ['IoT', 'Industrial'],
      rating: 4.9,
      location: 'Bangalore',
      price_range: 'high',
      delivery_capability: 'fast',
      certifications: ['ISO 9001', 'CE', 'FCC'],
      past_performance: 96,
    },
  ];

  const generateExplanations = async () => {
    setIsAnalyzing(true);
    setError('');

    try {
      const response = await fetch('/api/ai-explainability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rfq: sampleRFQ,
          suppliers: sampleSuppliers,
          explanation_type: 'both',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setExplanations(result.data.explanations);
      } else {
        setError(result.error || 'Failed to generate explanations');
      }
    } catch (err) {
      setError('Network error connecting to AI service');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const renderFeatureImportance = (explanation: any) => {
    if (!explanation) return null;

    const features = Object.entries(explanation.feature_importance || {});

    return (
      <div className='space-y-2'>
        {features.map(([feature, data]: [string, any]) => (
          <div key={feature} className='flex items-center justify-between p-2 bg-gray-50 rounded'>
            <span className='text-sm font-medium text-gray-700 capitalize'>
              {feature.replace(/_/g, ' ')}
            </span>
            <div className='flex items-center'>
              <div className='w-16 bg-gray-200 rounded-full h-2 mr-2'>
                <div
                  className={`h-2 rounded-full ${data.importance > 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  style={{ width: `${Math.abs(data.importance) * 100}%` }}
                ></div>
              </div>
              <span className='text-xs text-gray-600'>{(data.importance * 100).toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h2 className='text-2xl font-bold text-gray-900 flex items-center mb-2'>
          <Brain className='w-8 h-8 mr-3 text-blue-600' />
          AI Matching with Explainability
        </h2>
        <p className='text-gray-600 mb-4'>
          SHAP/LIME explanations for transparent supplier-RFQ matching decisions
        </p>

        <div className='flex items-center space-x-4 text-sm'>
          <div className='flex items-center text-green-600'>
            <span>✅</span>
            SHAP Global Explanations
          </div>
          <div className='flex items-center text-blue-600'>
            <span>✅</span>
            LIME Local Explanations
          </div>
          <div className='flex items-center text-purple-600'>
            <span>✅</span>
            Real-time Analysis
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 mb-4'>Demo: Explainable AI Matching</h3>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          <div>
            <h4 className='font-medium text-gray-900 mb-2'>Sample RFQ</h4>
            <div className='bg-gray-50 rounded-lg p-4 text-sm'>
              <p>
                <strong>Title:</strong> {sampleRFQ.title}
              </p>
              <p>
                <strong>Category:</strong> {sampleRFQ.category}
              </p>
              <p>
                <strong>Quantity:</strong> {sampleRFQ.quantity} units
              </p>
              <p>
                <strong>Budget:</strong> ₹{(sampleRFQ.budget_min / 100000).toFixed(1)}L - ₹
                {(sampleRFQ.budget_max / 100000).toFixed(1)}L
              </p>
              <p>
                <strong>Location:</strong> {sampleRFQ.location}
              </p>
            </div>
          </div>

          <div>
            <h4 className='font-medium text-gray-900 mb-2'>Available Suppliers</h4>
            <div className='space-y-2'>
              {sampleSuppliers.map(supplier => (
                <div key={supplier.supplier_id} className='bg-gray-50 rounded-lg p-3 text-sm'>
                  <div className='flex justify-between items-center'>
                    <span className='font-medium'>{supplier.name}</span>
                    <span className='text-yellow-600'>★ {supplier.rating}</span>
                  </div>
                  <p className='text-gray-600'>
                    {supplier.location} • {supplier.price_range} price
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={generateExplanations}
          disabled={isAnalyzing}
          className='bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center mx-auto'
        >
          {isAnalyzing ? (
            <Loader2 className='w-5 h-5 mr-2 animate-spin' />
          ) : (
            <Brain className='w-5 h-5 mr-2' />
          )}
          {isAnalyzing ? 'Analyzing with AI...' : 'Generate AI Explanations'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <div className='flex items-center'>
            <AlertCircle className='w-5 h-5 text-red-600 mr-2' />
            <span className='text-red-800'>{error}</span>
          </div>
        </div>
      )}

      {/* Explanations Results */}
      {explanations.length > 0 && (
        <div className='space-y-6'>
          <h3 className='text-lg font-semibold text-gray-900'>AI Matching Explanations</h3>

          {explanations.map((explanation, index) => (
            <div
              key={explanation.supplier_id}
              className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'
            >
              <div className='flex justify-between items-start mb-4'>
                <div>
                  <h4 className='text-lg font-semibold text-gray-900'>
                    {explanation.supplier_name}
                  </h4>
                  <p className='text-sm text-gray-600'>Supplier ID: {explanation.supplier_id}</p>
                </div>
                <div className='text-right'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {(explanation.match_score * 100).toFixed(1)}%
                  </div>
                  <div className='text-sm text-gray-500'>Match Score</div>
                </div>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {explanation.explanations.shap && (
                  <div>
                    <h5 className='font-medium text-gray-900 mb-3 flex items-center'>
                      <span>📊</span>
                      SHAP Explanation (Global Model Impact)
                    </h5>
                    {renderFeatureImportance(explanation.explanations.shap)}
                  </div>
                )}

                {explanation.explanations.lime && (
                  <div>
                    <h5 className='font-medium text-gray-900 mb-3 flex items-center'>
                      <Target className='w-4 h-4 mr-2 text-blue-600' />
                      LIME Explanation (Local Instance Impact)
                    </h5>
                    {renderFeatureImportance(explanation.explanations.lime)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Technical Information */}
      <div className='bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200'>
        <h3 className='text-lg font-semibold text-gray-900 mb-3'>Explainable AI Technology</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <h4 className='font-medium text-gray-900 mb-2'>SHAP (SHapley Additive exPlanations)</h4>
            <ul className='text-sm text-gray-700 space-y-1'>
              <li>• Global model behavior explanation</li>
              <li>• Feature importance across all predictions</li>
              <li>• Game theory-based fair attribution</li>
              <li>• Consistent and efficient explanations</li>
            </ul>
          </div>
          <div>
            <h4 className='font-medium text-gray-900 mb-2'>
              LIME (Local Interpretable Model-agnostic Explanations)
            </h4>
            <ul className='text-sm text-gray-700 space-y-1'>
              <li>• Local instance-specific explanations</li>
              <li>• Model-agnostic approach</li>
              <li>• Individual prediction interpretation</li>
              <li>• Trust and transparency focused</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
