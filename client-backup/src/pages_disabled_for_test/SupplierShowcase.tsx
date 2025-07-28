import { useState, useEffect, useMemo } from 'react';
import { FiSearch, FiFilter, FiStar, FiMapPin, FiCheckCircle } from 'react-icons/fi';

interface Supplier {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  location: string;
  categories: string[];
  minOrder: number;
  responseTime: string;
  verified: boolean;
  products: Product[];
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  moq: number;
  unit: string;
  imageUrl?: string;
  category: string;
}

type SortOption = 'rating' | 'minOrder' | 'responseTime' | 'name';

const CATEGORIES = [
  'Electronics',
  'Textiles',
  'Automotive',
  'Chemicals',
  'Food & Beverage',
  'Machinery',
  'Construction',
  'Medical',
  'Packaging',
  'Furniture'
];

export default function SupplierShowcase() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Filter and sort suppliers
  useEffect(() => {
    let result = [...suppliers];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(supplier => 
        supplier.name.toLowerCase().includes(term) ||
        supplier.description.toLowerCase().includes(term) ||
        supplier.categories.some(cat => cat.toLowerCase().includes(term)) ||
        supplier.products.some(p => p.name.toLowerCase().includes(term))
      );
    }
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter(supplier =>
        selectedCategories.some(cat => supplier.categories.includes(cat))
      );
    }
    
    // Apply rating filter
    if (minRating > 0) {
      result = result.filter(supplier => supplier.rating >= minRating);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'minOrder':
          return a.minOrder - b.minOrder;
        case 'responseTime':
          return a.responseTime.localeCompare(b.responseTime);
        case 'rating':
        default:
          return b.rating - a.rating;
      }
    });
    
    setFilteredSuppliers(result);
  }, [suppliers, searchTerm, selectedCategories, minRating, sortBy]);

  // Fetch suppliers data
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await fetch('/api/suppliers');
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockSuppliers: Supplier[] = Array.from({ length: 12 }, (_, i) => ({
          id: `sup-${i + 1}`,
          name: `Supplier ${String.fromCharCode(65 + i)}`,
          description: `Leading provider of quality products in ${CATEGORIES[i % CATEGORIES.length].toLowerCase()} industry.`,
          rating: Math.min(5, 3 + Math.random() * 2),
          reviewCount: Math.floor(Math.random() * 100) + 5,
          location: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune'][i % 6],
          categories: [
            CATEGORIES[i % CATEGORIES.length],
            CATEGORIES[(i + 2) % CATEGORIES.length]
          ],
          minOrder: [5000, 10000, 15000, 20000, 25000][i % 5],
          responseTime: `${Math.floor(Math.random() * 24) + 1} hours`,
          verified: Math.random() > 0.3,
          products: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, j) => ({
            id: `prod-${i}-${j}`,
            name: `Product ${j + 1} - ${['Basic', 'Standard', 'Premium', 'Pro', 'Elite'][j % 5]}`,
            description: `High-quality ${CATEGORIES[i % CATEGORIES.length].toLowerCase()} product`,
            price: [49.99, 99.99, 149.99, 199.99, 249.99][j % 5],
            moq: [10, 20, 50, 100, 200][j % 5],
            unit: ['pcs', 'kg', 'box', 'set', 'dozen'][j % 5],
            category: CATEGORIES[i % CATEGORIES.length]
          }))
        }));
        
        setSuppliers(mockSuppliers);
        setFilteredSuppliers(mockSuppliers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  // Calculate pagination
  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);
  const paginatedSuppliers = filteredSuppliers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setMinRating(0);
    setCurrentPage(1);
  };

  if (loading) return <div className="p-8 text-center">Loading suppliers...</div>;
  if (error) return <div className="p-8 text-red-500 text-center">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Directory</h1>
          <p className="text-gray-600 mt-2">Find and connect with trusted suppliers</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <FiFilter className="mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search suppliers, products, or categories..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Categories */}
              <div>
                <h3 className="font-medium mb-2">Categories</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 border rounded">
                  {CATEGORIES.map((category) => (
                    <label key={category} className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded text-blue-600"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                      />
                      <span className="ml-2 text-sm">{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div>
                <h3 className="font-medium mb-2">Minimum Rating</h3>
                <div className="flex items-center space-x-2">
                  {[0, 3, 4, 4.5].map((rating) => (
                    <button
                      key={rating || 'all'}
                      onClick={() => {
                        setMinRating(rating);
                        setCurrentPage(1);
                      }}
                      className={`px-3 py-1 text-sm rounded-full ${minRating === rating
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {rating === 0 ? 'All' : `${rating}+`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="font-medium mb-2">Sort By</h3>
                <select
                  className="w-full p-2 border rounded"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <option value="rating">Highest Rating</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="minOrder">Lowest Minimum Order</option>
                  <option value="responseTime">Fastest Response</option>
                </select>
              </div>
            </div>

            {(searchTerm || selectedCategories.length > 0 || minRating > 0) && (
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {filteredSuppliers.length} {filteredSuppliers.length === 1 ? 'supplier' : 'suppliers'} found
                </span>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Supplier Grid */}
      {filteredSuppliers.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No suppliers found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria</p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedSuppliers.map((supplier) => (
              <div
                key={supplier.id}
                className="border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-xl font-semibold">{supplier.name}</h2>
                      {supplier.verified && (
                        <FiCheckCircle className="ml-2 text-blue-500" title="Verified Supplier" />
                      )}
                    </div>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <FiMapPin className="mr-1" size={14} />
                      <span>{supplier.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                    <FiStar className="text-yellow-500 mr-1" />
                    <span className="font-medium">{supplier.rating.toFixed(1)}</span>
                    <span className="text-xs ml-1">({supplier.reviewCount})</span>
                  </div>
                </div>

                <p className="mt-3 text-gray-600 line-clamp-2">{supplier.description}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {supplier.categories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {category}
                    </span>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>Min. Order</span>
                    <span className="font-medium text-gray-900">₹{supplier.minOrder.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Avg. Response</span>
                    <span className="font-medium text-gray-900">{supplier.responseTime}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Featured Products</h3>
                  <div className="space-y-3">
                    {supplier.products.slice(0, 2).map((product) => (
                      <div key={product.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between">
                          <span className="font-medium text-sm">{product.name}</span>
                          <span className="font-semibold text-blue-600">${product.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-500">
                          <span>MOQ: {product.moq} {product.unit}</span>
                          <span>{product.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => setSelectedSupplier(supplier)}
                    className="flex-1 py-2 px-4 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    View Details
                  </button>
                  <button className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                    Contact Supplier
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &larr; Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg ${currentPage === pageNum
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next &rarr;
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Supplier Details Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">{selectedSupplier.name}</h2>
                  <div className="flex items-center mt-1 text-gray-600">
                    <FiMapPin className="mr-1" />
                    <span>{selectedSupplier.location}</span>
                    {selectedSupplier.verified && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        <FiCheckCircle className="mr-1" size={12} />
                        Verified Supplier
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSupplier(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-medium mb-4">About</h3>
                  <p className="text-gray-700">{selectedSupplier.description}</p>
                  
                  <h3 className="text-lg font-medium mt-8 mb-4">Key Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Business Type</p>
                      <p className="font-medium">Manufacturer & Exporter</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Year Established</p>
                      <p className="font-medium">2015</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Employees</p>
                      <p className="font-medium">51-100 People</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Annual Revenue</p>
                      <p className="font-medium">$5-10 Million</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium mt-8 mb-4">Products</h3>
                  <div className="space-y-4">
                    {selectedSupplier.products.map((product) => (
                      <div key={product.id} className="border rounded-lg p-4">
                        <div className="flex justify-between">
                          <h4 className="font-medium">{product.name}</h4>
                          <span className="font-semibold text-blue-600">${product.price.toFixed(2)}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                        <div className="mt-2 flex justify-between text-sm text-gray-500">
                          <span>MOQ: {product.moq} {product.unit}</span>
                          <span>Category: {product.category}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:border-l md:pl-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-3">Contact Supplier</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Contact Person</p>
                        <p className="font-medium">John Doe</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="font-medium">+91 98765 43210</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">contact@{selectedSupplier.name.toLowerCase().replace(/\s+/g, '')}.com</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">123 Business Park, {selectedSupplier.location}, India</p>
                      </div>
                      <button className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Send Inquiry
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 p-4 border rounded-lg">
                    <h3 className="font-medium mb-3">Supplier Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Response Rate</span>
                        <span className="font-medium">98%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Response Time</span>
                        <span className="font-medium">{selectedSupplier.responseTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">On-time Delivery</span>
                        <span className="font-medium">95%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Order Fulfillment</span>
                        <span className="font-medium">99%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
