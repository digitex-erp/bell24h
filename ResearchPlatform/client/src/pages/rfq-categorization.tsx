import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const RfqCategorization: React.FC = () => {
  const [rfqId, setRfqId] = useState<string>('');
  const [batchRfqIds, setBatchRfqIds] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for single RFQ categorization
  const {
    data: categorization,
    isLoading: isLoadingCategorization,
    error: categorizationError,
    refetch: refetchCategorization
  } = useQuery({
    queryKey: ['/api/rfq-categorization', rfqId],
    queryFn: () => 
      rfqId ? apiRequest('GET', `/api/rfq-categorization/${rfqId}`).then(res => res.json()) : null,
    enabled: !!rfqId && rfqId.length > 0,
    retry: false
  });

  // Mutation for updating RFQ categorization
  const updateCategorizationMutation = useMutation({
    mutationFn: ({ rfqId, categoryId, industryId }: { rfqId: string; categoryId: number; industryId: number }) => {
      return apiRequest('PUT', `/api/rfq-categorization/${rfqId}`, { categoryId, industryId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rfq-categorization', rfqId] });
      toast({
        title: 'Categorization updated',
        description: 'The RFQ categorization has been successfully updated.',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating categorization',
        description: error.message || 'An error occurred while updating the categorization.',
        variant: 'destructive',
      });
    }
  });

  // Mutation for batch categorization
  const batchCategorizeMutation = useMutation({
    mutationFn: (rfqIds: number[]) => {
      return apiRequest('POST', '/api/rfq-categorization/batch', { rfqIds }).then(res => res.json());
    },
    onSuccess: (data) => {
      toast({
        title: 'Batch categorization complete',
        description: `Successfully categorized ${data.succeeded} of ${data.total} RFQs.`,
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error in batch categorization',
        description: error.message || 'An error occurred during batch categorization.',
        variant: 'destructive',
      });
    }
  });

  // Handle single RFQ categorization
  const handleCategorizeRfq = () => {
    if (!rfqId || isNaN(parseInt(rfqId))) {
      toast({
        title: 'Invalid RFQ ID',
        description: 'Please enter a valid RFQ ID.',
        variant: 'destructive',
      });
      return;
    }
    refetchCategorization();
  };

  // Handle batch categorization
  const handleBatchCategorize = () => {
    if (!batchRfqIds) {
      toast({
        title: 'No RFQ IDs',
        description: 'Please enter at least one RFQ ID.',
        variant: 'destructive',
      });
      return;
    }

    // Parse RFQ IDs from comma-separated string
    const ids = batchRfqIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    
    if (ids.length === 0) {
      toast({
        title: 'Invalid RFQ IDs',
        description: 'Please enter valid RFQ IDs separated by commas.',
        variant: 'destructive',
      });
      return;
    }

    batchCategorizeMutation.mutate(ids);
  };

  // Handle updating RFQ categorization
  const handleUpdateCategorization = (categoryId: number, industryId: number) => {
    if (!rfqId) return;
    
    updateCategorizationMutation.mutate({
      rfqId,
      categoryId,
      industryId
    });
  };

  // Rendering confidence level badge
  const renderConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return <Badge className="bg-green-500">High Confidence</Badge>;
    } else if (confidence >= 0.5) {
      return <Badge className="bg-yellow-500">Medium Confidence</Badge>;
    } else {
      return <Badge className="bg-red-500">Low Confidence</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">RFQ Categorization</h1>
      
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="single">Single RFQ</TabsTrigger>
          <TabsTrigger value="batch">Batch Processing</TabsTrigger>
        </TabsList>
        
        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle>Single RFQ Categorization</CardTitle>
              <CardDescription>
                Automatically categorize a Request for Quote based on its content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4 mb-4">
                <Input
                  type="text"
                  placeholder="Enter RFQ ID"
                  value={rfqId}
                  onChange={e => setRfqId(e.target.value)}
                />
                <Button 
                  onClick={handleCategorizeRfq}
                  disabled={isLoadingCategorization}
                >
                  {isLoadingCategorization ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    'Categorize'
                  )}
                </Button>
              </div>
              
              {categorizationError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span>Error: {(categorizationError as Error).message}</span>
                  </div>
                </div>
              )}
              
              {categorization && (
                <div className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-center">
                        <span>Categorization Results</span>
                        {renderConfidenceBadge(categorization.confidence)}
                      </CardTitle>
                      <CardDescription>
                        Method: {categorization.method}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold">Industry</h3>
                          <p>{categorization.industryName} (ID: {categorization.industryId})</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Category</h3>
                          <p>{categorization.categoryName} (ID: {categorization.categoryId})</p>
                        </div>
                        
                        {categorization.alternativeCategories && categorization.alternativeCategories.length > 0 && (
                          <div>
                            <h3 className="font-semibold">Alternative Categories</h3>
                            <ul className="list-disc pl-5">
                              {categorization.alternativeCategories.map((alt: any, index: number) => (
                                <li key={index}>
                                  {alt.name} (ID: {alt.id}) - Confidence: {Math.round(alt.confidence * 100)}%
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        onClick={() => handleUpdateCategorization(categorization.categoryId, categorization.industryId)}
                        disabled={updateCategorizationMutation.isPending}
                        className="mr-2"
                      >
                        {updateCategorizationMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Applying
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Apply Categorization
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => refetchCategorization()}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Recategorize
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>Batch RFQ Categorization</CardTitle>
              <CardDescription>
                Process multiple RFQs at once to categorize them automatically
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">RFQ IDs (comma-separated)</label>
                  <Input
                    type="text"
                    placeholder="e.g. 1, 2, 3, 4"
                    value={batchRfqIds}
                    onChange={e => setBatchRfqIds(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleBatchCategorize}
                  disabled={batchCategorizeMutation.isPending}
                  className="w-full"
                >
                  {batchCategorizeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Batch
                    </>
                  ) : (
                    'Process Batch'
                  )}
                </Button>
                
                {batchCategorizeMutation.isSuccess && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span>Successfully processed {batchCategorizeMutation.data.succeeded} of {batchCategorizeMutation.data.total} RFQs.</span>
                    </div>
                  </div>
                )}
                
                {batchCategorizeMutation.isError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span>Error: {(batchCategorizeMutation.error as Error).message}</span>
                    </div>
                  </div>
                )}
                
                {batchCategorizeMutation.isSuccess && batchCategorizeMutation.data.results && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Results</h3>
                    <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                      {batchCategorizeMutation.data.results.map((result: any, index: number) => (
                        <div 
                          key={index}
                          className={`py-2 px-3 mb-1 rounded ${result.success ? 'bg-green-50' : 'bg-red-50'}`}
                        >
                          <div className="flex justify-between">
                            <span>RFQ #{result.rfqId}</span>
                            {result.success ? (
                              <Badge className="bg-green-500">Success</Badge>
                            ) : (
                              <Badge className="bg-red-500">Failed</Badge>
                            )}
                          </div>
                          {result.success && (
                            <div className="text-sm text-gray-600 mt-1">
                              {result.categorization.industryName} / {result.categorization.categoryName}
                            </div>
                          )}
                          {!result.success && (
                            <div className="text-sm text-red-600 mt-1">
                              {result.error}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RfqCategorization;