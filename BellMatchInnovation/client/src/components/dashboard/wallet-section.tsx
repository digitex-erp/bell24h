import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatDate } from '@/lib/utils';
import { 
  addFunds, 
  withdrawFunds,
  WalletResponse, 
  TransactionResponse 
} from '@/lib/payments';
import { IMPLEMENTATION_STATUS } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';

const WalletSection = () => {
  const { toast } = useToast();
  const [amountInput, setAmountInput] = React.useState('');
  const [addFundsOpen, setAddFundsOpen] = React.useState(false);
  const [withdrawOpen, setWithdrawOpen] = React.useState(false);

  // Fetch user wallet
  const { data: walletData, isLoading: walletLoading } = useQuery<WalletResponse>({
    queryKey: ['/api/payments/wallet'],
    refetchOnWindowFocus: false,
  });

  // Fetch recent transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery<TransactionResponse[]>({
    queryKey: ['/api/payments/transactions', { limit: 2 }],
    refetchOnWindowFocus: false,
  });

  // Add funds mutation
  const addFundsMutation = useMutation({
    mutationFn: (amount: number) => addFunds(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payments/transactions'] });
      setAddFundsOpen(false);
      setAmountInput('');
      toast({
        title: 'Funds Added',
        description: 'The amount has been added to your wallet.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to add funds. Please try again.',
        variant: 'destructive',
      });
      console.error('Add funds error:', error);
    }
  });

  // Withdraw funds mutation
  const withdrawMutation = useMutation({
    mutationFn: (amount: number) => withdrawFunds(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payments/transactions'] });
      setWithdrawOpen(false);
      setAmountInput('');
      toast({
        title: 'Withdrawal Initiated',
        description: 'Your withdrawal request has been submitted.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to process withdrawal. Please try again.',
        variant: 'destructive',
      });
      console.error('Withdrawal error:', error);
    }
  });

  const handleAddFunds = () => {
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }
    addFundsMutation.mutate(amount);
  };

  const handleWithdraw = () => {
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }
    
    const currentBalance = walletData ? parseFloat(walletData.balance) : 0;
    if (amount > currentBalance) {
      toast({
        title: 'Insufficient Funds',
        description: 'The amount exceeds your available balance.',
        variant: 'destructive',
      });
      return;
    }
    
    withdrawMutation.mutate(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-6 py-4 text-white">
        <h2 className="text-lg font-semibold">RazorpayX Wallet</h2>
        <p className="text-sm text-primary-100">Secure transactions & escrow</p>
        <div className="mt-2 flex items-baseline">
          <span className="text-2xl font-bold">
            {walletLoading ? '...' : formatCurrency(walletData?.balance || '0')}
          </span>
          <span className="ml-1 text-sm">available</span>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Implementation</span>
          <span className="text-gray-800 font-medium">{IMPLEMENTATION_STATUS.PAYMENT_INTEGRATION}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-warning-500 h-2 rounded-full" 
            style={{ width: `${IMPLEMENTATION_STATUS.PAYMENT_INTEGRATION}%` }}
          ></div>
        </div>
        
        <div className="flex space-x-2">
          <Dialog open={addFundsOpen} onOpenChange={setAddFundsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <i className="fas fa-plus mr-2"></i>
                Add Funds
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Funds to Wallet</DialogTitle>
                <DialogDescription>
                  Enter the amount you want to add to your RazorpayX wallet.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-center">
                  <span className="mr-2 text-lg">₹</span>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddFundsOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleAddFunds} 
                  disabled={addFundsMutation.isPending}
                >
                  {addFundsMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    'Add Funds'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <i className="fas fa-university mr-2"></i>
                Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
                <DialogDescription>
                  Enter the amount you want to withdraw to your bank account.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="flex items-center">
                  <span className="mr-2 text-lg">₹</span>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setWithdrawOpen(false)}>Cancel</Button>
                <Button 
                  onClick={handleWithdraw} 
                  disabled={withdrawMutation.isPending}
                >
                  {withdrawMutation.isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    'Withdraw'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        <div className="border-t border-gray-200 pt-3">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Transactions</h3>
          
          {transactionsLoading ? (
            <div className="space-y-2">
              <div className="flex justify-between items-center animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="flex justify-between items-center animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {transactionsData && transactionsData.length > 0 ? (
                transactionsData.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500`}>
                        <i className={`fas fa-${transaction.type === 'deposit' ? 'arrow-down' : transaction.type === 'withdrawal' ? 'arrow-up' : transaction.type === 'escrow' ? 'lock' : 'exchange'}`}></i>
                      </span>
                      <div>
                        <p className="text-sm text-gray-800 capitalize">{transaction.type}</p>
                        <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`text-sm ${transaction.type === 'deposit' ? 'text-success-600' : 'text-warning-600'} font-medium`}>
                      {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500">No recent transactions</p>
                </div>
              )}
            </div>
          )}
          
          <Button variant="link" className="mt-3 px-0 text-sm text-primary-600 hover:text-primary-800 font-medium">
            View All Transactions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WalletSection;
