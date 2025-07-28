import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

interface Invoice {
  id: string;
  invoiceNumber: string;
  buyerId: number;
  supplierId: number;
  amount: number;
  issueDate: Date;
  dueDate: Date;
  status: string;
  description?: string;
  attachmentUrl?: string;
  buyerName?: string;
  financedAmount?: number;
  financedDate?: Date;
}

interface FinancingOption {
  discountRate: number;
  processingFee: number;
  advanceAmount: number;
  dueDate: Date;
  totalFees: number;
  netAmount: number;
}

const KredXService: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [financingDialog, setFinancingDialog] = useState(false);
  const [createInvoiceDialog, setCreateInvoiceDialog] = useState(false);
  const [invoiceDetails, setInvoiceDetails] = useState({
    buyerId: '',
    amount: '',
    invoiceNumber: '',
    description: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    issueDate: new Date().toISOString().split('T')[0]
  });
  const [financingOptions, setFinancingOptions] = useState<FinancingOption | null>(null);

  // Fetch invoices
  const { data: invoices, isLoading: isLoadingInvoices } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
    staleTime: 60000,
  });

  // Fetch financing history
  const { data: financingHistory, isLoading: isLoadingHistory } = useQuery<any[]>({
    queryKey: ['/api/financial/kredx/history'],
    staleTime: 60000,
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/invoices', data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: 'Invoice created successfully',
        description: `Invoice #${data.invoiceNumber} has been created.`,
      });
      setCreateInvoiceDialog(false);
      resetInvoiceForm();
    },
    onError: (error) => {
      toast({
        title: 'Failed to create invoice',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  // Evaluate invoice for financing
  const evaluateInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const invoice = invoices?.find(inv => inv.id === invoiceId);
      if (!invoice) throw new Error('Invoice not found');
      
      const response = await apiRequest('POST', '/api/financial/kredx/evaluate-invoice', {
        buyerId: invoice.buyerId,
        amount: invoice.amount,
        dueDate: invoice.dueDate,
        issueDate: invoice.issueDate,
        invoiceNumber: invoice.invoiceNumber,
        description: invoice.description || 'Invoice financing'
      });
      return response.json();
    },
    onSuccess: (data) => {
      setFinancingOptions(data);
    },
    onError: (error) => {
      toast({
        title: 'Failed to evaluate invoice',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  // Finance invoice mutation
  const financeInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await apiRequest('POST', '/api/financial/kredx/finance-invoice', {
        invoiceId
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      queryClient.invalidateQueries({ queryKey: ['/api/financial/kredx/history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/wallet/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      toast({
        title: 'Invoice financed successfully',
        description: `₹${data.advanceAmount.toLocaleString()} has been added to your wallet.`,
      });
      setFinancingDialog(false);
      setFinancingOptions(null);
    },
    onError: (error) => {
      toast({
        title: 'Failed to finance invoice',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  const handleCreateInvoice = () => {
    // Validate form
    if (!invoiceDetails.buyerId || !invoiceDetails.amount || !invoiceDetails.invoiceNumber) {
      toast({
        title: 'Missing required fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    createInvoiceMutation.mutate({
      buyerId: parseInt(invoiceDetails.buyerId),
      amount: parseFloat(invoiceDetails.amount),
      invoiceNumber: invoiceDetails.invoiceNumber,
      description: invoiceDetails.description,
      dueDate: new Date(invoiceDetails.dueDate),
      issueDate: new Date(invoiceDetails.issueDate),
    });
  };

  const handleEvaluateInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    evaluateInvoiceMutation.mutate(invoice.id);
    setFinancingDialog(true);
  };

  const handleFinanceInvoice = () => {
    if (!selectedInvoice) return;
    financeInvoiceMutation.mutate(selectedInvoice.id);
  };

  const resetInvoiceForm = () => {
    setInvoiceDetails({
      buyerId: '',
      amount: '',
      invoiceNumber: '',
      description: '',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      issueDate: new Date().toISOString().split('T')[0]
    });
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const renderInvoiceStatus = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'FINANCED':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Financed</Badge>;
      case 'PAID':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>KredX Invoice Financing</span>
          <Button
            size="sm"
            onClick={() => setCreateInvoiceDialog(true)}
          >
            <i className="fas fa-plus mr-2"></i> New Invoice
          </Button>
        </CardTitle>
        <CardDescription>
          Convert unpaid invoices into immediate cash with competitive rates
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="invoices">
          <TabsList className="mb-4">
            <TabsTrigger value="invoices">Available Invoices</TabsTrigger>
            <TabsTrigger value="history">Financing History</TabsTrigger>
          </TabsList>
          
          {/* Available Invoices Tab */}
          <TabsContent value="invoices">
            {isLoadingInvoices ? (
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
            ) : !invoices || invoices.length === 0 ? (
              <div className="py-10 text-center">
                <i className="fas fa-file-invoice text-gray-300 text-4xl mb-3"></i>
                <p className="text-gray-500">No invoices found</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setCreateInvoiceDialog(true)}
                >
                  Create Your First Invoice
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices
                  .filter(invoice => invoice.status !== 'FINANCED' && invoice.status !== 'PAID')
                  .map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">Invoice #{invoice.invoiceNumber}</div>
                          <div className="text-sm text-gray-500">
                            Buyer ID: {invoice.buyerId}
                            {invoice.buyerName && ` (${invoice.buyerName})`}
                          </div>
                          <div className="text-sm text-gray-500">
                            Due: {formatDate(invoice.dueDate)}
                          </div>
                        </div>
                        <div className="text-lg font-semibold">
                          ₹{invoice.amount.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div>
                          {renderInvoiceStatus(invoice.status)}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleEvaluateInvoice(invoice)}
                          disabled={invoice.status === 'FINANCED' || invoice.status === 'PAID'}
                        >
                          Get Financing
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>
          
          {/* Financing History Tab */}
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
            ) : !financingHistory || financingHistory.length === 0 ? (
              <div className="py-10 text-center">
                <i className="fas fa-money-check-alt text-gray-300 text-4xl mb-3"></i>
                <p className="text-gray-500">No financing history found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {financingHistory.map((item) => (
                  <div key={item.invoiceId} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">Invoice #{item.invoiceNumber}</div>
                        <div className="text-sm text-gray-500">
                          Buyer ID: {item.buyerId}
                        </div>
                        <div className="text-sm text-gray-500">
                          Financed on: {formatDate(item.financedDate)}
                        </div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-green-600">
                          +₹{item.financedAmount.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 text-right">
                          Original: ₹{item.originalAmount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <Badge variant="outline" className="bg-green-100 text-green-800">
                        Financed
                      </Badge>
                      <div className="text-sm text-gray-500">
                        Due: {formatDate(item.dueDate)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-gray-50 p-4 text-sm text-gray-500 flex justify-between">
        <div>Secure financing by KredX</div>
        <div>Discount rates: 0.5-2%</div>
      </CardFooter>

      {/* Create Invoice Dialog */}
      <Dialog open={createInvoiceDialog} onOpenChange={setCreateInvoiceDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Enter the invoice details below to create a new invoice.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buyerId" className="mb-1">Buyer ID *</Label>
                <Input
                  id="buyerId"
                  value={invoiceDetails.buyerId}
                  onChange={(e) => setInvoiceDetails({...invoiceDetails, buyerId: e.target.value})}
                  placeholder="Enter buyer ID"
                  required
                />
              </div>
              <div>
                <Label htmlFor="invoiceNumber" className="mb-1">Invoice Number *</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceDetails.invoiceNumber}
                  onChange={(e) => setInvoiceDetails({...invoiceDetails, invoiceNumber: e.target.value})}
                  placeholder="INV-12345"
                  required
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="amount" className="mb-1">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                value={invoiceDetails.amount}
                onChange={(e) => setInvoiceDetails({...invoiceDetails, amount: e.target.value})}
                placeholder="Enter amount"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issueDate" className="mb-1">Issue Date</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={invoiceDetails.issueDate}
                  onChange={(e) => setInvoiceDetails({...invoiceDetails, issueDate: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="dueDate" className="mb-1">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={invoiceDetails.dueDate}
                  onChange={(e) => setInvoiceDetails({...invoiceDetails, dueDate: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="description" className="mb-1">Description</Label>
              <Input
                id="description"
                value={invoiceDetails.description}
                onChange={(e) => setInvoiceDetails({...invoiceDetails, description: e.target.value})}
                placeholder="Invoice description"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateInvoiceDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateInvoice}
              disabled={createInvoiceMutation.isPending}
            >
              {createInvoiceMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Creating...
                </>
              ) : (
                'Create Invoice'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Financing Dialog */}
      <Dialog open={financingDialog} onOpenChange={setFinancingDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Invoice Financing</DialogTitle>
            <DialogDescription>
              {selectedInvoice && `Review financing options for Invoice #${selectedInvoice.invoiceNumber}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {evaluateInvoiceMutation.isPending ? (
              <div className="text-center py-8">
                <i className="fas fa-spinner fa-spin text-2xl text-primary-600 mb-4"></i>
                <p>Calculating financing options...</p>
              </div>
            ) : financingOptions ? (
              <div className="space-y-4">
                <div className="bg-primary-50 p-4 rounded-md">
                  <div className="text-sm text-gray-500 mb-1">Original Invoice Amount</div>
                  <div className="text-xl font-semibold">₹{selectedInvoice?.amount.toLocaleString()}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Discount Rate</div>
                    <div className="font-medium">{financingOptions.discountRate}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Processing Fee</div>
                    <div className="font-medium">₹{financingOptions.processingFee.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Total Fees</div>
                    <div className="font-medium">₹{financingOptions.totalFees.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Due Date</div>
                    <div className="font-medium">{formatDate(financingOptions.dueDate)}</div>
                  </div>
                </div>
                
                <div className="border-t pt-4 mt-4">
                  <div className="text-sm text-gray-500 mb-1">You Receive</div>
                  <div className="text-2xl font-bold text-green-600">₹{financingOptions.netAmount.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Funds will be added to your wallet immediately</div>
                </div>
                
                <div className="bg-yellow-50 p-3 rounded-md text-sm">
                  <p className="text-gray-700 flex items-start">
                    <i className="fas fa-info-circle text-yellow-600 mr-2 mt-1"></i>
                    <span>
                      By proceeding, you agree to transfer the invoice collection rights to KredX. 
                      The buyer will be notified and will make payment directly to KredX.
                    </span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-red-600">
                Failed to retrieve financing options. Please try again.
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setFinancingDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleFinanceInvoice}
              disabled={!financingOptions || financeInvoiceMutation.isPending}
            >
              {financeInvoiceMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
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

export default KredXService;
