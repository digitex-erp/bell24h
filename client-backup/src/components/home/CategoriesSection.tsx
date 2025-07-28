'use client';

import { useRouter } from 'next/navigation';

const categories = [
  { name: 'Electronics', icon: '📱', count: 1250 },
  { name: 'Fashion', icon: '👔', count: 980 },
  { name: 'Home & Garden', icon: '🏠', count: 750 },
  { name: 'Beauty & Personal Care', icon: '💄', count: 620 },
  { name: 'Sports & Outdoors', icon: '⚽', count: 540 },
  { name: 'Toys & Games', icon: '🎮', count: 480 },
  { name: 'Automotive', icon: '🚗', count: 390 },
  { name: 'Industrial', icon: '🏭', count: 320 },
  { name: 'Health & Household', icon: '💊', count: 280 },
  { name: 'Pet Supplies', icon: '🐕', count: 210 },
  { name: 'Office Products', icon: '📎', count: 180 },
  { name: 'Tools & Home Improvement', icon: '🔧', count: 150 },
];

export const CategoriesSection = () => {
  const router = useRouter();

  return (
    <section className="py-20 bg-gray-100" id="categories">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium mb-4">
            Explore & Discover
          </span>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Browse by Top Categories</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find what you need across a diverse range of industries and product types.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => router.push(`/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`)}
              className="group flex flex-col items-center justify-center p-6 rounded-xl border border-gray-200 bg-white shadow-sm hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 h-full"
            >
              <span className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                {category.icon}
              </span>
              <span className="text-sm font-semibold text-gray-900 text-center mt-2">
                {category.name}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {category.count.toLocaleString()} items
              </span>
            </button>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={() => router.push('/categories')}
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-colors"
          >
            View All Categories
            <svg className="ml-3 -mr-1 w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};
