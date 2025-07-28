import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Filter, ChevronDown, ChevronUp, Star, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Supplier {
  id: string;
  name: string;
  location: string;
  rating: number;
  products: string[];
  responseTime: string;
  verified: boolean;
}

const Suppliers: React.FC = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Mock data - replace with real data from your API
  const suppliers: Supplier[] = [
    {
      id: '1',
      name: 'Global Steel Inc.',
      location: 'Mumbai, India',
      rating: 4.8,
      products: ['Steel Pipes', 'Steel Sheets', 'Steel Rods'],
      responseTime: '2 hours',
      verified: true,
    },
    {
      id: '2',
      name: 'Alumex Solutions',
      location: 'Pune, India',
      rating: 4.5,
      products: ['Aluminum Sheets', 'Aluminum Extrusions'],
      responseTime: '4 hours',
      verified: true,
    },
    {
      id: '3',
      name: 'CopperTech',
      location: 'Ahmedabad, India',
      rating: 4.2,
      products: ['Copper Wires', 'Copper Pipes'],
      responseTime: '1 hour',
      verified: false,
    },
  ];

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.products.some(product => 
      product.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('suppliers.title')}</h1>
          <p className="text-muted-foreground">
            {t('suppliers.subtitle', { count: filteredSuppliers.length })}
          </p>
        </div>
        <Button asChild>
          <Link to="/suppliers/new">
            <Plus className="mr-2 h-4 w-4" />
            {t('suppliers.addSupplier')}
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('suppliers.searchPlaceholder')}
                className="pl-8 w-full md:w-1/3"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="w-full md:w-auto justify-start"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              {t('common.filters')}
              {showFilters ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </Button>
            
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('suppliers.filters.location')}
                  </label>
                  <Input placeholder={t('suppliers.filters.locationPlaceholder')} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {t('suppliers.filters.rating')}
                  </label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">{t('suppliers.filters.anyRating')}</option>
                    <option value="5">5 ★</option>
                    <option value="4">4+ ★</option>
                    <option value="3">3+ ★</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full">
                    {t('common.applyFilters')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{supplier.name}</h3>
                        {supplier.verified && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            {t('suppliers.verified')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="mr-1 h-4 w-4" />
                        {supplier.location}
                      </div>
                      <div className="flex items-center">
                        <div className="flex">
                          {renderStars(supplier.rating)}
                        </div>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {supplier.rating} ({supplier.responseTime} {t('suppliers.responseTime')})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {supplier.products.slice(0, 3).map((product, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800"
                          >
                            {product}
                          </span>
                        ))}
                        {supplier.products.length > 3 && (
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                            +{supplier.products.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/suppliers/${supplier.id}`}>
                          {t('common.view')}
                        </Link>
                      </Button>
                      <Button size="sm" asChild>
                        <Link to={`/rfqs/new?supplierId=${supplier.id}`}>
                          {t('suppliers.requestQuote')}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Suppliers;
