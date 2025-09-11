// app/admin/analytics/page.tsx - Admin Analytics Dashboard
'use client';

import { Activity, AlertCircle, BarChart3, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

interface AnalyticsData {
  users: {
    total: number;
    new: number;
    active: number;
    growth: number;
  };
  leads: {
    total: number;
    hot: number;
    warm: number;
    cold: number;
    conversion: number;
  };
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    target: number;
  };
  performance: {
    pageViews: number;
    bounceRate: number;
    avgSession: number;
    topPages: Array<{ page: string; views: number }>;
  };
}

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate data fetch with error handling
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data - in real implementation, this would come from your database
        const mockData: AnalyticsData = {
          users: {
            total: 1247,
            new: 89,
            active: 456,
            growth: 12.5
          },
          leads: {
            total: 234,
            hot: 45,
            warm: 78,
            cold: 111,
            conversion: 18.2
          },
          revenue: {
            total: 125000,
            monthly: 18500,
            growth: 8.3,
            target: 200000
          },
          performance: {
            pageViews: 45678,
            bounceRate: 34.2,
            avgSession: 4.2,
            topPages: [
              { page: '/', views: 12345 },
              { page: '/services/verification', views: 5678 },
              { page: '/crm/leads', views: 3456 },
              { page: '/marketing/campaigns', views: 2345 }
            ]
          }
        };

        setAnalyticsData(mockData);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Analytics</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg font-bold">🔔</span>
            </div>
            <h1 className="text-2xl font-bold">Bell<span className="text-amber-400">24h</span></h1>
          </div>
          <nav className="flex items-center space-x-4">
            <a href="/" className="text-white hover:text-amber-400 transition-colors">Home</a>
            <a href="/admin" className="text-white hover:text-amber-400 transition-colors">Admin</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Monitor platform performance and user engagement</p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{analyticsData.users.total.toLocaleString()}</p>
                <p className="text-sm text-green-400">+{analyticsData.users.growth}% this month</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Leads</p>
                <p className="text-2xl font-bold text-white">{analyticsData.leads.total}</p>
                <p className="text-sm text-purple-400">{analyticsData.leads.conversion}% conversion</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Revenue</p>
                <p className="text-2xl font-bold text-white">₹{analyticsData.revenue.total.toLocaleString()}</p>
                <p className="text-sm text-green-400">+{analyticsData.revenue.growth}% growth</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Page Views</p>
                <p className="text-2xl font-bold text-white">{analyticsData.performance.pageViews.toLocaleString()}</p>
                <p className="text-sm text-amber-400">{analyticsData.performance.bounceRate}% bounce rate</p>
              </div>
              <Activity className="h-8 w-8 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Detailed Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Analytics */}
          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-blue-400" />
              User Analytics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">New Users (30 days)</span>
                <span className="text-white font-semibold">{analyticsData.users.new}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Active Users</span>
                <span className="text-white font-semibold">{analyticsData.users.active}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Growth Rate</span>
                <span className="text-green-400 font-semibold">+{analyticsData.users.growth}%</span>
              </div>
            </div>
          </div>

          {/* Lead Analytics */}
          <div className="bg-white/10 backdrop-blur rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
              Lead Analytics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Hot Leads</span>
                <span className="text-red-400 font-semibold">{analyticsData.leads.hot}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Warm Leads</span>
                <span className="text-yellow-400 font-semibold">{analyticsData.leads.warm}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Cold Leads</span>
                <span className="text-blue-400 font-semibold">{analyticsData.leads.cold}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Conversion Rate</span>
                <span className="text-green-400 font-semibold">{analyticsData.leads.conversion}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Analytics */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-400" />
            Revenue Analytics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">₹{analyticsData.revenue.total.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">This Month</p>
              <p className="text-2xl font-bold text-white">₹{analyticsData.revenue.monthly.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Target Progress</p>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(analyticsData.revenue.total / analyticsData.revenue.target) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400">
                {Math.round((analyticsData.revenue.total / analyticsData.revenue.target) * 100)}% of target
              </p>
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white/10 backdrop-blur rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 mr-2 text-amber-400" />
            Top Pages
          </h3>
          <div className="space-y-3">
            {analyticsData.performance.topPages.map((page, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-700/50 last:border-b-0">
                <span className="text-gray-300">{page.page}</span>
                <span className="text-white font-semibold">{page.views.toLocaleString()} views</span>
              </div>
            ))}
          </div>
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">Advanced Analytics Features</h3>
          <p className="text-gray-300 mb-4">
            Advanced analytics features including real-time data, custom date ranges, export capabilities, and detailed user behavior tracking are coming soon.
          </p>
          <div className="flex space-x-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 transition-colors">
              Request Early Access
            </button>
            <button className="border border-blue-500 text-blue-400 px-4 py-2 rounded hover:bg-blue-500/10 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}