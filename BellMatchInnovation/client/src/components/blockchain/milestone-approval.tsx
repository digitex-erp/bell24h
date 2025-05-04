import { useState } from 'react';
import { useBlockchainWallet } from '@/hooks/use-blockchain-wallet';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, Clock, Shield } from 'lucide-react';

export interface Milestone {
  id: number;
  name: string;
  description: string;
  amount: string;
  completed: boolean;
  approved: boolean;
  released?: boolean;
  evidence?: string;
  approvalDate?: Date;
  releaseDate?: Date;
}

interface MilestoneApprovalProps {
  orderId: number;
  milestones: Milestone[];
  onMilestoneApproved: (milestoneId: number) => void;
  onMilestoneRejected: (milestoneId: number, reason: string) => void;
  onPaymentReleased: (milestoneId: number) => void;
}

export function MilestoneApproval({ 
  orderId,
  milestones,
  onMilestoneApproved,
  onMilestoneRejected,
  onPaymentReleased
}: MilestoneApprovalProps) {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const { isConnected } = useBlockchainWallet();

  // Calculate overall progress
  const completedCount = milestones.filter(m => m.completed || m.approved || m.released).length;
  const overallProgress = milestones.length > 0 
    ? Math.round((completedCount / milestones.length) * 100) 
    : 0;

  // Helper to get the currently selected milestone
  const getSelectedMilestone = () => {
    return milestones.find(m => m.id === selectedMilestoneId) || null;
  }

  // Handlers for milestone actions
  const handleApproveClick = (milestoneId: number) => {
    setSelectedMilestoneId(milestoneId);
    setApprovalDialogOpen(true);
  };

  const handleReleaseClick = (milestoneId: number) => {
    setSelectedMilestoneId(milestoneId);
    setReleaseDialogOpen(true);
  };

  const handleDisputeClick = (milestoneId: number) => {
    setSelectedMilestoneId(milestoneId);
    setDisputeReason('');
    setDisputeDialogOpen(true);
  };

  const confirmApprove = () => {
    if (selectedMilestoneId !== null) {
      onMilestoneApproved(selectedMilestoneId);
      setApprovalDialogOpen(false);
    }
  };

  const confirmRelease = () => {
    if (selectedMilestoneId !== null) {
      onPaymentReleased(selectedMilestoneId);
      setReleaseDialogOpen(false);
    }
  };

  const confirmDispute = () => {
    if (selectedMilestoneId !== null && disputeReason.trim()) {
      onMilestoneRejected(selectedMilestoneId, disputeReason);
      setDisputeDialogOpen(false);
    }
  };

  // Helper to get status badge
  function getStatusBadge(milestone: Milestone) {
    if (milestone.released) {
      return <Badge className="bg-green-500"><Shield className="w-3 h-3 mr-1" /> Released</Badge>;
    } else if (milestone.approved) {
      return <Badge className="bg-blue-500"><CheckCircle className="w-3 h-3 mr-1" /> Approved</Badge>;
    } else if (milestone.completed) {
      return <Badge><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
    } else {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" /> In Progress</Badge>;
    }
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wallet Connection Required</CardTitle>
          <CardDescription>Connect your wallet to approve milestones and release payments.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (milestones.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Milestones Found</CardTitle>
          <CardDescription>There are no milestones defined for this order.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Project Progress</CardTitle>
          <CardDescription>Overall completion: {overallProgress}%</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={overallProgress} className="h-2" />
        </CardContent>
      </Card>

      {/* Milestones List */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Milestones</h3>
        
        {milestones.map((milestone) => (
          <Card key={milestone.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{milestone.name}</CardTitle>
                  <CardDescription className="mt-1">{milestone.description}</CardDescription>
                </div>
                {getStatusBadge(milestone)}
              </div>
            </CardHeader>
            
            <CardContent className="pb-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">{milestone.amount} ETH</p>
                </div>
                
                {milestone.evidence && (
                  <div className="ml-4">
                    <p className="text-sm text-muted-foreground">Evidence</p>
                    <p className="text-sm">{milestone.evidence}</p>
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="bg-muted/50 pt-3">
              <div className="flex flex-wrap gap-2 w-full justify-end">
                {/* Approve button - only show for completed milestones that aren't approved/released */}
                {milestone.completed && !milestone.approved && !milestone.released && (
                  <Button 
                    variant="outline"
                    onClick={() => handleApproveClick(milestone.id)}
                  >
                    Approve
                  </Button>
                )}
                
                {/* Release payment button - only show for approved milestones that aren't released */}
                {milestone.approved && !milestone.released && (
                  <Button 
                    variant="default"
                    onClick={() => handleReleaseClick(milestone.id)}
                  >
                    Release Payment
                  </Button>
                )}
                
                {/* Dispute button - only show for milestones that aren't released */}
                {!milestone.released && (
                  <Button 
                    variant="destructive"
                    onClick={() => handleDisputeClick(milestone.id)}
                  >
                    Dispute
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Approval Confirmation Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Milestone Approval</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this milestone? This will mark it as verified and allow payment to be released.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMilestoneId !== null && (
            <div className="py-4">
              <p className="font-medium">{getSelectedMilestone()?.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{getSelectedMilestone()?.description}</p>
              <p className="font-medium mt-4">Amount: {getSelectedMilestone()?.amount} ETH</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmApprove}>
              Approve Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Release Payment Dialog */}
      <Dialog open={releaseDialogOpen} onOpenChange={setReleaseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment Release</DialogTitle>
            <DialogDescription>
              Are you sure you want to release payment for this milestone? This action will transfer funds to the supplier.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMilestoneId !== null && (
            <div className="py-4">
              <p className="font-medium">{getSelectedMilestone()?.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{getSelectedMilestone()?.description}</p>
              <p className="font-medium mt-4">Amount: {getSelectedMilestone()?.amount} ETH</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReleaseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmRelease}>
              Release Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dispute Dialog */}
      <Dialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dispute Milestone</DialogTitle>
            <DialogDescription>
              Please provide a reason for disputing this milestone. This will notify the supplier and prevent payment.
            </DialogDescription>
          </DialogHeader>
          
          {selectedMilestoneId !== null && (
            <div className="py-4">
              <p className="font-medium">{getSelectedMilestone()?.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{getSelectedMilestone()?.description}</p>
              <p className="font-medium mt-4">Amount: {getSelectedMilestone()?.amount} ETH</p>
              
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">
                  Dispute Reason
                </label>
                <Textarea
                  placeholder="Please explain why you're disputing this milestone..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full"
                  rows={4}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDisputeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              disabled={!disputeReason.trim()} 
              onClick={confirmDispute}
            >
              Submit Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}