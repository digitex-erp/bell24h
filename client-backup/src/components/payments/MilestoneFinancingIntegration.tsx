import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatCurrency, formatAddress, formatDate } from '../../utils/formatters';
import { trackEvent } from '../../lib/analytics';

interface MilestoneContract {
  id: string;
  contractId: string;
  title: string;
  description: string;
  seller: string;
  buyer: string;
  totalAmount: number;
  createdAt: Date;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
  milestones: Milestone[];
  termsHash: string;
  transactionHash: string;
}

interface Milestone {
  id: string;
  contractId: string;
  description: string;
  amount: number;
  dueDate: Date;
  startDate?: Date;
  completionDate?: Date;
  paymentDate?: Date;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED' | 'REJECTED' | 'DISPUTED';
  financed: boolean;
  financingService?: 'KREDX' | 'M1EXCHANGE';
  financingAmount?: number;
  financingDate?: Date;
  financingTxHash?: string;
}

interface FinancingOption {
  provider: 'KREDX' | 'M1EXCHANGE';
  discountRate: number;
  processingFee: number;
  advanceAmount: number;
  netAmount: number;
  processingTime: string;
  availableImmediately: boolean;
}

interface MilestoneFinancingIntegrationProps {
  contractId?: string;
  milestoneId?: string;
}

