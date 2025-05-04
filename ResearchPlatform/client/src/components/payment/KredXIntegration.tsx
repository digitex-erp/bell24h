import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, CheckCircle2, CircleDollarSign, FileText, HelpCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getKredxRates, discountInvoice } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  amount: z.string().min(1, "Amount is required").regex(/^\d+(\.\d{1,2})?$/, "Must be a valid amount"),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function KredXIntegration() {
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch KredX rates
  const ratesQuery = useQuery({
    queryKey: ['/api/payment/kredx/rates'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for invoice discounting
  const discountMutation = useMutation({
    mutationFn: (data: { invoiceNumber: string; amount: string; dueDate: string }) =>
      discountInvoice(data.invoiceNumber, data.amount, data.dueDate),
    onSuccess: (data) => {
      toast({
        title: "Invoice Submitted",
        description: `Invoice ${data.invoiceNumber} successfully discounted at ${data.discountedAmount}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payment/kredx/user-invoices'] });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit invoice for discounting",
        variant: "destructive",
      });
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceNumber: "",
      amount: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    // Format the date as YYYY-MM-DD
    const formattedDate = format(data.dueDate, "yyyy-MM-dd");
    
    // Submit the form data
    discountMutation.mutate({
      invoiceNumber: data.invoiceNumber,
      amount: data.amount,
      dueDate: formattedDate,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">KredX Invoice Discounting</h2>
          <p className="text-muted-foreground">Convert your unpaid invoices into immediate cash flow</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsExplainerOpen(true)}>
          <HelpCircle className="h-4 w-4 mr-2" />
          How it works
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Submit Invoice for Discounting</CardTitle>
            <CardDescription>
              Get immediate payment on your pending invoices at competitive rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number</Label>
                  <Input
                    id="invoiceNumber"
                    placeholder="INV-0001"
                    {...form.register("invoiceNumber")}
                  />
                  {form.formState.errors.invoiceNumber && (
                    <p className="text-sm text-destructive">{form.formState.errors.invoiceNumber.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Invoice Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
                    <Input
                      id="amount"
                      placeholder="10000.00"
                      className="pl-8"
                      {...form.register("amount")}
                    />
                  </div>
                  {form.formState.errors.amount && (
                    <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.watch("dueDate") ? (
                        format(form.watch("dueDate"), "PPP")
                      ) : (
                        <span>Select due date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={form.watch("dueDate")}
                      onSelect={(date) => form.setValue("dueDate", date as Date)}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {form.formState.errors.dueDate && (
                  <p className="text-sm text-destructive">{form.formState.errors.dueDate.message}</p>
                )}
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={discountMutation.isPending}
                >
                  {discountMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CircleDollarSign className="mr-2 h-4 w-4" />
                      Discount Invoice Now
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Rates</CardTitle>
            <CardDescription>
              Our competitive discounting rates
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ratesQuery.isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : ratesQuery.isError ? (
              <div className="py-4 text-center text-destructive">
                Failed to load current rates
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Term</TableHead>
                    <TableHead>Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ratesQuery.data.rates.map((rate, index) => (
                    <TableRow key={index}>
                      <TableCell>{rate.term}</TableCell>
                      <TableCell>{rate.discountRate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <p className="text-xs text-muted-foreground mt-4">
              Rates last updated: {ratesQuery.data ? new Date(ratesQuery.data.lastUpdated).toLocaleString() : "Loading..."}
            </p>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Note: Actual rates may vary based on buyer's credit profile and invoice verification.
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* KredX process explainer dialog */}
      <Dialog open={isExplainerOpen} onOpenChange={setIsExplainerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>How KredX Invoice Discounting Works</DialogTitle>
            <DialogDescription>
              Turn your unpaid invoices into immediate cash flow
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                1
              </div>
              <div>
                <h4 className="font-medium">Submit Your Invoice</h4>
                <p className="text-sm text-muted-foreground">
                  Upload your pending invoice details to our secure platform.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                2
              </div>
              <div>
                <h4 className="font-medium">Verification Process</h4>
                <p className="text-sm text-muted-foreground">
                  KredX verifies your invoice with the buyer through secure channels.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                3
              </div>
              <div>
                <h4 className="font-medium">Receive Immediate Payment</h4>
                <p className="text-sm text-muted-foreground">
                  Get up to 95% of your invoice value deposited in your account within 24-72 hours.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                4
              </div>
              <div>
                <h4 className="font-medium">Buyer Pays on Due Date</h4>
                <p className="text-sm text-muted-foreground">
                  Your buyer pays the invoice amount to KredX on the original due date.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                5
              </div>
              <div>
                <h4 className="font-medium">Settle the Remainder</h4>
                <p className="text-sm text-muted-foreground">
                  Receive the remaining balance minus the discount fee.
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExplainerOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Recent Transactions
          </CardTitle>
          <CardDescription>Your recently discounted invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Original Amount</TableHead>
                <TableHead>Discounted Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>INV-2024-056</TableCell>
                <TableCell>₹45,000.00</TableCell>
                <TableCell>₹42,750.00</TableCell>
                <TableCell>June 15, 2024</TableCell>
                <TableCell className="flex items-center text-green-600">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Processed
                </TableCell>
              </TableRow>
              {discountMutation.isSuccess && (
                <TableRow>
                  <TableCell>{discountMutation.data.invoiceNumber}</TableCell>
                  <TableCell>₹{discountMutation.data.originalAmount}</TableCell>
                  <TableCell>₹{discountMutation.data.discountedAmount}</TableCell>
                  <TableCell>{new Date(discountMutation.data.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell className="flex items-center text-amber-600">
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Processing
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
