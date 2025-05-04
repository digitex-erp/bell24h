import React, { useState } from 'react';
import { Link } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from '@/lib/queryClient';
import { User, WalletTransaction } from '@shared/schema';

const Wallet: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [amountToAdd, setAmountToAdd] = useState('');
  const [amountToWithdraw, setAmountToWithdraw] = useState('');
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');
  
  // Fetch wallet balance and transactions
  const { data: userInfo, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });
  
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<WalletTransaction[]>({
    queryKey: ['/api/wallet/transactions'],
  });
  
  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (data: { amount: number; type: string; description?: string }) => {
      const response = await apiRequest('POST', '/api/wallet/transactions', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      toast({
        title: 'Transaction successful',
        description: `Your ${transactionType} has been processed.`,
      });
      
      // Reset form
      setAmountToAdd('');
      setAmountToWithdraw('');
      setTransactionDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: 'Transaction failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    },
  });
  
  const handleTransaction = () => {
    const amount = transactionType === 'deposit' 
      ? parseInt(amountToAdd) 
      : -parseInt(amountToWithdraw);
      
    if (isNaN(amount) || amount === 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }
    
    createTransactionMutation.mutate({
      amount,
      type: transactionType,
      description: `${transactionType} via online banking`,
    });
  };
  
  // Helper function to format date
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  // Filter transactions by type
  const getFilteredTransactions = (type: string) => {
    if (!transactions) return [];
    return type === 'all' 
      ? transactions 
      : transactions.filter(t => t.type === type);
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Wallet & Payments</h1>
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Balance Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="bg-gradient-to-r from-primary-700 to-primary-900 text-white">
                <h2 className="text-xl font-semibold">Wallet Balance</h2>
              </CardHeader>
              <CardContent className="p-6 text-center">
                {isLoadingUser ? (
                  <Skeleton className="h-16 w-32 mx-auto mb-4" />
                ) : (
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-gray-900">
                      ₹{userInfo?.walletBalance?.toLocaleString() || 0}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">Available Balance</div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <Button 
                    onClick={() => {
                      setTransactionType('deposit');
                      setTransactionDialogOpen(true);
                    }}
                    className="w-full"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add Money
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setTransactionType('withdrawal');
                      setTransactionDialogOpen(true);
                    }}
                    className="w-full"
                    disabled={!userInfo?.walletBalance || userInfo.walletBalance <= 0}
                  >
                    <i className="fas fa-arrow-right mr-2"></i>
                    Withdraw
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="bg-gray-50 p-4 text-center text-sm text-gray-500">
                <p>Secure payments powered by RazorpayX</p>
              </CardFooter>
            </Card>
            
            {/* Quick Links */}
            <Card className="mt-6">
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Quick Links</h2>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <Link href="/invoices">
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-md flex items-center text-gray-700">
                      <i className="fas fa-file-invoice mr-3 text-primary-600"></i>
                      <span>View Invoice History</span>
                    </button>
                  </Link>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-md flex items-center text-gray-700">
                    <i className="fas fa-history mr-3 text-primary-600"></i>
                    <span>Payment History</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-md flex items-center text-gray-700">
                    <i className="fas fa-money-check-alt mr-3 text-primary-600"></i>
                    <span>Manage Payment Methods</span>
                  </button>
                  <Link href="/invoices?tab=discounted">
                    <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-md flex items-center text-primary-700 font-medium">
                      <i className="fas fa-hand-holding-usd mr-3 text-primary-600"></i>
                      <span>Invoice Discounting</span>
                    </button>
                  </Link>
                  <button className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded-md flex items-center text-gray-700">
                    <i className="fas fa-shield-alt mr-3 text-primary-600"></i>
                    <span>Escrow Services</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Transaction History */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All Transactions</TabsTrigger>
                    <TabsTrigger value="deposit">Deposits</TabsTrigger>
                    <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
                    <TabsTrigger value="fee">Fees</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all">
                    {renderTransactionList(getFilteredTransactions('all'), isLoadingTransactions)}
                  </TabsContent>
                  
                  <TabsContent value="deposit">
                    {renderTransactionList(getFilteredTransactions('deposit'), isLoadingTransactions)}
                  </TabsContent>
                  
                  <TabsContent value="withdrawal">
                    {renderTransactionList(getFilteredTransactions('withdrawal'), isLoadingTransactions)}
                  </TabsContent>
                  
                  <TabsContent value="fee">
                    {renderTransactionList(getFilteredTransactions('fee'), isLoadingTransactions)}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Transaction Dialog */}
      <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {transactionType === 'deposit' ? 'Add Money to Wallet' : 'Withdraw from Wallet'}
            </DialogTitle>
            <DialogDescription>
              {transactionType === 'deposit' 
                ? 'Enter the amount you want to add to your wallet.'
                : 'Enter the amount you want to withdraw from your wallet.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="mb-4">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹)
              </label>
              <Input
                id="amount"
                type="number"
                min="1"
                placeholder="Enter amount"
                value={transactionType === 'deposit' ? amountToAdd : amountToWithdraw}
                onChange={(e) => {
                  if (transactionType === 'deposit') {
                    setAmountToAdd(e.target.value);
                  } else {
                    setAmountToWithdraw(e.target.value);
                  }
                }}
              />
            </div>
            
            {transactionType === 'deposit' && (
              <div className="bg-primary-50 p-3 rounded-md text-sm">
                <p className="text-gray-700 flex items-center">
                  <i className="fas fa-info-circle text-primary-600 mr-2"></i>
                  Funds will be added instantly to your wallet balance.
                </p>
              </div>
            )}
            
            {transactionType === 'withdrawal' && (
              <div className="bg-yellow-50 p-3 rounded-md text-sm">
                <p className="text-gray-700 flex items-center">
                  <i className="fas fa-info-circle text-yellow-600 mr-2"></i>
                  Withdrawal will be processed within 24 hours to your registered bank account.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransactionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleTransaction}
              disabled={createTransactionMutation.isPending}
            >
              {createTransactionMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Processing...
                </>
              ) : (
                'Confirm'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function renderTransactionList(transactions: WalletTransaction[], isLoading: boolean) {
    if (isLoading) {
      return (
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
      );
    }
    
    if (!transactions || transactions.length === 0) {
      return (
        <div className="py-10 text-center">
          <i className="fas fa-receipt text-gray-300 text-4xl mb-3"></i>
          <p className="text-gray-500">No transactions found</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {transactions.map((transaction) => {
          const isPositive = transaction.type === 'deposit' || transaction.type === 'refund';
          
          return (
            <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(transaction.createdAt)}
                  </div>
                </div>
                <div className={`text-lg font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? '+' : '-'}₹{Math.abs(transaction.amount).toLocaleString()}
                </div>
              </div>
              {transaction.description && (
                <div className="mt-2 text-sm text-gray-600">
                  {transaction.description}
                </div>
              )}
              <div className="mt-2 text-xs">
                <span className={`px-2 py-1 rounded-full ${
                  transaction.status === 'completed' 
                    ? 'bg-green-100 text-green-800' 
                    : transaction.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                }`}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
};

export default Wallet;
