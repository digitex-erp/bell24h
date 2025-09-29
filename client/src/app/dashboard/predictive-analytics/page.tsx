'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Package,
  Globe,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import UserDashboardLayout from '@/components/dashboard/UserDashboardLayout';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
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
  RadialLinearScale,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

// Mock API data - replace with real API calls
const mockPredictiveData = {
  user: {
    name: 'Rajesh Kumar',
    company: 'TechCorp Industries',
  },
  rfqSuccessRates: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    actual: [65, 68, 72, 75, 78, 82, 85, 88, 90, 87, 84, 89],
    predicted: [67, 70, 74, 77, 80, 83, 86, 89, 91, 88, 85, 90],
  },
  supplierReliability: [
    { name: 'SteelWorks Ltd', score: 92, trend: 'up', orders: 45, onTimeDelivery: 96 },
    { name: 'AutoParts Inc', score: 88, trend: 'up', orders: 32, onTimeDelivery: 91 },
    { name: 'Global Suppliers', score: 85, trend: 'stable', orders: 28, onTimeDelivery: 89 },
    { name: 'TechCorp Solutions', score: 78, trend: 'down', orders: 15, onTimeDelivery: 82 },
    { name: 'LogisticsHub India', score: 82, trend: 'up', orders: 38, onTimeDelivery: 85 },
  ],
  marketTrends: [
    { category: 'Steel & Metal', currentPrice: 45000, predictedPrice: 46500, change: 3.3, trend: 'up' },
    { category: 'Electronics', currentPrice: 12000, predictedPrice: 11500, change: -4.2, trend: 'down' },
    { category: 'Chemicals', currentPrice: 8500, predictedPrice: 8700, change: 2.4, trend: 'up' },
    { category: 'Textiles', currentPrice: 3200, predictedPrice: 3100, change: -3.1, trend: 'down' },
    { category: 'Automotive', currentPrice: 25000, predictedPrice: 25800, change: 3.2, trend: 'up' },
  ],
  aiInsights: [
    {
      type: 'success_prediction',
      title: 'High Success Probability',
      description: 'Your RFQ for Industrial Equipment has 94% success rate',
      confidence: 94,
      impact: 'high',
      action: 'Proceed with confidence',
    },
    {
      type: 'market_opportunity',
      title: 'Market Opportunity Detected',
      description: 'Steel prices expected to rise 5% in next quarter',
      confidence: 87,
      impact: 'medium',
      action: 'Consider early procurement',
    },
    {
      type: 'supplier_risk',
      title: 'Supplier Risk Alert',
      description: 'TechCorp Solutions showing declining performance',
      confidence: 82,
      impact: 'high',
      action: 'Review supplier relationship',
    },
  ],
  kpis: {
    totalRfqs: 156,
    successRate: 87.5,
    avgResponseTime: 2.3,
    costSavings: 125000,
    marketAccuracy: 91.2,
  },
};

// KPI Card Component
const KPICard = ({ title, value, change, trend, icon: Icon, color = 'blue' }) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-${color}-100 flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className="flex items-center text-sm">
          {getTrendIcon()}
          <span className={`ml-1 ${getTrendColor()}`}>{change}</span>
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

// Supplier Reliability Card
const SupplierReliabilityCard = ({ supplier }) => {
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">{supplier.name}</h4>
        <div className="flex items-center">
          {getTrendIcon(supplier.trend)}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Reliability Score</span>
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getScoreColor(supplier.score)}`}>
            {supplier.score}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${supplier.score}%` }}
          ></div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>Orders: {supplier.orders}</div>
          <div>On-time: {supplier.onTimeDelivery}%</div>
        </div>
      </div>
    </div>
  );
};

