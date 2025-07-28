import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  amount: number;
  dueDate: Date;
  completionDate?: Date;
  status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';
  paymentStatus: 'UNPAID' | 'EARLY_PAYMENT_PROCESSED' | 'PAID';
  paymentDate?: Date;
  paymentAmount?: number;
  paymentReference?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  buyerId: number;
  supplierId: number;
  status: string;
  startDate: Date;
  endDate: Date;
  buyerName?: string;
}

interface EarlyPaymentTerms {
  milestoneId: string;
  originalAmount: number;
  maxEligibleAmount: number;
  earlyPaymentFee: number;
  netAmount: number;
  processingTime: string;
  availableImmediately: boolean;
}

const M1ExchangeService: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [earlyPaymentDialog, setEarlyPaymentDialog] = useState(false);
  const [earlyPaymentTerms, setEarlyPaymentTerms] = useState<EarlyPaymentTerms | null>(null);
  const [requestDetails, setRequestDetails] = useState({
    requestedAmount: '',
    reason: ''
  });

  // Fetch eligible milestones
  const { data: eligibleMilestones, isLoading: isLoadingMilestones } = useQuery<any[]>({
    queryKey: ['/api/m1exchange/eligible-milestones', sessionStorage.getItem('supplierId')],
    queryFn: async () => {
      const supplierId = sessionStorage.getItem('supplierId');
      if (!supplierId) return [];
      const response = await apiRequest('GET', `/api/m1exchange/eligible-milestones/${supplierId}`);
      return response.json();
    },
    staleTime: 60000,
  });

  // Fetch projects for milestone details
  const { data: projects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    staleTime: 60000,
    enabled: !!milestones && milestones.length > 0,
  });

  // Fetch payment history
  const { data: paymentHistory, isLoading: isLoadingHistory } = useQuery<any[]>({
    queryKey: ['/api/m1exchange/transactions/supplier', sessionStorage.getItem('supplierId')],
    queryFn: async () => {
      const supplierId = sessionStorage.getItem('supplierId');
      if (!supplierId) return [];
      const response = await apiRequest('GET', `/api/m1exchange/transactions/supplier/${supplierId}`);
      return response.json();
    },
    staleTime: 60000,
  });

  // Fetch service status
  const { data: serviceStatus } = useQuery<any>({
    queryKey: ['/api/m1exchange/status'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/m1exchange/status');
      return response.json();
    },
    staleTime: 300000, // 5 minutes
  });

  // Check milestone eligibility mutation
  const checkEligibilityMutation = useMutation({
    mutationFn: async (milestoneId: string) => {
      const response = await apiRequest('GET', `/api/m1exchange/eligible-milestones/${sessionStorage.getItem('supplierId')}`);
      const milestones = await response.json();
      return milestones.find((m: any) => m.milestoneId === milestoneId) || null;
    },
    onSuccess: (data) => {
      setEarlyPaymentTerms(data);
      // Set initial requested amount to max eligible amount
      setRequestDetails({
        ...requestDetails,
        requestedAmount: data.maxEligibleAmount.toString()
      });
    },
    onError: (error) => {
      toast({
        title: 'Eligibility check failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
      setEarlyPaymentTerms(null);
    },
  });

  // Request early payment mutation
  const requestEarlyPaymentMutation = useMutation({
    mutationFn: async (data: { milestoneId: string; requestedAmount: number; reason?: string }) => {
      const supplierId = sessionStorage.getItem('supplierId');
      if (!supplierId) {
        throw new Error('User not authenticated');
      }
      const response = await apiRequest('POST', `/api/m1exchange/early-payment/${data.milestoneId}`, {
        requestedAmount: data.requestedAmount,
        remarks: data.reason
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/m1exchange/eligible-milestones'] });
      queryClient.invalidateQueries({ queryKey: ['/api/m1exchange/transactions/supplier'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      toast({
        title: 'Early payment processed',
        description: `₹${data.netAmount.toLocaleString()} has been added to your wallet.`,
      });
      setEarlyPaymentDialog(false);
    },
    onError: (error) => {
      toast({
        title: 'Failed to process early payment',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  const handleCheckEligibility = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    checkEligibilityMutation.mutate(milestone.id);
    setEarlyPaymentDialog(true);
  };

  const handleRequestEarlyPayment = () => {
    if (!selectedMilestone || !earlyPaymentTerms) return;
    
    const amount = parseFloat(requestDetails.requestedAmount);
    if (isNaN(amount) || amount <= 0 || amount > earlyPaymentTerms.maxEligibleAmount) {
      toast({
        title: 'Invalid amount',
        description: `Please enter an amount between 1 and ${earlyPaymentTerms.maxEligibleAmount}.`,
        variant: 'destructive',
      });
      return;
    }
    
    requestEarlyPaymentMutation.mutate({
      milestoneId: selectedMilestone.id,
      requestedAmount: amount,
      reason: requestDetails.reason || undefined
    });
  };

  const getProjectName = (projectId: string) => {
    if (!projects) return 'Loading...';
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getMilestoneStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Pending</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'APPROVED':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'UNPAID':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Unpaid</Badge>;
      case 'EARLY_PAYMENT_PROCESSED':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Early Payment</Badge>;
      case 'PAID':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate early payment fee based on the requested amount
  const calculateFee = (amount: number) => {
    if (!earlyPaymentTerms) return 0;
    
    const feeRate = earlyPaymentTerms.earlyPaymentFee / earlyPaymentTerms.originalAmount;
    const fee = amount * feeRate;
    return Math.max(fee, 100); // Minimum fee of ₹100
  };

  // Get milestones from eligibility data
  const getEligibleMilestones = () => {
    if (!eligibleMilestones) return [];
    return eligibleMilestones;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>M1 Exchange Early Milestone Payments</CardTitle>
        <CardDescription>
          Get paid immediately after milestone approval instead of waiting for the project completion
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="milestones">
          <TabsList className="mb-4">
            <TabsTrigger value="milestones">Eligible Milestones</TabsTrigger>
            <TabsTrigger value="history">Payment History</TabsTrigger>
            <TabsTrigger value="savings">Your Savings</TabsTrigger>
          </TabsList>
          
          {/* Eligible Milestones Tab */}
          <TabsContent value="milestones">
            {isLoadingMilestones ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <div>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24 mt-2" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-4 w-40 mt-2" />
                  </div>
                ))}
              </div>
            ) : !eligibleMilestones || getEligibleMilestones().length === 0 ? (
              <div className="py-10 text-center">
                <i className="fas fa-tasks text-gray-300 text-4xl mb-3"></i>
                <p className="text-gray-500">No eligible milestones found</p>
                <p className="text-sm text-gray-400 mt-2">
                  Milestones must be approved by the buyer to be eligible for early payment
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {getEligibleMilestones().map((milestone) => (
                  <div key={milestone.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{milestone.title}</div>
                        <div className="text-sm text-gray-500">
                          Project: {getProjectName(milestone.projectId)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Completed on: {formatDate(milestone.completionDate)}
                        </div>
                      </div>
                      <div className="text-lg font-semibold">
                        ₹{milestone.amount.toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      {getMilestoneStatusBadge(milestone.status)}
                      {getPaymentStatusBadge(milestone.paymentStatus)}
                    </div>
                    
                    {milestone.description && (
                      <div className="mt-2 text-sm text-gray-600 line-clamp-2">
                        {milestone.description}
                      </div>
                    )}
                    
                    <div className="flex justify-end mt-4">
                      <Button
                        size="sm"
                        onClick={() => handleCheckEligibility(milestone)}
                        disabled={milestone.status !== 'APPROVED' || milestone.paymentStatus !== 'UNPAID'}
                      >
                        Request Early Payment
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Payment History Tab */}
          <TabsContent value="history">
            {isLoadingHistory ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex justify-between">
                      <div>
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24 mt-2" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <Skeleton className="h-4 w-40 mt-2" />
                  </div>
                ))}
              </div>
            ) : !paymentHistory || paymentHistory.length === 0 ? (
              <div className="py-10 text-center">
                <i className="fas fa-history text-gray-300 text-4xl mb-3"></i>
                <p className="text-gray-500">No payment history found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div key={payment.transactionId} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{payment.milestoneName}</div>
                        <div className="text-sm text-gray-500">
                          Project: {payment.projectName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Date: {formatDate(payment.paymentDate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          +₹{payment.paymentAmount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          Fee: ₹{payment.feeAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="mt-3 bg-green-100 text-green-800">
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          {/* Savings Tab */}
          <TabsContent value="savings">
            {!savingsData ? (
              <div className="space-y-4">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-primary-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded p-3">
                      <h4 className="text-sm font-medium mb-1">Service Status</h4>
                      <p className={`text-lg font-bold ${serviceStatus?.status === 'operational' ? 'text-green-600' : 'text-amber-500'}`}>
                        {serviceStatus?.status === 'operational' ? 'Operational' : 'Limited'}
                      </p>
                    </div>
                    <div className="border rounded p-3">
                      <h4 className="text-sm font-medium mb-1">Total Transactions</h4>
                      <p className="text-lg font-bold text-green-600">
                        {paymentHistory?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded p-3 mt-4">
                  <h4 className="text-sm font-medium mb-1">Processing Time</h4>
                  <p className="text-lg font-bold text-green-600">
                    1-2 Business Days
                  </p>
                  <p className="text-xs text-gray-500">
                    For standard early payment processing
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium">Average Fee Rate</div>
                      <div className="text-sm font-medium">{savingsData.averageFeeRate}</div>
                    </div>
                    <Progress value={parseFloat(savingsData.averageFeeRate) * 50} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium">Total Fees Paid</div>
                      <div className="text-sm font-medium">₹{savingsData.totalFeesPaid.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-medium">Average Days Accelerated</div>
                      <div className="text-sm font-medium">{savingsData.averageDaysAccelerated} days</div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between mb-1">
                      <div className="text-sm font-semibold">Opportunity Cost Savings</div>
                      <div className="text-sm font-semibold text-green-600">
                        ₹{savingsData.opportunityCostSavings.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Estimated based on 18% APR interest rate you would have paid for alternative financing
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between mb-1">
                      <div className="text-lg font-bold">Net Benefit</div>
                      <div className="text-lg font-bold text-green-600">
                        ₹{savingsData.netBenefit.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Your total savings after subtracting fees paid
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-md p-4 bg-yellow-50">
                  <div className="flex items-start">
                    <i className="fas fa-lightbulb text-yellow-600 mr-3 mt-1"></i>
                    <div className="text-sm text-gray-700">
                      <p className="font-medium mb-1">Did you know?</p>
                      <p>By using early milestone payments through M1 Exchange, you've accelerated your cash flow 
                      by an average of {savingsData.averageDaysAccelerated} days per milestone. This has enabled 
                      you to reinvest in your business faster and take on new projects without waiting for 
                      payment terms.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-gray-50 p-4 text-sm text-gray-500 flex justify-between">
        <div>Powered by M1 Exchange</div>
        <div>Fee rate: 1-2% of milestone amount</div>
      </CardFooter>

      {/* Early Payment Dialog */}
      <Dialog open={earlyPaymentDialog} onOpenChange={setEarlyPaymentDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Early Milestone Payment</DialogTitle>
            <DialogDescription>
              {selectedMilestone && `Get paid now for milestone: ${selectedMilestone.title}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {checkEligibilityMutation.isPending ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-2xl text-primary-600 mb-4"></i>
                <p>Checking eligibility...</p>
              </div>
            ) : earlyPaymentTerms ? (
              <div className="space-y-4">
                <div className="bg-primary-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500 mb-1">Original Milestone Amount</div>
                  <div className="text-xl font-semibold">₹{earlyPaymentTerms.originalAmount.toLocaleString()}</div>
                </div>
                
                <div>
                  <label htmlFor="requestedAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Amount to Request
                  </label>
                  <Input
                    id="requestedAmount"
                    type="number"
                    min="1"
                    max={earlyPaymentTerms.maxEligibleAmount}
                    value={requestDetails.requestedAmount}
                    onChange={(e) => setRequestDetails({...requestDetails, requestedAmount: e.target.value})}
                    placeholder={`Max: ₹${earlyPaymentTerms.maxEligibleAmount.toLocaleString()}`}
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    You can request up to ₹{earlyPaymentTerms.maxEligibleAmount.toLocaleString()}
                  </div>
                </div>
                
                <div>
                  <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                    Reason for Early Payment (Optional)
                  </label>
                  <Textarea
                    id="reason"
                    value={requestDetails.reason}
                    onChange={(e) => setRequestDetails({...requestDetails, reason: e.target.value})}
                    placeholder="e.g., Working capital needs, supplier payments, etc."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-md">
                  <div>
                    <div className="text-sm text-gray-500">Early Payment Fee</div>
                    <div className="font-medium text-red-600">
                      -₹{calculateFee(parseFloat(requestDetails.requestedAmount) || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      ({(earlyPaymentTerms.earlyPaymentFee / earlyPaymentTerms.originalAmount * 100).toFixed(1)}% of amount)
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">You Receive</div>
                    <div className="font-medium text-green-600">
                      ₹{(
                        (parseFloat(requestDetails.requestedAmount) || 0) - 
                        calculateFee(parseFloat(requestDetails.requestedAmount) || 0)
                      ).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">
                      {earlyPaymentTerms.availableImmediately ? 'Available immediately' : earlyPaymentTerms.processingTime}
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded-md text-sm">
                  <p className="text-gray-700 flex items-start">
                    <i className="fas fa-info-circle text-yellow-600 mr-2 mt-1"></i>
                    <span>
                      Early payment will be processed immediately and added to your wallet balance.
                      The fee will be deducted automatically from the milestone amount.
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-red-600">
                <i className="fas fa-exclamation-circle text-2xl mb-4"></i>
                <p>This milestone is not eligible for early payment.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Ensure the milestone is approved by the buyer and not already paid.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEarlyPaymentDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleRequestEarlyPayment}
              disabled={!earlyPaymentTerms || requestEarlyPaymentMutation.isPending}
            >
              {requestEarlyPaymentMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Processing...
                </>
              ) : (
                'Confirm Early Payment'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default M1ExchangeService;
