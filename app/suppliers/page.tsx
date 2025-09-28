'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Supplier {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  location: string;
  verified: boolean;
  rating: number;
  products: string[];
  category: string;
  createdAt: string;
  _count: {
    rfqs: number;
    leads: number;
  };
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, [searchTerm, selectedCategory, showVerifiedOnly]);

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '50'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (showVerifiedOnly) params.append('verified', 'true');

      const response = await fetch(`/api/suppliers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.suppliers || []);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    'all', 'electronics', 'textiles-garments', 'pharmaceuticals', 
    'agricultural-products', 'automotive-parts', 'it-services'
  ];

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading suppliers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="page-content">
          <div className="text-center">
            <h1 className="page-title">
              Verified Suppliers
            </h1>
            <p className="page-subtitle mb-8">
              Connect with trusted suppliers across India
            </p>
            
            {/* Search and Filters */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search suppliers by name, company, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="electronics">Electronics</option>
                    <option value="textiles-garments">Textiles & Garments</option>
                    <option value="pharmaceuticals">Pharmaceuticals</option>
                    <option value="agricultural-products">Agricultural Products</option>
                    <option value="automotive-parts">Automotive Parts</option>
                    <option value="it-services">IT Services</option>
                  </select>
                  <button
                    onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
                    className={`px-4 py-3 rounded-lg transition-colors ${
                      showVerifiedOnly 
                        ? 'bg-green-600 text-white' 
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {showVerifiedOnly ? '✓ Verified Only' : 'Show All'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Total Suppliers</p>
                <p className="text-3xl font-bold text-neutral-900">{suppliers.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">🏢</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Verified Suppliers</p>
                <p className="text-3xl font-bold text-neutral-900">
                  {suppliers.filter(s => s.verified).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Active This Month</p>
                <p className="text-3xl font-bold text-neutral-900">
                  {suppliers.filter(s => {
                    const monthAgo = new Date();
                    monthAgo.setMonth(monthAgo.getMonth() - 1);
                    return new Date(s.createdAt) > monthAgo;
                  }).length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Suppliers Grid */}
        {suppliers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No suppliers found</h3>
            <p className="text-neutral-600 mb-6">
              Try adjusting your search criteria or filters
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setShowVerifiedOnly(false);
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suppliers.map((supplier) => (
              <div key={supplier.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="feature-title text-neutral-900">{supplier.company}</h3>
                    <p className="text-neutral-600">{supplier.name}</p>
                    <p className="text-sm text-neutral-500">{supplier.location}</p>
                  </div>
                  {supplier.verified && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                      ✓ Verified
                    </span>
                  )}
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${i < supplier.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-neutral-600">{supplier.rating}/5</span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-neutral-600 mb-2">Products:</p>
                  <div className="flex flex-wrap gap-1">
                    {supplier.products.slice(0, 3).map((product, index) => (
                      <span key={index} className="bg-neutral-100 text-neutral-700 text-xs px-2 py-1 rounded">
                        {product}
                      </span>
                    ))}
                    {supplier.products.length > 3 && (
                      <span className="text-xs text-neutral-500">+{supplier.products.length - 3} more</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-neutral-500 mb-4">
                  <span>{supplier._count.rfqs} RFQs</span>
                  <span>{supplier._count.leads} Leads</span>
                  <span>Joined {new Date(supplier.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/suppliers/${supplier.id}`}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors text-center text-sm"
                  >
                    View Profile
                  </Link>
                  <Link
                    href={`/rfq/create?supplier=${supplier.id}`}
                    className="flex-1 border border-indigo-600 text-indigo-600 py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors text-center text-sm"
                  >
                    Send RFQ
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}