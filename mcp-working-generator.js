#!/usr/bin/env node

// MCP Working Generator - Creates complete pages instantly
const fs = require('fs');
const path = require('path');

console.log('🚀 MCP Working Generator - Creating Pages Instantly...\n');

// Page templates
const pageTemplates = {
  'suppliers-verified': {
    title: 'Verified Suppliers',
    description: 'Browse verified suppliers with search and filter capabilities',
    features: ['Search functionality', 'Category filters', 'Grid layout', 'Supplier cards', 'Verification badges'],
    content: `'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SuppliersVerifiedPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'steel', label: 'Steel & Metals' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'chemicals', label: 'Chemicals' },
    { value: 'machinery', label: 'Machinery' }
  ];

  useEffect(() => {
    fetchSuppliers();
  }, [searchTerm, selectedCategory]);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      params.append('verified', 'true');
      
      const response = await fetch('/api/suppliers?' + params);
      const data = await response.json();
      setSuppliers(data.suppliers || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Verified Suppliers</h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect with trusted, verified suppliers across India
            </p>
            
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search suppliers, companies, or products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={"px-4 py-3 rounded-lg " + (viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700')}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={"px-4 py-3 rounded-lg " + (viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700')}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Suppliers Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : suppliers.length > 0 ? (
              <div className={"grid gap-6 " + (viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1')}>
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{supplier.company}</h3>
                        <p className="text-gray-600">{supplier.name}</p>
                      </div>
                      {supplier.verified && (
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span> {supplier.location}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Rating:</span> {supplier.rating}/5.0
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">RFQs:</span> {supplier.rfqCount}
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Products:</p>
                      <div className="flex flex-wrap gap-1">
                        {supplier.products.slice(0, 3).map((product, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {product}
                          </span>
                        ))}
                        {supplier.products.length > 3 && (
                          <span className="text-xs text-gray-500">+{supplier.products.length - 3} more</span>
                        )}
                      </div>
                    </div>
                    
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No suppliers found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}`
  },

  'products-search': {
    title: 'Product Search',
    description: 'Search and discover products across all categories',
    features: ['Product search', 'Category filters', 'Price range', 'Comparison', 'Wishlist'],
    content: `'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProductsSearchPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('relevance');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'steel', label: 'Steel & Metals' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'chemicals', label: 'Chemicals' },
    { value: 'machinery', label: 'Machinery' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, priceRange, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockProducts = [
        {
          id: '1',
          name: 'Steel Pipes - Grade A',
          category: 'steel',
          price: 2500,
          rating: 4.5,
          supplier: 'SteelCo India',
          image: '/images/steel-pipes.jpg',
          description: 'High-quality steel pipes for construction and industrial use'
        },
        {
          id: '2',
          name: 'Cotton Fabric - Premium',
          category: 'textiles',
          price: 150,
          rating: 4.8,
          supplier: 'Textile Innovations',
          image: '/images/cotton-fabric.jpg',
          description: 'Premium cotton fabric for clothing and home textiles'
        }
      ];
      
      setProducts(mockProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Product Search</h1>
            <p className="text-lg text-gray-600 mb-8">
              Discover products from verified suppliers across India
            </p>
            
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                    <div className="h-48 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                    <div className="aspect-w-16 aspect-h-12">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-t-lg"
                        onError={(e) => {
                          e.target.src = '/images/placeholder-product.jpg';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-bold text-blue-600">
                          ₹{product.price.toLocaleString()}
                        </span>
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">by {product.supplier}</p>
                      <div className="flex gap-2">
                        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                          View Details
                        </button>
                        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          ♡
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}`
  },

  'rfq-create': {
    title: 'Create RFQ',
    description: 'Create a Request for Quotation to get quotes from suppliers',
    features: ['RFQ form', 'Category selection', 'Specifications', 'Deadline', 'Budget range'],
    content: `'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RFQCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    specifications: '',
    quantity: '',
    budget: '',
    deadline: '',
    urgency: 'normal',
    location: ''
  });

  const categories = [
    { value: '', label: 'Select Category' },
    { value: 'steel', label: 'Steel & Metals' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'chemicals', label: 'Chemicals' },
    { value: 'machinery', label: 'Machinery' },
    { value: 'construction', label: 'Construction' },
    { value: 'automotive', label: 'Automotive' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low (7+ days)' },
    { value: 'normal', label: 'Normal (3-7 days)' },
    { value: 'high', label: 'High (1-3 days)' },
    { value: 'urgent', label: 'Urgent (24 hours)' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/rfq/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        router.push('/rfq/' + result.id);
      } else {
        throw new Error('Failed to create RFQ');
      }
    } catch (error) {
      console.error('Error creating RFQ:', error);
      alert('Failed to create RFQ. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Create RFQ</h1>
            <p className="text-lg text-gray-600 mb-8">
              Get quotes from verified suppliers for your requirements
            </p>
          </div>
        </section>

        {/* RFQ Form */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      RFQ Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Steel Pipes for Construction Project"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your requirements in detail..."
                  />
                </div>

                <div className="mb-6">
                  <label htmlFor="specifications" className="block text-sm font-medium text-gray-700 mb-2">
                    Technical Specifications
                  </label>
                  <textarea
                    id="specifications"
                    name="specifications"
                    value={formData.specifications}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Include technical specifications, dimensions, materials, etc."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="text"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 100 pieces"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Range
                    </label>
                    <input
                      type="text"
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., ₹50,000 - ₹1,00,000"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                      Deadline *
                    </label>
                    <input
                      type="date"
                      id="deadline"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency Level
                    </label>
                    <select
                      id="urgency"
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {urgencyLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Mumbai, Maharashtra"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Creating RFQ...' : 'Create RFQ'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}`
  },

  'dashboard-analytics': {
    title: 'Analytics Dashboard',
    description: 'View analytics and insights for your business',
    features: ['Analytics charts', 'Key metrics', 'Performance data', 'Export reports'],
    content: `'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function DashboardAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/analytics?range=' + timeRange);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const timeRanges = [
    { value: '1d', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <section className="bg-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
                <p className="text-gray-600">Monitor your business performance and insights</p>
              </div>
              <div className="mt-4 md:mt-0">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {timeRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Cards */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.metrics?.totalUsers?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-green-600 font-medium">
                    +{analytics?.growth?.userGrowth || 0}% from last period
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.metrics?.activeSuppliers?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-green-600 font-medium">
                    +{analytics?.growth?.supplierGrowth || 0}% from last period
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{analytics?.metrics?.totalRevenue?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-green-600 font-medium">
                    +{analytics?.growth?.revenueGrowth || 0}% from last period
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">System Health</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.metrics?.systemHealth || 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-green-600 font-medium">All systems operational</span>
                </div>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">New RFQs</span>
                    <span className="text-sm font-medium text-gray-900">
                      {analytics?.metrics?.recentRfqs || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">New Leads</span>
                    <span className="text-sm font-medium text-gray-900">
                      {analytics?.metrics?.recentLeads || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">AI Accuracy</span>
                    <span className="text-sm font-medium text-gray-900">
                      {analytics?.metrics?.aiAccuracy || 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="text-sm font-medium text-gray-900">
                      {analytics?.metrics?.uptime || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Performance Score</span>
                    <span className="text-sm font-medium text-gray-900">
                      {analytics?.metrics?.performanceScore || 0}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Fraud Detection</span>
                    <span className="text-sm font-medium text-gray-900">
                      {analytics?.metrics?.fraudDetection || 0}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
                    Export Report
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
                    View Detailed Analytics
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg">
                    Schedule Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}`
  }
};

