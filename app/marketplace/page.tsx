'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  description: string;
  supplierCount: number;
  productCount: number;
  icon: string;
  color: string;
}

interface Supplier {
  id: string;
  name: string;
  company: string;
  category: string;
  location: string;
  rating: number;
  verified: boolean;
  products: string[];
  gstNumber?: string;
  establishedYear?: number;
  employeeCount?: string;
  certifications?: string[];
}

export default function MarketplacePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const fetchMarketplaceData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch categories and suppliers data with enhanced error handling
      const [categoriesRes, suppliersRes] = await Promise.all([
        fetch('/api/marketplace/categories', { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-cache'
        }),
        fetch('/api/marketplace/suppliers', { 
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-cache'
        })
      ]);

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.categories || []);
      } else {
        console.warn('Categories API failed, using fallback data');
        setCategories(getFallbackCategories());
      }

      if (suppliersRes.ok) {
        const suppliersData = await suppliersRes.json();
        setSuppliers(suppliersData.suppliers || []);
      } else {
        console.warn('Suppliers API failed, using fallback data');
        setSuppliers(getFallbackSuppliers());
      }
    } catch (error) {
      console.error('Error fetching marketplace data:', error);
      // Use fallback data on error
      setCategories(getFallbackCategories());
      setSuppliers(getFallbackSuppliers());
    } finally {
      setIsLoading(false);
    }
  };

  // Fallback data for when APIs are not available
  const getFallbackCategories = (): Category[] => [
    { id: 'manufacturing', name: 'Manufacturing', description: 'Industrial equipment and machinery', supplierCount: 1250, productCount: 15420, icon: '🏭', color: 'bg-blue-100' },
    { id: 'textiles', name: 'Textiles', description: 'Fabric, clothing, and textile products', supplierCount: 890, productCount: 12300, icon: '👕', color: 'bg-green-100' },
    { id: 'electronics', name: 'Electronics', description: 'Electronic components and devices', supplierCount: 650, productCount: 8900, icon: '📱', color: 'bg-purple-100' },
    { id: 'construction', name: 'Construction', description: 'Building materials and construction supplies', supplierCount: 1100, productCount: 18750, icon: '🏗️', color: 'bg-orange-100' },
    { id: 'chemicals', name: 'Chemicals', description: 'Chemical raw materials and compounds', supplierCount: 420, productCount: 5600, icon: '🧪', color: 'bg-red-100' },
    { id: 'machinery', name: 'Machinery', description: 'Heavy machinery and equipment', supplierCount: 780, productCount: 11200, icon: '⚙️', color: 'bg-gray-100' },
    { id: 'packaging', name: 'Packaging', description: 'Packaging materials and solutions', supplierCount: 340, productCount: 4200, icon: '📦', color: 'bg-yellow-100' },
    { id: 'automotive', name: 'Automotive', description: 'Auto parts and automotive supplies', supplierCount: 560, productCount: 7800, icon: '🚗', color: 'bg-indigo-100' }
  ];

  const getFallbackSuppliers = (): Supplier[] => [
    { id: '1', name: 'Rajesh Kumar', company: 'Steel Works India Ltd', category: 'manufacturing', location: 'Mumbai, Maharashtra', rating: 4.8, verified: true, products: ['Steel Pipes', 'Steel Sheets', 'Steel Rods'], gstNumber: '27AABCU9603R1ZX', establishedYear: 2015, employeeCount: '50-100', certifications: ['ISO 9001', 'GST Registered'] },
    { id: '2', name: 'Priya Sharma', company: 'Textile Solutions Pvt Ltd', category: 'textiles', location: 'Surat, Gujarat', rating: 4.6, verified: true, products: ['Cotton Fabric', 'Silk Material', 'Synthetic Textiles'], gstNumber: '24AABCU9603R1ZY', establishedYear: 2012, employeeCount: '100-200', certifications: ['OEKO-TEX', 'GST Registered'] },
    { id: '3', name: 'Amit Patel', company: 'ElectroTech Components', category: 'electronics', location: 'Bangalore, Karnataka', rating: 4.9, verified: true, products: ['Circuit Boards', 'Electronic Components', 'LED Lights'], gstNumber: '29AABCU9603R1ZZ', establishedYear: 2018, employeeCount: '25-50', certifications: ['ISO 14001', 'GST Registered'] },
    { id: '4', name: 'Sunita Singh', company: 'Construction Materials Co', category: 'construction', location: 'Delhi, NCR', rating: 4.5, verified: true, products: ['Cement', 'Steel Bars', 'Bricks'], gstNumber: '07AABCU9603R1ZA', establishedYear: 2010, employeeCount: '200+', certifications: ['BIS Certified', 'GST Registered'] },
    { id: '5', name: 'Vikram Reddy', company: 'ChemCorp Industries', category: 'chemicals', location: 'Chennai, Tamil Nadu', rating: 4.7, verified: true, products: ['Industrial Chemicals', 'Solvents', 'Raw Materials'], gstNumber: '33AABCU9603R1ZB', establishedYear: 2016, employeeCount: '50-100', certifications: ['ISO 45001', 'GST Registered'] },
    { id: '6', name: 'Meera Joshi', company: 'Machine Works Ltd', category: 'machinery', location: 'Pune, Maharashtra', rating: 4.8, verified: true, products: ['CNC Machines', 'Industrial Equipment', 'Spare Parts'], gstNumber: '27AABCU9603R1ZC', establishedYear: 2014, employeeCount: '100-200', certifications: ['CE Marked', 'GST Registered'] }
  ];

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.products.some(product => product.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || supplier.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading marketplace...</p>
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
          B2B Marketplace
        </h1>
            <p className="page-subtitle mb-8">
              Connect with verified suppliers across India
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search suppliers, products, or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-6 py-4 pl-12 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === 'all' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                All Categories
              </button>
              {categories.slice(0, 8).map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    selectedCategory === category.id 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
          </div>
          
      <div className="page-content">
        {/* Categories Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-neutral-900 mb-8 text-center">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <h3 className="feature-title mb-2">{category.name}</h3>
                  <p className="feature-description text-sm">{category.description}</p>
                  <div className="flex justify-between text-sm text-neutral-500">
                    <span>{category.supplierCount} Suppliers</span>
                    <span>{category.productCount} Products</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Featured Suppliers */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-neutral-900">Featured Suppliers</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600'}`}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredSuppliers.slice(0, 8).map((supplier) => (
              <div key={supplier.id} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-indigo-600">
                        {supplier.company.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="feature-title text-neutral-900">{supplier.company}</h3>
                      <p className="text-neutral-600 text-sm">{supplier.name}</p>
                      <p className="text-xs text-neutral-500">{supplier.location}</p>
                    </div>
                  </div>
                  {supplier.verified && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                      <span>✓</span>
                      <span>Verified</span>
                    </span>
                  )}
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(supplier.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-neutral-600">{supplier.rating}/5</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">Response Time</p>
                    <p className="text-sm font-semibold text-green-600">{supplier.responseTime || '2.1 hours'}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-neutral-600 mb-2">Specialties:</p>
                  <div className="flex flex-wrap gap-1">
                    {(supplier.specialties || supplier.products).slice(0, 3).map((item, index) => (
                      <span key={index} className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded">
                        {item}
                      </span>
                    ))}
                    {(supplier.specialties || supplier.products).length > 3 && (
                      <span className="text-xs text-neutral-500">+{(supplier.specialties || supplier.products).length - 3} more</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-neutral-500">Established</p>
                    <p className="font-semibold">{supplier.establishedYear || '2015'}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">Team Size</p>
                    <p className="font-semibold">{supplier.employeeCount || '50-100'}</p>
                  </div>
                </div>
          
                <div className="flex gap-2">
                  <Link
                    href={`/suppliers/${supplier.id}`}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors text-center text-sm font-semibold"
                  >
                    View Profile
                  </Link>
                  <Link
                    href={`/rfq/create?supplier=${supplier.id}`}
                    className="flex-1 border border-indigo-600 text-indigo-600 py-2 px-4 rounded-lg hover:bg-indigo-50 transition-colors text-center text-sm font-semibold"
                  >
                    Send RFQ
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Call to Action */}
        <div className="text-center card">
          <h2 className="page-title">Ready to Get Started?</h2>
          <p className="page-subtitle mb-8">
            Create an RFQ and connect with verified suppliers
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
            href="/rfq/create" 
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-primary-700 transition-colors text-lg font-semibold"
          >
            Create RFQ
            </Link>
            <Link
              href="/auth/register"
              className="border border-indigo-600 text-indigo-600 px-8 py-4 rounded-lg hover:bg-indigo-50 transition-colors text-lg font-semibold"
            >
              Join as Supplier
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
