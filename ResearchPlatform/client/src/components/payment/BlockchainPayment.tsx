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
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  CreditCard, 
  LoaderCircle, 
  Lock, 
  RefreshCw, 
  ShieldCheck 
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { initiateBlockchainPayment, checkBlockchainTransactionStatus, getUserBlockchainTransactions } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

// Define form schema for blockchain payment
const paymentFormSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .regex(/^\d+(\.\d{1,5})?$/, "Must be a valid amount"),
  type: z.string().min(1, "Payment type is required"),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export default function BlockchainPayment() {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [paymentFormData, setPaymentFormData] = useState<PaymentFormValues | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form setup
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: "",
      type: "payment",
    },
  });

  // User ID - in a real app, this would come from auth context
  const userId = 1;

  // Query for user transactions
  const transactionsQuery = useQuery({
    queryKey: ['/api/payment/blockchain/transactions', userId],
    queryFn: () => getUserBlockchainTransactions(userId),
    staleTime: 30000, // 30 seconds
  });

  // Query for transaction status
  const transactionStatusQuery = useQuery({
    queryKey: ['/api/payment/blockchain/status', selectedTransaction],
    queryFn: () => selectedTransaction ? checkBlockchainTransactionStatus(selectedTransaction) : null,
    enabled: !!selectedTransaction,
    refetchInterval: selectedTransaction ? 5000 : false, // Poll every 5 seconds for active transaction
  });

  // Mutation for initiating blockchain payment
  const initiatePaymentMutation = useMutation({
    mutationFn: (data: { amount: string; type: string }) =>
      initiateBlockchainPayment(data.amount, data.type, userId),
    onSuccess: (data) => {
      toast({
        title: "Payment Initiated",
        description: `Transaction hash: ${data.transactionHash.substring(0, 8)}...`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/payment/blockchain/transactions', userId] });
      setSelectedTransaction(data.transactionHash);
      form.reset();
      setIsConfirmDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initiate blockchain payment",
        variant: "destructive",
      });
      setIsConfirmDialogOpen(false);
    },
  });

  const onSubmit = (data: PaymentFormValues) => {
    setPaymentFormData(data);
    setIsConfirmDialogOpen(true);
  };

  const confirmPayment = () => {
    if (paymentFormData) {
      initiatePaymentMutation.mutate({
        amount: paymentFormData.amount,
        type: paymentFormData.type,
      });
    }
  };

  const handleCheckStatus = (transactionHash: string) => {
    setSelectedTransaction(transactionHash);
  };

  // Format transaction date in readable format
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Confirmed
          </div>
        );
      case "pending":
        return (
          <div className="flex items-center text-amber-600">
            <Clock className="h-4 w-4 mr-1" />
            Pending
          </div>
        );
      case "failed":
        return (
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            Failed
          </div>
        );
      default:
        return (
          <div className="flex items-center text-neutral-600">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Unknown
          </div>
        );
    }
  };

  const getConnectionStatus = () => {
    // Check if Ethereum provider is having issues based on integration status
    // In a real app, this would check window.ethereum or a similar provider
    const hasConnection = true;
    
    if (!hasConnection) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>
            Unable to connect to Ethereum provider. Some functionality may be limited.
          </AlertDescription>
        </Alert>
      );
    }
    
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Blockchain Payments</h2>
          <p className="text-muted-foreground">Secure transactions with blockchain verification</p>
        </div>
        <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
          <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></div>
          Blockchain Network Connected
        </div>
      </div>

      {getConnectionStatus()}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Initiate Blockchain Payment
            </CardTitle>
            <CardDescription>
              Make secure, transparent payments using blockchain technology
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (ETH)</Label>
                <Input
                  id="amount"
                  placeholder="0.05"
                  {...form.register("amount")}
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Payment Type</Label>
                <Select
                  defaultValue="payment"
                  onValueChange={(value) => form.setValue("type", value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment">Direct Payment</SelectItem>
                    <SelectItem value="escrow">Escrow Payment</SelectItem>
                    <SelectItem value="milestone">Milestone Payment</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.type && (
                  <p className="text-sm text-destructive">{form.formState.errors.type.message}</p>
                )}
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={initiatePaymentMutation.isPending}
                >
                  {initiatePaymentMutation.isPending ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Initiate Secure Payment
                    </>
                  )}
                </Button>
              </div>
            </form>

            <Accordion type="single" collapsible className="mt-6">
              <AccordionItem value="security">
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-2 text-primary" />
                    Blockchain Security Features
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-2 text-green-600" />
                      Immutable transaction records
                    </p>
                    <p className="flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-2 text-green-600" />
                      Smart contract escrow protection
                    </p>
                    <p className="flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-2 text-green-600" />
                      Milestone-based payment release
                    </p>
                    <p className="flex items-center">
                      <CheckCircle2 className="h-3 w-3 mr-2 text-green-600" />
                      Multi-signature verification
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>
              Check your transaction status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedTransaction ? (
              <div className="space-y-4">
                {transactionStatusQuery.isLoading ? (
                  <div className="flex justify-center py-4">
                    <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : transactionStatusQuery.isError ? (
                  <div className="py-4 text-center text-destructive">
                    Failed to load transaction status
                  </div>
                ) : transactionStatusQuery.data ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span className="font-medium">{getStatusBadge(transactionStatusQuery.data.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Confirmations:</span>
                      <span className="font-medium">{transactionStatusQuery.data.confirmations}</span>
                    </div>
                    {transactionStatusQuery.data.blockNumber && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Block Number:</span>
                        <span className="font-medium">{transactionStatusQuery.data.blockNumber}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Transaction:</span>
                      <span className="font-medium text-xs truncate max-w-[150px]">
                        {transactionStatusQuery.data.transactionHash}
                      </span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => transactionStatusQuery.refetch()}
                    >
                      <RefreshCw className="h-3 w-3 mr-2" />
                      Refresh Status
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>Select a transaction to view its status</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your blockchain transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          {transactionsQuery.isLoading ? (
            <div className="flex justify-center py-4">
              <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : transactionsQuery.isError ? (
            <div className="py-4 text-center text-destructive">
              Failed to load transaction history
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction Hash</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactionsQuery.data.transactions.map((transaction) => (
                    <TableRow key={transaction.transactionHash}>
                      <TableCell className="font-mono text-xs">
                        {transaction.transactionHash.substring(0, 8)}...
                        {transaction.transactionHash.substring(transaction.transactionHash.length - 6)}
                      </TableCell>
                      <TableCell>{transaction.amount}</TableCell>
                      <TableCell className="capitalize">{transaction.type}</TableCell>
                      <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCheckStatus(transaction.transactionHash)}
                        >
                          Check Status
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {initiatePaymentMutation.isSuccess && (
                    <TableRow>
                      <TableCell className="font-mono text-xs">
                        {initiatePaymentMutation.data.transactionHash.substring(0, 8)}...
                        {initiatePaymentMutation.data.transactionHash.substring(initiatePaymentMutation.data.transactionHash.length - 6)}
                      </TableCell>
                      <TableCell>{initiatePaymentMutation.data.amount}</TableCell>
                      <TableCell className="capitalize">{paymentFormData?.type || "payment"}</TableCell>
                      <TableCell>{formatDate(initiatePaymentMutation.data.timestamp)}</TableCell>
                      <TableCell>{getStatusBadge("pending")}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCheckStatus(initiatePaymentMutation.data.transactionHash)}
                        >
                          Check Status
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Note: Transaction confirmations may take 1-5 minutes depending on network congestion.
          </p>
        </CardFooter>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Blockchain Payment</DialogTitle>
            <DialogDescription>
              Please review your payment details before proceeding
            </DialogDescription>
          </DialogHeader>
          
          {paymentFormData && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="font-medium">{paymentFormData.amount} ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Type:</span>
                <span className="font-medium capitalize">{paymentFormData.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Network Fee:</span>
                <span className="font-medium">~0.0015 ETH</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total:</span>
                <span className="font-medium">{(parseFloat(paymentFormData.amount) + 0.0015).toFixed(4)} ETH</span>
              </div>
              
              <Alert className="mt-2">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  Blockchain transactions are irreversible. Please ensure all details are correct.
                </AlertDescription>
              </Alert>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDialogOpen(false)} disabled={initiatePaymentMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={confirmPayment} disabled={initiatePaymentMutation.isPending}>
              {initiatePaymentMutation.isPending ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Payment"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
