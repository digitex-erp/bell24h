import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import WalletCard from "@/components/wallet/wallet-card";
import TransactionList from "@/components/wallet/transaction-list";
import { useAuth } from "@/hooks/use-auth";
import { Transaction } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function WalletPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"deposit" | "withdrawal">("deposit");

  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/wallet/transactions"],
  });

  const transactionMutation = useMutation({
    mutationFn: async (data: { amount: string; type: string; status: string; reference?: string }) => {
      const res = await apiRequest("POST", "/api/wallet/transactions", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: `${transactionType === "deposit" ? "Deposit" : "Withdrawal"} successful`,
        description: `₹${amount} has been ${transactionType === "deposit" ? "added to" : "withdrawn from"} your wallet.`,
      });
      
      setAmount("");
      setDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: `${transactionType === "deposit" ? "Deposit" : "Withdrawal"} failed`,
        description: error.message || "There was a problem processing your request.",
        variant: "destructive",
      });
    },
  });

  const handleTransaction = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    transactionMutation.mutate({
      amount,
      type: transactionType,
      status: "completed", // In a real app, this would be handled by the payment gateway
      reference: `${transactionType}-${Date.now()}`, // Simple reference generation
    });
  };

  const openDepositDialog = () => {
    setTransactionType("deposit");
    setAmount("");
    setDialogOpen(true);
  };

  const openWithdrawDialog = () => {
    setTransactionType("withdrawal");
    setAmount("");
    setDialogOpen(true);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Wallet</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your transactions and funds
            </p>
          </div>

          <div className="mb-8">
            <WalletCard 
              balance={user?.walletBalance || "0"} 
              onDeposit={openDepositDialog}
              onWithdraw={openWithdrawDialog}
            />
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction History</h2>
            <TransactionList 
              transactions={transactions || []} 
              isLoading={isLoading} 
            />
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {transactionType === "deposit" ? "Add Money to Wallet" : "Withdraw from Wallet"}
                </DialogTitle>
              </DialogHeader>
              
              <div className="py-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (₹)
                </label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="mb-4"
                />
                
                {transactionType === "deposit" && (
                  <div className="text-sm text-gray-500">
                    <p>In a real application, this would redirect to a payment gateway.</p>
                    <p>For demo purposes, the deposit will be added automatically.</p>
                  </div>
                )}
                
                {transactionType === "withdrawal" && parseFloat(user?.walletBalance || "0") < parseFloat(amount || "0") && (
                  <div className="text-sm text-red-500 mt-2">
                    Insufficient funds in your wallet.
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button 
                  onClick={handleTransaction}
                  disabled={
                    transactionMutation.isPending || 
                    !amount || 
                    isNaN(parseFloat(amount)) || 
                    parseFloat(amount) <= 0 ||
                    (transactionType === "withdrawal" && parseFloat(user?.walletBalance || "0") < parseFloat(amount))
                  }
                >
                  {transactionMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : transactionType === "deposit" ? (
                    "Add Money"
                  ) : (
                    "Withdraw Money"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </>
  );
}
