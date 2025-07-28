import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories } from '../api/categoryApi';
import { Category } from '../types/categories';
import SearchBar from '../components/SearchBar';
import { useSearch } from '../contexts/SearchContext';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchQuery, searchResults } = useSearch();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Display search results if there's a search query, otherwise show all categories
  const displayCategories = searchResults?.categories || categories;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <nav className="hidden md:flex space-x-8">
              <Link to="/" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">
                Home
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Search Bar */}
        <div className="px-4 sm:px-0 mb-8">
          <SearchBar 
            placeholder="Search for categories or subcategories..." 
            className="max-w-2xl mx-auto"
          />
        </div>

        {/* Categories List */}
        <div className="px-4 sm:px-0">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {searchQuery && searchResults && (
                <div className="mb-6">
                  <h2 className="text-lg font-medium text-gray-900">
                    Search Results for "{searchQuery}"
                  </h2>
                  <p className="text-sm text-gray-500">
                    Found {searchResults.categories.length} categories and {searchResults.subcategories.length} subcategories
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {displayCategories.map((category) => (
                  <div key={category.id} className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div 
                      className="px-4 py-5 sm:px-6 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                      onClick={() => toggleCategory(category.id)}
                    >
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{category.icon}</span>
                        <div>
                          <h3 className="text-lg leading-6 font-medium text-gray-900">
                            {category.name}
                          </h3>
                          <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      <div>
                        <svg 
                          className={`h-5 w-5 text-gray-400 transform ${expandedCategories.includes(category.id) ? 'rotate-180' : ''}`}
                          xmlns="http://www.w3.org/2000/svg" 
                          viewBox="0 0 20 20" 
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* Subcategories */}
                    {expandedCategories.includes(category.id) && (
                      <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                          {category.subcategories.map((subcategory) => (
                            <Link
                              key={subcategory.id}
                              to={`/categories/${category.slug}/${subcategory.slug}`}
                              className="group flex items-center p-3 rounded-md hover:bg-gray-50 border border-gray-200"
                            >
                              <span className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-200">
                                {subcategory.icon || category.icon}
                              </span>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                                  {subcategory.name}
                                </p>
                                {subcategory.description && (
                                  <p className="text-xs text-gray-500">{subcategory.description}</p>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Show subcategory search results if any */}
              {searchQuery && searchResults && searchResults.subcategories.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Matching Subcategories
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {searchResults.subcategories.map((item, index) => (
                      <Link
                        key={`${item.categorySlug}-${item.subcategory.id}-${index}`}
                        to={`/categories/${item.categorySlug}/${item.subcategory.slug}`}
                        className="group flex items-center p-3 rounded-md hover:bg-gray-50 border border-gray-200"
                      >
                        <span className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-200">
                          {item.subcategory.icon || '🔍'}
                        </span>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                            {item.subcategory.name}
                          </p>
                          {item.subcategory.description && (
                            <p className="text-xs text-gray-500">{item.subcategory.description}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* No results message */}
              {searchQuery && searchResults && searchResults.categories.length === 0 && searchResults.subcategories.length === 0 && (
                <div className="text-center py-12">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    We couldn't find anything matching "{searchQuery}". Try a different search term.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} Bell24H. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CategoriesPage;
