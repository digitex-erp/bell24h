'use client';

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  BarChart3,
  TrendingUp,
  Download,
  Filter,
  Calendar,
  Globe,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Package,
  Brain,
  FileText,
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Mock data for analytics
const mockAnalyticsData = {
  rfqConversion: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      {
        label: 'RFQ Conversion Rate (%)',
        data: [65, 72, 68, 75, 78, 82, 85, 88, 87],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Industry Average (%)',
        data: [60, 62, 65, 68, 70, 72, 75, 78, 80],
        borderColor: 'rgb(156, 163, 175)',
        backgroundColor: 'rgba(156, 163, 175, 0.1)',
        tension: 0.4,
        borderDash: [5, 5],
      },
    ],
  },
  demandForecast: {
    labels: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'Q1 2025', 'Q2 2025'],
    datasets: [
      {
        label: 'Predicted Demand (₹ Cr)',
        data: [12.5, 15.2, 18.7, 22.3, 26.8, 31.2],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Actual Demand (₹ Cr)',
        data: [12.1, 14.8, 18.2, null, null, null],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  },
  marketTrends: {
    labels: ['Steel & Metal', 'Automotive', 'Chemicals', 'Electronics', 'Textiles', 'Pharma'],
    datasets: [
      {
        label: 'Market Growth (%)',
        data: [8.5, 12.3, 6.7, 15.2, 4.1, 9.8],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(14, 165, 233, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)',
          'rgb(168, 85, 247)',
          'rgb(14, 165, 233)',
        ],
        borderWidth: 2,
      },
    ],
  },
  supplierPerformance: {
    labels: ['On-Time Delivery', 'Quality Score', 'Price Competitiveness', 'Communication', 'Innovation'],
    datasets: [
      {
        label: 'Average Score',
        data: [85, 92, 78, 88, 75],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
      },
    ],
  },
  regionalDistribution: {
    labels: ['North', 'South', 'East', 'West', 'Central'],
    datasets: [
      {
        data: [35, 28, 15, 18, 4],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(168, 85, 247, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(34, 197, 94)',
          'rgb(251, 191, 36)',
          'rgb(239, 68, 68)',
          'rgb(168, 85, 247)',
        ],
        borderWidth: 2,
      },
    ],
  },
  riskAssessment: {
    low: 45,
    medium: 35,
    high: 20,
  },
  kpis: {
    totalRFQs: 1247,
    conversionRate: 87.3,
    avgDealSize: 850000,
    topPerformingCategory: 'Steel & Metal',
    marketShare: 12.5,
    customerSatisfaction: 4.7,
  },
  aiInsights: [
    {
      type: 'success',
      title: 'High Conversion Opportunity',
      description: 'Steel & Metal category shows 23% higher conversion rate this quarter',
      impact: 'High',
    },
    {
      type: 'warning',
      title: 'Price Sensitivity Alert',
      description: 'Automotive suppliers showing 15% price increase trend',
      impact: 'Medium',
    },
    {
      type: 'info',
      title: 'Market Expansion',
      description: 'South region showing 18% growth in RFQ volume',
      impact: 'High',
    },
  ],
};

