import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Supplier } from '@shared/schema';

const Suppliers: React.FC = () => {
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');

  // Fetch suppliers
  const { data: suppliers, isLoading } = useQuery<Supplier[]>({
    queryKey: ['/api/suppliers'],
  });

  // Helper functions
  const getRiskScore = (supplier: Supplier) => {
    return {
      value: supplier.riskScore || 0,
      label: supplier.riskScore < 25 
        ? 'Low' 
        : supplier.riskScore < 50 
          ? 'Medium' 
          : 'High',
      color: supplier.riskScore < 25 
        ? 'bg-green-500' 
        : supplier.riskScore < 50 
          ? 'bg-yellow-500' 
          : 'bg-red-500'
    };
  };

  // Filter and search suppliers
  const filteredSuppliers = React.useMemo(() => {
    if (!suppliers) return [];
    
    return suppliers.filter(supplier => {
      const matchesSearch = search === '' || 
        supplier.industry.toLowerCase().includes(search.toLowerCase());
      
      const matchesIndustry = industryFilter === 'all' || 
        supplier.industry === industryFilter;
      
      return matchesSearch && matchesIndustry;
    });
  }, [suppliers, search, industryFilter]);

  // Extract unique industries for filter
  const industries = React.useMemo(() => {
    if (!suppliers) return [];
    const uniqueIndustries = new Set(suppliers.map(s => s.industry));
    return Array.from(uniqueIndustries);
  }, [suppliers]);

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Suppliers</h1>
        
        <div className="mt-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i className="fas fa-search text-gray-400"></i>
            </div>
            <Input
              type="search"
              placeholder="Search suppliers..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {/* Industry filter */}
          <div className="flex space-x-2">
            <Button
              variant={industryFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setIndustryFilter('all')}
              className="whitespace-nowrap"
            >
              All Industries
            </Button>
            {industries.slice(0, 3).map(industry => (
              <Button
                key={industry}
                variant={industryFilter === industry ? 'default' : 'outline'}
                onClick={() => setIndustryFilter(industry)}
                className="whitespace-nowrap"
              >
                {industry}
              </Button>
            ))}
            {industries.length > 3 && (
              <div className="relative">
                <Button variant="outline">
                  More
                  <i className="fas fa-chevron-down ml-2"></i>
                </Button>
              </div>
            )}
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader className="bg-primary-50">
            <h2 className="text-lg font-medium text-primary-800">
              {filteredSuppliers.length} Suppliers Found
            </h2>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              // Skeleton loading state
              <div className="divide-y divide-gray-200">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="p-6">
                    <div className="flex items-center">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="ml-4 flex-1">
                        <Skeleton className="h-5 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-10 w-24" />
                    </div>
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredSuppliers.length === 0 ? (
              // Empty state
              <div className="p-10 text-center">
                <i className="fas fa-building text-gray-300 text-5xl"></i>
                <p className="text-gray-500 mt-4">No suppliers found matching your criteria</p>
                {industryFilter !== 'all' || search !== '' ? (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setIndustryFilter('all');
                      setSearch('');
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : null}
              </div>
            ) : (
              // Supplier list
              <div className="divide-y divide-gray-200">
                {filteredSuppliers.map((supplier) => {
                  const risk = getRiskScore(supplier);
                  // Create initials for the supplier from their industry
                  const initials = supplier.industry.substring(0, 2).toUpperCase();
                  const matchRate = Math.round(100 - (supplier.riskScore || 0) * 0.8);
                  
                  return (
                    <div key={supplier.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                          <span className="text-sm font-medium">{initials}</span>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="text-lg font-medium text-gray-900">
                            {`Supplier ${supplier.id}`}
                          </div>
                          <div className="text-sm text-gray-500">
                            {supplier.industry}
                          </div>
                        </div>
                        <Button>
                          Contact
                        </Button>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wider">Risk Score</div>
                          <div className="mt-1 flex items-center">
                            <div className="h-2 w-32 bg-gray-200 rounded overflow-hidden">
                              <div className={`h-full ${risk.color}`} style={{ width: `${100 - risk.value}%` }}></div>
                            </div>
                            <span className="ml-2 text-sm font-medium">{risk.label}</span>
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wider">Match Rate</div>
                          <div className="mt-1 text-sm">{matchRate}% match to your requirements</div>
                        </div>
                        
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wider">Verification</div>
                          <div className="mt-1">
                            <Badge variant="success" className="text-xs">
                              <i className="fas fa-check-circle mr-1"></i> GST Verified
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Late Delivery Rate:</span> {supplier.lateDeliveryRate}%
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Compliance Score:</span> {supplier.complianceScore}/100
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Financial Stability:</span> {supplier.financialStability}/100
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">User Feedback:</span> {supplier.userFeedback}/100
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Suppliers;
