import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Invoice, InsertInvoice, insertInvoiceSchema, User, Supplier } from '@shared/schema';
import { z } from 'zod';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

// Extended schema with validation
const invoiceFormSchema = insertInvoiceSchema.extend({
  amount: z.coerce.number().min(1000, {
    message: 'Amount must be at least ₹1,000',
  }),
  dueDate: z.date().min(new Date(), {
    message: 'Due date must be in the future',
  }),
  issuedDate: z.date(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

const Invoices: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState('seller');
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false);
  const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // Check for tab parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['seller', 'buyer', 'discounted'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);
  
  // Form setup
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: '',
      amount: undefined,
      status: 'pending',
      dueDate: undefined,
      issuedDate: new Date(),
      description: '',
      currency: 'INR',
      items: [],
      taxes: 0,
      notes: '',
    },
  });
  
  // Fetch user info
  const { data: userInfo } = useQuery<User>({
    queryKey: ['/api/auth/user'],
  });

  // Fetch supplier info if user is a supplier
  const { data: supplierInfo } = useQuery<Supplier>({
    queryKey: ['/api/suppliers/me'],
    enabled: !!userInfo && userInfo.userType === 'supplier',
  });
  
  // Fetch invoices where user is seller
  const { 
    data: sellerInvoices = [], 
    isLoading: isLoadingSellerInvoices 
  } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices/seller'],
    enabled: !!userInfo,
  });
  
  // Fetch invoices where user is buyer
  const { 
    data: buyerInvoices = [], 
    isLoading: isLoadingBuyerInvoices 
  } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices/buyer'],
    enabled: !!userInfo,
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (data: InvoiceFormValues) => {
      const response = await apiRequest('POST', '/api/invoices', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices/seller'] });
      
      toast({
        title: 'Invoice created',
        description: 'Your invoice has been created successfully.',
      });
      
      setInvoiceDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Failed to create invoice',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  // Request discount (KredX integration) mutation
  const requestDiscountMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      const response = await apiRequest('POST', `/api/kredx/discount/${invoiceId}`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices/seller'] });
      
      toast({
        title: 'Discount request submitted',
        description: 'Your invoice discount request has been submitted to KredX.',
      });
      
      setDiscountDialogOpen(false);
      setSelectedInvoice(null);
    },
    onError: (error) => {
      toast({
        title: 'Discount request failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
    },
  });
  
  // Verify invoice mutation
  const verifyInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: number) => {
      setVerificationLoading(true);
      const response = await apiRequest('POST', `/api/invoices/verify/${invoiceId}`, {});
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices/seller'] });
      queryClient.invalidateQueries({ queryKey: ['/api/invoices/buyer'] });
      
      setVerificationResult(data);
      setVerificationLoading(false);
      
      // Don't close the dialog here, since we want to show the verification results
    },
    onError: (error) => {
      setVerificationLoading(false);
      
      toast({
        title: 'Verification failed',
        description: error.message || 'Please try again later.',
        variant: 'destructive',
      });
      
      setVerificationDialogOpen(false);
    },
  });

  // Helper function for handling form submission
  const onSubmit = (data: InvoiceFormValues) => {
    // Prepare items as JSON
    const formattedData = {
      ...data,
      sellerId: userInfo!.id,
      items: [
        {
          description: data.description,
          quantity: 1,
          unitPrice: data.amount,
          amount: data.amount,
        }
      ],
    };

    createInvoiceMutation.mutate(formattedData);
  };

  // Helper function to format date
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return format(date, 'PPP');
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'discounted':
        return 'bg-blue-100 text-blue-800';
      case 'discounting':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to check if invoice is eligible for discounting
  const isEligibleForDiscounting = (invoice: Invoice) => {
    return (
      invoice.status === 'pending' && 
      invoice.amount >= 10000 && 
      !invoice.discountRequested &&
      invoice.sellerId === userInfo?.id
    );
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Invoice Management</h1>
          {userInfo && (
            <Button onClick={() => setInvoiceDialogOpen(true)}>
              <i className="fas fa-plus mr-2"></i>
              Create New Invoice
            </Button>
          )}
        </div>

        <div className="mt-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium">Invoice Dashboard</h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="text-gray-500 font-medium mb-1">Total Invoices</div>
                  <div className="text-2xl font-bold">
                    {isLoadingSellerInvoices || isLoadingBuyerInvoices ? (
                      <Skeleton className="h-8 w-16" />
                    ) : (
                      sellerInvoices.length + buyerInvoices.length
                    )}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="text-gray-500 font-medium mb-1">Amount Receivable</div>
                  <div className="text-2xl font-bold text-green-600">
                    {isLoadingSellerInvoices ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      `₹${sellerInvoices
                        .filter(inv => inv.status === 'pending')
                        .reduce((sum, inv) => sum + inv.amount, 0)
                        .toLocaleString()}`
                    )}
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border shadow-sm">
                  <div className="text-gray-500 font-medium mb-1">Amount Payable</div>
                  <div className="text-2xl font-bold text-red-600">
                    {isLoadingBuyerInvoices ? (
                      <Skeleton className="h-8 w-24" />
                    ) : (
                      `₹${buyerInvoices
                        .filter(inv => inv.status === 'pending')
                        .reduce((sum, inv) => sum + inv.amount, 0)
                        .toLocaleString()}`
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="mt-6">
            <TabsList className="mb-4">
              <TabsTrigger value="seller">Invoices You Issued</TabsTrigger>
              <TabsTrigger value="buyer">Invoices You Received</TabsTrigger>
              <TabsTrigger value="discounted">Discounted Invoices</TabsTrigger>
            </TabsList>

            <TabsContent value="seller">
              {isLoadingSellerInvoices ? (
                <InvoicesLoadingState />
              ) : sellerInvoices.length === 0 ? (
                <InvoicesEmptyState
                  title="No Invoices Created"
                  description="You haven't created any invoices yet. Create your first invoice to start getting paid faster."
                  buttonText="Create Invoice"
                  buttonAction={() => setInvoiceDialogOpen(true)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sellerInvoices.map(invoice => (
                    <InvoiceCard
                      key={invoice.id}
                      invoice={invoice}
                      isUserSeller={true}
                      onRequestDiscount={() => {
                        setSelectedInvoice(invoice);
                        setDiscountDialogOpen(true);
                      }}
                      onVerifyInvoice={() => {
                        setSelectedInvoice(invoice);
                        setVerificationDialogOpen(true);
                        verifyInvoiceMutation.mutate(invoice.id);
                      }}
                      isEligibleForDiscounting={isEligibleForDiscounting(invoice)}
                      needsVerification={invoice.status === 'pending' && !invoice.verificationStatus}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="buyer">
              {isLoadingBuyerInvoices ? (
                <InvoicesLoadingState />
              ) : buyerInvoices.length === 0 ? (
                <InvoicesEmptyState
                  title="No Invoices Received"
                  description="You haven't received any invoices yet."
                  showButton={false}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {buyerInvoices.map(invoice => (
                    <InvoiceCard
                      key={invoice.id}
                      invoice={invoice}
                      isUserSeller={false}
                      onVerifyInvoice={() => {
                        setSelectedInvoice(invoice);
                        setVerificationDialogOpen(true);
                        verifyInvoiceMutation.mutate(invoice.id);
                      }}
                      needsVerification={invoice.status === 'pending' && !invoice.verificationStatus}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="discounted">
              {isLoadingSellerInvoices ? (
                <InvoicesLoadingState />
              ) : sellerInvoices.filter(i => i.status === 'discounted' || i.discountRequested).length === 0 ? (
                <InvoicesEmptyState
                  title="No Discounted Invoices"
                  description="You haven't discounted any invoices yet. Apply for invoice discounting to get paid faster."
                  showButton={false}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sellerInvoices
                    .filter(i => i.status === 'discounted' || i.discountRequested)
                    .map(invoice => (
                      <InvoiceCard
                        key={invoice.id}
                        invoice={invoice}
                        isUserSeller={true}
                        showDiscountDetails={true}
                      />
                    ))
                  }
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Invoice Dialog */}
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new invoice for your customer.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input placeholder="INV-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="buyerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer/Buyer</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {/* This would be populated from your customers/buyers list */}
                          <SelectItem value="1">Customer 1</SelectItem>
                          <SelectItem value="2">Customer 2</SelectItem>
                          <SelectItem value="3">Customer 3</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                          <Input 
                            placeholder="0.00" 
                            type="number" 
                            {...field} 
                            className="pl-8"
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Minimum ₹1,000 for KredX eligibility
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="INR">₹ Indian Rupee (INR)</SelectItem>
                          <SelectItem value="USD">$ US Dollar (USD)</SelectItem>
                          <SelectItem value="EUR">€ Euro (EUR)</SelectItem>
                          <SelectItem value="GBP">£ British Pound (GBP)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="issuedDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Issue Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter a description of goods or services provided" 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter any additional notes or payment terms" 
                        {...field} 
                        rows={2}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setInvoiceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit"
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
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Invoice Discounting Dialog */}
      <Dialog open={discountDialogOpen} onOpenChange={setDiscountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Invoice Discounting via KredX</DialogTitle>
            <DialogDescription>
              Get up to 85% of your invoice amount paid immediately instead of waiting for the due date.
            </DialogDescription>
          </DialogHeader>

          {selectedInvoice && (
            <div className="py-4">
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Invoice Number</div>
                <div className="font-medium">{selectedInvoice.invoiceNumber}</div>
                
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Invoice Amount</div>
                    <div className="font-bold text-xl">₹{selectedInvoice.amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Due Date</div>
                    <div className="font-medium">{formatDate(selectedInvoice.dueDate)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Advance Amount (85%)</div>
                    <div className="font-bold text-green-600">
                      ₹{(selectedInvoice.advanceAmount || Math.floor(selectedInvoice.amount * 0.85)).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">KredX Fee ({(selectedInvoice.feePercentage || 0.5) * 100}%)</div>
                    <div className="font-bold text-red-600">
                      ₹{(selectedInvoice.discountFee || Math.ceil(selectedInvoice.amount * 0.005)).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">Remaining Amount (14.5%)</div>
                    <div className="font-bold">
                      ₹{(selectedInvoice.remainingAmount || Math.floor(selectedInvoice.amount * 0.145)).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Will be credited after buyer pays the invoice
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-yellow-50 p-4 rounded-lg text-sm text-yellow-800">
                <p className="flex items-start">
                  <i className="fas fa-info-circle text-yellow-600 mr-2 mt-1"></i>
                  <span>
                    By proceeding, you agree to KredX's terms and conditions. The buyer will still be responsible
                    for paying the full invoice amount on the due date.
                  </span>
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscountDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedInvoice && requestDiscountMutation.mutate(selectedInvoice.id)}
              disabled={requestDiscountMutation.isPending}
            >
              {requestDiscountMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Processing...
                </>
              ) : (
                'Confirm Discount Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Tracking Dialog */}
      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Invoice Tracking</DialogTitle>
            <DialogDescription>
              Track the status of your discounted invoice with KredX
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {trackingLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : (
              selectedInvoice && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-medium">Invoice Information</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="text-gray-500">Invoice Number:</div>
                      <div>{selectedInvoice.invoiceNumber}</div>
                      
                      <div className="text-gray-500">Amount:</div>
                      <div className="font-medium">₹{selectedInvoice.amount.toLocaleString()}</div>
                      
                      <div className="text-gray-500">Status:</div>
                      <div>
                        <Badge className={getStatusColor(selectedInvoice.status)}>
                          {selectedInvoice.status.charAt(0).toUpperCase() + selectedInvoice.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="text-gray-500">KredX Status:</div>
                      <div>
                        <Badge className={cn(
                          "text-xs",
                          selectedInvoice.kredxStatus === 'completed' ? "bg-green-50 text-green-700" :
                          selectedInvoice.kredxStatus === 'pending' ? "bg-yellow-50 text-yellow-700" :
                          selectedInvoice.kredxStatus === 'processing' ? "bg-blue-50 text-blue-700" :
                          "bg-gray-50 text-gray-700"
                        )}>
                          {(selectedInvoice.kredxStatus || 'pending').charAt(0).toUpperCase() + 
                           (selectedInvoice.kredxStatus || 'pending').slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="text-gray-500">Discounted On:</div>
                      <div>{selectedInvoice.discountedAt ? formatDate(selectedInvoice.discountedAt) : 'Processing'}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-base font-medium">Payment Details</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="text-gray-500">Advance Amount:</div>
                      <div className="font-medium text-green-600">
                        ₹{(selectedInvoice.advanceAmount || Math.floor(selectedInvoice.amount * 0.85)).toLocaleString()}
                      </div>
                      
                      <div className="text-gray-500">KredX Fee:</div>
                      <div className="font-medium">
                        ₹{(selectedInvoice.discountFee || Math.ceil(selectedInvoice.amount * 0.005)).toLocaleString()} 
                        ({((selectedInvoice.feePercentage || 0.5) * 100).toFixed(1)}%)
                      </div>
                      
                      <div className="text-gray-500">Remaining Amount:</div>
                      <div className="font-medium">
                        ₹{(selectedInvoice.remainingAmount || Math.floor(selectedInvoice.amount * 0.145)).toLocaleString()}
                      </div>
                      
                      <div className="text-gray-500">Payment Status:</div>
                      <div>
                        <Badge className="bg-green-50 text-green-700">
                          {selectedInvoice.advanceAmount ? 'Advance Paid' : 'Processing'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-base font-medium">Blockchain Record</h3>
                    <div className="text-sm bg-gray-50 p-3 rounded border">
                      {selectedInvoice.blockchainReference ? (
                        <div className="break-all font-mono text-xs">
                          <div className="font-medium mb-1">Transaction Hash:</div>
                          {selectedInvoice.blockchainReference}
                        </div>
                      ) : (
                        <div className="text-gray-500 italic">
                          Blockchain record pending...
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* KredX Transaction History */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-medium">Transaction History</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8"
                        onClick={() => {
                          if (selectedInvoice) {
                            setTrackingLoading(true);
                            fetch(`/api/payments/invoices/${selectedInvoice.id}/transactions`)
                              .then(res => res.json())
                              .then(data => {
                                setTrackingLoading(false);
                                if (data.success && data.data) {
                                  setTrackingData({
                                    ...trackingData,
                                    transactions: data.data
                                  });
                                }
                              })
                              .catch(err => {
                                setTrackingLoading(false);
                                toast({
                                  title: 'Failed to fetch transactions',
                                  description: err.message || 'Please try again later.',
                                  variant: 'destructive',
                                });
                              });
                          }
                        }}
                      >
                        <i className="fas fa-sync-alt mr-1"></i> Refresh
                      </Button>
                    </div>
                    
                    <div className="overflow-hidden border rounded-md">
                      {trackingData?.transactions?.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                                Date
                              </th>
                              <th scope="col" className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {trackingData.transactions.map((txn: any, i: number) => (
                              <tr key={i} className={i % 2 ? 'bg-gray-50' : 'bg-white'}>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  <Badge className={cn(
                                    "text-xs capitalize",
                                    txn.transactionType === 'submission' ? "bg-blue-50 text-blue-700" :
                                    txn.transactionType === 'verification' ? "bg-purple-50 text-purple-700" :
                                    txn.transactionType === 'discounting' ? "bg-green-50 text-green-700" : 
                                    txn.transactionType === 'status_check' ? "bg-gray-50 text-gray-700" :
                                    "bg-gray-50 text-gray-700"
                                  )}>
                                    {txn.transactionType?.replace('_', ' ')}
                                  </Badge>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs">
                                  <Badge className={cn(
                                    "text-xs",
                                    txn.status === 'success' ? "bg-green-50 text-green-700" :
                                    txn.status === 'pending' ? "bg-yellow-50 text-yellow-700" :
                                    txn.status === 'failed' ? "bg-red-50 text-red-700" :
                                    "bg-gray-50 text-gray-700"
                                  )}>
                                    {txn.status}
                                  </Badge>
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600 hidden sm:table-cell">
                                  {new Date(txn.createdAt).toLocaleString()}
                                </td>
                                <td className="px-3 py-2 whitespace-nowrap text-xs text-right">
                                  {txn.amount ? `₹${txn.amount.toLocaleString()}` : '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="p-4 text-sm text-gray-500 text-center italic">
                          No transaction records available yet.
                          <div className="mt-1 text-xs">
                            Click 'Refresh' to fetch the latest transaction data.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                // Fetch latest tracking data
                if (selectedInvoice) {
                  setTrackingLoading(true);
                  
                  // First, fetch discount status
                  fetch(`/api/payments/invoices/${selectedInvoice.id}/discount-status`)
                    .then(res => res.json())
                    .then(statusData => {
                      // Then fetch transaction history
                      fetch(`/api/payments/invoices/${selectedInvoice.id}/transactions`)
                        .then(res => res.json())
                        .then(txnData => {
                          queryClient.invalidateQueries({ queryKey: ['/api/invoices/seller'] });
                          setTrackingLoading(false);
                          
                          // Combine all the data
                          setTrackingData({
                            ...statusData.data,
                            transactions: txnData.data || []
                          });
                        })
                        .catch(err => {
                          setTrackingLoading(false);
                          toast({
                            title: 'Failed to refresh transaction history',
                            description: err.message || 'Please try again later.',
                            variant: 'destructive',
                          });
                        });
                    })
                    .catch(err => {
                      setTrackingLoading(false);
                      toast({
                        title: 'Failed to refresh discount status',
                        description: err.message || 'Please try again later.',
                        variant: 'destructive',
                      });
                    });
                }
              }}
            >
              <i className="fas fa-sync-alt mr-1"></i> Refresh All Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Verification Dialog */}
      <Dialog open={verificationDialogOpen} onOpenChange={setVerificationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Verification</DialogTitle>
            <DialogDescription>
              {verificationLoading ? 
                "Verifying invoice authenticity..." :
                verificationResult ? 
                  "Here are the verification results for your invoice" : 
                  "Something went wrong during verification"
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {verificationLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-sm text-gray-500">
                  Running comprehensive verification checks including GST validation, business rule verification, fraud detection, and blockchain cross-reference...
                </p>
              </div>
            ) : verificationResult ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className={cn(
                    "p-2 rounded-full", 
                    verificationResult.success ? "bg-green-100" : "bg-red-100"
                  )}>
                    {verificationResult.success ? (
                      <i className="fas fa-check text-green-600 text-lg"></i>
                    ) : (
                      <i className="fas fa-times text-red-600 text-lg"></i>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{verificationResult.success ? "Verification Succeeded" : "Verification Failed"}</h3>
                    <p className="text-sm text-gray-500">{verificationResult.message}</p>
                  </div>
                </div>
                
                {/* Verification Details */}
                {verificationResult.verificationDetails && (
                  <div className="bg-gray-50 rounded-md p-4 text-sm">
                    <h4 className="font-medium mb-2">Verification Details</h4>
                    <div className="space-y-3">
                      {/* GST Verification */}
                      {verificationResult.verificationDetails.gst && (
                        <div className="border-l-4 pl-3 py-1 border-blue-500">
                          <div className="font-medium">GST Verification</div>
                          <div className={cn(
                            "flex items-center",
                            verificationResult.verificationDetails.gst.valid ? "text-green-600" : "text-red-600"
                          )}>
                            {verificationResult.verificationDetails.gst.valid ? (
                              <><i className="fas fa-check-circle mr-1"></i> Valid GST information</>
                            ) : (
                              <><i className="fas fa-exclamation-triangle mr-1"></i> {verificationResult.verificationDetails.gst.message}</>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Items/Amount Validation */}
                      {verificationResult.verificationDetails.items && (
                        <div className="border-l-4 pl-3 py-1 border-blue-500">
                          <div className="font-medium">Items & Amount</div>
                          <div className={cn(
                            "flex items-center",
                            verificationResult.verificationDetails.items.valid ? "text-green-600" : "text-red-600"
                          )}>
                            {verificationResult.verificationDetails.items.valid ? (
                              <><i className="fas fa-check-circle mr-1"></i> Items and amount validated</>
                            ) : (
                              <><i className="fas fa-exclamation-triangle mr-1"></i> {verificationResult.verificationDetails.items.message}</>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Fraud Checks */}
                      {verificationResult.verificationDetails.fraud && (
                        <div className="border-l-4 pl-3 py-1 border-blue-500">
                          <div className="font-medium">Anti-Fraud Check</div>
                          <div className={cn(
                            "flex items-center",
                            verificationResult.verificationDetails.fraud.valid ? "text-green-600" : "text-red-600"
                          )}>
                            {verificationResult.verificationDetails.fraud.valid ? (
                              <><i className="fas fa-check-circle mr-1"></i> No fraudulent patterns detected</>
                            ) : (
                              <><i className="fas fa-exclamation-triangle mr-1"></i> {verificationResult.verificationDetails.fraud.message}</>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Business Rules */}
                      {verificationResult.verificationDetails.business && (
                        <div className="border-l-4 pl-3 py-1 border-blue-500">
                          <div className="font-medium">Business Rules</div>
                          <div className={cn(
                            "flex items-center",
                            verificationResult.verificationDetails.business.valid ? "text-green-600" : "text-red-600"
                          )}>
                            {verificationResult.verificationDetails.business.valid ? (
                              <><i className="fas fa-check-circle mr-1"></i> All business rules passed</>
                            ) : (
                              <><i className="fas fa-exclamation-triangle mr-1"></i> {verificationResult.verificationDetails.business.message}</>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Blockchain Record */}
                      {verificationResult.blockchainReference && (
                        <div className="border-l-4 pl-3 py-1 border-orange-500">
                          <div className="font-medium">Blockchain Record</div>
                          <div className="text-gray-700 text-xs break-all">
                            <span className="text-gray-500">Transaction Hash:</span> {verificationResult.blockchainReference}
                          </div>
                          <div className="text-gray-700 flex items-center mt-1">
                            <i className="fas fa-shield-alt text-orange-500 mr-1"></i>
                            <span className="text-xs">Immutably recorded on Polygon blockchain</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {verificationResult.success && (
                  <div className="bg-green-50 p-4 rounded-md">
                    <div className="flex items-center text-green-800">
                      <i className="fas fa-info-circle mr-2"></i>
                      <span className="font-medium">This invoice is now verified</span>
                    </div>
                    <p className="text-sm text-green-700 mt-1">
                      The verification status has been updated on the invoice and is visible to both buyer and seller.
                      {selectedInvoice?.sellerId === userInfo?.id && " Verified invoices are eligible for KredX early payment program."}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="rounded-full bg-red-100 p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-red-600 text-lg"></i>
                </div>
                <h3 className="font-medium">Verification Error</h3>
                <p className="text-sm text-gray-500 mt-1">
                  We encountered an error while verifying this invoice. Please try again later.
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={() => {
              setVerificationDialogOpen(false);
              setVerificationResult(null);
            }}>
              Close
            </Button>
            {verificationResult?.success && selectedInvoice?.sellerId === userInfo?.id && isEligibleForDiscounting(selectedInvoice) && (
              <Button 
                className="ml-2 bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setVerificationDialogOpen(false);
                  setDiscountDialogOpen(true);
                }}
              >
                <i className="fas fa-bolt mr-1"></i> Get Paid Now
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper components
const InvoicesLoadingState = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="animate-pulse">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4">
          <Skeleton className="h-8 w-28" />
        </CardFooter>
      </Card>
    ))}
  </div>
);

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText?: string;
  buttonAction?: () => void;
  showButton?: boolean;
}

const InvoicesEmptyState = ({ 
  title, 
  description, 
  buttonText = "Create", 
  buttonAction,
  showButton = true
}: EmptyStateProps) => (
  <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <i className="fas fa-file-invoice text-2xl text-gray-400"></i>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 max-w-md mx-auto">{description}</p>
    {showButton && buttonAction && (
      <Button onClick={buttonAction} className="mt-4">
        {buttonText}
      </Button>
    )}
  </div>
);

interface InvoiceCardProps {
  invoice: Invoice;
  isUserSeller: boolean;
  onRequestDiscount?: () => void;
  onVerifyInvoice?: () => void;
  isEligibleForDiscounting?: boolean;
  showDiscountDetails?: boolean;
  needsVerification?: boolean;
}

const InvoiceCard = ({ 
  invoice, 
  isUserSeller, 
  onRequestDiscount,
  isEligibleForDiscounting = false,
  showDiscountDetails = false,
  onVerifyInvoice
}: InvoiceCardProps) => {
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy');
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{invoice.invoiceNumber}</h3>
            <p className="text-sm text-gray-500">Issued: {formatDate(invoice.issuedDate)}</p>
          </div>
          <Badge className={cn(
            "font-normal",
            invoice.status === 'paid' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
            invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' :
            invoice.status === 'overdue' ? 'bg-red-100 text-red-800 hover:bg-red-100' :
            invoice.status === 'discounted' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
            invoice.status === 'discounting' ? 'bg-purple-100 text-purple-800 hover:bg-purple-100' :
            'bg-gray-100 text-gray-800 hover:bg-gray-100'
          )}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="mb-4">
          <div className="text-2xl font-bold">
            ₹{invoice.amount.toLocaleString()}
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Due: {formatDate(invoice.dueDate)}</span>
            <span className={cn(
              "font-medium",
              new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' ? 'text-red-600' : 'text-gray-600'
            )}>
              {new Date(invoice.dueDate) < new Date() && invoice.status !== 'paid' 
                ? 'Overdue' 
                : `Due in ${Math.ceil((new Date(invoice.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`}
            </span>
          </div>
        </div>

        {showDiscountDetails && invoice.discountRequested && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm text-blue-800">
            <div className="font-medium mb-1">Discount Information</div>
            <div className="grid grid-cols-2 gap-2">
              <div>Requested:</div>
              <div className="font-medium">{formatDate(invoice.updatedAt)}</div>
              
              <div>Status:</div>
              <div className="font-medium">{invoice.verificationStatus || 'Processing'}</div>
              
              {invoice.status === 'discounted' && (
                <>
                  <div>Amount Received:</div>
                  <div className="font-medium">₹{(invoice.advanceAmount || Math.floor(invoice.amount * 0.85)).toLocaleString()}</div>
                  <div className="text-gray-500 text-xs mt-1">
                    KredX Fee: ₹{(invoice.discountFee || Math.ceil(invoice.amount * 0.005)).toLocaleString()} 
                    ({((invoice.feePercentage || 0.5) * 100).toFixed(1)}%)
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="text-sm text-gray-600 mb-4">
          {(invoice.description || invoice.items?.[0]?.description || 'No description provided').substring(0, 100)}
          {((invoice.description || invoice.items?.[0]?.description || '').length > 100) && '...'}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-500">
            {isUserSeller ? 'Customer:' : 'Seller:'}
          </div>
          <div className="font-medium">
            {isUserSeller ? `ID: ${invoice.buyerId}` : `ID: ${invoice.sellerId}`}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex flex-wrap justify-between gap-2">
        <Button variant="outline" size="sm">
          <i className="fas fa-eye mr-1"></i> View
        </Button>
        
        {/* Verification button - shown to both sellers and buyers when invoice needs verification */}
        {invoice.status === 'pending' && invoice.verificationStatus !== 'verified' && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onVerifyInvoice}
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            <i className="fas fa-check-double mr-1"></i> Verify Invoice
          </Button>
        )}
        
        {/* Show verification status badge if already verified */}
        {invoice.verificationStatus === 'verified' && (
          <Badge className="bg-green-100 text-green-800">
            <i className="fas fa-shield-check mr-1"></i> Verified
          </Badge>
        )}
        
        {/* Show verification status badge if verification failed */}
        {invoice.verificationStatus === 'rejected' && (
          <Badge className="bg-red-100 text-red-800">
            <i className="fas fa-exclamation-triangle mr-1"></i> Verification Failed
          </Badge>
        )}
        
        {/* KredX/Payment options */}
        {isUserSeller && (
          invoice.status === 'pending' ? (
            isEligibleForDiscounting ? (
              <Button 
                size="sm" 
                onClick={onRequestDiscount}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <i className="fas fa-bolt mr-1"></i> Get Paid Now
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="border-yellow-300 text-yellow-800"
              >
                <i className="fas fa-clock mr-1"></i> Awaiting Payment
              </Button>
            )
          ) : invoice.status === 'paid' ? (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              <i className="fas fa-check-circle mr-1"></i> Paid
            </Badge>
          ) : invoice.status === 'discounted' ? (
            <div className="flex flex-col gap-1">
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                <i className="fas fa-check-circle mr-1"></i> Discounted
              </Badge>
              {invoice.kredxStatus && (
                <Badge className={cn(
                  "text-xs",
                  invoice.kredxStatus === 'completed' ? "bg-green-50 text-green-700" :
                  invoice.kredxStatus === 'pending' ? "bg-yellow-50 text-yellow-700" :
                  invoice.kredxStatus === 'processing' ? "bg-blue-50 text-blue-700" :
                  "bg-gray-50 text-gray-700"
                )}>
                  <i className={cn(
                    "mr-1 fas",
                    invoice.kredxStatus === 'completed' ? "fa-check-circle" :
                    invoice.kredxStatus === 'pending' ? "fa-clock" :
                    invoice.kredxStatus === 'processing' ? "fa-spinner" :
                    "fa-info-circle"
                  )}></i>
                  KredX: {invoice.kredxStatus.charAt(0).toUpperCase() + invoice.kredxStatus.slice(1)}
                </Badge>
              )}
              <Button 
                size="xs" 
                variant="ghost" 
                className="text-xs text-blue-600 p-0 h-auto underline"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedInvoice(invoice);
                  setTrackingLoading(true);
                  setTrackingDialogOpen(true);
                  
                  // Fetch discount status and transaction history when opening dialog
                  Promise.all([
                    fetch(`/api/payments/invoices/${invoice.id}/discount-status`).then(res => res.json()),
                    fetch(`/api/payments/invoices/${invoice.id}/transactions`).then(res => res.json())
                  ])
                    .then(([statusData, txnData]) => {
                      setTrackingLoading(false);
                      setTrackingData({
                        ...statusData.data,
                        transactions: txnData.data || []
                      });
                    })
                    .catch(err => {
                      setTrackingLoading(false);
                      toast({
                        title: 'Failed to load tracking data',
                        description: err.message || 'Please try again later.',
                        variant: 'destructive',
                      });
                    });
                }}
              >
                <i className="fas fa-route mr-1"></i> Track Status
              </Button>
            </div>
          ) : (
            <Badge className={invoice.status === 'overdue' ? 'bg-red-100 text-red-800 hover:bg-red-100' : ''}>
              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
            </Badge>
          )
        )}
        
        {!isUserSeller && invoice.status === 'pending' && (
          <Button size="sm" className="bg-green-600 hover:bg-green-700">
            <i className="fas fa-credit-card mr-1"></i> Pay Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default Invoices;