import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Rfq } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Define the structure for the recommendation data
interface RecommendationSupplier {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
  avatarUrl?: string;
}

interface Recommendation {
  rfq: Rfq;
  matchScore: number;
  suppliers: RecommendationSupplier[];
}

export default function AIRecommendations() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Fetch published RFQs
  const { data: rfqs, isLoading: isLoadingRfqs } = useQuery({
    queryKey: ['/api/rfqs?status=published'],
  });

  // Get top 3 recommendations to display
  const displayRecommendations = rfqs?.slice(0, 3) || [];

  // Function to get initials from a name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Handle submitting an RFQ to suppliers
  const handleSubmitRFQ = async (rfqId: number) => {
    try {
      // This is a simplified version - in a real app, you would select which suppliers to submit to
      const supplierIds = [1, 2, 3]; // Example supplier IDs
      
      await apiRequest('POST', `/api/rfqs/${rfqId}/submit`, { supplierIds });
      
      toast({
        title: "RFQ Submitted",
        description: "Your RFQ has been submitted to the selected suppliers.",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your RFQ.",
        variant: "destructive",
      });
    }
  };

  // Function to fetch supplier matches for an RFQ
  const fetchMatchesForRfq = async (rfqId: number) => {
    try {
      const response = await apiRequest('GET', `/api/rfqs/${rfqId}/matches`, undefined);
      const matches = await response.json();
      return matches;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch supplier matches.",
        variant: "destructive",
      });
      return [];
    }
  };

  if (isLoadingRfqs) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((index) => (
          <Card key={index}>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Skeleton className="h-6 w-36 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              
              <div className="mt-4">
                <Skeleton className="h-5 w-36 mb-3" />
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="ml-3">
                          <Skeleton className="h-5 w-32 mb-1" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-8 w-12" />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <div className="flex justify-between">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-neutral-900">AI Supplier Recommendations</h2>
        <Button 
          onClick={() => navigate('/rfq/list')}
        >
          View All Matches
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayRecommendations.length > 0 ? (
          displayRecommendations.map((rfq) => (
            <Card key={rfq.id} className="border border-neutral-100">
              <CardContent className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">{rfq.title}</h3>
                    <p className="text-sm text-neutral-500">#{`RFQ-${new Date(rfq.createdAt).getFullYear()}-${rfq.id.toString().padStart(3, '0')}`}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                    AI Match
                  </span>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-neutral-700 mb-2">Top Supplier Matches:</h4>
                  <ul className="space-y-3">
                    {/* This would normally come from an API call to get matches */}
                    {[
                      { id: 1, name: "Quality Manufacturer", rating: 4.8, reviewCount: 124 },
                      { id: 2, name: "Global Solutions", rating: 4.6, reviewCount: 98 },
                      { id: 3, name: "Advanced Industries", rating: 4.5, reviewCount: 112 }
                    ].map((supplier) => (
                      <li key={supplier.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Avatar>
                            <AvatarFallback>{getInitials(supplier.name)}</AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-neutral-900">{supplier.name}</p>
                            <p className="text-xs text-neutral-500">⭐ {supplier.rating} ({supplier.reviewCount} reviews)</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-primary-DEFAULT hover:text-primary-dark"
                          onClick={() => navigate(`/supplier/${supplier.id}`)}
                        >
                          View
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-4 pt-4 border-t border-neutral-100">
                  <div className="flex justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-neutral-700 hover:text-neutral-900"
                      onClick={() => fetchMatchesForRfq(rfq.id)}
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Find More
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="text-primary-DEFAULT border-primary-DEFAULT hover:bg-primary-DEFAULT hover:text-white"
                      onClick={() => handleSubmitRFQ(rfq.id)}
                    >
                      Submit RFQ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-3 text-center py-8">
            <h3 className="text-lg font-medium text-neutral-700 mb-2">No published RFQs found</h3>
            <p className="text-neutral-500 mb-4">Create and publish an RFQ to get AI-powered supplier recommendations</p>
            <Button onClick={() => navigate('/rfq/create')}>Create New RFQ</Button>
          </div>
        )}
      </div>
    </div>
  );
}
