import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import MainLayout from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { BlockchainSection } from '../components/dashboard/blockchain-section';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { addFunds, withdrawFunds, createEscrowPayment, releaseEscrowPayment } from '@/lib/payments';
import { useToast } from '@/hooks/use-toast';
import { IMPLEMENTATION_STATUS } from '@/lib/constants';
import { queryClient } from '@/lib/queryClient';

interface Transaction {
  id: number;
  type: string;
  amount: string;
  status: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface Invoice {
  id: number;
  supplierId: number;
  supplierName?: string;
  amount: string;
  dueDate: string;
  status: string;
  discountRate?: string;
  discountedAmount?: string;
  createdAt: string;
}

const Wallet = () => {
  const { toast } = useToast();
  const [amountInput, setAmountInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [addFundsOpen, setAddFundsOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [escrowOpen, setEscrowOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);

  // Fetch wallet data
  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ['/api/payments/wallet'],
    refetchOnWindowFocus: false,
  });

  // Fetch transactions
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ['/api/payments/transactions'],
    refetchOnWindowFocus: false,
  });

  // Fetch invoices
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ['/api/payments/invoices'],
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

  // Create escrow payment mutation
  const createEscrowMutation = useMutation({
    mutationFn: ({ amount, description }: { amount: number, description: string }) => 
      createEscrowPayment(amount, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payments/transactions'] });
      setEscrowOpen(false);
      setAmountInput('');
      setDescriptionInput('');
      toast({
        title: 'Escrow Created',
        description: 'The escrow payment has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create escrow payment. Please try again.',
        variant: 'destructive',
      });
      console.error('Escrow error:', error);
    }
  });

  // Release escrow payment mutation
  const releaseEscrowMutation = useMutation({
    mutationFn: (transactionId: number) => releaseEscrowPayment(transactionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payments/transactions'] });
      toast({
        title: 'Escrow Released',
        description: 'The escrow payment has been released successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to release escrow payment. Please try again.',
        variant: 'destructive',
      });
      console.error('Release escrow error:', error);
    }
  });

  // Discount invoice mutation
  const discountInvoiceMutation = useMutation({
    mutationFn: (invoiceId: number) => {
      return fetch(`/api/payments/invoices/discount/${invoiceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).then(res => {
        if (!res.ok) throw new Error('Failed to discount invoice');
        return res.json();
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payments/invoices'] });
      setCurrentInvoice(null);
      toast({
        title: 'Invoice Discounted',
        description: 'Your invoice has been submitted for discounting.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to discount invoice. Please try again.',
        variant: 'destructive',
      });
      console.error('Discount invoice error:', error);
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
    
    const currentBalance = walletData?.balance ? parseFloat(walletData.balance) : 0;
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

  const handleCreateEscrow = () => {
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid Amount',
        description: 'Please enter a valid amount.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!descriptionInput.trim()) {
      toast({
        title: 'Missing Description',
        description: 'Please provide a description for this escrow.',
        variant: 'destructive',
      });
      return;
    }
    
    const currentBalance = walletData?.balance ? parseFloat(walletData.balance) : 0;
    if (amount > currentBalance) {
      toast({
        title: 'Insufficient Funds',
        description: 'The amount exceeds your available balance.',
        variant: 'destructive',
      });
      return;
    }
    
    createEscrowMutation.mutate({ amount, description: descriptionInput });
  };

  const handleReleaseEscrow = (transactionId: number) => {
    releaseEscrowMutation.mutate(transactionId);
  };

  const handleDiscountInvoice = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    discountInvoiceMutation.mutate(invoice.id);
  };

  // Transaction status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      'pending': 'bg-warning-100 text-warning-800',
      'completed': 'bg-success-100 text-success-800',
      'failed': 'bg-danger-100 text-danger-800',
    };
    
    return (
      <Badge className={statusMap[status] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Wallet & Payments</h1>
            <p className="text-gray-500">Manage your funds, escrow payments, and invoices</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={addFundsOpen} onOpenChange={setAddFundsOpen}>
              <DialogTrigger asChild>
                <Button>
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
                <Button variant="outline">
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
        </div>

        {/* Wallet Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="md:col-span-2">
            <CardHeader className="bg-gradient-to-r from-primary-600 to-primary-800 text-white pb-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>RazorpayX Wallet</CardTitle>
                  <CardDescription className="text-primary-100">Secure transactions & escrow</CardDescription>
                </div>
                <div className="flex items-center space-x-1 bg-white/20 px-2 py-1 rounded text-sm">
                  <i className="fas fa-shield-alt"></i>
                  <span>{IMPLEMENTATION_STATUS.PAYMENT_INTEGRATION}% Complete</span>
                </div>
              </div>
              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-bold">
                  {walletLoading ? '...' : formatCurrency(walletData?.balance || '0')}
                </span>
                <span className="ml-1 text-sm opacity-90">available balance</span>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700">Escrow Balance</h3>
                    <Dialog open={escrowOpen} onOpenChange={setEscrowOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <i className="fas fa-lock mr-1"></i> Create
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create Escrow Payment</DialogTitle>
                          <DialogDescription>
                            Escrow payments are held securely until the transaction is complete.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label htmlFor="escrow-amount" className="text-sm font-medium text-gray-700">
                              Amount (₹)
                            </label>
                            <div className="flex items-center">
                              <span className="mr-2 text-lg">₹</span>
                              <Input
                                id="escrow-amount"
                                type="number"
                                placeholder="Amount"
                                value={amountInput}
                                onChange={(e) => setAmountInput(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="escrow-description" className="text-sm font-medium text-gray-700">
                              Description
                            </label>
                            <Input
                              id="escrow-description"
                              placeholder="e.g., Payment for Order #123"
                              value={descriptionInput}
                              onChange={(e) => setDescriptionInput(e.target.value)}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEscrowOpen(false)}>Cancel</Button>
                          <Button 
                            onClick={handleCreateEscrow} 
                            disabled={createEscrowMutation.isPending}
                          >
                            {createEscrowMutation.isPending ? (
                              <>
                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                                Processing...
                              </>
                            ) : (
                              'Create Escrow'
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <p className="text-xl font-bold text-gray-800 mt-2">
                    {walletLoading ? '...' : formatCurrency(walletData?.escrowBalance || '0')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Funds held in escrow for ongoing transactions
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700">Implementation Status</h3>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span>RazorpayX Wallet</span>
                      <span>{IMPLEMENTATION_STATUS.PAYMENT_INTEGRATION}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                      <div 
                        className="bg-warning-500 h-2 rounded-full" 
                        style={{ width: `${IMPLEMENTATION_STATUS.PAYMENT_INTEGRATION}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs mb-1">
                      <span>KredX Integration</span>
                      <span>{IMPLEMENTATION_STATUS.KREDX_INTEGRATION}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-warning-500 h-2 rounded-full" 
                        style={{ width: `${IMPLEMENTATION_STATUS.KREDX_INTEGRATION}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <i className="fas fa-bolt text-warning-500 mr-2"></i>
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common payment operations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" onClick={() => setAddFundsOpen(true)}>
                <i className="fas fa-plus mr-2"></i>
                Add Funds
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => setWithdrawOpen(true)}>
                <i className="fas fa-university mr-2"></i>
                Withdraw
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => setEscrowOpen(true)}>
                <i className="fas fa-lock mr-2"></i>
                Create Escrow
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <i className="fas fa-file-invoice-dollar mr-2"></i>
                Discount Invoice
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Transactions & Invoices Tabs */}
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>
                  View your recent wallet and escrow transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 animate-pulse">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="h-4 bg-gray-200 rounded w-20 mb-2 ml-auto"></div>
                          <div className="h-3 bg-gray-200 rounded w-16 ml-auto"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : transactionsData && transactionsData.length > 0 ? (
                  <div className="space-y-1">
                    {transactionsData.map((transaction: Transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full bg-${
                            transaction.type === 'deposit' ? 'primary' : 
                            transaction.type === 'withdrawal' ? 'warning' : 
                            transaction.type === 'escrow' ? 'success' : 'gray'
                          }-100 flex items-center justify-center`}>
                            <i className={`fas fa-${
                              transaction.type === 'deposit' ? 'arrow-down' : 
                              transaction.type === 'withdrawal' ? 'arrow-up' : 
                              transaction.type === 'escrow' ? 'lock' : 
                              transaction.type === 'release' ? 'unlock' : 'exchange'
                            } text-${
                              transaction.type === 'deposit' ? 'primary' : 
                              transaction.type === 'withdrawal' ? 'warning' : 
                              transaction.type === 'escrow' ? 'success' : 'gray'
                            }-600`}></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800 capitalize">
                              {transaction.type}
                              {transaction.type === 'escrow' && ' (Locked)'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {transaction.description || formatDate(transaction.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${
                            transaction.type === 'deposit' || transaction.type === 'release' 
                              ? 'text-success-600' 
                              : 'text-warning-600'
                          }`}>
                            {transaction.type === 'deposit' || transaction.type === 'release' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </p>
                          <div className="flex items-center space-x-2 justify-end mt-1">
                            {getStatusBadge(transaction.status)}
                            {transaction.type === 'escrow' && transaction.status === 'completed' && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleReleaseEscrow(transaction.id)}
                                className="h-6 px-2"
                              >
                                Release
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-history text-4xl text-gray-300 mb-3"></i>
                    <h3 className="text-lg font-medium text-gray-700">No Transactions Yet</h3>
                    <p className="text-sm text-gray-500 mt-1">Your transaction history will appear here</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-center border-t border-gray-100 pt-4">
                <Button variant="link">View All Transactions</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="invoices" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
                <CardDescription>
                  Manage your invoices and get immediate payments via KredX
                </CardDescription>
              </CardHeader>
              <CardContent>
                {invoicesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                        <div className="flex justify-between mb-3">
                          <div className="h-5 bg-gray-200 rounded w-32"></div>
                          <div className="h-5 bg-gray-200 rounded w-24"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                        <div className="flex justify-between items-center">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-8 bg-gray-200 rounded w-32"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : invoicesData && invoicesData.length > 0 ? (
                  <div className="space-y-4">
                    {invoicesData.map((invoice: Invoice) => (
                      <div key={invoice.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between mb-2">
                          <h3 className="font-medium text-gray-800">
                            Invoice #{invoice.id}
                          </h3>
                          <Badge className={`${
                            invoice.status === 'paid' ? 'bg-success-100 text-success-800' : 
                            invoice.status === 'discounted' ? 'bg-primary-100 text-primary-800' :
                            invoice.status === 'pending' ? 'bg-warning-100 text-warning-800' : 
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {invoice.supplierName || `Supplier ID: ${invoice.supplierId}`}
                        </p>
                        <div className="mt-3 flex flex-wrap justify-between">
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500">Amount</p>
                            <p className="text-base font-medium">{formatCurrency(invoice.amount)}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-500">Due Date</p>
                            <p className="text-sm">{formatDate(invoice.dueDate)}</p>
                          </div>
                          {invoice.discountedAmount && (
                            <div className="space-y-1">
                              <p className="text-xs text-gray-500">Discounted Amount</p>
                              <p className="text-sm text-primary-600 font-medium">
                                {formatCurrency(invoice.discountedAmount)}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          {invoice.status === 'pending' && (
                            <Button 
                              size="sm"
                              onClick={() => handleDiscountInvoice(invoice)}
                              disabled={discountInvoiceMutation.isPending && currentInvoice?.id === invoice.id}
                            >
                              {discountInvoiceMutation.isPending && currentInvoice?.id === invoice.id ? (
                                <>
                                  <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-t-transparent"></div>
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-percentage mr-1"></i>
                                  Discount via KredX
                                </>
                              )}
                            </Button>
                          )}
                          {invoice.status === 'discounted' && (
                            <p className="text-xs text-primary-600">
                              <i className="fas fa-info-circle mr-1"></i>
                              Discounted at {invoice.discountRate || '0.5%'} fee
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <i className="fas fa-file-invoice-dollar text-4xl text-gray-300 mb-3"></i>
                    <h3 className="text-lg font-medium text-gray-700">No Invoices Yet</h3>
                    <p className="text-sm text-gray-500 mt-1">Your invoices will appear here</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t border-gray-100 pt-4">
                <div className="text-sm text-gray-500 flex items-center">
                  <i className="fas fa-info-circle mr-1 text-primary-600"></i>
                  <span>KredX integration: {IMPLEMENTATION_STATUS.KREDX_INTEGRATION}% complete</span>
                </div>
                <Button variant="link">View All Invoices</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="blockchain" className="mt-4">
            <BlockchainSection />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Wallet;