// Market Trend Card
const MarketTrendCard = ({ trend }) => {
  const getTrendIcon = () => {
    if (trend.trend === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend.trend === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = () => {
    if (trend.trend === 'up') return 'text-green-600';
    if (trend.trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">{trend.category}</h4>
        <div className="flex items-center">
          {getTrendIcon()}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Current Price</span>
          <span className="font-semibold">₹{trend.currentPrice.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Predicted Price</span>
          <span className="font-semibold">₹{trend.predictedPrice.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Change</span>
          <span className={`font-semibold ${getTrendColor()}`}>
            {trend.change > 0 ? '+' : ''}{trend.change}%
          </span>
        </div>
      </div>
    </div>
  );
};

// AI Insight Card
const AIInsightCard = ({ insight }) => {
  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high': return 'border-red-200 bg-red-50';
      case 'medium': return 'border-yellow-200 bg-yellow-50';
      case 'low': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success_prediction': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'market_opportunity': return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'supplier_risk': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Brain className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className={`p-4 rounded-lg border ${getImpactColor(insight.impact)}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          {getTypeIcon(insight.type)}
          <h4 className="font-semibold text-gray-900 ml-2">{insight.title}</h4>
        </div>
        <span className="text-sm font-semibold text-gray-600">{insight.confidence}%</span>
      </div>
      
      <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Recommended Action:</span>
        <span className="text-xs font-medium text-blue-600">{insight.action}</span>
      </div>
    </div>
  );
};

export default function PredictiveAnalyticsPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(mockPredictiveData);

  // Simulate API refresh
  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setData(mockPredictiveData);
    setIsLoading(false);
  };

  // RFQ Success Rate Chart
  const rfqChartData = {
    labels: data.rfqSuccessRates.labels,
    datasets: [
      {
        label: 'Actual Success Rate',
        data: data.rfqSuccessRates.actual,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Predicted Success Rate',
        data: data.rfqSuccessRates.predicted,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        borderDash: [5, 5],
      },
    ],
  };

  const rfqChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'RFQ Success Rate Predictions',
        font: { size: 16 },
      },
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Success Rate (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Month',
        },
      },
    },
  };

  // Market Trends Chart
  const marketChartData = {
    labels: data.marketTrends.map(trend => trend.category),
    datasets: [
      {
        label: 'Current Price',
        data: data.marketTrends.map(trend => trend.currentPrice),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Predicted Price',
        data: data.marketTrends.map(trend => trend.predictedPrice),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
    ],
  };

  const marketChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Market Price Predictions',
        font: { size: 16 },
      },
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Price (₹)',
        },
      },
    },
  };

  const user = data.user;

  return (
    <UserDashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Predictive Analytics</h1>
            <p className="text-gray-600 mt-1">AI-powered insights for RFQ success, supplier reliability, and market trends</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <KPICard
            title="Total RFQs"
            value={data.kpis.totalRfqs}
            change="+12%"
            trend="up"
            icon={Target}
            color="blue"
          />
          <KPICard
            title="Success Rate"
            value={`${data.kpis.successRate}%`}
            change="+3.2%"
            trend="up"
            icon={CheckCircle}
            color="green"
          />
          <KPICard
            title="Avg Response Time"
            value={`${data.kpis.avgResponseTime} days`}
            change="-0.5 days"
            trend="up"
            icon={Clock}
            color="purple"
          />
          <KPICard
            title="Cost Savings"
            value={`₹${data.kpis.costSavings.toLocaleString()}`}
            change="+18%"
            trend="up"
            icon={DollarSign}
            color="yellow"
          />
          <KPICard
            title="Market Accuracy"
            value={`${data.kpis.marketAccuracy}%`}
            change="+2.1%"
            trend="up"
            icon={Brain}
            color="indigo"
          />
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <Line data={rfqChartData} options={rfqChartOptions} />
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <Bar data={marketChartData} options={marketChartOptions} />
          </div>
        </div>

        {/* Supplier Reliability & Market Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Supplier Reliability Scores
            </h3>
            <div className="space-y-4">
              {data.supplierReliability.map((supplier, index) => (
                <SupplierReliabilityCard key={index} supplier={supplier} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
              Market Price Predictions
            </h3>
            <div className="space-y-4">
              {data.marketTrends.map((trend, index) => (
                <MarketTrendCard key={index} trend={trend} />
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            AI-Powered Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.aiInsights.map((insight, index) => (
              <AIInsightCard key={index} insight={insight} />
            ))}
          </div>
        </div>

        {/* Live Status Indicator */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
            <span className="text-green-800 font-medium">Live Analytics Active</span>
            <span className="text-green-600 text-sm ml-2">• Real-time data updates every 5 minutes</span>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
}