import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { IndustryBadge } from "@/components/ui/industry-badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Loader2, ChevronLeft, Clock, CheckCircle2, AlertTriangle, FileText } from "lucide-react";

export default function RFQDetail() {
  const [, params] = useRoute<{ id: string }>("/rfq/:id");
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const rfqId = params?.id ? parseInt(params.id) : 0;
  const [activeTab, setActiveTab] = useState("details");

  // Fetch RFQ details
  const { 
    data: rfq,
    isLoading: isLoadingRfq,
    isError: isRfqError
  } = useQuery({
    queryKey: [`/api/rfqs/${rfqId}`],
    enabled: !!rfqId
  });

  // Fetch supplier matches
  const {
    data: supplierMatches,
    isLoading: isLoadingMatches,
    refetch: refetchMatches
  } = useQuery({
    queryKey: [`/api/rfqs/${rfqId}/matches`],
    enabled: !!rfqId && rfq?.status !== 'draft'
  });

  // Publish RFQ mutation
  const publishMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('PATCH', `/api/rfqs/${rfqId}`, { 
        status: 'published'
      });
    },
    onSuccess: () => {
      toast({
        title: "RFQ Published",
        description: "Your RFQ has been published successfully.",
      });
      // Refetch RFQ and invalidate RFQ list
      queryClient.invalidateQueries({ queryKey: [`/api/rfqs/${rfqId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/rfqs'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to publish RFQ. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Find AI matches mutation
  const findMatchesMutation = useMutation({
    mutationFn: async () => {
      await refetchMatches();
    },
    onSuccess: () => {
      toast({
        title: "Matches Found",
        description: "Supplier matches have been generated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to find supplier matches. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Submit RFQ to suppliers mutation
  const submitToSuppliersMutation = useMutation({
    mutationFn: async (supplierIds: number[]) => {
      await apiRequest('POST', `/api/rfqs/${rfqId}/submit`, { 
        supplierIds 
      });
    },
    onSuccess: () => {
      toast({
        title: "RFQ Submitted",
        description: "Your RFQ has been submitted to the selected suppliers.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/rfqs/${rfqId}`] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit RFQ to suppliers. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Handle publishing the RFQ
  const handlePublish = () => {
    publishMutation.mutate();
  };

  // Handle finding AI matches
  const handleFindMatches = () => {
    findMatchesMutation.mutate();
  };

  // Handle submitting to all suppliers
  const handleSubmitToSuppliers = () => {
    if (supplierMatches && supplierMatches.length > 0) {
      const supplierIds = supplierMatches.map((match: any) => match.supplierId);
      submitToSuppliersMutation.mutate(supplierIds);
    } else {
      toast({
        title: "No Suppliers",
        description: "There are no suppliers to submit this RFQ to.",
        variant: "destructive"
      });
    }
  };

  // Get the user's initials for the avatar
  const getInitials = (name: string) => {
    if (!name) return "";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Format RFQ ID
  const formatRfqId = (id: number, createdAt: string) => {
    if (!id || !createdAt) return "";
    const year = new Date(createdAt).getFullYear();
    return `RFQ-${year}-${id.toString().padStart(3, '0')}`;
  };

  if (isRfqError) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 md:ml-64 min-h-screen">
          <Header title="RFQ Details" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">RFQ Not Found</h2>
                <p className="text-neutral-500 mb-6">The RFQ you are looking for does not exist or you do not have permission to view it.</p>
                <Button onClick={() => navigate('/rfq/list')}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to RFQs
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 md:ml-64 min-h-screen">
        <Header title={isLoadingRfq ? "RFQ Details" : `RFQ: ${rfq.title}`} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6 flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={() => navigate('/rfq/list')}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to RFQs
            </Button>
            
            {!isLoadingRfq && rfq && (
              <Button 
                variant="default"
                onClick={() => navigate(`/rfq/${rfqId}/recommendations`)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="mr-2 h-4 w-4"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                AI Supplier Recommendations
              </Button>
            )}
          </div>
          
          {isLoadingRfq ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/3" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2 flex items-center">
                    <span className="mr-3">#{formatRfqId(rfq.id, rfq.createdAt)}</span>
                    <StatusBadge status={rfq.status} className="text-sm" />
                  </h1>
                  <p className="text-neutral-500">Created on {formatDate(rfq.createdAt)}</p>
                </div>
                <div className="mt-4 md:mt-0 space-x-3">
                  {rfq.status === 'draft' && (
                    <Button
                      onClick={handlePublish}
                      disabled={publishMutation.isPending}
                    >
                      {publishMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        "Publish RFQ"
                      )}
                    </Button>
                  )}
                  
                  {rfq.status === 'published' && (
                    <Button
                      onClick={handleSubmitToSuppliers}
                      disabled={submitToSuppliersMutation.isPending}
                    >
                      {submitToSuppliersMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit to Suppliers"
                      )}
                    </Button>
                  )}
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="details">
                    <FileText className="h-4 w-4 mr-2" />
                    RFQ Details
                  </TabsTrigger>
                  <TabsTrigger value="suppliers">
                    <Clock className="h-4 w-4 mr-2" />
                    Supplier Matches
                  </TabsTrigger>
                  <TabsTrigger value="quotes">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Quotes
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details">
                  <Card>
                    <CardHeader>
                      <CardTitle>RFQ Information</CardTitle>
                      <CardDescription>
                        Detailed information about this request for quotation
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-neutral-500 mb-1">Title</h3>
                          <p className="text-neutral-900">{rfq.title}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-neutral-500 mb-1">Industry</h3>
                          <p className="text-neutral-900">
                            <IndustryBadge industry={rfq.industry} />
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-neutral-500 mb-1">Quantity</h3>
                          <p className="text-neutral-900">{rfq.quantity} units</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-neutral-500 mb-1">Budget</h3>
                          <p className="text-neutral-900">
                            {rfq.budget ? formatCurrency(rfq.budget) : 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-neutral-500 mb-1">Deadline</h3>
                          <p className="text-neutral-900">
                            {rfq.deadline ? formatDate(rfq.deadline) : 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-neutral-500 mb-1">Status</h3>
                          <p className="text-neutral-900">
                            <StatusBadge status={rfq.status} />
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500 mb-2">Description</h3>
                        <div className="p-4 bg-neutral-50 rounded-md text-neutral-900">
                          <p className="whitespace-pre-line">{rfq.description}</p>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-neutral-500 mb-2">Attachments</h3>
                        <div className="p-4 bg-neutral-50 rounded-md text-neutral-900">
                          <p className="text-neutral-500">No attachments</p>
                        </div>
                      </div>
                    </CardContent>
                    {rfq.status === 'draft' && (
                      <CardFooter className="flex justify-end space-x-4 border-t pt-6">
                        <Button variant="outline">Edit RFQ</Button>
                        <Button 
                          onClick={handlePublish}
                          disabled={publishMutation.isPending}
                        >
                          {publishMutation.isPending ? "Publishing..." : "Publish RFQ"}
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                </TabsContent>
                
                <TabsContent value="suppliers">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Supplier Matches</CardTitle>
                          <CardDescription>
                            AI-powered supplier recommendations for this RFQ
                          </CardDescription>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/rfq/${rfqId}/recommendations`)}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="mr-2 h-4 w-4"
                          >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                          </svg>
                          View Enhanced Recommendations
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {rfq.status === 'draft' ? (
                        <div className="p-8 text-center">
                          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">RFQ is in Draft Status</h3>
                          <p className="text-neutral-500 mb-4">Publish this RFQ to find supplier matches.</p>
                          <Button 
                            onClick={handlePublish}
                            disabled={publishMutation.isPending}
                          >
                            {publishMutation.isPending ? "Publishing..." : "Publish RFQ Now"}
                          </Button>
                        </div>
                      ) : isLoadingMatches ? (
                        <div className="space-y-4">
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex justify-between items-center p-4 border rounded-md">
                              <div className="flex items-center">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="ml-4">
                                  <Skeleton className="h-5 w-32 mb-1" />
                                  <Skeleton className="h-4 w-20" />
                                </div>
                              </div>
                              <Skeleton className="h-6 w-24 rounded-full" />
                            </div>
                          ))}
                        </div>
                      ) : supplierMatches?.length > 0 ? (
                        <div className="space-y-4">
                          {supplierMatches.map((match: any, index: number) => (
                            <div key={index} className="flex justify-between items-center p-4 border rounded-md hover:bg-neutral-50">
                              <div className="flex items-center">
                                <Avatar>
                                  <AvatarFallback>
                                    {getInitials(match.supplier?.name || `S${match.supplierId}`)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="ml-4">
                                  <p className="font-medium">{match.supplier?.name || `Supplier #${match.supplierId}`}</p>
                                  <p className="text-sm text-neutral-500">
                                    {match.supplier?.industry && <IndustryBadge industry={match.supplier.industry} />}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                                  {Math.round(match.matchScore)}% Match
                                </Badge>
                                <Button variant="outline" size="sm">View Profile</Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">No Supplier Matches Yet</h3>
                          <p className="text-neutral-500 mb-4">Find AI-powered supplier matches for this RFQ.</p>
                          <Button 
                            onClick={handleFindMatches}
                            disabled={findMatchesMutation.isPending}
                          >
                            {findMatchesMutation.isPending ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Finding matches...
                              </>
                            ) : (
                              "Find Supplier Matches"
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                    {supplierMatches?.length > 0 && (
                      <CardFooter className="flex justify-end space-x-4 border-t pt-6">
                        <Button 
                          onClick={handleSubmitToSuppliers}
                          disabled={submitToSuppliersMutation.isPending}
                        >
                          {submitToSuppliersMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            "Submit to All Suppliers"
                          )}
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                </TabsContent>
                
                <TabsContent value="quotes">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quote Responses</CardTitle>
                      <CardDescription>
                        Quotes received from suppliers for this RFQ
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="p-8 text-center">
                        <Clock className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Quotes Yet</h3>
                        <p className="text-neutral-500">
                          {rfq.status === 'published' 
                            ? "Quotes will appear here as suppliers respond to your RFQ."
                            : "Publish your RFQ to start receiving quotes from suppliers."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
