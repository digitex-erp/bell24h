import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { createMilestonePayment } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, LoaderCircle, LucideProps, PlayCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Define milestone payment schema
const milestonePaymentSchema = z.object({
  rfqId: z.coerce.number({
    required_error: "RFQ is required",
    invalid_type_error: "RFQ must be a number",
  }),
  supplierId: z.coerce.number({
    required_error: "Supplier is required",
    invalid_type_error: "Supplier must be a number",
  }),
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, { message: "Amount must be a positive number" }),
  milestoneNumber: z.coerce.number().min(1, "Milestone number is required"),
  milestoneTotal: z.coerce.number().min(1, "Total milestones is required"),
  milestonePercent: z.coerce.number().min(1).max(100, "Percentage must be between 1 and 100"),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
});

type MilestonePaymentFormValues = z.infer<typeof milestonePaymentSchema>;

const MilestoneIcon = (props: LucideProps & { status: string }) => {
  const { status, ...rest } = props;
  
  switch (status.toLowerCase()) {
    case 'completed':
      return <CheckCircle className="text-green-500" {...rest} />;
    case 'active':
      return <PlayCircle className="text-primary-500" {...rest} />;
    case 'pending':
      return <Clock className="text-yellow-500" {...rest} />;
    default:
      return <LoaderCircle className="text-dark-400" {...rest} />;
  }
};

export default function MilestonePayments() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Fetch existing milestone payments
  const { data: payments, isLoading } = useQuery({ 
    queryKey: ['/api/payments']
  });
  
  // Filter for milestone payments only
  const milestonePayments = payments?.filter(payment => payment.type === 'milestone') || [];
  
  // Fetch RFQs for dropdown
  const { data: rfqs } = useQuery({ 
    queryKey: ['/api/rfqs']
  });
  
  // Fetch suppliers for dropdown
  const { data: suppliers } = useQuery({ 
    queryKey: ['/api/suppliers']
  });
  
  // Create milestone payment form
  const form = useForm<MilestonePaymentFormValues>({
    resolver: zodResolver(milestonePaymentSchema),
    defaultValues: {
      amount: "",
      milestoneNumber: 1,
      milestoneTotal: 3,
      milestonePercent: 33,
    },
  });
  
  // Create milestone payment mutation
  const createMilestonePaymentMutation = useMutation({
    mutationFn: createMilestonePayment,
    onSuccess: () => {
      toast({
        title: "Milestone Payment Created",
        description: "The milestone payment has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      setIsCreateDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error creating milestone payment:", error);
      toast({
        title: "Error",
        description: "Failed to create milestone payment. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });
  
  // Handle form submission
  const onSubmit = (data: MilestonePaymentFormValues) => {
    setIsProcessing(true);
    
    // Omit the acceptTerms field before submitting
    const { acceptTerms, ...paymentData } = data;
    
    createMilestonePaymentMutation.mutate(paymentData);
  };
  
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-dark-800">Milestone Payments</h2>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Milestone Payment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Milestone Payment</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="rfqId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RFQ</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="">Select RFQ</option>
                            {rfqs?.map((rfq) => (
                              <option key={rfq.id} value={rfq.id}>
                                {rfq.rfqNumber} - {rfq.product}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                </div>
                
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (₹)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Enter milestone amount" 
                          type="text" 
                          inputMode="decimal"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="milestoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Milestone Number</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min={1}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="milestoneTotal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Milestones</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min={1}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="milestonePercent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Completion %</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min={1}
                            max={100}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
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
                          I accept that this milestone payment will be held in escrow until the milestone is completed.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={isProcessing}>
                    {isProcessing && (
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Milestone Payment
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
            <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary-500 mb-2" />
            <p className="text-dark-500">Loading milestone payments...</p>
          </CardContent>
        </Card>
      ) : milestonePayments.length > 0 ? (
        <div className="space-y-4">
          {milestonePayments.map((payment) => {
            const rfq = rfqs?.find(r => r.id === payment.rfqId);
            const supplier = suppliers?.find(s => s.id === payment.supplierId);
            
            return (
              <Card key={payment.id}>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-dark-800">
                          {rfq ? rfq.rfqNumber : `RFQ #${payment.rfqId}`}
                        </h3>
                        <Badge variant={
                          payment.status === "completed" ? "success" :
                          payment.status === "pending" ? "outline" : "secondary"
                        }>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-dark-500 mt-1">
                        {rfq?.product} - {supplier?.name || `Supplier #${payment.supplierId}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-dark-800">₹{parseFloat(payment.amount).toLocaleString()}</p>
                      <p className="text-xs text-dark-500 mt-1">
                        {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1 text-xs text-dark-500">
                      <span>Milestone {payment.milestoneNumber} of {payment.milestoneTotal}</span>
                      <span>{payment.milestonePercent}% Complete</span>
                    </div>
                    <Progress value={payment.milestonePercent || 0} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex -space-x-2">
                      {Array.from({ length: payment.milestoneTotal || 3 }).map((_, i) => {
                        let status = "pending";
                        if (i + 1 < payment.milestoneNumber) status = "completed";
                        if (i + 1 === payment.milestoneNumber) status = "active";
                        
                        return (
                          <div key={i} className="relative z-10">
                            <MilestoneIcon 
                              status={status} 
                              className="h-8 w-8 bg-white rounded-full p-1" 
                            />
                          </div>
                        );
                      })}
                    </div>
                    
                    {payment.status === "pending" && (
                      <Button size="sm" variant="outline">Release Funds</Button>
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
            <p className="text-dark-500">No milestone payments found. Create your first milestone payment to get started.</p>
            <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
              Create Milestone Payment
            </Button>
          </CardContent>
        </Card>
      )}
    </>
  );
}