export default function PredictiveAnalytics() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [isExporting, setIsExporting] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'info':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'High':
        return 'text-red-600 bg-red-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'Low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Interactive Analytics Dashboard',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const handleExport = async () => {
    setIsExporting(true);
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExporting(false);
    alert('Analytics report exported successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
                Predictive Analytics
              </h1>
              <p className="text-gray-600">AI-driven insights and market intelligence</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Select timeframe"
              >
                <option value="1month">Last Month</option>
                <option value="3months">Last 3 Months</option>
                <option value="6months">Last 6 Months</option>
                <option value="1year">Last Year</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-gray-500" />
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Select industry"
              >
                <option value="all">All Industries</option>
                <option value="steel">Steel & Metal</option>
                <option value="automotive">Automotive</option>
                <option value="chemicals">Chemicals</option>
                <option value="electronics">Electronics</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-gray-500" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                aria-label="Select region"
              >
                <option value="all">All Regions</option>
                <option value="north">North</option>
                <option value="south">South</option>
                <option value="east">East</option>
                <option value="west">West</option>
                <option value="central">Central</option>
              </select>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total RFQs</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalyticsData.kpis.totalRFQs.toLocaleString()}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">+15% from last month</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalyticsData.kpis.conversionRate}%</p>
              </div>
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-blue-600">Above industry average</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Deal Size</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(mockAnalyticsData.kpis.avgDealSize)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-600" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">+8% from last quarter</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Market Share</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalyticsData.kpis.marketShare}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-blue-600">Growing steadily</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                <p className="text-sm text-gray-600">Customer Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">{mockAnalyticsData.kpis.customerSatisfaction}/5</p>
              </div>
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600">Excellent rating</span>
            </div>
          </div>
        </div>

        {/* AI Insights Panel */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-blue-600" />
              AI-Powered Insights
            </h3>
            <span className="text-sm text-gray-500">Updated 5 minutes ago</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockAnalyticsData.aiInsights.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{insight.title}</h4>
                  <span className={`px-2 py-1 text-xs rounded-full ${getImpactColor(insight.impact)}`}>
                    {insight.impact}
                  </span>
                </div>
                <p className="text-sm">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* RFQ Conversion Rate */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">RFQ Conversion Rate Trend</h3>
            <div className="h-80">
              <Line data={mockAnalyticsData.rfqConversion} options={chartOptions} />
            </div>
          </div>

          {/* Demand Forecast */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Demand Forecast</h3>
            <div className="h-80">
              <Line data={mockAnalyticsData.demandForecast} options={chartOptions} />
            </div>
          </div>

          {/* Market Trends */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Growth by Industry</h3>
            <div className="h-80">
              <Bar data={mockAnalyticsData.marketTrends} options={chartOptions} />
            </div>
          </div>

          {/* Regional Distribution */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Distribution</h3>
            <div className="h-80">
              <Doughnut data={mockAnalyticsData.regionalDistribution} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Supplier Performance & Risk Assessment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Supplier Performance */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Performance Metrics</h3>
            <div className="h-80">
              <Bar data={mockAnalyticsData.supplierPerformance} options={chartOptions} />
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Supplier Risk Distribution</h3>
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <div className="relative w-48 h-48 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-green-500"
                    style={{ 
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + 45 * Math.cos(0)}% ${50 + 45 * Math.sin(0)}%)` 
                    }}
                  ></div>
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-yellow-500"
                    style={{ 
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + 45 * Math.cos(Math.PI * 0.45)}% ${50 + 45 * Math.sin(Math.PI * 0.45)}%)` 
                    }}
                  ></div>
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-red-500"
                    style={{ 
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + 45 * Math.cos(Math.PI * 0.8)}% ${50 + 45 * Math.sin(Math.PI * 0.8)}%)` 
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">Risk</div>
                      <div className="text-sm text-gray-600">Assessment</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm">Low Risk</span>
                    </div>
                    <span className="text-sm font-medium">{mockAnalyticsData.riskAssessment.low}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                      <span className="text-sm">Medium Risk</span>
                    </div>
                    <span className="text-sm font-medium">{mockAnalyticsData.riskAssessment.medium}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                      <span className="text-sm">High Risk</span>
                    </div>
                    <span className="text-sm font-medium">{mockAnalyticsData.riskAssessment.high}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Items */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                <h4 className="font-medium text-green-900">Expand Steel & Metal</h4>
              </div>
              <p className="text-sm text-green-700">High conversion rate suggests expansion opportunity</p>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <h4 className="font-medium text-yellow-900">Monitor Automotive Prices</h4>
              </div>
              <p className="text-sm text-yellow-700">Price increases may affect conversion rates</p>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center mb-2">
                <Target className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-900">Focus on South Region</h4>
              </div>
              <p className="text-sm text-blue-700">High growth potential in southern markets</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}