'use client';

import React, { useState, useEffect } from 'react';
import { AIInsights, AlertCircle, BarChart3, Brain, CheckCircle, Clock, Download, Eye, Filter, LimeExplanation, RefreshCw, Search, Settings, ShapVisualization, Supplier, Target, TrendingUp, Users, Zap } from 'lucide-react';;;
import { ShapVisualization } from '@/components/ShapVisualization';
import { LimeExplanation } from '@/components/LimeExplanation';

interface Supplier {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  aiScore: number;
  confidence: number;
  status: 'active' | 'pending' | 'inactive';
  lastUpdated: string;
  features: {
    [key: string]: number;
  };
}

interface AIInsights {
  supplierId: string;
  shapData: any[];
  limeData: any[];
  prediction: {
    score: number;
    confidence: number;
    recommendation: string;
    riskLevel: 'low' | 'medium' | 'high';
  };
  features: {
    name: string;
    importance: number;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
}

export default function AIInsightsDashboard() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(&apos;');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('aiScore);
  const [viewMode, setViewMode] = useState<overview' | 'detailed'>('overview');

  // Mock data - in production, this would come from your API
  useEffect(() => {
    const mockSuppliers: Supplier[] = [
      {
        id: '1',
        name: 'TechCorp Solutions',
        category: 'Technology',
        location: 'Mumbai, India',
        rating: 4.8,
        aiScore: 92,
        confidence: 0.89,
        status: 'active',
        lastUpdated: '2024-01-15',
        features: {
          'Financial Stability': 0.85,
          'Delivery Performance': 0.92,
          'Quality Rating': 0.88,
          'Innovation Index': 0.79,
          'Customer Satisfaction': 0.91
        }
      },
      {
        id: '2',
        name: 'Global Manufacturing Ltd',
        category: 'Manufacturing',
        location: 'Delhi, India',
        rating: 4.5,
        aiScore: 78,
        confidence: 0.76,
        status: 'active',
        lastUpdated: '2024-01-14',
        features: {
          'Financial Stability': 0.72,
          'Delivery Performance': 0.85,
          'Quality Rating': 0.79,
          'Innovation Index': 0.65,
          'Customer Satisfaction': 0.82
        }
      },
      {
        id: '3',
        name: 'InnovateTech Systems',
        category: 'Technology',
        location: 'Bangalore, India',
        rating: 4.9,
        aiScore: 95,
        confidence: 0.93,
        status: 'active',
        lastUpdated: '2024-01-16',
        features: {
          'Financial Stability': 0.91,
          'Delivery Performance': 0.94,
          'Quality Rating': 0.96,
          'Innovation Index': 0.98,
          'Customer Satisfaction': 0.93
        }
      },
      {
        id: '4',
        name: 'Reliable Logistics',
        category: 'Logistics',
        location: 'Chennai, India',
        rating: 4.2,
        aiScore: 71,
        confidence: 0.68,
        status: 'pending',
        lastUpdated: '2024-01-13',
        features: {
          'Financial Stability': 0.65,
          'Delivery Performance': 0.78,
          'Quality Rating': 0.72,
          'Innovation Index': 0.58,
          'Customer Satisfaction': 0.75
        }
      }
    ];

    setSuppliers(mockSuppliers);
  }, []);

