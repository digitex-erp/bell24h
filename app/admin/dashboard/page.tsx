'use client';

import { useState, useEffect } from 'react';
import { 
  ArrowUp, 
  Users, 
  Building, 
  DollarSign, 
  Activity, 
  ArrowUp,
  ArrowDown,
  Minus,
  RefreshCw,
  Maximize2,
  Minimize2,
  Cpu,
  Shield,
  Clock,
  Zap
} from 'lucide-react';

interface DashboardMetrics {
  totalUsers: number;
  activeSuppliers: number;
  totalRevenue: number;
  systemHealth: number;
  aiAccuracy: number;
  fraudDetection: number;
  uptime: number;
  performanceScore: number;
}

interface SHAPExplanation {
  feature: string;
  importance: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalUsers: 1250,
    activeSuppliers: 847,
    totalRevenue: 12500000,
    systemHealth: 99.8,
    aiAccuracy: 94.2,
    fraudDetection: 98.1,
    uptime: 99.9,
    performanceScore: 96.8
  });

  const [shapExplanations, setShapExplanations] = useState<SHAPExplanation[]>([
    { feature: 'GST Verification', importance: 0.35, impact: 'positive', description: 'Strong indicator of supplier reliability' },
    { feature: 'Credit Score', importance: 0.28, impact: 'positive', description: 'Financial stability predictor' },
    { feature: 'Response Time', importance: 0.22, impact: 'positive', description: 'Operational efficiency measure' },
    { feature: 'Previous Disputes', importance: -0.15, impact: 'negative', description: 'Risk factor for future issues' }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const toggleCardExpansion = (cardId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  const getTrendIcon = (value: number, threshold: number = 0) => {
    if (value > threshold) return <ArrowUp className="w-4 h-4 text-green-500" />;
    if (value < threshold) return <ArrowDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (value: number, threshold: number = 0) => {
    if (value > threshold) return 'text-green-600';
    if (value < threshold) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Advanced Dashboard</h1>
              <p className="text-gray-600 mt-1">Real-time analytics with AI explainability</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.totalUsers.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(12.5)}
                  <span className={`text-sm font-medium ml-1 ${getTrendColor(12.5)}`}>+12.5%</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Active Suppliers */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.activeSuppliers.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(8.2)}
                  <span className={`text-sm font-medium ml-1 ${getTrendColor(8.2)}`}>+8.2%</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Building className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">₹{(metrics.totalRevenue / 10000000).toFixed(1)}Cr</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(15.3)}
                  <span className={`text-sm font-medium ml-1 ${getTrendColor(15.3)}`}>+15.3%</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-3xl font-bold text-gray-900">{metrics.systemHealth}%</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(0.1)}
                  <span className={`text-sm font-medium ml-1 ${getTrendColor(0.1)}`}>+0.1%</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* AI Explainability - SHAP */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">AI Trust Score Explanation (SHAP)</h3>
            <button
              onClick={() => toggleCardExpansion('shap')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              {expandedCards.has('shap') ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
          <div className="space-y-4">
            {shapExplanations.map((explanation, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      explanation.impact === 'positive' ? 'bg-green-500' : 
                      explanation.impact === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="font-medium text-gray-900">{explanation.feature}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{explanation.description}</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    explanation.impact === 'positive' ? 'text-green-600' : 
                    explanation.impact === 'negative' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {(explanation.importance * 100).toFixed(1)}%
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full ${
                        explanation.impact === 'positive' ? 'bg-green-500' : 
                        explanation.impact === 'negative' ? 'bg-red-500' : 'bg-gray-500'
                      }`}
                      style={{ width: `${Math.abs(explanation.importance) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI Accuracy</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.aiAccuracy}%</p>
              </div>
              <Cpu className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fraud Detection</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.fraudDetection}%</p>
              </div>
              <Shield className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.uptime}%</p>
              </div>
              <Clock className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Performance</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.performanceScore}%</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Real-time Activity Feed</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">New RFQ submitted</p>
                <p className="text-xs text-gray-600">Industrial IoT Sensors - ₹4.5L budget</p>
              </div>
              <span className="text-xs text-gray-500">2 min ago</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Supplier verified</p>
                <p className="text-xs text-gray-600">TechCorp Industries - AI Trust Score: 94.2%</p>
              </div>
              <span className="text-xs text-gray-500">5 min ago</span>
            </div>
            <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Payment processed</p>
                <p className="text-xs text-gray-600">₹2.3L escrow payment - Order #RFQ-2024-089</p>
              </div>
              <span className="text-xs text-gray-500">8 min ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


