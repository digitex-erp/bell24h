import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, ChevronDown, ChevronUp, Star, ShoppingCart, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

// Import categories from the categories module
import { categories } from '@/data/categories';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  minOrder: number;
  unit: string;
  rating: number;
  reviewCount: number;
  supplier: {
    id: string;
    name: string;
    verified: boolean;
  };
  image: string;
  category: string;
  subcategory: string;
  tags: string[];
  moq: number;
  leadTime: string;
  inStock: boolean;
}

// Mock data - replace with real data from your API
const featuredProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Stainless Steel 304 Coil',
    description: 'High-quality stainless steel 304 coil with excellent corrosion resistance and durability.',
    price: 2500,
    currency: 'USD',
    minOrder: 1,
    unit: 'metric ton',
    rating: 4.7,
    reviewCount: 128,
    supplier: {
      id: 'supp-001',
      name: 'Global Steel Inc.',
      verified: true,
    },
    image: '/placeholder-product.jpg',
    category: 'Metals',
    subcategory: 'Stainless Steel',
    tags: ['stainless', 'steel', '304', 'coil'],
    moq: 2,
    leadTime: '7-14 days',
    inStock: true,
  },
  {
    id: 'prod-002',
    name: 'Aluminum 6061 T6 Sheet',
    description: 'Aircraft-grade aluminum sheet with excellent strength-to-weight ratio and good machinability.',
    price: 8.5,
    currency: 'USD',
    minOrder: 100,
    unit: 'kg',
    rating: 4.5,
    reviewCount: 87,
    supplier: {
      id: 'supp-002',
      name: 'Alumex Solutions',
      verified: true,
    },
    image: '/placeholder-product.jpg',
    category: 'Metals',
    subcategory: 'Aluminum',
    tags: ['aluminum', '6061', 'sheet', 't6'],
    moq: 50,
    leadTime: '5-10 days',
    inStock: true,
  },
  {
    id: 'prod-003',
    name: 'Copper Wire 12 AWG',
    description: 'Pure copper wire, 12 AWG, suitable for electrical wiring and grounding applications.',
    price: 3.2,
    currency: 'USD',
    minOrder: 100,
    unit: 'meter',
    rating: 4.8,
    reviewCount: 215,
    supplier: {
      id: 'supp-003',
      name: 'CopperTech',
      verified: true,
    },
    image: '/placeholder-product.jpg',
    category: 'Electrical',
    subcategory: 'Wires & Cables',
    tags: ['copper', 'wire', 'electrical', '12awg'],
    moq: 100,
    leadTime: '3-7 days',
    inStock: true,
  },
  {
    id: 'prod-004',
    name: 'PVC Pipes 1" (25mm)',
    description: 'High-quality PVC pipes for plumbing and irrigation, pressure rated for various applications.',
    price: 1.8,
    currency: 'USD',
    minOrder: 50,
    unit: 'meter',
    rating: 4.3,
    reviewCount: 94,
    supplier: {
      id: 'supp-004',
      name: 'PVC Masters',
      verified: true,
    },
    image: '/placeholder-product.jpg',
    category: 'Plumbing',
    subcategory: 'Pipes & Fittings',
    tags: ['pvc', 'pipe', 'plumbing', '1inch'],
    moq: 20,
    leadTime: '7-14 days',
    inStock: true,
  },
];

