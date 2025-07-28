'use client';

import { BarChart3, Brain, Package, Users, ArrowLeft, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { notFound } from 'next/navigation';

// ✅ CORRECT CATEGORY DATA MAPPING
const categoryData = {
  'handicrafts': {
    name: 'Handicrafts',
    icon: '🎨',
    description: 'Traditional Indian handicrafts and artisanal products from across the country',
    stats: {
      suppliers: '2,500',
      successRate: '95.2%',
      responseTime: '2.1 hours',
      monthlyVolume: '₹12.8Cr',
      growth: '+18%',
    },
    subcategories: ['Wooden Crafts', 'Metal Work', 'Textile Arts', 'Pottery', 'Jewelry'],
    featuredSuppliers: [
      { id: 1, name: 'Jaipur Handicrafts', location: 'Jaipur, Rajasthan', rating: 4.8 },
      { id: 2, name: 'Kashmir Arts', location: 'Srinagar, Kashmir', rating: 4.7 },
      { id: 3, name: 'Moradabad Brass', location: 'Moradabad, UP', rating: 4.6 }
    ]
  },
  'electronics-and-components': {
    name: 'Electronics & Components',
    icon: '🔌',
    description: 'Complete electronics ecosystem with PCB manufacturing, component sourcing, and assembly services',
    stats: {
      suppliers: '32,891',
      successRate: '94.8%',
      responseTime: '2.3 hours',
      monthlyVolume: '₹45.2Cr',
      growth: '+15%',
    },
    subcategories: ['Semiconductors', 'PCBs', 'Connectors', 'Sensors', 'Displays'],
    featuredSuppliers: [
      { id: 4, name: 'Tech Electronics Ltd', location: 'Bangalore, Karnataka', rating: 4.9 },
      { id: 5, name: 'Component Solutions', location: 'Mumbai, Maharashtra', rating: 4.8 },
      { id: 6, name: 'Electro Systems', location: 'Chennai, Tamil Nadu', rating: 4.7 }
    ]
  },
  'steel-and-metals': {
    name: 'Steel & Metals',
    icon: '🔩',
    description: 'Comprehensive steel and metal solutions for construction and manufacturing',
    stats: {
      suppliers: '1,200',
      successRate: '96.5%',
      responseTime: '3.2 hours',
      monthlyVolume: '₹28.7Cr',
      growth: '+22%',
    },
    subcategories: ['TMT Bars', 'Steel Sheets', 'Aluminum', 'Copper', 'Brass'],
    featuredSuppliers: [
      { id: 7, name: 'Tata Steel', location: 'Jamshedpur, Jharkhand', rating: 4.9 },
      { id: 8, name: 'JSW Steel', location: 'Mumbai, Maharashtra', rating: 4.8 },
      { id: 9, name: 'Metal Solutions', location: 'Ahmedabad, Gujarat', rating: 4.7 }
    ]
  },
  'construction-materials': {
    name: 'Construction Materials',
    icon: '🏗️',
    description: 'Building materials, construction supplies, and infrastructure solutions',
    stats: {
      suppliers: '800',
      successRate: '91.3%',
      responseTime: '4.5 hours',
      monthlyVolume: '₹34.5Cr',
      growth: '+13%',
    },
    subcategories: ['Cement', 'Bricks', 'Sand', 'Tiles', 'Pipes'],
    featuredSuppliers: [
      { id: 10, name: 'UltraTech Cement', location: 'Mumbai, Maharashtra', rating: 4.8 },
      { id: 11, name: 'ACC Limited', location: 'Mumbai, Maharashtra', rating: 4.7 },
      { id: 12, name: 'Construction Supply Co', location: 'Delhi, NCR', rating: 4.6 }
    ]
  },
  'textiles-and-fabrics': {
    name: 'Textiles & Fabrics',
    icon: '🧵',
    description: 'End-to-end textile solutions from fabric sourcing to garment manufacturing',
    stats: {
      suppliers: '1,100',
      successRate: '92.5%',
      responseTime: '3.1 hours',
      monthlyVolume: '₹38.7Cr',
      growth: '+12%',
    },
    subcategories: ['Cotton', 'Synthetic', 'Wool', 'Silk', 'Jute'],
    featuredSuppliers: [
      { id: 13, name: 'Arvind Mills', location: 'Ahmedabad, Gujarat', rating: 4.8 },
      { id: 14, name: 'Raymond Ltd', location: 'Mumbai, Maharashtra', rating: 4.7 },
      { id: 15, name: 'Textile Solutions', location: 'Surat, Gujarat', rating: 4.6 }
    ]
  },
  'chemicals-and-polymers': {
    name: 'Chemicals & Polymers',
    icon: '🧪',
    description: 'Chemical products, plastics, and industrial materials for various industries',
    stats: {
      suppliers: '950',
      successRate: '90.7%',
      responseTime: '3.9 hours',
      monthlyVolume: '₹29.8Cr',
      growth: '+14%',
    },
    subcategories: ['Industrial Chemicals', 'Plastics', 'Rubber', 'Adhesives'],
    featuredSuppliers: [
      { id: 16, name: 'Reliance Industries', location: 'Mumbai, Maharashtra', rating: 4.9 },
      { id: 17, name: 'Dow Chemical', location: 'Mumbai, Maharashtra', rating: 4.8 },
      { id: 18, name: 'Chemical Solutions', location: 'Vadodara, Gujarat', rating: 4.7 }
    ]
  },
  'machinery-and-equipment': {
    name: 'Machinery & Equipment',
    icon: '⚙️',
    description: 'Industrial machinery, CNC equipment, and manufacturing solutions',
    stats: {
      suppliers: '1,500',
      successRate: '96.2%',
      responseTime: '4.2 hours',
      monthlyVolume: '₹52.3Cr',
      growth: '+18%',
    },
    subcategories: ['CNC Machines', 'Lathes', 'Mills', 'Presses'],
    featuredSuppliers: [
      { id: 19, name: 'Larsen & Toubro', location: 'Mumbai, Maharashtra', rating: 4.9 },
      { id: 20, name: 'Bharat Heavy Electricals', location: 'New Delhi', rating: 4.8 },
      { id: 21, name: 'Machine Tools India', location: 'Bangalore, Karnataka', rating: 4.7 }
    ]
  },
  'automotive-parts': {
    name: 'Automotive Parts',
    icon: '🚗',
    description: 'Automotive components, spare parts, and manufacturing services',
    stats: {
      suppliers: '900',
      successRate: '93.7%',
      responseTime: '3.8 hours',
      monthlyVolume: '₹41.8Cr',
      growth: '+16%',
    },
    subcategories: ['Engine Parts', 'Brake Systems', 'Suspension', 'Electrical'],
    featuredSuppliers: [
      { id: 22, name: 'Maruti Suzuki', location: 'Gurgaon, Haryana', rating: 4.9 },
      { id: 23, name: 'Tata Motors', location: 'Mumbai, Maharashtra', rating: 4.8 },
      { id: 24, name: 'Auto Components Ltd', location: 'Chennai, Tamil Nadu', rating: 4.7 }
    ]
  },
  'paper-and-packaging': {
    name: 'Paper & Packaging',
    icon: '📦',
    description: 'Paper products, packaging materials, and printing solutions',
    stats: {
      suppliers: '650',
      successRate: '89.2%',
      responseTime: '2.8 hours',
      monthlyVolume: '₹18.4Cr',
      growth: '+9%',
    },
    subcategories: ['Corrugated', 'Kraft Paper', 'Labels', 'Tapes'],
    featuredSuppliers: [
      { id: 25, name: 'ITC Limited', location: 'Kolkata, West Bengal', rating: 4.8 },
      { id: 26, name: 'Ballarpur Industries', location: 'Mumbai, Maharashtra', rating: 4.7 },
      { id: 27, name: 'Packaging Solutions', location: 'Ahmedabad, Gujarat', rating: 4.6 }
    ]
  }
};

export default function CategoryDetailPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showRFQForm, setShowRFQForm] = useState(false);

  // ✅ CORRECT ROUTING LOGIC
  const category = categoryData[params.slug as keyof typeof categoryData];
  
  if (!category) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ Dynamic Category Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center mb-4">
            <Link href="/categories" className="text-white hover:text-blue-200 mr-4">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="text-2xl mr-3">{category.icon}</span>
            <h1 className="text-4xl font-bold">{category.name}</h1>
          </div>
          <p className="text-xl mt-2">{category.description}</p>
        </div>
      </div>

      {/* ✅ Dynamic Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{category.stats.suppliers}</div>
                    <div className="text-sm text-gray-600">Suppliers</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <BarChart3 className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{category.stats.successRate}</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <Package className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{category.stats.responseTime}</div>
                    <div className="text-sm text-gray-600">Avg Response</div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex items-center">
                  <Brain className="w-8 h-8 text-orange-600 mr-3" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{category.stats.monthlyVolume}</div>
                    <div className="text-sm text-gray-600">Monthly Volume</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Suppliers */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Featured Suppliers</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {category.featuredSuppliers.map((supplier) => (
                  <div key={supplier.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-bold text-lg">{supplier.name}</h3>
                    <p className="text-gray-600">{supplier.location}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 text-sm">{supplier.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subcategories */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Subcategories</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.subcategories.map((subcategory, index) => (
                  <Link 
                    key={index}
                    href={`/buyer/rfq/create?category=${encodeURIComponent(category.name)}&subcategory=${encodeURIComponent(subcategory)}`}
                    className="block p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <span className="text-blue-600 font-medium">{subcategory}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link 
                  href={`/buyer/rfq/create?category=${encodeURIComponent(category.name)}`}
                  className="block w-full bg-blue-600 text-white px-4 py-3 rounded-lg text-center font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Create RFQ for {category.name}
                </Link>
                
                <Link 
                  href={`/supplier/products/add?category=${encodeURIComponent(category.name)}`}
                  className="block w-full bg-green-600 text-white px-4 py-3 rounded-lg text-center font-semibold hover:bg-green-700 transition-colors"
                >
                  <Package className="w-5 h-5 inline mr-2" />
                  List {category.name} Products
                </Link>

                <Link 
                  href={`/buyer/suppliers?category=${encodeURIComponent(category.name)}`}
                  className="block w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg text-center font-semibold hover:bg-gray-200 transition-colors"
                >
                  <Search className="w-5 h-5 inline mr-2" />
                  Browse Suppliers
                </Link>
              </div>
            </div>

            {/* Category Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Category Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Growth Rate:</span>
                  <span className="font-bold text-green-600">{category.stats.growth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-bold text-blue-600">{category.stats.successRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Response:</span>
                  <span className="font-bold text-purple-600">{category.stats.responseTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


