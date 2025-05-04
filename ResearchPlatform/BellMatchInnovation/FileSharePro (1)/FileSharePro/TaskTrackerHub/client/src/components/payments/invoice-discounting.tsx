import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createInvoiceDiscount } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Loader2, Clock, FileText, AlertCircle, InfoIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define invoice discounting schema
const invoiceDiscountSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, { message: "Amount must be a positive number" }),
  dueDate: z.date({
    required_error: "Due date is required",
  }).refine((date) => {
    return date > addDays(new Date(), 14);
  }, {
    message: "Due date must be at least 14 days in the future",
  }),
  supplierId: z.coerce.number({
    required_error: "Supplier is required",
    invalid_type_error: "Supplier must be a number",
  }),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

type InvoiceDiscountFormValues = z.infer<typeof invoiceDiscountSchema>;

export default function InvoiceDiscounting() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [discountRate, setDiscountRate] = useState(3.5);
  
  // Fetch existing invoice discounting payments
  const { data: payments, isLoading } = useQuery({ 
    queryKey: ['/api/payments']
  });
  
  // Filter for invoice discounting payments only
  const invoicePayments = payments?.filter(payment => payment.type === 'invoice') || [];
  
  // Fetch suppliers for dropdown
  const { data: suppliers } = useQuery({ 
    queryKey: ['/api/suppliers']
  });
  
  // Create invoice discounting form
  const form = useForm<InvoiceDiscountFormValues>({
    resolver: zodResolver(invoiceDiscountSchema),
    defaultValues: {
      invoiceNumber: "",
      amount: "",
      dueDate: addDays(new Date(), 30),
    },
  });
  
  // Watch amount and due date to calculate discount rate
  const amount = form.watch("amount");
  const dueDate = form.watch("dueDate");
  
  // Calculate discount rate based on amount and days to maturity
  const calculateDiscountRate = (amount: string, dueDate: Date | undefined) => {
    if (!amount || !dueDate) return 3.5;
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue)) return 3.5;
    
    const daysToMaturity = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    
    // Simple algorithm to determine discount rate
    // Higher amounts and shorter maturity periods get better rates
    let baseRate = 3.5; // 3.5% base rate
    
    // Adjust for amount (larger invoices get better rates)
    if (amountValue > 500000) baseRate -= 0.5;
    else if (amountValue > 100000) baseRate -= 0.3;
    
    // Adjust for maturity (shorter periods get better rates)
    if (daysToMaturity < 15) baseRate -= 0.2;
    else if (daysToMaturity > 45) baseRate += 0.3;
    
    return Math.max(1.5, Math.min(5.0, baseRate)); // Cap between 1.5% and 5%
  };
  
  // Update discount rate when amount or due date changes
  useState(() => {
    if (amount && dueDate) {
      const newRate = calculateDiscountRate(amount, dueDate);
      setDiscountRate(newRate);
    }
  });
  
  // Create invoice discount mutation
  const createInvoiceDiscountMutation = useMutation({
    mutationFn: createInvoiceDiscount,
    onSuccess: () => {
      toast({
        title: "Invoice Submitted for Discounting",
        description: "Your invoice has been submitted for early payment.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error creating invoice discount:", error);
      toast({
        title: "Error",
        description: "Failed to submit invoice for discounting. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });
  
  // Handle form submission
  const onSubmit = (data: InvoiceDiscountFormValues) => {
    setIsProcessing(true);
    
    // Omit the acceptTerms field before submitting
    const { acceptTerms, ...invoiceData } = data;
    
    createInvoiceDiscountMutation.mutate(invoiceData);
  };
  
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-dark-800">Invoice Discounting</h2>
          <p className="text-sm text-dark-500">Get early payment on your invoices through KredX</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Get Early Payment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Submit Invoice for Early Payment</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <Alert variant="outline" className="mb-4">
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>KredX Invoice Discounting</AlertTitle>
                  <AlertDescription>
                    Get immediate payment on your pending invoices. The discount rate is determined by invoice amount and days to maturity.
                  </AlertDescription>
                </Alert>
                
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter invoice number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice Amount (₹)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Enter invoice amount" 
                            type="text" 
                            inputMode="decimal"
                            onChange={(e) => {
                              field.onChange(e);
                              const newRate = calculateDiscountRate(e.target.value, dueDate);
                              setDiscountRate(newRate);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Invoice Due Date</FormLabel>
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
                              onSelect={(date) => {
                                field.onChange(date);
                                if (date && amount) {
                                  const newRate = calculateDiscountRate(amount, date);
                                  setDiscountRate(newRate);
                                }
                              }}
                              disabled={(date) =>
                                date < addDays(new Date(), 7) || date > addDays(new Date(), 90)
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
                  name="supplierId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier</FormLabel>
                      <FormControl>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                          {...field}
                        >
                          <option value="">Select Supplier</option>
                          {suppliers?.map((supplier) => (
                            <option key={supplier.id} value={supplier.id}>
                              {supplier.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {amount && !isNaN(parseFloat(amount)) && (
                  <div className="p-4 border rounded-md bg-dark-50">
                    <h3 className="font-medium text-dark-700 mb-2">Invoice Discounting Offer</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-dark-500">Invoice Amount</p>
                        <p className="font-medium">₹{parseFloat(amount).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-dark-500">Discount Rate</p>
                        <p className="font-medium">{discountRate.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-dark-500">Discount Fee</p>
                        <p className="font-medium">₹{(parseFloat(amount) * discountRate / 100).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-dark-500">You'll Receive</p>
                        <p className="font-medium">₹{(parseFloat(amount) * (1 - discountRate / 100)).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I accept the KredX terms and conditions for invoice discounting.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={isProcessing}>
                    {isProcessing && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Submit for Early Payment
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-500 mb-2" />
            <p className="text-dark-500">Loading invoice data...</p>
          </CardContent>
        </Card>
      ) : invoicePayments.length > 0 ? (
        <div className="space-y-4">
          {invoicePayments.map((payment) => {
            const supplier = suppliers?.find(s => s.id === payment.supplierId);
            const discountFeePercent = payment.discountFee ? 
              (parseFloat(payment.discountFee) / parseFloat(payment.amount) * 100).toFixed(1) + '%' : 
              '3.5%';
            
            return (
              <Card key={payment.id}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-dark-800">
                          Invoice #{payment.invoiceNumber}
                        </h3>
                        <Badge variant={
                          payment.status === "completed" ? "success" :
                          payment.status === "pending" ? "outline" : "secondary"
                        }>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-dark-500 mt-1">
                        {supplier?.name || `Supplier #${payment.supplierId}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-dark-800">₹{parseFloat(payment.amount).toLocaleString()}</p>
                      <p className="text-xs text-dark-500 mt-1">
                        Due: {payment.invoiceDueDate ? new Date(payment.invoiceDueDate).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-dark-50 rounded-md">
                    <div className="grid grid-cols-3 gap-4 text-xs">
                      <div>
                        <p className="text-dark-500">Discount Fee</p>
                        <p className="font-medium">{discountFeePercent}</p>
                      </div>
                      <div>
                        <p className="text-dark-500">Fee Amount</p>
                        <p className="font-medium">₹{parseFloat(payment.discountFee || "0").toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-dark-500">You'll Receive</p>
                        <p className="font-medium">₹{(parseFloat(payment.amount) - parseFloat(payment.discountFee || "0")).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center text-xs text-dark-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Processing time: 1-2 business days</span>
                    </div>
                    
                    {payment.status === "pending" && (
                      <Button size="sm" variant="outline">Check Status</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <FileText className="mx-auto h-16 w-16 text-dark-300 mb-4" />
            <h3 className="text-lg font-medium text-dark-800 mb-2">Get Paid Faster with KredX</h3>
            <p className="text-dark-500 max-w-md mx-auto mb-6">
              Instead of waiting 30-90 days for your customers to pay, get up to 97% of your invoice amount within 24-48 hours.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Submit an Invoice
            </Button>
          </CardContent>
        </Card>
      )}
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Benefits of Invoice Discounting</CardTitle>
          <CardDescription>
            Improve your cash flow with KredX's invoice discounting solution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-dark-800">Immediate Cash Flow</h3>
              <p className="text-sm text-dark-500 mt-1">
                Convert your accounts receivable into immediate cash to meet working capital needs.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-dark-800">No Debt on Balance Sheet</h3>
              <p className="text-sm text-dark-500 mt-1">
                Invoice discounting is not considered debt, keeping your balance sheet clean.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-dark-800">Competitive Rates</h3>
              <p className="text-sm text-dark-500 mt-1">
                Get access to better rates than traditional financing options based on your invoice volume.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-dark-800">Quick Processing</h3>
              <p className="text-sm text-dark-500 mt-1">
                Get funds in your account within 24-48 hours of invoice verification.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
