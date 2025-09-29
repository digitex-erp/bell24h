'use client';

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
}