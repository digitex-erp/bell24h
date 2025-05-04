import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, AlertCircle, Info } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Transaction {
  id: number;
  transactionId: string;
  originalAmount: string;
  discountedAmount: string;
  discountRate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  paymentDate: string | null;
  milestone?: {
    id: number;
    title: string;
  };
}

interface M1ExchangeTransactionsProps {
  supplierId: number;
}

export default function M1ExchangeTransactions({ supplierId }: M1ExchangeTransactionsProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch transactions for the supplier
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [`/api/m1exchange/transactions/supplier/${supplierId}`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/m1exchange/transactions/supplier/${supplierId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      const data = await response.json();
      return data.transactions || [];
    }
  });

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge based on status
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: string, label: string }> = {
      'pending': { variant: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      'processing': { variant: 'bg-blue-100 text-blue-800', label: 'Processing' },
      'completed': { variant: 'bg-green-100 text-green-800', label: 'Completed' },
      'failed': { variant: 'bg-red-100 text-red-800', label: 'Failed' }
    };

    const statusInfo = statusMap[status.toLowerCase()] || { variant: 'bg-gray-100 text-gray-800', label: status };

    return (
      <Badge variant="outline" className={`${statusInfo.variant}`}>
        {statusInfo.label}
      </Badge>
    );
  };

  // View transaction details
  const viewTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  // Handle error states and loading
  if (isError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load M1 Exchange transactions: {(error as Error).message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">M1 Exchange Transactions</CardTitle>
          <CardDescription>
            Your early payment transactions through M1 Exchange
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={() => refetch()} className="p-0 h-8 w-8">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : data && data.length > 0 ? (
          <Table>
            <TableCaption>List of your recent M1 Exchange transactions</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Original Amount</TableHead>
                <TableHead>Discounted Amount</TableHead>
                <TableHead>Discount Rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created On</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((transaction: Transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell className="font-mono text-xs">
                    {transaction.transactionId.substring(0, 12)}...
                  </TableCell>
                  <TableCell>₹{Number(transaction.originalAmount).toLocaleString()}</TableCell>
                  <TableCell>₹{Number(transaction.discountedAmount).toLocaleString()}</TableCell>
                  <TableCell>{transaction.discountRate}</TableCell>
                  <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                  <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => viewTransactionDetails(transaction)}
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No transactions found</p>
            <p className="text-sm mt-1">Early payment requests will appear here</p>
          </div>
        )}

        {/* Transaction Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Transaction Details</DialogTitle>
              <DialogDescription>
                Transaction ID: {selectedTransaction?.transactionId}
              </DialogDescription>
            </DialogHeader>
            
            {selectedTransaction && (
              <div className="py-4 space-y-3">
                {selectedTransaction.milestone && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Milestone:</span>
                    <span className="font-medium">{selectedTransaction.milestone.title}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Original Amount:</span>
                  <span className="font-medium">₹{Number(selectedTransaction.originalAmount).toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Discounted Amount:</span>
                  <span className="font-medium">₹{Number(selectedTransaction.discountedAmount).toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Discount Rate:</span>
                  <span className="font-medium">{selectedTransaction.discountRate}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Status:</span>
                  {getStatusBadge(selectedTransaction.status)}
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Created On:</span>
                  <span className="font-medium">{formatDate(selectedTransaction.createdAt)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Last Updated:</span>
                  <span className="font-medium">{formatDate(selectedTransaction.updatedAt)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Payment Date:</span>
                  <span className="font-medium">{formatDate(selectedTransaction.paymentDate)}</span>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}