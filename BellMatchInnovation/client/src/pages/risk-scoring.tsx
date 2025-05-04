import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import MainLayout from '@/components/layout/main-layout';
import { useSupplierMatch } from '@/hooks/use-supplier-match';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { getRiskGradeDisplay } from '@/lib/utils';

interface Supplier {
  id: number;
  companyName: string;
  description: string;
  location: string;
  logo?: string;
  categories: string[];
  verified: boolean;
  riskScore: number;
  riskGrade: string;
  riskFactors?: {
    financial: number;
    delivery: number;
    quality: number;
    compliance: number;
    reputation: number;
  };
}

const RiskScoring = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [riskThreshold, setRiskThreshold] = useState([3.0]);

  // Fetch supplier risk data
  const { data: suppliersData, isLoading: suppliersLoading } = useQuery({
    queryKey: ['/api/suppliers/risk'],
    refetchOnWindowFocus: false,
  });

  // Get risk level class
  const getRiskLevelClass = (score: number) => {
    if (score <= 2.0) return 'text-success-600';
    if (score <= 3.5) return 'text-warning-600';
    return 'text-danger-600';
  };

  // Get progress color class
  const getProgressColor = (value: number) => {
    const percent = (value / 5) * 100;
    if (percent <= 40) return 'bg-success-500';
    if (percent <= 70) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  // Filter suppliers based on search query and risk threshold
  const filteredSuppliers = React.useMemo(() => {
    const suppliers = suppliersData?.suppliers || [];
    return suppliers.filter((supplier: Supplier) => {
      // Filter by search query
      const matchesSearch = searchQuery === '' || 
        supplier.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by risk threshold
      const matchesRisk = supplier.riskScore <= riskThreshold[0];
      
      return matchesSearch && matchesRisk;
    });
  }, [suppliersData, searchQuery, riskThreshold]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Supplier Risk Scoring</h1>
            <p className="text-gray-500">Evaluate suppliers with our Aladin-inspired risk assessment algorithm</p>
          </div>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Search Suppliers</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <i className="fas fa-search"></i>
                  </span>
                  <Input
                    placeholder="Search by name or location"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Max Risk Score: {riskThreshold[0].toFixed(1)}</label>
                <Slider
                  value={riskThreshold}
                  onValueChange={setRiskThreshold}
                  min={1.0}
                  max={5.0}
                  step={0.1}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Low Risk</span>
                  <span>Medium Risk</span>
                  <span>High Risk</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">View Mode</label>
                <div className="flex space-x-2">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setViewMode('table')}
                  >
                    <i className="fas fa-table mr-2"></i>
                    Table View
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setViewMode('grid')}
                  >
                    <i className="fas fa-th-large mr-2"></i>
                    Grid View
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Suppliers Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle>Supplier Risk Assessment</CardTitle>
            <CardDescription>
              Comprehensive risk analysis using multiple data points
            </CardDescription>
          </CardHeader>
          <CardContent>
            {suppliersLoading ? (
              viewMode === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Supplier</th>
                        <th className="py-2 text-left">Location</th>
                        <th className="py-2 text-left">Risk Score</th>
                        <th className="py-2 text-left">Risk Grade</th>
                        <th className="py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <tr key={i} className="border-b animate-pulse">
                          <td className="py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                              <div className="h-5 bg-gray-200 rounded w-32"></div>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                          </td>
                          <td className="py-4">
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                          </td>
                          <td className="py-4">
                            <div className="h-6 bg-gray-200 rounded w-12"></div>
                          </td>
                          <td className="py-4">
                            <div className="h-8 bg-gray-200 rounded w-20"></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="border rounded-lg p-4 animate-pulse">
                      <div className="flex items-center mb-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                        <div>
                          <div className="h-5 bg-gray-200 rounded w-32 mb-1"></div>
                          <div className="h-4 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : filteredSuppliers.length > 0 ? (
              viewMode === 'table' ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 text-left">Supplier</th>
                        <th className="py-2 text-left">Location</th>
                        <th className="py-2 text-left">Risk Score</th>
                        <th className="py-2 text-left">Risk Grade</th>
                        <th className="py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSuppliers.map((supplier: Supplier) => (
                        <tr key={supplier.id} className="border-b hover:bg-gray-50">
                          <td className="py-4">
                            <div className="flex items-center">
                              {supplier.logo ? (
                                <img
                                  src={supplier.logo}
                                  alt={supplier.companyName}
                                  className="w-10 h-10 rounded-full object-cover mr-3"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium mr-3">
                                  {supplier.companyName.charAt(0)}
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-800">{supplier.companyName}</p>
                                {supplier.verified && (
                                  <Badge className="bg-primary-100 text-primary-800 text-xs">
                                    <i className="fas fa-check-circle mr-1"></i> Verified
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 text-gray-600">{supplier.location}</td>
                          <td className="py-4">
                            <div className="flex items-center">
                              <span className={`font-medium ${getRiskLevelClass(supplier.riskScore)}`}>
                                {supplier.riskScore.toFixed(1)}/5.0
                              </span>
                            </div>
                          </td>
                          <td className="py-4">
                            <Badge className={`${
                              supplier.riskGrade.startsWith('A') ? 'bg-success-100 text-success-800' :
                              supplier.riskGrade.startsWith('B') ? 'bg-warning-100 text-warning-800' :
                              'bg-danger-100 text-danger-800'
                            }`}>
                              {supplier.riskGrade}
                            </Badge>
                          </td>
                          <td className="py-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedSupplier(supplier);
                                setDetailsOpen(true);
                              }}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSuppliers.map((supplier: Supplier) => (
                    <div key={supplier.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center mb-3">
                        {supplier.logo ? (
                          <img
                            src={supplier.logo}
                            alt={supplier.companyName}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium mr-3">
                            {supplier.companyName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">{supplier.companyName}</p>
                          <p className="text-sm text-gray-600">{supplier.location}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{supplier.description}</p>
                      
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex space-x-2 items-center">
                          <span className="text-sm text-gray-600">Risk Score:</span>
                          <span className={`font-medium ${getRiskLevelClass(supplier.riskScore)}`}>
                            {supplier.riskScore.toFixed(1)}/5.0
                          </span>
                        </div>
                        <Badge className={`${
                          supplier.riskGrade.startsWith('A') ? 'bg-success-100 text-success-800' :
                          supplier.riskGrade.startsWith('B') ? 'bg-warning-100 text-warning-800' :
                          'bg-danger-100 text-danger-800'
                        }`}>
                          Grade {supplier.riskGrade}
                        </Badge>
                      </div>
                      
                      <Button 
                        className="w-full"
                        variant="outline"
                        onClick={() => {
                          setSelectedSupplier(supplier);
                          setDetailsOpen(true);
                        }}
                      >
                        <i className="fas fa-shield-alt mr-2"></i>
                        View Risk Details
                      </Button>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4">
                  <i className="fas fa-search text-gray-400 text-xl"></i>
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-1">No suppliers found</h3>
                <p className="text-gray-500">
                  {searchQuery
                    ? "Try adjusting your search or risk threshold filters"
                    : "No suppliers match your current risk threshold"}
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t border-gray-100 pt-4 flex justify-between">
            <p className="text-sm text-gray-500">
              Showing {filteredSuppliers?.length || 0} of {suppliersData?.suppliers?.length || 0} suppliers
            </p>
            <p className="text-sm text-gray-500">
              <i className="fas fa-shield-alt mr-1 text-primary-600"></i>
              Risk data updated daily
            </p>
          </CardFooter>
        </Card>

        {/* Risk Scoring Methodology */}
        <Card>
          <CardHeader>
            <CardTitle>Aladin Risk Scoring Methodology</CardTitle>
            <CardDescription>
              Our proprietary risk assessment algorithm evaluates suppliers on multiple factors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-3">
                  <i className="fas fa-coins"></i>
                </div>
                <h3 className="font-medium mb-1">Financial Stability</h3>
                <p className="text-sm text-gray-500">Credit rating, revenue trends, and financial health indicators</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-3">
                  <i className="fas fa-truck"></i>
                </div>
                <h3 className="font-medium mb-1">Delivery Performance</h3>
                <p className="text-sm text-gray-500">Historical on-time delivery rates and logistics capabilities</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-3">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h3 className="font-medium mb-1">Quality Assurance</h3>
                <p className="text-sm text-gray-500">Product quality metrics, certifications, and quality control processes</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-3">
                  <i className="fas fa-balance-scale"></i>
                </div>
                <h3 className="font-medium mb-1">Compliance</h3>
                <p className="text-sm text-gray-500">Regulatory compliance, legal history, and environmental standards</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-3">
                  <i className="fas fa-star"></i>
                </div>
                <h3 className="font-medium mb-1">Market Reputation</h3>
                <p className="text-sm text-gray-500">Customer reviews, industry recognition, and market presence</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Details Dialog */}
        {selectedSupplier && (
          <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Supplier Risk Analysis</DialogTitle>
                <DialogDescription>
                  Detailed risk assessment for {selectedSupplier.companyName}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="flex items-center space-x-4">
                  {selectedSupplier.logo ? (
                    <img
                      src={selectedSupplier.logo}
                      alt={selectedSupplier.companyName}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-2xl font-medium">
                      {selectedSupplier.companyName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold">{selectedSupplier.companyName}</h3>
                    <p className="text-gray-600">{selectedSupplier.location}</p>
                    <div className="flex items-center mt-1 space-x-2">
                      <Badge className={`${
                        selectedSupplier.riskGrade.startsWith('A') ? 'bg-success-100 text-success-800' :
                        selectedSupplier.riskGrade.startsWith('B') ? 'bg-warning-100 text-warning-800' :
                        'bg-danger-100 text-danger-800'
                      }`}>
                        Risk Grade: {selectedSupplier.riskGrade}
                      </Badge>
                      {selectedSupplier.verified && (
                        <Badge className="bg-primary-100 text-primary-800">
                          <i className="fas fa-check-circle mr-1"></i> Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Overall Risk Score</h4>
                    <span className={`font-bold text-lg ${getRiskLevelClass(selectedSupplier.riskScore)}`}>
                      {selectedSupplier.riskScore.toFixed(1)}/5.0
                    </span>
                  </div>
                  <Progress 
                    value={(selectedSupplier.riskScore / 5) * 100} 
                    className="h-2"
                    indicatorClassName={getProgressColor(selectedSupplier.riskScore)}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low Risk</span>
                    <span>Medium Risk</span>
                    <span>High Risk</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Risk Factor Breakdown</h4>
                  
                  {selectedSupplier.riskFactors ? (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Financial Stability</span>
                          <span className={getRiskLevelClass(selectedSupplier.riskFactors.financial)}>
                            {selectedSupplier.riskFactors.financial.toFixed(1)}
                          </span>
                        </div>
                        <Progress 
                          value={(selectedSupplier.riskFactors.financial / 5) * 100} 
                          className="h-1.5"
                          indicatorClassName={getProgressColor(selectedSupplier.riskFactors.financial)}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Delivery Performance</span>
                          <span className={getRiskLevelClass(selectedSupplier.riskFactors.delivery)}>
                            {selectedSupplier.riskFactors.delivery.toFixed(1)}
                          </span>
                        </div>
                        <Progress 
                          value={(selectedSupplier.riskFactors.delivery / 5) * 100} 
                          className="h-1.5"
                          indicatorClassName={getProgressColor(selectedSupplier.riskFactors.delivery)}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Quality Assurance</span>
                          <span className={getRiskLevelClass(selectedSupplier.riskFactors.quality)}>
                            {selectedSupplier.riskFactors.quality.toFixed(1)}
                          </span>
                        </div>
                        <Progress 
                          value={(selectedSupplier.riskFactors.quality / 5) * 100} 
                          className="h-1.5"
                          indicatorClassName={getProgressColor(selectedSupplier.riskFactors.quality)}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Regulatory Compliance</span>
                          <span className={getRiskLevelClass(selectedSupplier.riskFactors.compliance)}>
                            {selectedSupplier.riskFactors.compliance.toFixed(1)}
                          </span>
                        </div>
                        <Progress 
                          value={(selectedSupplier.riskFactors.compliance / 5) * 100} 
                          className="h-1.5"
                          indicatorClassName={getProgressColor(selectedSupplier.riskFactors.compliance)}
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Market Reputation</span>
                          <span className={getRiskLevelClass(selectedSupplier.riskFactors.reputation)}>
                            {selectedSupplier.riskFactors.reputation.toFixed(1)}
                          </span>
                        </div>
                        <Progress 
                          value={(selectedSupplier.riskFactors.reputation / 5) * 100} 
                          className="h-1.5"
                          indicatorClassName={getProgressColor(selectedSupplier.riskFactors.reputation)}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-gray-500 py-4 text-center">
                      Detailed risk factor breakdown is not available for this supplier
                    </div>
                  )}
                </div>
                
                <div className="rounded-lg border border-gray-200 p-4">
                  <h4 className="font-medium mb-2">Risk Assessment Summary</h4>
                  <p className="text-sm text-gray-600">
                    {selectedSupplier.riskGrade.startsWith('A') 
                      ? `${selectedSupplier.companyName} has been evaluated as a low-risk supplier with strong financial stability, consistent delivery performance, and high quality standards. They are recommended for both short-term and long-term business relationships.`
                      : selectedSupplier.riskGrade.startsWith('B')
                      ? `${selectedSupplier.companyName} has been evaluated as a medium-risk supplier with adequate financial health and acceptable performance metrics. Regular monitoring is advised for ongoing business relationships.`
                      : `${selectedSupplier.companyName} has been evaluated as a high-risk supplier with concerns in multiple risk categories. Caution is advised when establishing business relationships, and enhanced due diligence is recommended.`
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setDetailsOpen(false)}
                >
                  Close
                </Button>
                <Button>
                  <i className="fas fa-file-download mr-2"></i>
                  Download Report
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
};

export default RiskScoring;