const MilestoneFinancingIntegration: React.FC<MilestoneFinancingIntegrationProps> = ({ 
  contractId, 
  milestoneId 
}) => {
  const { toast } = useToast();
  const [financingDialog, setFinancingDialog] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [financingOptions, setFinancingOptions] = useState<FinancingOption[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<'KREDX' | 'M1EXCHANGE' | null>(null);
  
  // Fetch contract details if contractId is provided
  const { data: contract, isLoading: isLoadingContract } = useQuery<MilestoneContract>({
    queryKey: [`/api/contracts/milestone/${contractId}`],
    staleTime: 60000,
    enabled: !!contractId,
  });
  
  // Fetch milestone details if milestoneId is provided
  const { data: milestone, isLoading: isLoadingMilestone } = useQuery<Milestone>({
    queryKey: [`/api/contracts/milestone/milestones/${milestoneId}`],
    staleTime: 60000,
    enabled: !!milestoneId && !contractId, // Only fetch if milestoneId is provided and contractId is not
  });

  // Fetch all eligible milestones if neither contractId nor milestoneId is provided
  const { data: eligibleMilestones, isLoading: isLoadingEligible } = useQuery<Milestone[]>({
    queryKey: ['/api/contracts/milestone/financing/eligible'],
    staleTime: 60000,
    enabled: !contractId && !milestoneId,
  });

  // Check milestone eligibility for financing
  const checkEligibilityMutation = useMutation({
    mutationFn: async (selectedMilestone: Milestone) => {
      trackEvent('milestone_financing_check_eligibility', {
        milestone_id: selectedMilestone.id,
        contract_id: selectedMilestone.contractId,
        amount: selectedMilestone.amount
      });
      
      const response = await apiRequest('POST', '/api/contracts/milestone/financing/evaluate', {
        milestoneId: selectedMilestone.id,
        contractId: selectedMilestone.contractId,
        amount: selectedMilestone.amount
      });
      return response.json();
    },
    onSuccess: (data) => {
      setFinancingOptions(data);
      if (data.length === 0) {
        toast({
          title: 'Not eligible for financing',
          description: 'This milestone is not eligible for financing at this time.',
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: 'Failed to check eligibility',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  // Apply for financing
  const applyFinancingMutation = useMutation({
    mutationFn: async ({ milestone, provider }: { milestone: Milestone, provider: 'KREDX' | 'M1EXCHANGE' }) => {
      trackEvent('milestone_financing_apply', {
        milestone_id: milestone.id,
        contract_id: milestone.contractId,
        amount: milestone.amount,
        provider: provider
      });
      
      const response = await apiRequest('POST', `/api/contracts/milestone/financing/${provider.toLowerCase()}`, {
        milestoneId: milestone.id,
        contractId: milestone.contractId,
        amount: milestone.amount
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Financing approved!',
        description: `Your milestone payment of ${formatCurrency(data.financingAmount)} has been financed successfully.`,
      });
      setFinancingDialog(false);
      setSelectedMilestone(null);
      setSelectedProvider(null);
    },
    onError: (error) => {
      toast({
        title: 'Financing failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  // Handle milestone selection for financing
  const handleMilestoneSelect = (milestone: Milestone) => {
    setSelectedMilestone(milestone);
    checkEligibilityMutation.mutate(milestone);
    setFinancingDialog(true);
  };

  // Handle financing application
  const handleApplyFinancing = () => {
    if (!selectedMilestone || !selectedProvider) return;
    
    applyFinancingMutation.mutate({ 
      milestone: selectedMilestone, 
      provider: selectedProvider 
    });
  };

  // Get milestones to display
  const getMilestonesToDisplay = (): Milestone[] => {
    if (contract) {
      return contract.milestones.filter(m => 
        m.status === 'APPROVED' && !m.financed
      );
    }
    
    if (milestone) {
      return [milestone];
    }
    
    return eligibleMilestones || [];
  };

  // Render milestone status badge
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'COMPLETED':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>;
      case 'DISPUTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Disputed</Badge>;
      case 'PENDING':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Pending</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestone Financing</CardTitle>
        <CardDescription>
          Get paid faster for approved milestones with our financing partners
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="milestones">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="milestones">Eligible Milestones</TabsTrigger>
            <TabsTrigger value="history">Financing History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="milestones" className="space-y-4">
            {isLoadingContract || isLoadingMilestone || isLoadingEligible ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : getMilestonesToDisplay().length > 0 ? (
              <div className="space-y-4">
                {getMilestonesToDisplay().map((milestone) => (
                  <div 
                    key={milestone.id} 
                    className="border rounded-lg p-4 hover:border-primary transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{milestone.description}</div>
                        <div className="text-sm text-gray-500">
                          Due: {formatDate(milestone.dueDate)}
                        </div>
                        <div className="mt-2">
                          {renderStatusBadge(milestone.status)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold">
                          {formatCurrency(milestone.amount)}
                        </div>
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={() => handleMilestoneSelect(milestone)}
                          disabled={milestone.status !== 'APPROVED' || milestone.financed}
                        >
                          Finance Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No eligible milestones found for financing</p>
                <p className="text-sm text-gray-400 mt-2">
                  Milestones must be approved by the buyer to be eligible for financing
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            {/* Financing History UI - To be implemented */}
            <div className="text-center py-8">
              <p className="text-gray-500">No financing history found</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      {/* Financing Dialog */}
      <Dialog open={financingDialog} onOpenChange={setFinancingDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Milestone Financing Options</DialogTitle>
            <DialogDescription>
              Compare offers from our financing partners
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {checkEligibilityMutation.isPending ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Checking financing options...</p>
              </div>
            ) : financingOptions.length > 0 ? (
              <div className="space-y-6">
                <div className="bg-primary-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500 mb-1">Original Milestone Amount</div>
                  <div className="text-xl font-semibold">
                    {selectedMilestone ? formatCurrency(selectedMilestone.amount) : 'N/A'}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label className="text-base">Select a financing provider:</Label>
                  <RadioGroup value={selectedProvider || ''} onValueChange={(value) => setSelectedProvider(value as 'KREDX' | 'M1EXCHANGE')}>
                    {financingOptions.map((option) => (
                      <div
                        key={option.provider}
                        className={`border rounded-lg p-4 transition-colors ${
                          selectedProvider === option.provider ? 'border-primary bg-primary-50' : ''
                        }`}
                      >
                        <div className="flex items-start">
                          <RadioGroupItem value={option.provider} id={option.provider} className="mt-1" />
                          <div className="ml-3 flex-1">
                            <Label htmlFor={option.provider} className="font-medium text-base">
                              {option.provider === 'KREDX' ? 'KredX' : 'M1Exchange'}
                            </Label>
                            
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <div className="text-sm text-gray-500">Discount Rate</div>
                                <div className="font-medium">{option.discountRate}%</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Processing Fee</div>
                                <div className="font-medium">{formatCurrency(option.processingFee)}</div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">Processing Time</div>
                                <div className="font-medium">
                                  {option.availableImmediately ? 'Immediate' : option.processingTime}
                                </div>
                              </div>
                              <div>
                                <div className="text-sm text-gray-500">You Receive</div>
                                <div className="font-medium text-green-600">
                                  {formatCurrency(option.netAmount)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded-md text-sm">
                  <p className="text-gray-700">
                    By proceeding, you agree to transfer the milestone payment rights to the selected financing provider.
                    Funds will be added to your wallet immediately upon approval.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-red-600">
                <p>No financing options available for this milestone.</p>
                <p className="text-sm text-gray-500 mt-2">
                  This could be due to the milestone amount, contract status, or buyer credit rating.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setFinancingDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleApplyFinancing}
              disabled={!selectedProvider || applyFinancingMutation.isPending}
            >
              {applyFinancingMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                'Get Financing Now'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MilestoneFinancingIntegration;