const Marketplace: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [minOrder, setMinOrder] = useState<number>(0);
  const [supplierLocation, setSupplierLocation] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const toggleWishlist = (productId: string) => {
    const newWishlist = new Set(wishlist);
    if (wishlist.has(productId)) {
      newWishlist.delete(productId);
    } else {
      newWishlist.add(productId);
    }
    setWishlist(newWishlist);
  };

  const filteredProducts = featuredProducts.filter(product => {
    // Filter by search query
    const matchesSearch = 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Filter by category
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    // Filter by subcategory
    const matchesSubcategory = !selectedSubcategory || product.subcategory === selectedSubcategory;
    
    // Filter by price range
    const matchesPrice = 
      product.price >= priceRange[0] && 
      product.price <= priceRange[1];
    
    // Filter by minimum order quantity
    const matchesMinOrder = product.minOrder >= minOrder;
    
    return matchesSearch && matchesCategory && matchesSubcategory && 
           matchesPrice && matchesMinOrder;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'reviews':
        return b.reviewCount - a.reviewCount;
      default:
        return 0;
    }
  });

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={cn(
          'h-4 w-4',
          i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        )} 
      />
    ));
  };

  const handleCategorySelect = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    } else {
      setSelectedCategory(categoryId);
      setSelectedSubcategory(null);
    }
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId === selectedSubcategory ? null : subcategoryId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-8 mb-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold mb-4">{t('marketplace.hero.title')}</h1>
          <p className="text-xl mb-8 text-blue-100">
            {t('marketplace.hero.subtitle')}
          </p>
          <div className="relative
          ">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder={t('marketplace.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-6 rounded-lg text-lg border-0 shadow-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button className="absolute right-2 top-1/2 transform -translate-y-1/2 h-12 px-6">
              {t('common.search')}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('marketplace.filters')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Categories */}
              <div>
                <h3 className="font-medium mb-3">{t('marketplace.categories')}</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id}>
                      <button
                        onClick={() => handleCategorySelect(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between ${
                          selectedCategory === category.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50'
                        }`}
                      >
                        <span>{category.name}</span>
                        {selectedCategory === category.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      
                      {selectedCategory === category.id && (
                        <div className="ml-4 mt-1 space-y-1">
                          {category.subcategories.map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => handleSubcategorySelect(sub.id)}
                              className={`w-full text-left px-3 py-1.5 text-sm rounded-md flex items-center ${
                                selectedSubcategory === sub.id 
                                  ? 'bg-blue-100 text-blue-700 font-medium' 
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {sub.name}
                              <span className="ml-auto text-xs text-gray-400">
                                {sub.count}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-medium mb-3">{t('marketplace.priceRange')}</h3>
                <div className="flex items-center space-x-2">
                  <Input 
                    type="number" 
                    placeholder="Min" 
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="h-9"
                  />
                  <span className="text-gray-500">-</span>
                  <Input 
                    type="number" 
                    placeholder="Max" 
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Minimum Order Quantity */}
              <div>
                <h3 className="font-medium mb-3">{t('marketplace.minOrder')}</h3>
                <Input 
                  type="number" 
                  placeholder="Min order quantity"
                  value={minOrder}
                  onChange={(e) => setMinOrder(Number(e.target.value))}
                  className="h-9"
                />
              </div>

              {/* Supplier Location */}
              <div>
                <h3 className="font-medium mb-3">{t('marketplace.supplierLocation')}</h3>
                <select 
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={supplierLocation}
                  onChange={(e) => setSupplierLocation(e.target.value)}
                >
                  <option value="all">{t('marketplace.anyLocation')}</option>
                  <option value="local">{t('marketplace.localSuppliers')}</option>
                  <option value="international">{t('marketplace.international')}</option>
                </select>
              </div>

              <Button className="w-full">
                {t('marketplace.applyFilters')}
              </Button>
              <Button variant="outline" className="w-full">
                {t('marketplace.resetFilters')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Sort and Results Info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <p className="text-sm text-gray-500">
              {t('marketplace.showingResults', { 
                count: filteredProducts.length,
                total: featuredProducts.length 
              })}
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">{t('marketplace.sortBy')}:</span>
              <select 
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevance">{t('marketplace.sort.relevance')}</option>
                <option value="price-low">{t('marketplace.sort.priceLowToHigh')}</option>
                <option value="price-high">{t('marketplace.sort.priceHighToLow')}</option>
                <option value="rating">{t('marketplace.sort.topRated')}</option>
                <option value="reviews">{t('marketplace.sort.mostReviews')}</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <div className="aspect-square bg-gray-100 flex items-center justify-center">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/300x300?text=Product+Image';
                        }}
                      />
                    </div>
                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-2 right-2 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
                      aria-label={wishlist.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      <Heart 
                        className={`h-5 w-5 ${wishlist.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
                      />
                    </button>
                    {!product.inStock && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">
                        {t('marketplace.outOfStock')}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg line-clamp-2">
                        <Link to={`/products/${product.id}`} className="hover:text-blue-600 hover:underline">
                          {product.name}
                        </Link>
                      </h3>
                      <div className="text-lg font-semibold text-blue-600">
                        ${product.price.toFixed(2)}
                        <span className="text-xs text-gray-500 font-normal">/{product.unit}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {renderStars(product.rating)}
                      </div>
                      <span className="text-xs text-gray-500 ml-1">
                        ({product.reviewCount})
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {product.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {product.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1 mb-4">
                      <p>{t('marketplace.minOrder')}: {product.minOrder} {product.unit}</p>
                      <p>{t('marketplace.leadTime')}: {product.leadTime}</p>
                      <p>
                        {t('marketplace.supplier')}: 
                        <Link 
                          to={`/suppliers/${product.supplier.id}`} 
                          className="text-blue-600 hover:underline"
                        >
                          {product.supplier.name}
                        </Link>
                        {product.supplier.verified && (
                          <span className="ml-1 text-green-600">
                            ✓ {t('marketplace.verified')}
                          </span>
                        )}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        {t('marketplace.viewDetails')}
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 gap-1"
                        disabled={!product.inStock}
                        onClick={() => {
                          // Add to cart logic here
                        }}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {t('marketplace.addToCart')}
                      </Button>
                    </div>
                    
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="mt-2 w-full text-blue-600"
                      onClick={() => {
                        // Request quote logic here
                        navigate(`/rfqs/new?productId=${product.id}`);
                      }}
                    >
                      {t('marketplace.requestQuote')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-dashed">
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {t('marketplace.noResults.title')}
              </h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                {t('marketplace.noResults.description')}
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                  setSelectedSubcategory(null);
                  setPriceRange([0, 10000]);
                  setMinOrder(0);
                  setSupplierLocation('all');
                }}
              >
                {t('marketplace.clearFilters')}
              </Button>
            </div>
          )}

          {/* Pagination */}
          {sortedProducts.length > 0 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  {t('common.previous')}
                </Button>
                <Button variant="outline" size="sm" className="font-medium">
                  1
                </Button>
                <Button variant="ghost" size="sm">
                  2
                </Button>
                <Button variant="ghost" size="sm">
                  3
                </Button>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  4
                </Button>
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                  5
                </Button>
                <span className="px-2 text-sm text-gray-500">...</span>
                <Button variant="ghost" size="sm">
                  10
                </Button>
                <Button variant="outline" size="sm">
                  {t('common.next')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Categories Section */}
      <section className="mt-16">
        <h2 className="text-2xl font-bold mb-6">{t('marketplace.browseByCategory')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.slice(0, 12).map((category) => (
            <Link 
              key={category.id} 
              to={`/marketplace?category=${encodeURIComponent(category.name)}`}
              className="group"
            >
              <Card className="h-full text-center p-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                  <div className="text-blue-600">
                    {category.icon || '📦'}
                  </div>
                </div>
                <h3 className="font-medium text-sm">{category.name}</h3>
                <p className="text-xs text-gray-500">{category.count} {t('marketplace.products')}</p>
              </Card>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button variant="outline">
            {t('marketplace.viewAllCategories')}
          </Button>
        </div>
      </section>

      {/* Supplier CTA */}
      <section className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">{t('marketplace.supplierCta.title')}</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          {t('marketplace.supplierCta.description')}
        </p>
        <div className="space-x-4">
          <Button>
            {t('marketplace.supplierCta.ctaPrimary')}
          </Button>
          <Button variant="outline">
            {t('marketplace.supplierCta.ctaSecondary')}
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Marketplace;
