'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Database, 
  Users, 
  Mail, 
  Phone, 
  TrendingUp, 
  DollarSign,
  Play,
  Pause,
  Settings,
  BarChart3,
  Zap,
  Crown,
  Gift,
  Target,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import Header from '@/components/Header';

interface N8NAnalytics {
  scraping: {
    totalScraped: number;
    scrapedByDate: Array<{date: string; count: number}>;
    scrapedBySource: Array<{source: string; count: number}>;
    topCategories: Array<{category: string; count: number}>;
  };
  claims: {
    totalClaims: number;
    claimRate: number;
    claimsByDate: Array<{date: string; count: number}>;
    claimsByStatus: Array<{status: string; count: number}>;
    claimsByCategory: Array<{category: string; count: number}>;
  };
  marketing: {
    totalCampaigns: number;
    campaignsByType: Array<{type: string; count: number}>;
    campaignsByDate: Array<{date: string; count: number}>;
    campaignPerformance: Array<any>;
    averageMetrics: {
      deliveryRate: number;
      openRate: number;
      clickRate: number;
      claimRate: number;
      conversionRate: number;
    };
  };
  revenue: {
    totalClaims: number;
    verifiedClaims: number;
    expectedPremiumSubscribers: number;
    totalValueGiven: number;
    monthlyRecurringRevenue: number;
    annualRecurringRevenue: number;
    projections: any;
    roi: any;
  };
}

export default function N8NDashboardPage() {
  const [analytics, setAnalytics] = useState<N8NAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/n8n/analytics/dashboard');
      const data = await response.json();
      
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartScraping = async () => {
    try {
      const response = await fetch('/api/n8n/workflows/start-scraping', {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('Scraping workflow started successfully!');
        fetchAnalytics();
      }
    } catch (error) {
      alert('Failed to start scraping workflow');
    }
  };

  const handleStartMarketing = async () => {
    try {
      const response = await fetch('/api/n8n/workflows/start-marketing', {
        method: 'POST'
      });
      
      if (response.ok) {
        alert('Marketing campaign started successfully!');
        fetchAnalytics();
      }
    } catch (error) {
      alert('Failed to start marketing campaign');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="N8N Autonomous Dashboard" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading N8N analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'scraping', name: 'Scraping', icon: Database },
    { id: 'claims', name: 'Claims', icon: Users },
    { id: 'marketing', name: 'Marketing', icon: Mail },
    { id: 'revenue', name: 'Revenue', icon: DollarSign }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="N8N Autonomous Dashboard" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Scraped</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {analytics?.scraping.totalScraped.toLocaleString() || 0}
                  </p>
                </div>
                <Database className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Claims</p>
                  <p className="text-3xl font-bold text-green-600">
                    {analytics?.claims.totalClaims.toLocaleString() || 0}
                  </p>
                </div>
                <Users className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Claim Rate</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {analytics?.claims.claimRate.toFixed(1)}%
                  </p>
                </div>
                <Target className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-orange-600">
                    ₹{analytics?.revenue.monthlyRecurringRevenue.toLocaleString() || 0}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button onClick={handleStartScraping} className="bg-blue-600 hover:bg-blue-700">
            <Play className="h-4 w-4 mr-2" />
            Start Scraping
          </Button>
          <Button onClick={handleStartMarketing} className="bg-green-600 hover:bg-green-700">
            <Mail className="h-4 w-4 mr-2" />
            Start Marketing
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure N8N
          </Button>
          <Button variant="outline" onClick={fetchAnalytics}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Refresh Data
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Strategy Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-5 w-5" />
                  <span>Autonomous Strategy Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">🎯 Target Goal</h3>
                    <p className="text-blue-800 text-sm">
                      4,000 companies scraped across 400 categories (10 per category)
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-green-900 mb-2">💰 Revenue Projection</h3>
                    <p className="text-green-800 text-sm">
                      2-5% claim rate = 80-200 companies with ₹30,000+ FREE benefits each
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">🚀 Growth Strategy</h3>
                    <p className="text-purple-800 text-sm">
                      Early users become advocates, driving organic growth and referrals
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Current Progress</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Companies Scraped</span>
                      <span className="font-semibold">
                        {analytics?.scraping.totalScraped || 0} / 4,000
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${((analytics?.scraping.totalScraped || 0) / 4000) * 100}%` 
                        }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Companies Claimed</span>
                      <span className="font-semibold">
                        {analytics?.claims.totalClaims || 0} / 200 (target)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: `${((analytics?.claims.totalClaims || 0) / 200) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Claim Rate</span>
                      <Badge className="bg-green-100 text-green-800">
                        {analytics?.claims.claimRate.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Marketing Delivery</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {analytics?.marketing.averageMetrics.deliveryRate.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Conversion Rate</span>
                      <Badge className="bg-purple-100 text-purple-800">
                        {analytics?.marketing.averageMetrics.conversionRate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'scraping' && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Sources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.scraping.scrapedBySource.map((source, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{source.source}</span>
                        <Badge variant="outline">{source.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.scraping.topCategories.slice(0, 5).map((category, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{category.category}</span>
                        <Badge variant="outline">{category.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'claims' && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Claims by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.claims.claimsByStatus.map((status, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{status.status}</span>
                        <Badge variant="outline">{status.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Claims by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.claims.claimsByCategory.slice(0, 5).map((category, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{category.category}</span>
                        <Badge variant="outline">{category.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'marketing' && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Delivery Rate</span>
                      <Badge className="bg-green-100 text-green-800">
                        {analytics.marketing.averageMetrics.deliveryRate.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Open Rate</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {analytics.marketing.averageMetrics.openRate.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Click Rate</span>
                      <Badge className="bg-purple-100 text-purple-800">
                        {analytics.marketing.averageMetrics.clickRate.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Claim Rate</span>
                      <Badge className="bg-orange-100 text-orange-800">
                        {analytics.marketing.averageMetrics.claimRate.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Campaign Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.marketing.campaignsByType.map((type, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{type.type}</span>
                        <Badge variant="outline">{type.count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'revenue' && analytics && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Gift className="h-5 w-5 text-green-500" />
                    <span>Value Given</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">
                    ₹{analytics.revenue.totalValueGiven.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    FREE lifetime benefits distributed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    <span>Monthly Revenue</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">
                    ₹{analytics.revenue.monthlyRecurringRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Expected MRR after 6 months
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-purple-500" />
                    <span>Annual Revenue</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-purple-600">
                    ₹{analytics.revenue.annualRecurringRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Projected ARR
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Projections by Claim Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.entries(analytics.revenue.projections).map(([rate, projection]: [string, any]) => (
                    <div key={rate} className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">{rate} Claim Rate</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Expected Claims:</span>
                          <span className="font-medium">{projection.expectedClaims}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Monthly Revenue:</span>
                          <span className="font-medium">₹{projection.mrr.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Annual Revenue:</span>
                          <span className="font-medium">₹{projection.arr.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
