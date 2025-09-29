'use client';

import React, { useState } from 'react';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  MapPin,
  Star,
  Eye,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  Award,
} from 'lucide-react';
import UserDashboardLayout from '@/components/dashboard/UserDashboardLayout';

// Mock data
const mockRiskData = {
  user: { name: 'Rajesh Kumar', company: 'TechCorp Industries' },
  overallRiskScore: 78,
  totalSuppliers: 45,
  highRiskSuppliers: 3,
  mediumRiskSuppliers: 12,
  lowRiskSuppliers: 30,
  suppliers: [
    {
      id: 'SUP001',
      name: 'SteelWorks Ltd',
      category: 'Steel & Metal',
      riskScore: 92,
      riskLevel: 'Low',
      location: 'Mumbai, India',
      totalOrders: 156,
      onTimeDelivery: 96,
      qualityRating: 4.8,
      gstVerified: true,
      lastOrderDate: '2024-09-25',
      riskFactors: [],
      strengths: ['On-time delivery', 'Quality consistency'],
    },
    {
      id: 'SUP002',
      name: 'AutoParts Inc',
      category: 'Automotive',
      riskScore: 88,
      riskLevel: 'Low',
      location: 'Chennai, India',
      totalOrders: 89,
      onTimeDelivery: 91,
      qualityRating: 4.5,
      gstVerified: true,
      lastOrderDate: '2024-09-20',
      riskFactors: ['Slightly longer payment terms'],
      strengths: ['Good quality', 'Reliable delivery'],
    },
    {
      id: 'SUP003',
      name: 'TechCorp Solutions',
      category: 'Electronics',
      riskScore: 45,
      riskLevel: 'High',
      location: 'Bangalore, India',
      totalOrders: 23,
      onTimeDelivery: 78,
      qualityRating: 3.2,
      gstVerified: false,
      lastOrderDate: '2024-08-15',
      riskFactors: ['Late deliveries', 'Quality issues', 'Unverified GST'],
      strengths: ['Competitive pricing'],
    },
  ],
};

const RiskScoreCard = ({ score, level }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Overall Risk Score</h3>
        <Shield className="w-6 h-6 text-blue-600" />
      </div>
      
      <div className="text-center">
        <div className="text-4xl font-bold text-gray-900 mb-2">{score}</div>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(score)}`}>
          {level} Risk
        </div>
      </div>
    </div>
  );
};

const SupplierCard = ({ supplier }) => {
  const getRiskColor = (level) => {
    switch (level) {
      case 'Low': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'High': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h4 className="text-lg font-semibold text-gray-900 mr-3">{supplier.name}</h4>
            <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(supplier.riskLevel)}`}>
              {supplier.riskLevel} Risk
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Building2 className="w-4 h-4 mr-1" />
            <span>{supplier.category}</span>
            <span className="mx-2">•</span>
            <MapPin className="w-4 h-4 mr-1" />
            <span>{supplier.location}</span>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">{supplier.riskScore}</div>
          <div className="text-xs text-gray-500">Risk Score</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Total Orders</div>
          <div className="text-lg font-semibold text-gray-900">{supplier.totalOrders}</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">On-time Delivery</div>
          <div className="text-lg font-semibold text-gray-900">{supplier.onTimeDelivery}%</div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">Quality Rating</div>
          <div className="text-lg font-semibold text-gray-900 flex items-center">
            <Star className="w-4 h-4 text-yellow-400 mr-1" />
            {supplier.qualityRating}
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-600">GST Status</div>
          <div className="text-lg font-semibold text-gray-900 flex items-center">
            {supplier.gstVerified ? (
              <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-500 mr-1" />
            )}
            {supplier.gstVerified ? 'Verified' : 'Unverified'}
          </div>
        </div>
      </div>

      {supplier.riskFactors.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-red-600 mb-2">Risk Factors:</div>
          <div className="flex flex-wrap gap-1">
            {supplier.riskFactors.map((factor, index) => (
              <span key={index} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                {factor}
              </span>
            ))}
          </div>
        </div>
      )}

      {supplier.strengths.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium text-green-600 mb-2">Strengths:</div>
          <div className="flex flex-wrap gap-1">
            {supplier.strengths.map((strength, index) => (
              <span key={index} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                {strength}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          <span>Last Order: {supplier.lastOrderDate}</span>
        </div>
        <button className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800">
          <Eye className="w-4 h-4 mr-1" />
          View Details
        </button>
      </div>
    </div>
  );
};

export default function SupplierRiskPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [data] = useState(mockRiskData);

  const filteredSuppliers = data.suppliers.filter(supplier => {
    const matchesFilter = filter === 'all' || supplier.riskLevel.toLowerCase() === filter;
    const matchesSearch = 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const user = data.user;

  return (
    <UserDashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Supplier Risk Scoring</h1>
            <p className="text-gray-600 mt-1">AI-powered risk assessment and supplier reliability analysis</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        {/* Risk Score & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RiskScoreCard score={data.overallRiskScore} level="Medium" />
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-600" />
              Supplier Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Suppliers</span>
                <span className="font-semibold text-gray-900">{data.totalSuppliers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Low Risk</span>
                <span className="font-semibold text-green-600">{data.lowRiskSuppliers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Medium Risk</span>
                <span className="font-semibold text-yellow-600">{data.mediumRiskSuppliers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">High Risk</span>
                <span className="font-semibold text-red-600">{data.highRiskSuppliers}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2 text-green-600" />
              Compliance Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">GST Verified</span>
                <span className="font-semibold text-gray-900">42/45</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '93%' }}></div>
              </div>
              <div className="text-sm text-gray-600">93.3% Compliance Rate</div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {['all', 'low', 'medium', 'high'].map((riskLevel) => (
                <button
                  key={riskLevel}
                  onClick={() => setFilter(riskLevel)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filter === riskLevel
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Suppliers List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => (
            <SupplierCard key={supplier.id} supplier={supplier} />
          ))}
        </div>

        {/* Live Status Indicator */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-3"></div>
            <span className="text-green-800 font-medium">Live Risk Assessment Active</span>
            <span className="text-green-600 text-sm ml-2">• Real-time risk scoring and monitoring</span>
          </div>
        </div>
      </div>
    </UserDashboardLayout>
  );
}