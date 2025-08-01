'use client';

import { Brain } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface FeatureImportance {
  feature: string;
  importance: number;
  description: string;
}

interface MatchExplanation {
  rfqId: string;
  supplierId: string;
  matchScore: number;
  features: FeatureImportance[];
  localExplanation: string;
  globalExplanation: string;
  confidenceScore: number;
}

export default function AIInsightsPage() {
  const {
    data: session,
    status,
  } = () => ({
    data: { user: { id: 'user', email: 'user@company.com', name: 'Business User' } },
    status: 'authenticated',
  });
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'explanations' | 'insights' | 'analytics'
  >('overview');
  const [matchExplanations, setMatchExplanations] = useState<MatchExplanation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated') {
      router.push('/login');
      return;
    }

    if (session?.user) {
      loadAIData();
    }
  }, [session, status]);

  const loadAIData = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock SHAP/LIME explanations
      setMatchExplanations([
        {
          rfqId: 'RFQ001',
          supplierId: 'SUP123',
          matchScore: 0.87,
          features: [
            {
              feature: 'Location Proximity',
              importance: 0.24,
              description: 'Supplier location reduces delivery costs by 15%',
            },
            {
              feature: 'Past Performance',
              importance: 0.21,
              description: 'Excellent delivery record (98% on-time)',
            },
            {
              feature: 'Price Competitiveness',
              importance: 0.18,
              description: '8% below market average',
            },
            {
              feature: 'ESG Score',
              importance: 0.16,
              description: 'High environmental compliance (A+ rating)',
            },
            {
              feature: 'Technical Capability',
              importance: 0.12,
              description: 'Certified for required specifications',
            },
            {
              feature: 'Financial Stability',
              importance: 0.09,
              description: 'Strong credit rating (AAA)',
            },
          ],
          localExplanation:
            "This match is primarily driven by the supplier's proximity to your location, which significantly reduces logistics costs. Their excellent track record and competitive pricing further strengthen the recommendation.",
          globalExplanation:
            'Location proximity is the most significant factor (24% impact), followed by historical performance metrics (21% impact) and price competitiveness (18% impact).',
          confidenceScore: 0.92,
        },
      ]);
    } catch (error) {
      console.error('Failed to load AI data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='relative'>
            <div className='animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4'></div>
            <div className='absolute inset-0 flex items-center justify-center'>
              <Brain className='h-6 w-6 text-purple-600' />
            </div>
          </div>
          <h2 className='text-xl font-semibold text-gray-800 mb-2'>Loading AI Insights</h2>
          <p className='text-gray-600'>Analyzing matching algorithms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-blue-50'>
      {/* Header */}
      <div className='bg-white shadow-lg border-b-2 border-purple-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-20'>
            <div className='flex items-center space-x-6'>
              <div className='h-12 w-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg'>
                <Brain className='h-6 w-6 text-white' />
              </div>
              <div>
                <h1 className='text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
                  AI Insights & Explainability
                </h1>
                <p className='text-sm text-gray-500'>Powered by SHAP & LIME algorithms</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className='px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition font-medium'
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Navigation Tabs */}
        <div className='mb-8'>
          <div className='bg-white rounded-xl shadow-lg p-2'>
            <nav className='flex space-x-2'>
              {['overview', 'explanations', 'insights', 'analytics'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-6 py-3 rounded-lg font-medium text-sm capitalize transition-all ${
                    activeTab === tab
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab === 'overview'
                    ? '🏠 Overview'
                    : tab === 'explanations'
                    ? '🧠 AI Explanations'
                    : tab === 'insights'
                    ? '💡 Insights'
                    : '📊 Analytics'}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              <div className='bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-purple-100 text-sm font-medium'>AI Matches</p>
                    <p className='text-3xl font-bold'>247</p>
                    <p className='text-purple-200 text-xs'>This month</p>
                  </div>
                  <Target className='h-8 w-8 text-purple-200' />
                </div>
              </div>
              <div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-blue-100 text-sm font-medium'>Accuracy</p>
                    <p className='text-3xl font-bold'>94.2%</p>
                    <p className='text-blue-200 text-xs'>Match success rate</p>
                  </div>
                  <span>✅</span>
                </div>
              </div>
              <div className='bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-green-100 text-sm font-medium'>Confidence</p>
                    <p className='text-3xl font-bold'>92%</p>
                    <p className='text-green-200 text-xs'>Average AI confidence</p>
                  </div>
                  <span>📊</span>
                </div>
              </div>
              <div className='bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-orange-100 text-sm font-medium'>Savings</p>
                    <p className='text-3xl font-bold'>₹4.2L</p>
                    <p className='text-orange-200 text-xs'>Through AI optimization</p>
                  </div>
                  <span>📈</span>
                </div>
              </div>
            </div>

            {/* AI Features Overview */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div className='bg-white rounded-xl shadow-lg p-6'>
                <div className='flex items-center space-x-3 mb-4'>
                  <div className='p-2 bg-purple-100 rounded-lg'>
                    <Brain className='h-6 w-6 text-purple-600' />
                  </div>
                  <h3 className='text-lg font-bold text-gray-800'>SHAP Explanations</h3>
                </div>
                <p className='text-gray-600 mb-4'>
                  Understand exactly why AI matches suppliers to your RFQs using game-theory based
                  explanations.
                </p>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Feature Importance Analysis</span>
                    <span className='text-green-600 font-medium'>Active</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Global Model Explanations</span>
                    <span className='text-green-600 font-medium'>Active</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Decision Tree Visualization</span>
                    <span className='text-green-600 font-medium'>Active</span>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-xl shadow-lg p-6'>
                <div className='flex items-center space-x-3 mb-4'>
                  <div className='p-2 bg-blue-100 rounded-lg'>
                    <Lightbulb className='h-6 w-6 text-blue-600' />
                  </div>
                  <h3 className='text-lg font-bold text-gray-800'>LIME Interpretability</h3>
                </div>
                <p className='text-gray-600 mb-4'>
                  Get local explanations for individual supplier matches with actionable insights.
                </p>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Local Model Explanations</span>
                    <span className='text-green-600 font-medium'>Active</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Feature Perturbation Analysis</span>
                    <span className='text-green-600 font-medium'>Active</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span>Counterfactual Examples</span>
                    <span className='text-green-600 font-medium'>Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Explanations Tab */}
        {activeTab === 'explanations' && (
          <div className='space-y-6'>
            {matchExplanations.map(explanation => (
              <div key={explanation.rfqId} className='bg-white rounded-xl shadow-lg p-6'>
                <div className='flex items-center justify-between mb-6'>
                  <div>
                    <h3 className='text-xl font-bold text-gray-800'>Match Explanation</h3>
                    <p className='text-sm text-gray-500'>
                      RFQ {explanation.rfqId} → Supplier {explanation.supplierId}
                    </p>
                  </div>
                  <div className='text-right'>
                    <div className='text-2xl font-bold text-gray-800'>
                      {(explanation.matchScore * 100).toFixed(1)}%
                    </div>
                    <div className='text-sm text-gray-500'>Match Score</div>
                  </div>
                </div>

                {/* SHAP Feature Importance */}
                <div className='mb-6'>
                  <h4 className='text-lg font-semibold text-gray-800 mb-4'>
                    🎯 SHAP Feature Importance
                  </h4>
                  <div className='space-y-3'>
                    {explanation.features.map((feature, index) => (
                      <div key={index} className='p-4 border border-gray-200 rounded-lg'>
                        <div className='flex items-center justify-between mb-2'>
                          <span className='font-medium text-gray-800'>{feature.feature}</span>
                          <span className='text-sm font-bold text-gray-600'>
                            {(feature.importance * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2 mb-2'>
                          <div
                            className='bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full'
                            style={{ width: `${feature.importance * 100}%` }}
                          ></div>
                        </div>
                        <p className='text-sm text-gray-600'>{feature.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* LIME Local Explanation */}
                <div className='mb-6'>
                  <h4 className='text-lg font-semibold text-gray-800 mb-3'>
                    💡 LIME Local Explanation
                  </h4>
                  <div className='p-4 bg-blue-50 border border-blue-200 rounded-lg'>
                    <p className='text-gray-700'>{explanation.localExplanation}</p>
                  </div>
                </div>

                {/* Global Explanation */}
                <div className='mb-6'>
                  <h4 className='text-lg font-semibold text-gray-800 mb-3'>
                    🌍 Global Model Explanation
                  </h4>
                  <div className='p-4 bg-purple-50 border border-purple-200 rounded-lg'>
                    <p className='text-gray-700'>{explanation.globalExplanation}</p>
                  </div>
                </div>

                {/* Confidence Score */}
                <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                  <div className='flex items-center space-x-2'>
                    <span>✅</span>
                    <span className='font-medium text-gray-800'>AI Confidence Score</span>
                  </div>
                  <div className='text-lg font-bold text-gray-800'>
                    {(explanation.confidenceScore * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === 'insights' && (
          <div className='space-y-6'>
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <h3 className='text-lg font-bold text-gray-800 mb-4'>🔍 AI-Generated Insights</h3>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='p-4 border border-green-200 rounded-lg bg-green-50'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <span>✅</span>
                    <span className='font-medium text-green-800'>Optimization Opportunity</span>
                  </div>
                  <p className='text-sm text-green-700'>
                    Suppliers within 50km radius show 23% better delivery performance. Consider
                    prioritizing local suppliers.
                  </p>
                </div>
                <div className='p-4 border border-blue-200 rounded-lg bg-blue-50'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <Brain className='h-5 w-5 text-blue-600' />
                    <span className='font-medium text-blue-800'>Pattern Discovery</span>
                  </div>
                  <p className='text-sm text-blue-700'>
                    ESG-compliant suppliers have 15% lower long-term total cost of ownership despite
                    higher initial prices.
                  </p>
                </div>
                <div className='p-4 border border-orange-200 rounded-lg bg-orange-50'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <AlertTriangle className='h-5 w-5 text-orange-600' />
                    <span className='font-medium text-orange-800'>Risk Alert</span>
                  </div>
                  <p className='text-sm text-orange-700'>
                    3 suppliers in your network show declining performance metrics. Consider
                    diversification.
                  </p>
                </div>
                <div className='p-4 border border-purple-200 rounded-lg bg-purple-50'>
                  <div className='flex items-center space-x-2 mb-2'>
                    <span>📈</span>
                    <span className='font-medium text-purple-800'>Trend Analysis</span>
                  </div>
                  <p className='text-sm text-purple-700'>
                    Price competitiveness is becoming less important than sustainability metrics in
                    your matches.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className='space-y-6'>
            <div className='bg-white rounded-xl shadow-lg p-6'>
              <h3 className='text-lg font-bold text-gray-800 mb-4'>📊 AI Performance Analytics</h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='p-4 border border-gray-200 rounded-lg'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-gray-500'>Model Accuracy</span>
                    <span>📊</span>
                  </div>
                  <div className='text-2xl font-bold text-gray-800'>94.2%</div>
                  <div className='text-xs text-gray-500 mt-1'>+2.1% from last month</div>
                </div>
                <div className='p-4 border border-gray-200 rounded-lg'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-gray-500'>Prediction Speed</span>
                    <span>📊</span>
                  </div>
                  <div className='text-2xl font-bold text-gray-800'>47ms</div>
                  <div className='text-xs text-gray-500 mt-1'>Average response time</div>
                </div>
                <div className='p-4 border border-gray-200 rounded-lg'>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm font-medium text-gray-500'>Cost Savings</span>
                    <span>📈</span>
                  </div>
                  <div className='text-2xl font-bold text-gray-800'>₹4.2L</div>
                  <div className='text-xs text-gray-500 mt-1'>Through AI optimization</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
