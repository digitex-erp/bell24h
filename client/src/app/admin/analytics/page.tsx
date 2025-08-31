'use client';

import { BarChart3, TrendingUp, Users, DollarSign, Activity, Eye, Download } from 'lucide-react';
import { useState } from 'react';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');

  const mockData = {
    revenue: {
      current: '₹12.4Cr',
      previous: '₹10.1Cr',
      change: '+23%',
      trend: 'up'
    },
    users: {
      current: '1,250',
      previous: '1,180',
      change: '+6%',
      trend: 'up'
    },
    orders: {
      current: '2,847',
      previous: '2,456',
      change: '+16%',
      trend: 'up'
    },
    suppliers: {
      current: '847',
      previous: '789',
      change: '+7%',
      trend: 'up'
    }
  };

  const categoryData = [
    { name: 'Electronics', revenue: '₹4.2Cr', percentage: 34, color: 'bg-blue-500' },
    { name: 'Textiles', revenue: '₹3.1Cr', percentage: 25, color: 'bg-green-500' },
    { name: 'Machinery', revenue: '₹2.8Cr', percentage: 23, color: 'bg-purple-500' },
    { name: 'Chemicals', revenue: '₹1.5Cr', percentage: 12, color: 'bg-orange-500' },
    { name: 'Others', revenue: '₹0.8Cr', percentage: 6, color: 'bg-gray-500' }
  ];

  const monthlyData = [
    { month: 'Jan', revenue: 8.2, users: 980, orders: 2100 },
    { month: 'Feb', revenue: 9.1, users: 1050, orders: 2250 },
    { month: 'Mar', revenue: 9.8, users: 1120, orders: 2400 },
    { month: 'Apr', revenue: 10.5, users: 1180, orders: 2550 },
    { month: 'May', revenue: 11.2, users: 1220, orders: 2700 },
    { month: 'Jun', revenue: 11.8, users: 1250, orders: 2847 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Analytics</h1>
              <p className="mt-2 text-gray-600">Real-time insights and performance metrics</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{mockData.revenue.current}</p>
                <p className={`text-sm ${mockData.revenue.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {mockData.revenue.change} vs previous period
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{mockData.users.current}</p>
                <p className={`text-sm ${mockData.users.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {mockData.users.change} vs previous period
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{mockData.orders.current}</p>
                <p className={`text-sm ${mockData.orders.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {mockData.orders.change} vs previous period
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
                <p className="text-2xl font-bold text-gray-900">{mockData.suppliers.current}</p>
                <p className={`text-sm ${mockData.suppliers.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {mockData.suppliers.change} vs previous period
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue by Category */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Revenue by Category</h3>
              <button className="text-blue-600 hover:text-blue-800">
                <Eye className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              {categoryData.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${category.color}`}></div>
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{category.revenue}</div>
                    <div className="text-xs text-gray-500">{category.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Monthly Trends</h3>
              <button className="text-blue-600 hover:text-blue-800">
                <Eye className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-4">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{data.month}</span>
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">₹{data.revenue}Cr</div>
                      <div className="text-xs text-gray-500">Revenue</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{data.users}</div>
                      <div className="text-xs text-gray-500">Users</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{data.orders}</div>
                      <div className="text-xs text-gray-500">Orders</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Performance Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">🚀 Growth Highlights</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Electronics demand surged 45% this month</li>
                <li>• New supplier onboarding increased 67%</li>
                <li>• International orders up 89%</li>
              </ul>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">📊 Key Metrics</h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Average order value: ₹4.3L</li>
                <li>• Customer retention: 94%</li>
                <li>• Response time: &lt;2 hours</li>
              </ul>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">🎯 Recommendations</h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Expand electronics category</li>
                <li>• Focus on tier-2 cities</li>
                <li>• Enhance mobile experience</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
