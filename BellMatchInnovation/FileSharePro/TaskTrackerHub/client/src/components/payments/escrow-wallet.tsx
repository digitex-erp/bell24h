import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, RefreshCw } from "lucide-react";

// Define fund schemas
const fundWalletSchema = z.object({
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, { message: "Amount must be a positive number" }),
  source: z.enum(["bank", "credit", "upi"], {
    required_error: "Please select a payment source",
  }),
});

const withdrawSchema = z.object({
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, { message: "Amount must be a positive number" }),
  bankAccount: z.string().min(1, "Bank account is required"),
});

type FundWalletFormValues = z.infer<typeof fundWalletSchema>;
type WithdrawFormValues = z.infer<typeof withdrawSchema>;

export default function EscrowWallet() {
  const { toast } = useToast();
  const [isFundDialogOpen, setIsFundDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Fetch wallet data
  const { data: walletData, isLoading, refetch } = useQuery({ 
    queryKey: ['/api/wallet']
  });
  
  // Fund wallet form
  const fundForm = useForm<FundWalletFormValues>({
    resolver: zodResolver(fundWalletSchema),
    defaultValues: {
      amount: "",
      source: "bank",
    },
  });
  
  // Withdraw form
  const withdrawForm = useForm<WithdrawFormValues>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: {
      amount: "",
      bankAccount: "",
    },
  });
  
  // Handle fund wallet submission
  const handleFundWallet = async (data: FundWalletFormValues) => {
    setIsProcessing(true);
    
    try {
      // In a real app, this would call the RazorpayX API
      // Simulate an API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Wallet Funded",
        description: `₹${data.amount} has been added to your wallet.`,
      });
      
      // Refetch wallet data
      refetch();
      
      // Close dialog
      setIsFundDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fund wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle withdraw submission
  const handleWithdraw = async (data: WithdrawFormValues) => {
    setIsProcessing(true);
    
    try {
      // In a real app, this would call the RazorpayX API
      // Simulate an API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Withdrawal Initiated",
        description: `₹${data.amount} withdrawal has been initiated. Funds will be transferred within 24 hours.`,
      });
      
      // Refetch wallet data
      refetch();
      
      // Close dialog
      setIsWithdrawDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate withdrawal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <>
      <Card className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">Escrow Wallet</h3>
              <p className="text-sm opacity-80">Secure transaction account for your marketplace deals</p>
              
              <div className="mt-6">
                <div className="text-sm opacity-80">Available Balance</div>
                <div className="text-3xl font-bold mt-1">
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Loading...
                    </div>
                  ) : (
                    `₹${parseFloat(walletData?.balance || "0").toLocaleString()}`
                  )}
                </div>
              </div>
              
              <div className="mt-6 text-xs opacity-70 flex items-center">
                <span>Powered by RazorpayX</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white ml-2 h-5 w-5"
                  onClick={() => refetch()}
                >
                  <RefreshCw className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Dialog open={isFundDialogOpen} onOpenChange={setIsFundDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" size="sm" className="w-full">
                    Add Funds
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Fund Your Escrow Wallet</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...fundForm}>
                    <form onSubmit={fundForm.handleSubmit(handleFundWallet)} className="space-y-4 py-4">
                      <FormField
                        control={fundForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (₹)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Enter amount" 
                                type="text" 
                                inputMode="decimal"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={fundForm.control}
                        name="source"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Source</FormLabel>
                            <div className="flex gap-4">
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <input
                                    type="radio"
                                    checked={field.value === "bank"}
                                    onChange={() => field.onChange("bank")}
                                    className="w-4 h-4"
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  Bank Transfer
                                </FormLabel>
                              </FormItem>
                              
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <input
                                    type="radio"
                                    checked={field.value === "credit"}
                                    onChange={() => field.onChange("credit")}
                                    className="w-4 h-4"
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  Credit Card
                                </FormLabel>
                              </FormItem>
                              
                              <FormItem className="flex items-center space-x-2 space-y-0">
                                <FormControl>
                                  <input
                                    type="radio"
                                    checked={field.value === "upi"}
                                    onChange={() => field.onChange("upi")}
                                    className="w-4 h-4"
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  UPI
                                </FormLabel>
                              </FormItem>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={isProcessing}>
                          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Fund Wallet
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full bg-white/10 text-white border-white/20 hover:bg-white/20">
                    Withdraw
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Withdraw Funds</DialogTitle>
                  </DialogHeader>
                  
                  <Form {...withdrawForm}>
                    <form onSubmit={withdrawForm.handleSubmit(handleWithdraw)} className="space-y-4 py-4">
                      <FormField
                        control={withdrawForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount (₹)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Enter amount" 
                                type="text" 
                                inputMode="decimal"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={withdrawForm.control}
                        name="bankAccount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bank Account</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="Enter bank account number" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4 flex justify-end">
                        <Button type="submit" disabled={isProcessing}>
                          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Withdraw Funds
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Escrow Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-dark-800">Secure Transactions</h3>
              <p className="text-sm text-dark-500 mt-1">
                Funds are held in escrow until both parties agree that transaction conditions have been met.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-dark-800">Milestone Payments</h3>
              <p className="text-sm text-dark-500 mt-1">
                Break payments into milestones to release funds as work progresses.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-dark-800">Dispute Resolution</h3>
              <p className="text-sm text-dark-500 mt-1">
                Our team helps resolve any disputes that may arise during transactions.
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-dark-800">Instant Transfers</h3>
              <p className="text-sm text-dark-500 mt-1">
                Fast fund transfers from your wallet to your bank account.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