// Generate a single page
function generatePage(pageName) {
  const template = pageTemplates[pageName];
  if (!template) {
    console.log(`❌ Template not found for: ${pageName}`);
    console.log('Available templates:', Object.keys(pageTemplates).join(', '));
    return false;
  }

  const pageDir = path.join(process.cwd(), 'app', pageName);
  const pageFile = path.join(pageDir, 'page.tsx');

  // Create directory if it doesn't exist
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }

  // Write the page file
  fs.writeFileSync(pageFile, template.content);
  console.log(`✅ Generated: ${pageName}/page.tsx`);
  console.log(`   Title: ${template.title}`);
  console.log(`   Features: ${template.features.join(', ')}`);
  
  return true;
}

// Generate all B2B pages
function generateAllB2B() {
  console.log('🚀 Generating all B2B marketplace pages...\n');
  
  const pages = Object.keys(pageTemplates);
  let successCount = 0;
  
  pages.forEach(pageName => {
    if (generatePage(pageName)) {
      successCount++;
    }
  });
  
  console.log(`\n🎉 Generated ${successCount}/${pages.length} pages successfully!`);
  console.log('\n📁 Generated pages:');
  pages.forEach(pageName => {
    console.log(`   - app/${pageName}/page.tsx`);
  });
  
  return successCount;
}

// Generate multiple specific pages
function generateMultiple(pages) {
  console.log(`🚀 Generating ${pages.length} specific pages...\n`);
  
  let successCount = 0;
  
  pages.forEach(pageName => {
    if (generatePage(pageName)) {
      successCount++;
    }
  });
  
  console.log(`\n🎉 Generated ${successCount}/${pages.length} pages successfully!`);
  
  return successCount;
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node mcp-working-generator.js b2b                    # Generate all B2B pages');
    console.log('  node mcp-working-generator.js page [page-name]       # Generate specific page');
    console.log('  node mcp-working-generator.js multiple [page1] [page2] # Generate multiple pages');
    console.log('\nAvailable pages:', Object.keys(pageTemplates).join(', '));
    return;
  }
  
  const command = args[0];
  
  switch (command) {
    case 'b2b':
      generateAllB2B();
      break;
      
    case 'page':
      if (args[1]) {
        generatePage(args[1]);
      } else {
        console.log('❌ Please specify a page name');
        console.log('Available pages:', Object.keys(pageTemplates).join(', '));
      }
      break;
      
    case 'multiple':
      if (args.length > 1) {
        generateMultiple(args.slice(1));
      } else {
        console.log('❌ Please specify page names');
        console.log('Available pages:', Object.keys(pageTemplates).join(', '));
      }
      break;
      
    default:
      console.log(`❌ Unknown command: ${command}`);
      console.log('Use "b2b", "page", or "multiple"');
  }
}

// Run the generator
main();
