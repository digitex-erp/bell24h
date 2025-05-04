import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, AlertCircle, Check, RefreshCw, ArrowUpRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface M1ExchangeEarlyPaymentProps {
  milestoneId: number;
  milestoneTitle: string;
  amount: string | number;
  isApproved: boolean;
  supplierId: number;
  onComplete?: (data: any) => void;
}

export default function M1ExchangeEarlyPayment({
  milestoneId,
  milestoneTitle,
  amount,
  isApproved,
  supplierId,
  onComplete
}: M1ExchangeEarlyPaymentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusCheckLoading, setStatusCheckLoading] = useState(false);
  const [discountedAmount, setDiscountedAmount] = useState<string | null>(null);
  const [discountRate, setDiscountRate] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);
  const [estimatedPayment, setEstimatedPayment] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Function to check M1 Exchange service status
  const checkM1ExchangeStatus = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const response = await apiRequest('GET', '/api/m1exchange/status');
      const data = await response.json();
      
      if (!response.ok) {
        setErrorMessage(data.message || 'Failed to check M1 Exchange service status');
        return false;
      }
      
      if (data.status !== 'connected') {
        setErrorMessage(`M1 Exchange service is not available: ${data.message}`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking M1Exchange status:', error);
      setErrorMessage('Network error when connecting to M1 Exchange service');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to request early payment
  const requestEarlyPayment = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      // First check if the service is available
      const isServiceAvailable = await checkM1ExchangeStatus();
      if (!isServiceAvailable) {
        return;
      }
      
      // Request early payment
      const response = await apiRequest(
        'POST', 
        `/api/m1exchange/early-payment/${milestoneId}`,
        { supplierId }
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        setErrorMessage(data.message || 'Failed to request early payment');
        return;
      }
      
      // Store the transaction details
      setTransactionId(data.transactionId);
      setDiscountedAmount(data.discountedAmount);
      setDiscountRate(data.discountRate);
      setTransactionStatus(data.status);
      setEstimatedPayment(data.estimatedPaymentDate);
      
      // Open dialog to show details
      setIsDialogOpen(true);
      
      // Call the onComplete callback with the transaction data
      if (onComplete) {
        onComplete(data);
      }
      
      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/m1exchange/transactions/supplier/${supplierId}`] });
      
      toast({
        title: "Early payment request submitted",
        description: `Your request for milestone "${milestoneTitle}" has been submitted to M1 Exchange.`,
        variant: "default",
      });
    } catch (error) {
      console.error('Error requesting early payment:', error);
      setErrorMessage('Failed to connect to M1 Exchange service');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to check transaction status
  const checkTransactionStatus = async () => {
    if (!transactionId) return;
    
    try {
      setStatusCheckLoading(true);
      
      const response = await apiRequest(
        'GET', 
        `/api/m1exchange/transactions/${transactionId}`
      );
      
      const data = await response.json();
      
      if (!response.ok) {
        toast({
          title: "Error checking status",
          description: data.message || "Failed to check transaction status",
          variant: "destructive",
        });
        return;
      }
      
      // Update transaction status
      setTransactionStatus(data.status);
      
      toast({
        title: "Transaction status updated",
        description: `Status: ${data.status}`,
        variant: "default",
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [`/api/m1exchange/transactions/supplier/${supplierId}`] });
    } catch (error) {
      console.error('Error checking transaction status:', error);
      toast({
        title: "Error checking status",
        description: "Network error when checking transaction status",
        variant: "destructive",
      });
    } finally {
      setStatusCheckLoading(false);
    }
  };

  // Format the status for display
  const getStatusDisplay = () => {
    if (!transactionStatus) return null;
    
    const statusMap: Record<string, { label: string, color: string }> = {
      pending: { label: 'Pending', color: 'bg-yellow-500' },
      processing: { label: 'Processing', color: 'bg-blue-500' },
      completed: { label: 'Completed', color: 'bg-green-500' },
      failed: { label: 'Failed', color: 'bg-red-500' }
    };
    
    const status = statusMap[transactionStatus] || { label: transactionStatus, color: 'bg-gray-500' };
    
    return (
      <Badge className={`${status.color} text-white`}>
        {status.label}
      </Badge>
    );
  };

  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-md flex items-center">
            <ArrowUpRight className="mr-2 h-5 w-5" />
            M1 Exchange Early Payment
          </CardTitle>
          <CardDescription>
            Get paid earlier for this milestone through M1 Exchange
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm mb-1">Milestone: {milestoneTitle}</p>
            <p className="text-sm mb-1">Amount: ₹{Number(amount).toLocaleString()}</p>
            {discountRate && (
              <p className="text-sm mb-1">Discount Rate: {discountRate}</p>
            )}
            {transactionStatus && (
              <div className="flex items-center mt-2">
                <span className="text-sm mr-2">Status:</span>
                {getStatusDisplay()}
              </div>
            )}
            {errorMessage && (
              <div className="bg-red-100 text-red-800 p-2 rounded mt-2 text-sm flex items-start">
                <AlertCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            disabled={!transactionId || statusCheckLoading}
            onClick={checkTransactionStatus}
          >
            {statusCheckLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Status
              </>
            )}
          </Button>
          
          <Button
            onClick={requestEarlyPayment}
            disabled={isLoading || !isApproved}
            variant="default"
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Request Early Payment"
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Transaction Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Early Payment Request Submitted</DialogTitle>
            <DialogDescription>
              Your request has been submitted to M1 Exchange for processing.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Original Amount:</span>
              <span className="font-medium">₹{Number(amount).toLocaleString()}</span>
            </div>
            
            {discountedAmount && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Discounted Amount:</span>
                <span className="font-medium">₹{Number(discountedAmount).toLocaleString()}</span>
              </div>
            )}
            
            {discountRate && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Discount Rate:</span>
                <span className="font-medium">{discountRate}</span>
              </div>
            )}
            
            {estimatedPayment && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Estimated Payment Date:</span>
                <span className="font-medium">{new Date(estimatedPayment).toLocaleDateString()}</span>
              </div>
            )}
            
            {transactionId && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Transaction ID:</span>
                <span className="font-medium">{transactionId}</span>
              </div>
            )}
            
            {transactionStatus && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status:</span>
                {getStatusDisplay()}
              </div>
            )}
          </div>
          
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={checkTransactionStatus}
              disabled={statusCheckLoading}
            >
              {statusCheckLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Status
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}