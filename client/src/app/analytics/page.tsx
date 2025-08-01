'use client';
import { useState, useEffect } from 'react';
import { Leaf } from 'lucide-react';
import MinimalLayout from '@/components/layouts/MinimalLayout';

interface AnalyticsData {
  overview: {
    totalRFQs: number;
    activeRFQs: number;
    completedRFQs: number;
    totalResponses: number;
    totalSpend: string;
    walletBalance: string;
    conversionRate: number;
    avgResponseTime: string;
    supplierSatisfaction: number;
    costSavings: string;
  };
  recentActivity: {
    rfqs: any[];
    transactions: any[];
  };
  spendByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    count: number;
    revenue: number;
  }>;
  performanceMetrics: {
    voiceRfqAccuracy: number;
    tradingProfit: string;
    esgScore: number;
    automationSavings: string;
  };
  businessIntelligence: {
    topSuppliers: Array<{
      name: string;
      orders: number;
      value: string;
      rating: number;
    }>;
    marketInsights: Array<{
      category: string;
      trend: 'up' | 'down' | 'stable';
      change: string;
    }>;
    predictiveAnalytics: Array<{
      metric: string;
      prediction: string;
      confidence: number;
    }>;
  };
}

export default function EnterpriseAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [selectedTimeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Rich mock data simulating comprehensive Bell24H platform
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      const mockAnalytics: AnalyticsData = {
        overview: {
          totalRFQs: 2847,
          activeRFQs: 342,
          completedRFQs: 2234,
          totalResponses: 8921,
          totalSpend: '8.7 Cr',
          walletBalance: '2,45,000',
          conversionRate: 87.3,
          avgResponseTime: '4.2h',
          supplierSatisfaction: 9.2,
          costSavings: '1.2 Cr',
        },
        recentActivity: {
          rfqs: [
            {
              id: 'RFQ-2024-1847',
              title: 'Industrial Steel Pipes (Voice RFQ)',
              status: 'Active',
              category: 'Manufacturing',
              responses: 12,
              created: '2 hours ago',
              type: 'voice',
            },
            {
              id: 'RFQ-2024-1846',
              title: 'Cotton Raw Material Trading',
              status: 'Completed',
              category: 'Textiles',
              responses: 8,
              created: '4 hours ago',
              type: 'trading',
            },
            {
              id: 'RFQ-2024-1845',
              title: 'ESG Compliance Services',
              status: 'Active',
              category: 'Sustainability',
              responses: 15,
              created: '6 hours ago',
              type: 'esg',
            },
            {
              id: 'RFQ-2024-1844',
              title: 'Logistics & Transportation',
              status: 'Completed',
              category: 'Logistics',
              responses: 6,
              created: '8 hours ago',
              type: 'logistics',
            },
            {
              id: 'RFQ-2024-1843',
              title: 'Digital Marketing Services',
              status: 'Active',
              category: 'Services',
              responses: 9,
              created: '12 hours ago',
              type: 'standard',
            },
          ],
          transactions: [
            {
              id: 'TXN-001',
              amount: '2,50,000',
              type: 'Trading Profit',
              status: 'completed',
              time: '1 hour ago',
            },
            {
              id: 'TXN-002',
              amount: '75,000',
              type: 'ESG Consulting',
              status: 'completed',
              time: '3 hours ago',
            },
            {
              id: 'TXN-003',
              amount: '1,25,000',
              type: 'Escrow Release',
              status: 'pending',
              time: '5 hours ago',
            },
            {
              id: 'TXN-004',
              amount: '45,000',
              type: 'Voice RFQ Processing',
              status: 'completed',
              time: '7 hours ago',
            },
            {
              id: 'TXN-005',
              amount: '90,000',
              type: 'Shiprocket Integration',
              status: 'completed',
              time: '1 day ago',
            },
          ],
        },
        spendByCategory: [
          { category: 'Manufacturing & Industrial', amount: 2850000, percentage: 32.8 },
          { category: 'IT & Technology', amount: 1650000, percentage: 19.0 },
          { category: 'Construction & Infrastructure', amount: 1420000, percentage: 16.3 },
          { category: 'Textiles & Apparel', amount: 1150000, percentage: 13.2 },
          { category: 'Logistics & Transportation', amount: 980000, percentage: 11.3 },
          { category: 'Healthcare & Pharmaceuticals', amount: 650000, percentage: 7.5 },
        ],
        monthlyTrends: [
          { month: 'January', count: 234, revenue: 15600000 },
          { month: 'February', count: 267, revenue: 18200000 },
          { month: 'March', count: 298, revenue: 21400000 },
          { month: 'April', count: 312, revenue: 23800000 },
          { month: 'May', count: 345, revenue: 26500000 },
          { month: 'June', count: 389, revenue: 29200000 },
        ],
        performanceMetrics: {
          voiceRfqAccuracy: 98.5,
          tradingProfit: '₹3.2 Cr',
          esgScore: 94.7,
          automationSavings: '₹1.8 Cr',
        },
        businessIntelligence: {
          topSuppliers: [
            { name: 'Tata Steel Limited', orders: 47, value: '₹2.8 Cr', rating: 9.6 },
            { name: 'Reliance Industries', orders: 32, value: '₹1.9 Cr', rating: 9.4 },
            { name: 'Infosys Technologies', orders: 28, value: '₹1.5 Cr', rating: 9.8 },
            { name: 'Mahindra Group', orders: 23, value: '₹1.2 Cr', rating: 9.2 },
            { name: 'Wipro Limited', orders: 19, value: '₹95 L', rating: 9.0 },
          ],
          marketInsights: [
            { category: 'Steel Prices', trend: 'up', change: '+12.5%' },
            { category: 'Cotton Futures', trend: 'down', change: '-8.2%' },
            { category: 'IT Services', trend: 'up', change: '+15.7%' },
            { category: 'Logistics Costs', trend: 'stable', change: '+2.1%' },
          ],
          predictiveAnalytics: [
            { metric: 'Q4 Revenue', prediction: '₹45.2 Cr', confidence: 94 },
            { metric: 'Supplier Growth', prediction: '+67 new suppliers', confidence: 87 },
            { metric: 'Cost Optimization', prediction: '₹2.8 Cr savings', confidence: 91 },
            { metric: 'ESG Score', prediction: '96.8 score', confidence: 89 },
          ],
        },
      };

      setAnalytics(mockAnalytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'voice':
        return <span>🎤</span>;
      case 'trading':
        return <span>📈</span>;
      case 'esg':
        return <Leaf className='h-4 w-4 text-emerald-600' />;
      case 'logistics':
        return <Building2 className='h-4 w-4 text-purple-600' />;
      default:
        return <span>📊</span>;
    }
  };

  if (loading) {
    return (
      <MinimalLayout>
        <div className='min-h-screen bg-white flex items-center justify-center'>
          <div className='text-center'>
            <span>🔄</span>
            <div className='text-xl font-medium text-gray-900'>Loading Enterprise Analytics...</div>
            <div className='text-sm text-gray-600 mt-2'>
              Gathering comprehensive business intelligence
            </div>
          </div>
        </div>
      </MinimalLayout>
    );
  }

  if (error) {
    return (
      <MinimalLayout>
        <div className='min-h-screen bg-white flex items-center justify-center'>
          <div className='text-center'>
            <div className='text-xl text-red-600 mb-4'>Error: {error}</div>
            <button
              onClick={fetchAnalytics}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              Retry
            </button>
          </div>
        </div>
      </MinimalLayout>
    );
  }

  if (!analytics) {
    return (
      <MinimalLayout>
        <div className='min-h-screen bg-white flex items-center justify-center'>
          <div className='text-xl text-gray-900'>No analytics data available</div>
        </div>
      </MinimalLayout>
    );
  }

  return (
    <MinimalLayout>
      <div className='min-h-screen bg-white'>
        <div className='max-w-7xl mx-auto p-6'>
          {/* Header */}
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>Enterprise Analytics</h1>
              <p className='text-gray-600'>
                Comprehensive business intelligence and performance insights for Bell24H marketplace
              </p>
            </div>
            <div className='flex items-center space-x-4'>
              <select
                value={selectedTimeRange}
                onChange={e => setSelectedTimeRange(e.target.value)}
                className='px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              >
                <option value='7d'>Last 7 days</option>
                <option value='30d'>Last 30 days</option>
                <option value='90d'>Last 90 days</option>
                <option value='1y'>Last year</option>
              </select>
              <button
                onClick={fetchAnalytics}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2'
              >
                <span>🔄</span>
                <span>Refresh</span>
              </button>
              <button className='px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2'>
                <span>⬇️</span>
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Key Metrics Overview */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-600 text-sm font-medium'>Total RFQs</p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {analytics.overview.totalRFQs.toLocaleString()}
                  </p>
                  <p className='text-green-600 text-sm font-medium mt-1'>+23.5% from last month</p>
                </div>
                <span>📊</span>
              </div>
            </div>

            <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-600 text-sm font-medium'>Active RFQs</p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {analytics.overview.activeRFQs}
                  </p>
                  <p className='text-blue-600 text-sm font-medium mt-1'>
                    {analytics.overview.conversionRate}% conversion rate
                  </p>
                </div>
                <span>📊</span>
              </div>
            </div>

            <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-600 text-sm font-medium'>Total Responses</p>
                  <p className='text-3xl font-bold text-gray-900'>
                    {analytics.overview.totalResponses.toLocaleString()}
                  </p>
                  <p className='text-gray-600 text-sm font-medium mt-1'>
                    Avg: {analytics.overview.avgResponseTime}
                  </p>
                </div>
                <span>👤</span>
              </div>
            </div>

            <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-gray-600 text-sm font-medium'>Total Spend</p>
                  <div className='flex items-center space-x-2'>
                    {isBalanceVisible ? (
                      <p className='text-3xl font-bold text-gray-900'>
                        ₹{analytics.overview.totalSpend}
                      </p>
                    ) : (
                      <p className='text-3xl font-bold text-gray-900'>₹••••••</p>
                    )}
                    <button
                      onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                      className='text-gray-400 hover:text-gray-600'
                    >
                      {isBalanceVisible ? (
                        <span>👁️</span>
                      ) : (
                        <span>👁️</span>
                      )}
                    </button>
                  </div>
                  <p className='text-green-600 text-sm font-medium mt-1'>
                    ₹{analytics.overview.costSavings} saved
                  </p>
                </div>
                <span>$</span>
              </div>
            </div>
          </div>

          {/* Enterprise Performance Metrics */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
            <div className='bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6'>
              <div className='flex items-center space-x-3 mb-3'>
                <span>🎤</span>
                <div>
                  <p className='text-blue-800 font-medium'>Voice RFQ AI</p>
                  <p className='text-2xl font-bold text-blue-900'>
                    {analytics.performanceMetrics.voiceRfqAccuracy}%
                  </p>
                </div>
              </div>
              <p className='text-blue-700 text-sm'>Speech Recognition Accuracy</p>
            </div>

            <div className='bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6'>
              <div className='flex items-center space-x-3 mb-3'>
                <span>📈</span>
                <div>
                  <p className='text-green-800 font-medium'>Trading Profit</p>
                  <p className='text-2xl font-bold text-green-900'>
                    {analytics.performanceMetrics.tradingProfit}
                  </p>
                </div>
              </div>
              <p className='text-green-700 text-sm'>Commodity Trading YTD</p>
            </div>

            <div className='bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-6'>
              <div className='flex items-center space-x-3 mb-3'>
                <Leaf className='h-8 w-8 text-emerald-600' />
                <div>
                  <p className='text-emerald-800 font-medium'>ESG Score</p>
                  <p className='text-2xl font-bold text-emerald-900'>
                    {analytics.performanceMetrics.esgScore}
                  </p>
                </div>
              </div>
              <p className='text-emerald-700 text-sm'>Sustainability Rating</p>
            </div>

            <div className='bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6'>
              <div className='flex items-center space-x-3 mb-3'>
                <Target className='h-8 w-8 text-orange-600' />
                <div>
                  <p className='text-orange-800 font-medium'>Automation</p>
                  <p className='text-2xl font-bold text-orange-900'>
                    {analytics.performanceMetrics.automationSavings}
                  </p>
                </div>
              </div>
              <p className='text-orange-700 text-sm'>AI-Driven Cost Savings</p>
            </div>
          </div>

          {/* Charts and Analytics */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
            {/* Category Spending Breakdown */}
            <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
              <h3 className='text-xl font-bold text-gray-900 mb-6'>Spending by Category</h3>
              <div className='space-y-4'>
                {analytics.spendByCategory.map((item, index) => (
                  <div key={index} className='space-y-2'>
                    <div className='flex items-center justify-between'>
                      <span className='text-gray-900 font-medium'>{item.category}</span>
                      <div className='flex items-center space-x-2'>
                        <span className='text-gray-600 text-sm'>{item.percentage}%</span>
                        <span className='text-gray-900 font-semibold'>
                          ₹{(item.amount / 100000).toFixed(1)}L
                        </span>
                      </div>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Revenue Trends */}
            <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
              <h3 className='text-xl font-bold text-gray-900 mb-6'>Monthly Performance Trends</h3>
              <div className='space-y-4'>
                {analytics.monthlyTrends.map((item, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                  >
                    <div>
                      <span className='text-gray-900 font-medium'>{item.month}</span>
                      <p className='text-gray-600 text-sm'>{item.count} RFQs processed</p>
                    </div>
                    <div className='text-right'>
                      <span className='text-gray-900 font-semibold'>
                        ₹{(item.revenue / 10000000).toFixed(1)} Cr
                      </span>
                      <p className='text-green-600 text-sm font-medium'>
                        +{Math.round(Math.random() * 20 + 5)}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Business Intelligence Dashboard */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8'>
            {/* Top Suppliers Performance */}
            <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
              <h3 className='text-xl font-bold text-gray-900 mb-6'>Top Performing Suppliers</h3>
              <div className='space-y-4'>
                {analytics.businessIntelligence.topSuppliers.map((supplier, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors'
                  >
                    <div className='flex-1'>
                      <p className='font-medium text-gray-900'>{supplier.name}</p>
                      <p className='text-sm text-gray-600'>
                        {supplier.orders} orders • Rating: {supplier.rating}/10
                      </p>
                    </div>
                    <span className='text-gray-900 font-semibold text-sm'>{supplier.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Intelligence */}
            <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
              <h3 className='text-xl font-bold text-gray-900 mb-6'>Market Intelligence</h3>
              <div className='space-y-4'>
                {analytics.businessIntelligence.marketInsights.map((insight, index) => (
                  <div
                    key={index}
                    className='flex items-center justify-between p-3 border border-gray-100 rounded-lg'
                  >
                    <span className='text-gray-900 font-medium'>{insight.category}</span>
                    <div className='flex items-center space-x-2'>
                      <span
                        className={`text-sm font-semibold ${
                          insight.trend === 'up'
                            ? 'text-green-600'
                            : insight.trend === 'down'
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {insight.change}
                      </span>
                      <span>📈</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Predictive Analytics */}
            <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
              <h3 className='text-xl font-bold text-gray-900 mb-6'>AI Predictions</h3>
              <div className='space-y-4'>
                {analytics.businessIntelligence.predictiveAnalytics.map((prediction, index) => (
                  <div key={index} className='p-3 border border-gray-100 rounded-lg'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-gray-900 font-medium'>{prediction.metric}</span>
                      <span className='text-xs text-gray-600'>
                        {prediction.confidence}% confidence
                      </span>
                    </div>
                    <p className='text-blue-600 font-semibold mb-2'>{prediction.prediction}</p>
                    <div className='w-full bg-gray-200 rounded-full h-1'>
                      <div
                        className='bg-blue-600 h-1 rounded-full transition-all duration-300'
                        style={{ width: `${prediction.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Enterprise Activity */}
          <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
            <h3 className='text-xl font-bold text-gray-900 mb-6'>Recent Enterprise Activity</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <h4 className='text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2'>
                  <span>📊</span>
                  <span>Latest RFQs</span>
                </h4>
                <div className='space-y-3'>
                  {analytics.recentActivity.rfqs.map((rfq, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex items-center space-x-3 flex-1'>
                        {getTypeIcon(rfq.type)}
                        <div>
                          <p className='font-medium text-gray-900 text-sm'>{rfq.title}</p>
                          <p className='text-xs text-gray-600'>
                            {rfq.category} • {rfq.responses} responses • {rfq.created}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rfq.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {rfq.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className='text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2'>
                  <span>$</span>
                  <span>Recent Transactions</span>
                </h4>
                <div className='space-y-3'>
                  {analytics.recentActivity.transactions.map((txn, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors'
                    >
                      <div className='flex-1'>
                        <p className='font-medium text-gray-900 text-sm'>₹{txn.amount}</p>
                        <p className='text-xs text-gray-600'>
                          {txn.type} • {txn.time}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          txn.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {txn.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MinimalLayout>
  );
}