  const fetchAIInsights = async (supplierId: string) => {
    setLoading(true);
    try {
      // Mock API call - in production, this would be a real API call
      const response = await fetch(`/api/ai/explanations?supplierId=${supplierId}`);
      const data = await response.json();
      setAiInsights(data);
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierSelect = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    fetchAIInsights(supplier.id);
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    switch (sortBy) {
      case 'aiScore':
        return b.aiScore - a.aiScore;
      case 'rating':
        return b.rating - a.rating;
      case 'confidence':
        return b.confidence - a.confidence;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <Brain className="w-8 h-8 mr-3 text-blue-600" />
                AI Insights Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Explainable AI for supplier evaluation and decision making
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                {viewMode === 'overview' ? 'Detailed View' : 'Overview'}
              </button>
              <button 
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                data-testid="export-button"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Supplier List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Suppliers</h2>
                
              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search suppliers..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    data-testid="search-input"
                  />
                </div>
                  
                  <div className="flex space-x-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      data-testid="status-filter"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="pending">Pending</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="aiScore">AI Score</option>
                      <option value="rating">Rating</option>
                      <option value="confidence">Confidence</option>
                      <option value="name">Name</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Supplier List */}
              <div className="max-h-96 overflow-y-auto" data-testid="supplier-list">
                {sortedSuppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    onClick={() => handleSupplierSelect(supplier)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedSupplier?.id === supplier.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    data-testid="supplier-item"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        supplier.status === 'active' ? 'bg-green-100 text-green-800' :
                        supplier.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {supplier.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      {supplier.category} • {supplier.location}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-1">AI Score:</span>
                          <span className={`font-medium ${getScoreColor(supplier.aiScore)}`}>
                            {supplier.aiScore}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm text-gray-600 mr-1">Rating:</span>
                          <span className="font-medium">{supplier.rating}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {supplier.lastUpdated}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="lg:col-span-2">
            {selectedSupplier ? (
              <div className="space-y-6">
                {/* Supplier Overview */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {selectedSupplier.name} - AI Analysis
                    </h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Confidence:</span>
                      <span className="font-medium text-blue-600">
                        {(selectedSupplier.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(selectedSupplier.aiScore)}`}>
                        {selectedSupplier.aiScore}
                      </div>
                      <div className="text-sm text-gray-600">AI Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {selectedSupplier.rating}
                      </div>
                      <div className="text-sm text-gray-600">Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {selectedSupplier.category}
                      </div>
                      <div className="text-sm text-gray-600">Category</div>
                    </div>
                  </div>

                  {/* Feature Breakdown */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900 mb-3">Feature Analysis</h3>
                    {Object.entries(selectedSupplier.features).map(([feature, value]) => (
                      <div key={feature} className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">{feature}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${value * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-12 text-right">
                            {(value * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SHAP/LIME Visualizations */}
                {loading ? (
                  <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" data-testid="loading-spinner" />
                    <p className="text-gray-600">Loading AI insights...</p>
                  </div>
                ) : aiInsights ? (
                  <div className="space-y-6" data-testid="ai-insights">
                    {/* SHAP Visualization */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                        SHAP Analysis
                      </h3>
                      <ShapVisualization
                        data={aiInsights.shapData}
                        title="Feature Importance Analysis"
                        type="bar"
                        width={600}
                        height={400}
                        onFeatureClick={(feature) => console.log('Feature clicked:', feature)}
                      />
                    </div>

                    {/* LIME Explanation */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Target className="w-5 h-5 mr-2 text-green-600" />
                        LIME Explanation
                      </h3>
                      <LimeExplanation
                        data={aiInsights.limeData}
                        prediction={aiInsights.prediction}
                        features={aiInsights.features}
                        onFeatureHover={(feature) => console.log('Feature hovered:', feature)}
                      />
                    </div>

                    {/* AI Recommendation */}
                    <div className="bg-white rounded-lg shadow-sm border p-6" data-testid="prediction-summary">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-purple-600" />
                        AI Recommendation
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Risk Level:</span>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(aiInsights.prediction.riskLevel)}`}>
                            {aiInsights.prediction.riskLevel.toUpperCase()}
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-800" data-testid="recommendation">{aiInsights.prediction.recommendation}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Overall Score:</span>
                          <span className="font-medium" data-testid="overall-score">{aiInsights.prediction.score}/100</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Confidence:</span>
                          <span className="font-medium" data-testid="confidence">{(aiInsights.prediction.confidence * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                    <AlertCircle className="w-8 h-8 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Select a supplier to view AI insights</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                <Brain className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Supplier Selected</h3>
                <p className="text-gray-600">Choose a supplier from the list to view AI insights and explanations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}