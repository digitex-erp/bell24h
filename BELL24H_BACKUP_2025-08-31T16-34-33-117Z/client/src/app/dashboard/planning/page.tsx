'use client';

import { Target, TrendingUp, Users, BarChart3, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function BusinessPlanningPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('quarterly');
  const [activeTab, setActiveTab] = useState('forecasting');
  const [planningData, setPlanningData] = useState({
    revenue: { current: 1200000, projected: 1800000, growth: 50 },
    suppliers: { current: 234, projected: 350, growth: 49.6 },
    orders: { current: 1245, projected: 2100, growth: 68.7 },
    efficiency: { current: 87, projected: 94, improvement: 8.0 },
  });

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-lg'>
        <div className='container mx-auto px-4 py-6'>
          <div className='flex justify-between items-center'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>Business Planning</h1>
              <p className='text-gray-600 mt-2'>
                Strategic planning, forecasting, and business growth tools
              </p>
            </div>
            <div className='flex space-x-4'>
              <select
                value={selectedTimeframe}
                onChange={e => setSelectedTimeframe(e.target.value)}
                className='px-4 py-2 border rounded-lg'
              >
                <option value='monthly'>Monthly View</option>
                <option value='quarterly'>Quarterly View</option>
                <option value='yearly'>Yearly View</option>
              </select>
              <button className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700'>
                Export Plan
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          {/* Planning Navigation */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-lg shadow-lg p-6'>
              <h3 className='font-bold text-gray-900 mb-4'>Planning Tools</h3>
              <nav className='space-y-2'>
                {[
                  {
                    id: 'forecasting',
                    name: 'Demand Forecasting',
                    icon: TrendingUp,
                  },
                  {
                    id: 'resources',
                    name: 'Resource Allocation',
                    icon: Target,
                  },
                  {
                    id: 'collaboration',
                    name: 'Team Collaboration',
                    icon: Users,
                  },
                  {
                    id: 'analytics',
                    name: 'Business Analytics',
                    icon: BarChart3,
                  },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className='h-5 w-5' />
                    <span>{tab.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className='lg:col-span-3'>
            {/* Key Metrics */}
            <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
              <div className='bg-white p-6 rounded-lg shadow-lg'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-600 text-sm'>Revenue Growth</p>
                    <p className='text-2xl font-bold text-green-600'>
                      +{planningData.revenue.growth}%
                    </p>
                  </div>
                  <span>$</span>
                </div>
                <p className='text-xs text-gray-500 mt-2'>
                  ₹{planningData.revenue.projected.toLocaleString('en-IN')} projected
                </p>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-lg'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-600 text-sm'>Supplier Network</p>
                    <p className='text-2xl font-bold text-blue-600'>
                      +{planningData.suppliers.growth.toFixed(1)}%
                    </p>
                  </div>
                  <span>📦</span>
                </div>
                <p className='text-xs text-gray-500 mt-2'>
                  {planningData.suppliers.projected} suppliers projected
                </p>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-lg'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-600 text-sm'>Order Volume</p>
                    <p className='text-2xl font-bold text-purple-600'>
                      +{planningData.orders.growth.toFixed(1)}%
                    </p>
                  </div>
                  <span>🚚</span>
                </div>
                <p className='text-xs text-gray-500 mt-2'>
                  {planningData.orders.projected} orders projected
                </p>
              </div>

              <div className='bg-white p-6 rounded-lg shadow-lg'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-gray-600 text-sm'>Efficiency</p>
                    <p className='text-2xl font-bold text-orange-600'>
                      {planningData.efficiency.projected}%
                    </p>
                  </div>
                  <Target className='h-8 w-8 text-orange-600' />
                </div>
                <p className='text-xs text-gray-500 mt-2'>
                  +{planningData.efficiency.improvement}% improvement
                </p>
              </div>
            </div>

            {/* Active Tab Content */}
            <div className='bg-white rounded-lg shadow-lg p-6'>
              {activeTab === 'forecasting' && (
                <div>
                  <h3 className='text-xl font-bold text-gray-900 mb-6'>Demand Forecasting</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <h4 className='font-semibold text-gray-800 mb-4'>Market Trends</h4>
                      <div className='space-y-3'>
                        <div className='flex items-center justify-between p-3 bg-green-50 rounded-lg'>
                          <span className='text-sm'>Electronics Demand</span>
                          <span className='text-green-600 font-semibold'>↗ +15%</span>
                        </div>
                        <div className='flex items-center justify-between p-3 bg-blue-50 rounded-lg'>
                          <span className='text-sm'>Textile Orders</span>
                          <span className='text-blue-600 font-semibold'>↗ +8%</span>
                        </div>
                        <div className='flex items-center justify-between p-3 bg-orange-50 rounded-lg'>
                          <span className='text-sm'>Chemical Supply</span>
                          <span className='text-orange-600 font-semibold'>→ Stable</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-800 mb-4'>AI Predictions</h4>
                      <div className='space-y-3'>
                        <div className='p-4 border-l-4 border-blue-500 bg-blue-50'>
                          <p className='text-sm text-blue-800'>
                            High demand expected for industrial machinery in Q2 2025
                          </p>
                        </div>
                        <div className='p-4 border-l-4 border-green-500 bg-green-50'>
                          <p className='text-sm text-green-800'>
                            Seasonal surge in agricultural equipment predicted
                          </p>
                        </div>
                        <div className='p-4 border-l-4 border-purple-500 bg-purple-50'>
                          <p className='text-sm text-purple-800'>
                            Export opportunities increasing in Southeast Asia
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'resources' && (
                <div>
                  <h3 className='text-xl font-bold text-gray-900 mb-6'>Resource Allocation</h3>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    <div className='space-y-4'>
                      <h4 className='font-semibold text-gray-800'>Human Resources</h4>
                      <div className='p-4 bg-gray-50 rounded-lg'>
                        <div className='flex justify-between items-center mb-2'>
                          <span className='text-sm'>Sales Team</span>
                          <span className='text-sm font-semibold'>12 members</span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-blue-600 h-2 rounded-full'
                            style={{ width: '75%' }}
                          ></div>
                        </div>
                      </div>
                      <div className='p-4 bg-gray-50 rounded-lg'>
                        <div className='flex justify-between items-center mb-2'>
                          <span className='text-sm'>Support Team</span>
                          <span className='text-sm font-semibold'>8 members</span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-green-600 h-2 rounded-full'
                            style={{ width: '60%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className='space-y-4'>
                      <h4 className='font-semibold text-gray-800'>Technology Resources</h4>
                      <div className='p-4 bg-gray-50 rounded-lg'>
                        <div className='flex justify-between items-center mb-2'>
                          <span className='text-sm'>Server Capacity</span>
                          <span className='text-sm font-semibold'>85% used</span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-orange-600 h-2 rounded-full'
                            style={{ width: '85%' }}
                          ></div>
                        </div>
                      </div>
                      <div className='p-4 bg-gray-50 rounded-lg'>
                        <div className='flex justify-between items-center mb-2'>
                          <span className='text-sm'>API Usage</span>
                          <span className='text-sm font-semibold'>60% used</span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-blue-600 h-2 rounded-full'
                            style={{ width: '60%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className='space-y-4'>
                      <h4 className='font-semibold text-gray-800'>Financial Resources</h4>
                      <div className='p-4 bg-gray-50 rounded-lg'>
                        <div className='flex justify-between items-center mb-2'>
                          <span className='text-sm'>Marketing Budget</span>
                          <span className='text-sm font-semibold'>₹45L/₹60L</span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-purple-600 h-2 rounded-full'
                            style={{ width: '75%' }}
                          ></div>
                        </div>
                      </div>
                      <div className='p-4 bg-gray-50 rounded-lg'>
                        <div className='flex justify-between items-center mb-2'>
                          <span className='text-sm'>Development Budget</span>
                          <span className='text-sm font-semibold'>₹30L/₹50L</span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-green-600 h-2 rounded-full'
                            style={{ width: '60%' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'collaboration' && (
                <div>
                  <h3 className='text-xl font-bold text-gray-900 mb-6'>Team Collaboration</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <h4 className='font-semibold text-gray-800 mb-4'>Active Projects</h4>
                      <div className='space-y-3'>
                        <div className='p-4 border rounded-lg'>
                          <div className='flex items-center justify-between mb-2'>
                            <h5 className='font-medium'>Q2 Expansion Plan</h5>
                            <span className='bg-green-100 text-green-800 text-xs px-2 py-1 rounded'>
                              On Track
                            </span>
                          </div>
                          <div className='flex items-center space-x-2 text-sm text-gray-600'>
                            <span>👤</span>
                            <span>5 team members</span>
                            <span>•</span>
                            <span>Due: March 31, 2025</span>
                          </div>
                        </div>
                        <div className='p-4 border rounded-lg'>
                          <div className='flex items-center justify-between mb-2'>
                            <h5 className='font-medium'>Supplier Network Growth</h5>
                            <span className='bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded'>
                              In Progress
                            </span>
                          </div>
                          <div className='flex items-center space-x-2 text-sm text-gray-600'>
                            <span>👤</span>
                            <span>8 team members</span>
                            <span>•</span>
                            <span>Due: April 15, 2025</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-800 mb-4'>Team Updates</h4>
                      <div className='space-y-3'>
                        <div className='p-3 bg-blue-50 rounded-lg'>
                          <div className='flex items-center space-x-2 mb-1'>
                            <div className='w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs'>
                              RP
                            </div>
                            <span className='text-sm font-medium'>Rajesh Patel</span>
                            <span className='text-xs text-gray-500'>2 hours ago</span>
                          </div>
                          <p className='text-sm text-gray-700'>
                            Completed supplier verification for electronics category
                          </p>
                        </div>
                        <div className='p-3 bg-green-50 rounded-lg'>
                          <div className='flex items-center space-x-2 mb-1'>
                            <div className='w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs'>
                              PS
                            </div>
                            <span className='text-sm font-medium'>Priya Sharma</span>
                            <span className='text-xs text-gray-500'>4 hours ago</span>
                          </div>
                          <p className='text-sm text-gray-700'>
                            Updated Q2 revenue projections - looking strong!
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div>
                  <h3 className='text-xl font-bold text-gray-900 mb-6'>Business Analytics</h3>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <h4 className='font-semibold text-gray-800 mb-4'>Performance Metrics</h4>
                      <div className='space-y-4'>
                        <div className='p-4 bg-gray-50 rounded-lg'>
                          <div className='flex justify-between items-center mb-2'>
                            <span className='text-sm'>Customer Acquisition</span>
                            <span className='text-green-600 font-semibold'>+23%</span>
                          </div>
                          <div className='text-xs text-gray-500'>235 new customers this month</div>
                        </div>
                        <div className='p-4 bg-gray-50 rounded-lg'>
                          <div className='flex justify-between items-center mb-2'>
                            <span className='text-sm'>Revenue per Customer</span>
                            <span className='text-blue-600 font-semibold'>₹48,500</span>
                          </div>
                          <div className='text-xs text-gray-500'>+12% from last quarter</div>
                        </div>
                        <div className='p-4 bg-gray-50 rounded-lg'>
                          <div className='flex justify-between items-center mb-2'>
                            <span className='text-sm'>Platform Usage</span>
                            <span className='text-purple-600 font-semibold'>94%</span>
                          </div>
                          <div className='text-xs text-gray-500'>Daily active user rate</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className='font-semibold text-gray-800 mb-4'>Growth Insights</h4>
                      <div className='space-y-3'>
                        <div className='p-4 border-l-4 border-green-500 bg-green-50'>
                          <div className='flex items-center space-x-2 mb-1'>
                            <span>✅</span>
                            <span className='text-sm font-medium text-green-800'>
                              Strong Performance
                            </span>
                          </div>
                          <p className='text-xs text-green-700'>
                            Electronics category showing 40% month-over-month growth
                          </p>
                        </div>
                        <div className='p-4 border-l-4 border-yellow-500 bg-yellow-50'>
                          <div className='flex items-center space-x-2 mb-1'>
                            <AlertCircle className='h-4 w-4 text-yellow-600' />
                            <span className='text-sm font-medium text-yellow-800'>Opportunity</span>
                          </div>
                          <p className='text-xs text-yellow-700'>
                            Textile category has potential for 25% growth with focused marketing
                          </p>
                        </div>
                        <div className='p-4 border-l-4 border-blue-500 bg-blue-50'>
                          <div className='flex items-center space-x-2 mb-1'>
                            <span>📈</span>
                            <span className='text-sm font-medium text-blue-800'>Trending</span>
                          </div>
                          <p className='text-xs text-blue-700'>
                            International expansion showing promising early results
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
