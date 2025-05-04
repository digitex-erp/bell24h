import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MainLayout from '../components/layout/main-layout';
import { MilestoneApproval, Milestone } from '../components/blockchain/milestone-approval';
import M1ExchangeEarlyPayment from '../components/payments/M1ExchangeEarlyPayment';
import M1ExchangeTransactions from '../components/payments/M1ExchangeTransactions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useToast } from '../hooks/use-toast';
import { AlertCircle, ArrowLeft, Wallet, CreditCard } from 'lucide-react';
import { useBlockchainWallet } from '../hooks/use-blockchain-wallet';
import { PaymentState } from '../lib/blockchain';

export default function MilestoneApprovalPage() {
  const { orderId } = useParams();
  const orderIdNum = orderId ? parseInt(orderId) : 0;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { 
    isConnected, 
    connectWallet, 
    getPayment, 
    getOrderPayments, 
    releasePayment
  } = useBlockchainWallet();
  
  // Helper function to get payment ID for a milestone
  const getPaymentIdForMilestone = async (orderId: number, milestoneNumber: number): Promise<number | null> => {
    try {
      // Get all payments for this order from the blockchain
      const paymentIds = await getOrderPayments(orderId);
      
      // If there are no payments, return null
      if (!paymentIds || paymentIds.length === 0) return null;
      
      // For each payment ID, get the payment details and check if it matches the milestone
      for (const paymentId of paymentIds) {
        const payment = await getPayment(paymentId);
        
        // If this payment is for the milestone we're looking for, return the payment ID
        if (payment.milestoneNumber === milestoneNumber) {
          return paymentId;
        }
      }
      
      // If no payment matches, return null
      return null;
    } catch (error) {
      console.error("Error getting payment ID for milestone:", error);
      return null;
    }
  };
  
  // Fetch order details
  const { data: orderData, isLoading: orderLoading } = useQuery({ 
    queryKey: [`/api/orders/${orderIdNum}`],
    enabled: !!orderIdNum
  });
  
  // Fetch milestones for the order
  const { data: milestoneData, isLoading: milestonesLoading } = useQuery({ 
    queryKey: [`/api/orders/${orderIdNum}/milestones`],
    enabled: !!orderIdNum
  });

  // Example milestones data for demonstration (this would come from the API)
  const [milestones, setMilestones] = useState<Milestone[]>([
    {
      id: 1,
      name: "Initial Design Delivery",
      description: "Delivery of initial product design documents and prototypes",
      amount: "0.5",
      completed: true,
      approved: false,
      evidence: "Design documents submitted on April 25, 2025. Includes wireframes, UI mockups, and design specifications. All requirements from the RFQ have been incorporated into the design.",
    },
    {
      id: 2,
      name: "MVP Development",
      description: "Functional MVP with core features implemented",
      amount: "1.2",
      completed: true,
      approved: false,
      evidence: "MVP successfully developed and deployed to staging environment. All core features are working as specified in the RFQ. Access credentials have been shared with the team for evaluation.",
    },
    {
      id: 3,
      name: "Quality Assurance",
      description: "Complete testing and bug fixing",
      amount: "0.8",
      completed: false,
      approved: false,
    },
    {
      id: 4,
      name: "Final Delivery",
      description: "Production deployment with documentation",
      amount: "0.5",
      completed: false,
      approved: false,
    }
  ]);
  
  // Mutation for approving milestones
  const approveMilestoneMutation = useMutation({
    mutationFn: async (milestoneId: number) => {
      // First, get the milestone data
      const milestone = milestones.find(m => m.id === milestoneId);
      if (!milestone) {
        throw new Error("Milestone not found");
      }
      
      // Handle blockchain interaction if connected
      if (isConnected) {
        try {
          // Get the payment ID from the blockchain for this milestone
          const paymentId = await getPaymentIdForMilestone(orderIdNum, milestoneId);
          if (paymentId) {
            // Get the payment details to verify it's valid
            const payment = await getPayment(paymentId);
            if (payment.state !== PaymentState.Funded) {
              throw new Error("Payment must be funded before approval");
            }
          } else {
            throw new Error("No blockchain payment found for this milestone");
          }
        } catch (blockchainError: any) {
          console.error("Blockchain error during approval:", blockchainError);
          throw new Error(`Blockchain error: ${blockchainError.message}`);
        }
      }
      
      // Call the API to update the milestone status
      const response = await fetch(`/api/orders/${orderIdNum}/milestones/${milestoneId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          approved: true,
          approvalDate: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to approve milestone: ${errorText}`);
      }
      
      const data = await response.json();
      return { success: true, milestoneId, data };
    },
    onSuccess: (data) => {
      // Update local state
      setMilestones(prev => 
        prev.map(m => 
          m.id === data.milestoneId 
            ? { ...m, approved: true, approvalDate: new Date() } 
            : m
        )
      );
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderIdNum}/milestones`] });
      
      toast({
        title: "Milestone Approved",
        description: "The milestone has been approved. You can now release the payment when ready.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Approval Failed",
        description: error.message || "Failed to approve milestone",
        variant: "destructive"
      });
    }
  });
  
  // Mutation for rejecting milestones
  const rejectMilestoneMutation = useMutation({
    mutationFn: async ({ milestoneId, reason }: { milestoneId: number, reason: string }) => {
      // First, get the milestone data
      const milestone = milestones.find(m => m.id === milestoneId);
      if (!milestone) {
        throw new Error("Milestone not found");
      }
      
      // Call the API to update the milestone status
      const response = await fetch(`/api/orders/${orderIdNum}/milestones/${milestoneId}/reject`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          rejected: true, 
          rejectionReason: reason,
          rejectionDate: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to reject milestone: ${errorText}`);
      }
      
      const data = await response.json();
      return { success: true, milestoneId, reason, data };
    },
    onSuccess: (data) => {
      // Update local state
      setMilestones(prev => 
        prev.map(m => 
          m.id === data.milestoneId 
            ? { ...m, completed: false, evidence: `Rejected: ${data.reason}` } 
            : m
        )
      );
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderIdNum}/milestones`] });
      
      toast({
        title: "Milestone Rejected",
        description: "The milestone has been rejected with feedback provided.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Rejection Failed",
        description: error.message || "Failed to reject milestone",
        variant: "destructive"
      });
    }
  });
  
  // Mutation for releasing milestone payments
  const releasePaymentMutation = useMutation({
    mutationFn: async (milestoneId: number) => {
      // First, get the milestone data
      const milestone = milestones.find(m => m.id === milestoneId);
      if (!milestone) {
        throw new Error("Milestone not found");
      }
      
      // Milestone must be approved before payment can be released
      if (!milestone.approved) {
        throw new Error("Milestone must be approved before payment can be released");
      }
      
      // Handle blockchain interaction if connected
      if (isConnected) {
        try {
          // Get the payment ID from the blockchain for this milestone
          const paymentId = await getPaymentIdForMilestone(orderIdNum, milestoneId);
          if (paymentId) {
            // Release the payment on the blockchain
            await releasePayment(paymentId);
          } else {
            throw new Error("No blockchain payment found for this milestone");
          }
        } catch (blockchainError: any) {
          console.error("Blockchain error during payment release:", blockchainError);
          throw new Error(`Blockchain error: ${blockchainError.message}`);
        }
      }
      
      // Call the API to update the milestone status
      const response = await fetch(`/api/orders/${orderIdNum}/milestones/${milestoneId}/release`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          released: true,
          releaseDate: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to release payment: ${errorText}`);
      }
      
      const data = await response.json();
      return { success: true, milestoneId, data };
    },
    onSuccess: (data) => {
      // Update local state
      setMilestones(prev => 
        prev.map(m => 
          m.id === data.milestoneId 
            ? { ...m, released: true, releaseDate: new Date() } 
            : m
        )
      );
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderIdNum}/milestones`] });
      
      toast({
        title: "Payment Released",
        description: "The milestone payment has been released to the supplier.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Release Failed",
        description: error.message || "Failed to release payment",
        variant: "destructive"
      });
    }
  });
  
  // Handle milestone approval
  const handleMilestoneApproved = (milestoneId: number) => {
    approveMilestoneMutation.mutate(milestoneId);
  };
  
  // Handle milestone rejection
  const handleMilestoneRejected = (milestoneId: number, reason: string) => {
    rejectMilestoneMutation.mutate({ milestoneId, reason });
  };
  
  // Handle payment release
  const handlePaymentReleased = (milestoneId: number) => {
    releasePaymentMutation.mutate(milestoneId);
  };
  
  // Load milestones from API when data is available
  useEffect(() => {
    if (milestoneData && Array.isArray(milestoneData) && milestoneData.length > 0) {
      setMilestones(milestoneData);
    }
  }, [milestoneData]);
  
  return (
    <MainLayout>
      <div className="container max-w-5xl py-6 space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Milestone Approval</h1>
            <p className="text-gray-500">
              Review and approve milestones for blockchain-secured payments
            </p>
          </div>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        
        {!isConnected ? (
          <Card>
            <CardHeader>
              <CardTitle>Wallet Connection Required</CardTitle>
              <CardDescription>
                Connect your wallet to approve milestones and release payments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={connectWallet}>
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        ) : orderLoading || milestonesLoading ? (
          <Card>
            <CardContent className="py-10 text-center">
              <div className="animate-pulse space-y-3">
                <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                <div className="h-24 bg-gray-200 rounded w-full mt-6"></div>
                <div className="h-24 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ) : orderData ? (
          <>
            {/* Order details card */}
            <Card>
              <CardHeader>
                <CardTitle>Order #{orderIdNum}</CardTitle>
                <CardDescription>
                  {orderData.title || `RFQ-${orderData.rfqId || orderIdNum}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Supplier</h3>
                    <p>{orderData.supplierName || `Supplier ID: ${orderData.supplierId}`}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Total Amount</h3>
                    <p>{orderData.totalAmount || milestones.reduce((sum, m) => sum + parseFloat(m.amount), 0)} ETH</p>
                  </div>
                  {orderData.description && (
                    <div className="col-span-2 mt-2">
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="text-sm">{orderData.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Milestone approval component */}
            <Tabs defaultValue="milestones" className="mb-6">
              <TabsList className="mb-4">
                <TabsTrigger value="milestones" className="flex items-center">
                  <Wallet className="h-4 w-4 mr-2" />
                  Milestone Approval
                </TabsTrigger>
                <TabsTrigger value="financing" className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Financial Services
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="milestones">
                <MilestoneApproval 
                  orderId={orderIdNum}
                  milestones={milestones}
                  onMilestoneApproved={handleMilestoneApproved}
                  onMilestoneRejected={handleMilestoneRejected}
                  onPaymentReleased={handlePaymentReleased}
                />
              </TabsContent>
              
              <TabsContent value="financing">
                {orderData && orderData.supplierId && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">M1 Exchange Early Payment</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        M1 Exchange offers early payment options for approved milestones. 
                        As a supplier, you can request early payment for a small discount.
                      </p>
                    </div>
                    
                    {milestones.filter(m => m.approved && !m.released).map(milestone => (
                      <M1ExchangeEarlyPayment
                        key={milestone.id}
                        milestoneId={milestone.id}
                        milestoneTitle={milestone.name}
                        amount={milestone.amount}
                        isApproved={milestone.approved}
                        supplierId={orderData.supplierId}
                        onComplete={(data) => {
                          console.log('Early payment requested:', data);
                          // Refresh milestones data
                          queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderIdNum}/milestones`] });
                        }}
                      />
                    ))}
                    
                    {milestones.filter(m => m.approved && !m.released).length === 0 && (
                      <Card>
                        <CardContent className="py-6">
                          <p className="text-center text-muted-foreground">
                            No approved milestones available for early payment.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                    
                    <M1ExchangeTransactions supplierId={orderData.supplierId} />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertCircle className="h-5 w-5 mr-2" />
                Order Not Found
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>The specified order could not be found or you don't have permission to view it.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.history.back()}
              >
                Go Back
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}