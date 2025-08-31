'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

export default function CategoriesPage() {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Simplified categories data for better performance
  const categories = useMemo(
    () => [
      {
        name: 'Electronics & Components',
        icon: '⚡',
        count: '32,891',
        growth: '+15%',
        slug: 'electronics-and-components',
        description: 'Complete electronics ecosystem',
        successRate: '94.8%',
        featured: true,
        trending: true,
      },
      {
        name: 'Textiles & Garments',
        icon: '🧵',
        count: '28,456',
        growth: '+12%',
        slug: 'textiles-and-garments',
        description: 'End-to-end textile solutions',
        successRate: '92.5%',
        featured: true,
        trending: false,
      },
      {
        name: 'Machinery & Equipment',
        icon: '⚙️',
        count: '25,789',
        growth: '+18%',
        slug: 'machinery-and-equipment',
        description: 'Industrial machinery solutions',
        successRate: '96.2%',
        featured: true,
        trending: true,
      },
      {
        name: 'Automotive & Parts',
        icon: '🚗',
        count: '19,876',
        growth: '+16%',
        slug: 'automotive-and-parts',
        description: 'Automotive components',
        successRate: '93.7%',
        featured: false,
        trending: true,
      },
      {
        name: 'Construction Materials',
        icon: '🏗️',
        count: '18,234',
        growth: '+13%',
        slug: 'construction-materials',
        description: 'Construction supplies',
        successRate: '91.3%',
        featured: false,
        trending: false,
      },
      {
        name: 'Chemicals & Plastics',
        icon: '🧪',
        count: '16,789',
        growth: '+14%',
        slug: 'chemicals-and-plastics',
        description: 'Chemical products',
        successRate: '90.7%',
        featured: false,
        trending: false,
      },
      {
        name: 'Food & Beverages',
        icon: '🍽️',
        count: '15,432',
        growth: '+11%',
        slug: 'food-and-beverages',
        description: 'Food processing equipment',
        successRate: '89.5%',
        featured: false,
        trending: false,
      },
      {
        name: 'Pharmaceuticals',
        icon: '💊',
        count: '14,567',
        growth: '+17%',
        slug: 'pharmaceuticals',
        description: 'Medical supplies',
        successRate: '95.1%',
        featured: true,
        trending: true,
      },
      {
        name: 'Energy & Power',
        icon: '⚡',
        count: '13,890',
        growth: '+19%',
        slug: 'energy-and-power',
        description: 'Power generation equipment',
        successRate: '93.2%',
        featured: false,
        trending: true,
      },
      {
        name: 'IT & Software',
        icon: '💻',
        count: '12,345',
        growth: '+22%',
        slug: 'it-and-software',
        description: 'Technology solutions',
        successRate: '97.8%',
        featured: true,
        trending: true,
      },
      {
        name: 'Agriculture',
        icon: '🌾',
        count: '11,234',
        growth: '+9%',
        slug: 'agriculture',
        description: 'Farming equipment',
        successRate: '88.9%',
        featured: false,
        trending: false,
      },
      {
        name: 'Healthcare',
        icon: '🏥',
        count: '10,987',
        growth: '+16%',
        slug: 'healthcare',
        description: 'Medical devices',
        successRate: '94.3%',
        featured: true,
        trending: false,
      },
    ],
    []
  );

  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter =
        selectedFilter === 'all' ||
        (selectedFilter === 'featured' && category.featured) ||
        (selectedFilter === 'trending' && category.trending);
      return matchesSearch && matchesFilter;
    });
  }, [categories, searchTerm, selectedFilter]);

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* NAVIGATION */}
      <nav className='bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50'>
        <div className='container mx-auto px-4'>
          <div className='flex justify-between items-center h-16'>
            <div className='flex items-center space-x-4'>
              <Link
                href='/'
                className='flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors'
              >
                <span>←</span>
                <span className='text-sm font-medium'>Back to Home</span>
              </Link>
              <div className='border-l border-gray-300 pl-4'>
                <Link
                  href='/'
                  className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'
                >
                  BELL24H
                </Link>
              </div>
            </div>

            <div className='flex items-center space-x-6'>
              <Link
                href='/suppliers'
                className='text-gray-600 hover:text-blue-600 font-medium text-sm'
              >
                Suppliers
              </Link>
              <Link
                href='/pricing'
                className='text-gray-600 hover:text-blue-600 font-medium text-sm'
              >
                Pricing
              </Link>
              <Link
                href='/login'
                className='bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700'
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <section className='bg-gradient-to-br from-blue-50 to-purple-50 py-12'>
        <div className='container mx-auto px-4'>
          <div className='text-center mb-8'>
            <h1 className='text-4xl font-bold text-gray-900 mb-4'>All Business Categories</h1>
            <p className='text-lg text-gray-600 mb-6'>
              50+ categories • 534,672+ verified suppliers
            </p>

            {/* SEARCH & FILTERS */}
            <div className='max-w-4xl mx-auto'>
              <div className='grid grid-cols-1 md:grid-cols-12 gap-4'>
                <div className='md:col-span-6'>
                  <div className='relative'>
                    <span>🔍</span>
                    <input
                      type='text'
                      placeholder='Search categories...'
                      className='w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className='md:col-span-4'>
                  <select
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                    value={selectedFilter}
                    onChange={e => setSelectedFilter(e.target.value)}
                  >
                    <option value='all'>All Categories</option>
                    <option value='featured'>Featured</option>
                    <option value='trending'>Trending</option>
                  </select>
                </div>

                <div className='md:col-span-2'>
                  <div className='flex border border-gray-300 rounded-lg overflow-hidden'>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 p-3 ${
                        viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
                      }`}
                    >
                      <span>▦</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`flex-1 p-3 ${
                        viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
                      }`}
                    >
                      <span>☰</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES GRID */}
      <section className='py-12'>
        <div className='container mx-auto px-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {filteredCategories.map((category, index) => (
              <Link
                key={category.slug}
                href={`/categories/${category.slug}`}
                className='bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all block text-center group hover:scale-105 transform'
              >
                <div className='relative mb-4'>
                  <div className='text-4xl mb-3'>{category.icon}</div>
                  {category.trending && (
                    <div className='absolute -top-2 -right-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold'>
                      Trending
                    </div>
                  )}
                  {category.featured && (
                    <div className='absolute -top-2 -left-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold'>
                      Featured
                    </div>
                  )}
                </div>

                <h3 className='font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors'>
                  {category.name}
                </h3>
                <p className='text-gray-600 text-sm mb-3'>{category.description}</p>

                <div className='grid grid-cols-2 gap-3 mb-4'>
                  <div className='text-center'>
                    <div className='font-bold text-blue-600 text-sm'>{category.count}</div>
                    <div className='text-xs text-gray-500'>Suppliers</div>
                  </div>
                  <div className='text-center'>
                    <div className='font-bold text-green-600 text-sm'>{category.growth}</div>
                    <div className='text-xs text-gray-500'>Growth</div>
                  </div>
                </div>

                <div className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold'>
                  {category.successRate} Success Rate
                </div>
              </Link>
            ))}
          </div>

          {filteredCategories.length === 0 && (
            <div className='text-center py-12'>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>No categories found</h3>
              <p className='text-gray-600'>Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
