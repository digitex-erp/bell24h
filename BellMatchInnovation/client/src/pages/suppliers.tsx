import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getMatchScoreColor, getRiskGradeDisplay } from '@/lib/utils';
import { PRODUCT_CATEGORIES } from '@/lib/constants';
import { getSupplierMatchExplanation } from '@/lib/openai';
import { useToast } from '@/hooks/use-toast';
import { ExportActionButton } from '@/components/export/export-action-button';
import { ExportDialog } from '@/components/export/export-dialog';
import { formatSuppliersForExport } from '@/lib/export-utils';

interface Supplier {
  id: number;
  companyName: string;
  logo?: string;
  categories: string[];
  description: string;
  location: string;
  verified: boolean;
  riskScore: number;
  riskGrade: string;
  matchScore?: number;
}

const Suppliers = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [explanationOpen, setExplanationOpen] = useState(false);
  const [explanationLoading, setExplanationLoading] = useState(false);
  const [explanation, setExplanation] = useState<any | null>(null);
  
  const itemsPerPage = 12;

  // Fetch suppliers
  const { data, isLoading } = useQuery({
    queryKey: ['/api/suppliers', { 
      category: categoryFilter !== 'all' ? categoryFilter : undefined, 
      location: locationFilter !== 'all' ? locationFilter : undefined,
      page: currentPage, 
      limit: itemsPerPage 
    }],
    refetchOnWindowFocus: false,
  });

  const suppliers = data?.suppliers || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const locations = data?.locations || [];

  // Filter suppliers based on search query
  const filteredSuppliers = searchQuery.trim() === '' 
    ? suppliers 
    : suppliers.filter((supplier: Supplier) => 
        supplier.companyName.toLowerCase().includes(searchQuery.toLowerCase()) || 
        supplier.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  const handleShowExplanation = async (supplier: Supplier) => {
    if (!supplier.matchScore) {
      toast({
        title: 'No Match Score',
        description: 'This supplier has not been matched to any of your RFQs yet.',
      });
      return;
    }

    setSelectedSupplier(supplier);
    setExplanationOpen(true);
    setExplanationLoading(true);

    try {
      // In a real app, we'd pass the most recent RFQ ID
      const rfqId = 1; // placeholder
      const explanation = await getSupplierMatchExplanation(rfqId, supplier.id);
      setExplanation(explanation);
    } catch (error) {
      console.error('Error fetching explanation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load SHAP/LIME explanation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setExplanationLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Suppliers</h1>
            <p className="text-gray-500">Browse and connect with verified suppliers</p>
          </div>
          {filteredSuppliers.length > 0 && (
            <div className="flex gap-2">
              <ExportActionButton
                data={filteredSuppliers}
                exportType="supplier"
                filename="bell24h_suppliers.csv"
                title="Bell24h Suppliers"
                buttonText="Quick Export"
                variant="outline"
              />
              <ExportDialog
                data={formatSuppliersForExport(filteredSuppliers)}
                columns={[
                  { header: 'ID', key: 'id' },
                  { header: 'Company Name', key: 'companyName' },
                  { header: 'Location', key: 'location' },
                  { header: 'Categories', key: 'categories' },
                  { header: 'Verified', key: 'verified' },
                  { header: 'Risk Score', key: 'riskScore' },
                  { header: 'Risk Grade', key: 'riskGrade' },
                  { header: 'Match Score', key: 'matchScore' },
                  { header: 'Description', key: 'description' },
                ]}
                title="Export Suppliers"
                description="Export your supplier list with customizable options."
                defaultFilename="bell24h_suppliers.csv"
                trigger={
                  <Button variant="outline" size="sm">
                    <i className="fas fa-sliders-h mr-2"></i> Advanced Export
                  </Button>
                }
              />
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-lg shadow">
          <div className="w-full md:w-1/3 relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
              <i className="fas fa-search"></i>
            </span>
            <Input
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location: string) => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid" className="mt-4">
            {isLoading ? (
              // Loading skeleton for grid view
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Card key={i} className="overflow-hidden animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : filteredSuppliers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredSuppliers.map((supplier: Supplier) => (
                  <Card key={supplier.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-3">
                        {supplier.logo ? (
                          <img 
                            src={supplier.logo} 
                            alt={supplier.companyName} 
                            className="h-12 w-12 rounded-full object-cover" 
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-lg font-semibold">
                            {supplier.companyName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <CardTitle className="text-base">{supplier.companyName}</CardTitle>
                          <CardDescription>{supplier.location}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-gray-600 line-clamp-3">{supplier.description}</p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {supplier.categories.slice(0, 3).map((category, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {category}
                          </Badge>
                        ))}
                        {supplier.categories.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{supplier.categories.length - 3} more
                          </Badge>
                        )}
                      </div>
                      
                      {supplier.verified && (
                        <div className="mt-2">
                          <Badge className="bg-primary-100 text-primary-800">
                            <i className="fas fa-check-circle mr-1"></i> Verified
                          </Badge>
                        </div>
                      )}
                      
                      {supplier.matchScore && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm text-gray-600">Match Score:</span>
                          <div className="flex items-center">
                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`${getMatchScoreColor(supplier.matchScore)} h-2 rounded-full`} 
                                style={{ width: `${supplier.matchScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">{supplier.matchScore}%</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-2 flex items-center">
                        <span className="text-sm text-gray-600 mr-2">Risk Score:</span>
                        <span className={`text-sm font-medium ${getRiskGradeDisplay(supplier.riskGrade).colorClass}`}>
                          {getRiskGradeDisplay(supplier.riskGrade).text}
                        </span>
                        <i className={`fas fa-shield-alt ml-1 ${getRiskGradeDisplay(supplier.riskGrade).colorClass}`}></i>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-2">
                      {supplier.matchScore && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleShowExplanation(supplier)}
                        >
                          <i className="fas fa-info-circle mr-1"></i> SHAP Details
                        </Button>
                      )}
                      <Button size="sm">
                        <i className="fas fa-paper-plane mr-1"></i> Send RFQ
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <i className="fas fa-users text-4xl text-gray-300 mb-3"></i>
                <h3 className="text-lg font-medium text-gray-700">No Suppliers Found</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {searchQuery || categoryFilter !== 'all' || locationFilter !== 'all' ? 
                    'Try a different search term or clear filters.' : 
                    'There are no suppliers in the system yet.'}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="list" className="mt-4">
            {isLoading ? (
              // Loading skeleton for list view
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-white p-4 rounded-lg shadow flex animate-pulse">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mr-4"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    </div>
                    <div className="w-32 flex flex-col items-end space-y-2">
                      <div className="h-6 bg-gray-200 rounded w-24"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredSuppliers.length > 0 ? (
              <div className="space-y-4">
                {filteredSuppliers.map((supplier: Supplier) => (
                  <div key={supplier.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                    <div className="flex">
                      <div className="mr-4">
                        {supplier.logo ? (
                          <img 
                            src={supplier.logo} 
                            alt={supplier.companyName} 
                            className="h-12 w-12 rounded-full object-cover" 
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-lg font-semibold">
                            {supplier.companyName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-lg text-gray-800">{supplier.companyName}</h3>
                          {supplier.verified && (
                            <Badge className="bg-primary-100 text-primary-800">
                              <i className="fas fa-check-circle mr-1"></i> Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{supplier.location}</p>
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{supplier.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {supplier.categories.slice(0, 3).map((category, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {supplier.categories.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{supplier.categories.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex flex-col justify-between">
                        <div>
                          {supplier.matchScore && (
                            <div className="flex items-center justify-end mb-2">
                              <span className="text-sm text-gray-600 mr-2">Match:</span>
                              <Badge className="bg-success-100 text-success-800">
                                {supplier.matchScore}%
                              </Badge>
                            </div>
                          )}
                          <div className="flex items-center justify-end">
                            <span className="text-sm text-gray-600 mr-2">Risk:</span>
                            <span className={`text-sm font-medium ${getRiskGradeDisplay(supplier.riskGrade).colorClass}`}>
                              {getRiskGradeDisplay(supplier.riskGrade).text}
                            </span>
                            <i className={`fas fa-shield-alt ml-1 ${getRiskGradeDisplay(supplier.riskGrade).colorClass}`}></i>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-3">
                          {supplier.matchScore && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleShowExplanation(supplier)}
                            >
                              <i className="fas fa-info-circle mr-1"></i> SHAP
                            </Button>
                          )}
                          <Button size="sm">
                            <i className="fas fa-paper-plane mr-1"></i> Send RFQ
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <i className="fas fa-users text-4xl text-gray-300 mb-3"></i>
                <h3 className="text-lg font-medium text-gray-700">No Suppliers Found</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {searchQuery || categoryFilter !== 'all' || locationFilter !== 'all' ? 
                    'Try a different search term or clear filters.' : 
                    'There are no suppliers in the system yet.'}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left"></i>
              </Button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((page, i, arr) => (
                  <React.Fragment key={page}>
                    {i > 0 && arr[i - 1] !== page - 1 && (
                      <Button variant="outline" size="sm" disabled>
                        ...
                      </Button>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                ))
              }
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <i className="fas fa-chevron-right"></i>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* SHAP/LIME Explanation Dialog */}
      <Dialog open={explanationOpen} onOpenChange={setExplanationOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Match Explanation</DialogTitle>
            <DialogDescription>
              {selectedSupplier && `SHAP/LIME explanation for ${selectedSupplier.companyName} match score`}
            </DialogDescription>
          </DialogHeader>
          
          {explanationLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          ) : explanation ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Overall Match Score: {selectedSupplier?.matchScore}%</h4>
                <p className="text-sm text-gray-600">{explanation.recommendation}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Contributing Factors</h4>
                <div className="space-y-3">
                  {explanation.factors.map((factor: any, index: number) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{factor.name}</span>
                        <span className="text-gray-600">Importance: {Math.round(factor.importance * 100)}%</span>
                      </div>
                      <div className="flex space-x-2 items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`${getMatchScoreColor(factor.score * 100)} h-2.5 rounded-full`} 
                            style={{ width: `${factor.score * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{Math.round(factor.score * 100)}%</span>
                      </div>
                      {factor.description && (
                        <p className="text-xs text-gray-500">{factor.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Failed to load explanation details.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Suppliers;
