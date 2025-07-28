'use client';

import { useEffect, useState } from 'react';

export default function AIDashboardPage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading AI Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-blue-100'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-7xl mx-auto'>
          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-4xl font-bold text-gray-900 mb-4'>AI Dashboard - BELL24H</h1>
            <p className='text-xl text-gray-600'>
              Intelligent insights and analytics for your B2B marketplace
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className='bg-white rounded-xl shadow-lg p-2 mb-8'>
            <div className='flex space-x-2'>
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                { id: 'predictions', label: 'Predictions', icon: Brain },
                { id: 'insights', label: 'Insights', icon: Target },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className='w-5 h-5' />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Key Metrics */}
            <div className='lg:col-span-2'>
              <div className='bg-white rounded-2xl shadow-xl p-8 mb-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-6'>
                  Key Performance Metrics
                </h2>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                  <div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-blue-100 text-sm font-medium'>Total Users</p>
                        <p className='text-3xl font-bold'>534,281</p>
                        <p className='text-blue-200 text-sm'>+12.5% from last month</p>
                      </div>
                      <span>👤</span>
                    </div>
                  </div>

                  <div className='bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-green-100 text-sm font-medium'>Active Suppliers</p>
                        <p className='text-3xl font-bold'>50,000+</p>
                        <p className='text-green-200 text-sm'>+8.3% from last month</p>
                      </div>
                      <span>🛒</span>
                    </div>
                  </div>

                  <div className='bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-purple-100 text-sm font-medium'>AI Accuracy</p>
                        <p className='text-3xl font-bold'>98.5%</p>
                        <p className='text-purple-200 text-sm'>+2.1% from last month</p>
                      </div>
                      <Brain className='w-8 h-8 text-purple-200' />
                    </div>
                  </div>

                  <div className='bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white'>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-orange-100 text-sm font-medium'>Response Time</p>
                        <p className='text-3xl font-bold'>2.3s</p>
                        <p className='text-orange-200 text-sm'>-15% from last month</p>
                      </div>
                      <span>📊</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className='bg-white rounded-2xl shadow-xl p-8'>
                <h2 className='text-2xl font-semibold text-gray-900 mb-6'>AI-Powered Insights</h2>

                <div className='space-y-6'>
                  <div className='border border-gray-200 rounded-xl p-6'>
                    <div className='flex items-center space-x-3 mb-4'>
                      <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                        <Brain className='w-5 h-5 text-blue-600' />
                      </div>
                      <div>
                        <h3 className='font-semibold text-gray-900'>Market Trend Analysis</h3>
                        <p className='text-sm text-gray-600'>Real-time market intelligence</p>
                      </div>
                    </div>
                    <p className='text-gray-700'>
                      AI analysis shows a 23% increase in demand for industrial machinery in Q3
                      2024. Top trending categories include automation equipment and renewable
                      energy solutions.
                    </p>
                  </div>

                  <div className='border border-gray-200 rounded-xl p-6'>
                    <div className='flex items-center space-x-3 mb-4'>
                      <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                        <Target className='w-5 h-5 text-green-600' />
                      </div>
                      <div>
                        <h3 className='font-semibold text-gray-900'>Predictive Matching</h3>
                        <p className='text-sm text-gray-600'>Smart supplier recommendations</p>
                      </div>
                    </div>
                    <p className='text-gray-700'>
                      Our AI has achieved 94.7% accuracy in matching buyers with relevant suppliers,
                      reducing search time by 67% and improving conversion rates by 41%.
                    </p>
                  </div>

                  <div className='border border-gray-200 rounded-xl p-6'>
                    <div className='flex items-center space-x-3 mb-4'>
                      <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                        <span>⚡</span>
                      </div>
                      <div>
                        <h3 className='font-semibold text-gray-900'>Smart Automation</h3>
                        <p className='text-sm text-gray-600'>Automated workflow optimization</p>
                      </div>
                    </div>
                    <p className='text-gray-700'>
                      AI-powered automation has reduced manual processing time by 78% and increased
                      customer satisfaction scores to 4.8/5.0.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className='space-y-8'>
              {/* Quick Actions */}
              <div className='bg-white rounded-2xl shadow-xl p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Quick Actions</h3>
                <div className='space-y-3'>
                  <button className='w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors'>
                    <span className='font-medium text-blue-900'>Generate Report</span>
                    <span>↑</span>
                  </button>
                  <button className='w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors'>
                    <span className='font-medium text-green-900'>Export Data</span>
                    <span>↑</span>
                  </button>
                  <button className='w-full flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors'>
                    <span className='font-medium text-purple-900'>AI Training</span>
                    <span>↑</span>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className='bg-white rounded-2xl shadow-xl p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>Recent Activity</h3>
                <div className='space-y-4'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-gray-900'>New supplier registered</p>
                      <p className='text-xs text-gray-500'>2 minutes ago</p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-gray-900'>AI model updated</p>
                      <p className='text-xs text-gray-500'>15 minutes ago</p>
                    </div>
                  </div>
                  <div className='flex items-center space-x-3'>
                    <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                    <div className='flex-1'>
                      <p className='text-sm font-medium text-gray-900'>Report generated</p>
                      <p className='text-xs text-gray-500'>1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Status */}
              <div className='bg-white rounded-2xl shadow-xl p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>System Status</h3>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>AI Engine</span>
                    <div className='flex items-center space-x-2'>
                      <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                      <span className='text-sm font-medium text-green-600'>Online</span>
                    </div>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>Database</span>
                    <div className='flex items-center space-x-2'>
                      <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                      <span className='text-sm font-medium text-green-600'>Online</span>
                    </div>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-600'>API Services</span>
                    <div className='flex items-center space-x-2'>
                      <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                      <span className='text-sm font-medium text-green-600'>Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
