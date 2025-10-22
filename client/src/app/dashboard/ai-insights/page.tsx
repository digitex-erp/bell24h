'use client';

import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  BarChart3, 
  Lightbulb, 
  RefreshCw, 
  Download, 
  Share2, 
  Filter,
  Search,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import ShapVisualization from '@/components/ShapVisualization';
import LimeExplanation from '@/components/LimeExplanation';

interface SupplierData {
  id: string;
  name: string;
  company: string;
  score: number;
  confidence: number;
  recommendation: string;
  lastUpdated: string;
  status: 'active' | 'pending' | 'inactive';
}

interface AIInsights {
  shap: any;
  lime: any;
  prediction: {
    score: number;
    confidence: number;
    recommendation: string;
    reasoning: string;
  };
}

export default function AIInsightsPage() {
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock supplier data
  useEffect(() => {
    const mockSuppliers: SupplierData[] = [
      {
        id: 'supplier-001',
        name: 'Rajesh Kumar',
        company: 'SteelWorks Ltd',
        score: 8.7,
        confidence: 0.89,
        recommendation: 'Highly Recommended',
        lastUpdated: '2024-09-28T10:30:00Z',
        status: 'active'
      },
      {
        id: 'supplier-002',
        name: 'Priya Sharma',
        company: 'AutoParts Inc',
        score: 7.2,
        confidence: 0.82,
        recommendation: 'Recommended',
        lastUpdated: '2024-09-27T15:45:00Z',
        status: 'active'
      },
      {
        id: 'supplier-003',
        name: 'Amit Patel',
        company: 'TechSolutions',
        score: 6.8,
        confidence: 0.75,
        recommendation: 'Consider',
        lastUpdated: '2024-09-26T11:20:00Z',
        status: 'pending'
      },
      {
        id: 'supplier-004',
        name: 'Sneha Reddy',
        company: 'MachineryCorp',
        score: 9.1,
        confidence: 0.94,
        recommendation: 'Highly Recommended',
        lastUpdated: '2024-09-25T14:15:00Z',
        status: 'active'
      },
      {
        id: 'supplier-005',
        name: 'Vikram Singh',
        company: 'EquipmentPro',
        score: 5.9,
        confidence: 0.68,
        recommendation: 'Review Required',
        lastUpdated: '2024-09-24T09:30:00Z',
        status: 'inactive'
      }
    ];
    setSuppliers(mockSuppliers);
  }, []);

  const fetchAIInsights = async (supplierId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai/explanations?supplierId=${supplierId}&type=both`);
      const data = await response.json();
      setAiInsights(data);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierSelect = (supplierId: string) => {
    setSelectedSupplier(supplierId);
    fetchAIInsights(supplierId);
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'Highly Recommended':
        return 'text-green-600 bg-green-100';
      case 'Recommended':
        return 'text-blue-600 bg-blue-100';
      case 'Consider':
        return 'text-yellow-600 bg-yellow-100';
      case 'Review Required':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation) {
      case 'Highly Recommended':
        return <CheckCircle className="w-4 h-4" />;
      case 'Recommended':
        return <TrendingUp className="w-4 h-4" />;
      case 'Consider':
        return <Target className="w-4 h-4" />;
      case 'Review Required':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || supplier.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Insights Dashboard</h1>
          <p className="text-gray-600 mt-2">Understand how AI evaluates suppliers with explainable insights</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => selectedSupplier && fetchAIInsights(selectedSupplier)}
            disabled={loading}
            data-testid="refresh-button"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            data-testid="export-button"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supplier List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Suppliers</h2>
              <div className="flex space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-testid="search-input"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  data-testid="status-filter"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="space-y-3" data-testid="supplier-list">
              {filteredSuppliers.map((supplier) => (
                <div
                  key={supplier.id}
                  data-testid="supplier-item"
                  onClick={() => handleSupplierSelect(supplier.id)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedSupplier === supplier.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                      <p className="text-sm text-gray-600">{supplier.company}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm font-medium text-gray-900">
                          Score: {supplier.score}/10
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getRecommendationColor(supplier.recommendation)}`}>
                          {getRecommendationIcon(supplier.recommendation)}
                          <span className="ml-1">{supplier.recommendation}</span>
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {(supplier.confidence * 100).toFixed(0)}% confidence
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" data-testid="loading-spinner" />
              <p className="text-gray-600">Loading AI insights...</p>
            </div>
          ) : selectedSupplier && aiInsights ? (
            <div className="space-y-6" data-testid="ai-insights">
              {/* Prediction Summary */}
              <div className="bg-white rounded-lg shadow-sm border p-6" data-testid="prediction-summary">
                <div className="flex items-center mb-4">
                  <Brain className="w-6 h-6 text-purple-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-900">AI Prediction Summary</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1" data-testid="overall-score">
                      {aiInsights.prediction.score}/10
                    </div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1" data-testid="confidence">
                      {(aiInsights.prediction.confidence * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Confidence</div>
                  </div>
                  <div className="text-center">
                    <div className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${getRecommendationColor(aiInsights.prediction.recommendation)}`} data-testid="recommendation">
                      {getRecommendationIcon(aiInsights.prediction.recommendation)}
                      <span className="ml-1">{aiInsights.prediction.recommendation}</span>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Recommendation</div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">AI Reasoning</h4>
                  <p className="text-sm text-gray-700">{aiInsights.prediction.reasoning}</p>
                </div>
              </div>

              {/* SHAP Visualization */}
              {aiInsights.shap && (
                <ShapVisualization
                  data={aiInsights.shap.data}
                  title="SHAP Feature Importance"
                  type="bar"
                  onFeatureClick={(feature) => console.log('Feature clicked:', feature)}
                />
              )}

              {/* LIME Explanation */}
              {aiInsights.lime && (
                <LimeExplanation
                  explanations={aiInsights.lime.data}
                  prediction={aiInsights.prediction.recommendation}
                  confidence={aiInsights.prediction.confidence}
                  onFeatureClick={(feature) => console.log('Feature clicked:', feature)}
                />
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
              <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Supplier</h3>
              <p className="text-gray-600">Choose a supplier from the list to view AI insights and explanations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
