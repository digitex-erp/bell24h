import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Download, 
  Plus, 
  Wallet as WalletIcon, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft,
  AlertCircle,
  Check,
  Clock
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth-context";

export default function Wallet() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  
  // Fetch wallet data
  const { data: walletData, isLoading: isLoadingWallet } = useQuery({
    queryKey: ["/api/wallet"],
  });

  // Fetch transactions
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["/api/wallet/transactions"],
  });

  // Fetch escrow data
  const { data: escrows = [], isLoading: isLoadingEscrows } = useQuery({
    queryKey: ["/api/wallet/escrows"],
  });

  // Fetch invoices for KredX discounting
  const { data: invoices = [], isLoading: isLoadingInvoices } = useQuery({
    queryKey: ["/api/wallet/invoices"],
  });

  // Mutation for deposit
  const depositMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest("POST", "/api/wallet/deposit", { amount });
      return response.json();
    },
    onSuccess: () => {
      setIsDepositDialogOpen(false);
      setDepositAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      toast({
        title: "Deposit Successful",
        description: "Funds have been added to your wallet.",
      });
    },
    onError: (error) => {
      toast({
        title: "Deposit Failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Mutation for withdrawal
  const withdrawMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await apiRequest("POST", "/api/wallet/withdraw", { amount });
      return response.json();
    },
    onSuccess: () => {
      setIsWithdrawDialogOpen(false);
      setWithdrawAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
      toast({
        title: "Withdrawal Request Submitted",
        description: "Your funds will be processed shortly.",
      });
    },
    onError: (error) => {
      toast({
        title: "Withdrawal Failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    },
  });

  // Mutation for KredX discounting
  const discountMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const response = await apiRequest("POST", "/api/wallet/discount", { invoiceId });
      return response.json();
    },
    onSuccess: () => {
      setSelectedInvoice(null);
      queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/invoices"] });
      toast({
        title: "Invoice Submitted for Discounting",
        description: "Your invoice has been submitted to KredX for processing.",
      });
    },
    onError: (error) => {
      toast({
        title: "Discounting Failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    },
  });

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than zero.",
        variant: "destructive",
      });
      return;
    }
    depositMutation.mutate(amount);
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than zero.",
        variant: "destructive",
      });
      return;
    }
    
    if (walletData && amount > parseFloat(walletData.balance)) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough balance for this withdrawal.",
        variant: "destructive",
      });
      return;
    }
    
    withdrawMutation.mutate(amount);
  };

  const handleDiscount = () => {
    if (!selectedInvoice) {
      toast({
        title: "No Invoice Selected",
        description: "Please select an invoice to discount.",
        variant: "destructive",
      });
      return;
    }
    
    discountMutation.mutate(selectedInvoice);
  };

  const balance = walletData ? formatCurrency(walletData.balance) : "...";
  const escrowBalance = walletData ? formatCurrency(walletData.escrowBalance) : "...";

  return (
    <div className="px-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Wallet & Finances</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your wallet, escrow, and invoice discounting.</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
          <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="inline-flex items-center">
                <ArrowDownLeft className="h-5 w-5 mr-2" />
                Deposit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Deposit Funds</DialogTitle>
                <DialogDescription>
                  Add funds to your wallet using RazorpayX.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="amount" className="text-right text-sm font-medium">
                    Amount (₹)
                  </label>
                  <div className="col-span-3">
                    <Input
                      id="amount"
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="col-span-3"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDepositDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleDeposit} 
                  disabled={depositMutation.isPending || !depositAmount}
                >
                  {depositMutation.isPending ? "Processing..." : "Deposit"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="inline-flex items-center">
                <ArrowUpRight className="h-5 w-5 mr-2" />
                Withdraw
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
                <DialogDescription>
                  Withdraw funds from your wallet to your bank account.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="withdraw-amount" className="text-right text-sm font-medium">
                    Amount (₹)
                  </label>
                  <div className="col-span-3">
                    <Input
                      id="withdraw-amount"
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="col-span-4 text-xs text-gray-500">
                  <p>Available balance: {balance}</p>
                  <p className="mt-1">A withdrawal fee of ₹50 will be deducted from your withdrawal amount.</p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsWithdrawDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleWithdraw} 
                  disabled={withdrawMutation.isPending || !withdrawAmount}
                >
                  {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <WalletIcon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{balance}</div>
            <p className="text-xs text-gray-500 mt-1">
              Last transaction: {walletData?.lastTransactionDate ? formatDate(walletData.lastTransactionDate) : 'N/A'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Escrow Balance</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{escrowBalance}</div>
            <p className="text-xs text-gray-500 mt-1">
              Active escrows: {walletData?.activeEscrows || 0}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Invoice Discounting</CardTitle>
            <Download className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{walletData?.discountedInvoices || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              Total value: {walletData?.discountedAmount ? formatCurrency(walletData.discountedAmount) : 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList className="mb-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="escrow">Escrow</TabsTrigger>
          <TabsTrigger value="invoice-discounting">Invoice Discounting</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View all your wallet transactions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingTransactions ? (
                <div className="flex justify-center items-center py-8">
                  <p className="text-sm text-gray-500">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <WalletIcon className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Transactions</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-md">
                    You don't have any transactions yet. Deposit funds to get started.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Badge variant={
                              transaction.type === "deposit" ? "default" : 
                              transaction.type === "withdrawal" ? "outline" : 
                              transaction.type === "escrow" ? "secondary" : 
                              "default"
                            }>
                              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className={
                            transaction.type === "deposit" || transaction.type === "refund" 
                              ? "text-green-600" 
                              : "text-red-600"
                          }>
                            {transaction.type === "deposit" || transaction.type === "refund" 
                              ? "+" 
                              : "-"}{formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              transaction.status === "completed" ? "success" : 
                              transaction.status === "pending" ? "outline" : 
                              transaction.status === "failed" ? "destructive" : 
                              "default"
                            }>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="escrow">
          <Card>
            <CardHeader>
              <CardTitle>Escrow Management</CardTitle>
              <CardDescription>
                Securely manage milestone-based payments through RazorpayX escrow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEscrows ? (
                <div className="flex justify-center items-center py-8">
                  <p className="text-sm text-gray-500">Loading escrows...</p>
                </div>
              ) : escrows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <TrendingUp className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Active Escrows</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-md">
                    You don't have any active escrow agreements. Escrows are created when you accept a bid or award an RFQ.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Escrow ID</TableHead>
                        <TableHead>Related To</TableHead>
                        <TableHead>Counterparty</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Current Milestone</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {escrows.map((escrow: any) => (
                        <TableRow key={escrow.id}>
                          <TableCell>{escrow.id}</TableCell>
                          <TableCell>
                            {escrow.rfq ? `RFQ #${escrow.rfq.id}` : `Bid #${escrow.bid.id}`}
                          </TableCell>
                          <TableCell>
                            {user?.id === escrow.buyerId ? escrow.supplier.fullName : escrow.buyer.fullName}
                          </TableCell>
                          <TableCell>{formatCurrency(escrow.amount)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              escrow.status === "funded" ? "success" : 
                              escrow.status === "pending" ? "outline" : 
                              escrow.status === "disputed" ? "destructive" : 
                              escrow.status === "released" ? "default" : 
                              "secondary"
                            }>
                              {escrow.status.charAt(0).toUpperCase() + escrow.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {escrow.currentMilestone}/{escrow.milestones?.length || 1}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invoice-discounting">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>KredX Invoice Discounting</CardTitle>
                <CardDescription>
                  Get immediate cash flow by discounting your invoices through KredX (0.5% fee).
                </CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-5 w-5 mr-2" />
                    Submit Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Submit Invoice for Discounting</DialogTitle>
                    <DialogDescription>
                      Select an invoice to discount through KredX. A 0.5% fee will be applied.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="invoice" className="text-right text-sm font-medium">
                        Invoice
                      </label>
                      <div className="col-span-3">
                        <Select onValueChange={setSelectedInvoice}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select invoice" />
                          </SelectTrigger>
                          <SelectContent>
                            {invoices
                              .filter((invoice: any) => !invoice.kredxDiscounted && invoice.gstVerified)
                              .map((invoice: any) => (
                                <SelectItem key={invoice.id} value={invoice.id.toString()}>
                                  {invoice.invoiceNumber} - {formatCurrency(invoice.amount)}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="col-span-4 flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <p className="text-xs text-gray-500">
                        Only GST verified invoices can be discounted. KredX charges a 0.5% fee.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={handleDiscount} 
                      disabled={discountMutation.isPending || !selectedInvoice}
                    >
                      {discountMutation.isPending ? "Processing..." : "Submit for Discounting"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoadingInvoices ? (
                <div className="flex justify-center items-center py-8">
                  <p className="text-sm text-gray-500">Loading invoices...</p>
                </div>
              ) : invoices.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Download className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No Invoices</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-md">
                    You don't have any invoices yet. Create an invoice from a completed order to get started.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Buyer/Seller</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>GST Verified</TableHead>
                        <TableHead>Discounted</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice: any) => (
                        <TableRow key={invoice.id}>
                          <TableCell>{invoice.invoiceNumber}</TableCell>
                          <TableCell>
                            {user?.id === invoice.sellerId ? invoice.buyer.fullName : invoice.seller.fullName}
                          </TableCell>
                          <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                          <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                          <TableCell>
                            {invoice.gstVerified ? (
                              <div className="flex items-center">
                                <Check className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-green-600">Verified</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 text-amber-500 mr-1" />
                                <span className="text-amber-600">Pending</span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {invoice.kredxDiscounted ? (
                              <div className="flex items-center">
                                <Check className="h-4 w-4 text-green-500 mr-1" />
                                <span className="text-green-600">Yes</span>
                              </div>
                            ) : (
                              <span className="text-gray-500">No</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              invoice.status === "paid" ? "success" : 
                              invoice.status === "overdue" ? "destructive" : 
                              invoice.status === "discounted" ? "secondary" : 
                              "outline"
                            }>
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
