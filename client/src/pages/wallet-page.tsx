import { useState } from 'react';
import { useWallet } from '@/hooks/use-wallet';
import { useAuth } from '@/hooks/use-auth';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlusCircle, 
  MinusCircle, 
  CreditCard, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Transaction form schema
const transactionSchema = z.object({
  amount: z.string().min(1, "Amount is required").refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  description: z.string().min(3, "Description is required"),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

export default function WalletPage() {
  const { user } = useAuth();
  const { 
    walletBalance, 
    transactions, 
    isLoadingTransactions, 
    createTransactionMutation 
  } = useWallet();
  
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal' | null>(null);
  
  // Transaction form with zod validation
  const form = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: '',
      description: '',
    },
  });
  
  // Close dialog and reset form
  const closeDialog = () => {
    setTransactionType(null);
    form.reset();
  };
  
  // Handle transaction submission
  const onSubmit = (data: TransactionFormData) => {
    if (!transactionType || !user) return;
    
    createTransactionMutation.mutate({
      user_id: user.id,
      type: transactionType,
      amount: data.amount,
      description: data.description,
      status: 'completed'
    });
    
    closeDialog();
  };
  
  // Function to format date
  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'MMM dd, yyyy • HH:mm');
  };
  
  // Function to get transaction badge variant
  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Badge variant="success" className="flex items-center"><ArrowDownLeft className="h-3 w-3 mr-1" /> Deposit</Badge>;
      case 'withdrawal':
        return <Badge variant="destructive" className="flex items-center"><ArrowUpRight className="h-3 w-3 mr-1" /> Withdrawal</Badge>;
      case 'payment':
        return <Badge variant="secondary" className="flex items-center"><CreditCard className="h-3 w-3 mr-1" /> Payment</Badge>;
      case 'refund':
        return <Badge variant="warning" className="flex items-center"><ArrowDownLeft className="h-3 w-3 mr-1" /> Refund</Badge>;
      case 'escrow':
        return <Badge className="flex items-center"><DollarSign className="h-3 w-3 mr-1" /> Escrow</Badge>;
      case 'fee':
        return <Badge variant="outline" className="flex items-center"><DollarSign className="h-3 w-3 mr-1" /> Fee</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };
  
  return (
    <MainLayout
      title="Wallet"
      description="Manage your funds for secure transactions on the platform."
    >
      {/* Wallet Balance Card */}
      <Card className="bg-gradient-to-r from-primary-600 to-primary-800 text-white mb-8">
        <CardContent className="p-8">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-lg text-primary-100">Current Balance</p>
              <h2 className="text-4xl font-bold">₹{walletBalance}</h2>
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => setTransactionType('deposit')}
                variant="secondary" 
                className="flex items-center"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Funds
              </Button>
              <Button 
                onClick={() => setTransactionType('withdrawal')}
                variant="outline" 
                className="bg-transparent border-white text-white hover:bg-white hover:text-primary-700 flex items-center"
              >
                <MinusCircle className="mr-2 h-4 w-4" />
                Withdraw
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            View all your deposits, withdrawals, and payments.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Transactions</TabsTrigger>
              <TabsTrigger value="deposit">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
              <TabsTrigger value="payment">Payments</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingTransactions ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">Loading transactions...</TableCell>
                      </TableRow>
                    ) : transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">No transactions found.</TableCell>
                      </TableRow>
                    ) : (
                      transactions.map(transaction => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.reference_number}</TableCell>
                          <TableCell>{getTransactionBadge(transaction.type)}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell className={`font-medium ${
                            transaction.type === 'deposit' || transaction.type === 'refund' 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {transaction.type === 'deposit' || transaction.type === 'refund' 
                              ? '+' : '-'}₹{transaction.amount}
                          </TableCell>
                          <TableCell>{formatDate(transaction.created_at)}</TableCell>
                          <TableCell>
                            <Badge variant={transaction.status === 'completed' ? 'success' : 'secondary'}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="deposit">
              {/* Filtered table for deposits */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingTransactions ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">Loading deposits...</TableCell>
                      </TableRow>
                    ) : transactions.filter(t => t.type === 'deposit').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">No deposits found.</TableCell>
                      </TableRow>
                    ) : (
                      transactions
                        .filter(t => t.type === 'deposit')
                        .map(transaction => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">{transaction.reference_number}</TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell className="font-medium text-green-600">
                              +₹{transaction.amount}
                            </TableCell>
                            <TableCell>{formatDate(transaction.created_at)}</TableCell>
                            <TableCell>
                              <Badge variant={transaction.status === 'completed' ? 'success' : 'secondary'}>
                                {transaction.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            {/* Similar tables for withdrawals and payments */}
            <TabsContent value="withdrawal">
              {/* Filtered table for withdrawals - similar structure */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingTransactions ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">Loading withdrawals...</TableCell>
                      </TableRow>
                    ) : transactions.filter(t => t.type === 'withdrawal').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">No withdrawals found.</TableCell>
                      </TableRow>
                    ) : (
                      transactions
                        .filter(t => t.type === 'withdrawal')
                        .map(transaction => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">{transaction.reference_number}</TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell className="font-medium text-red-600">
                              -₹{transaction.amount}
                            </TableCell>
                            <TableCell>{formatDate(transaction.created_at)}</TableCell>
                            <TableCell>
                              <Badge variant={transaction.status === 'completed' ? 'success' : 'secondary'}>
                                {transaction.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="payment">
              {/* Filtered table for payments - similar structure */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingTransactions ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">Loading payments...</TableCell>
                      </TableRow>
                    ) : transactions.filter(t => t.type === 'payment').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-4">No payments found.</TableCell>
                      </TableRow>
                    ) : (
                      transactions
                        .filter(t => t.type === 'payment')
                        .map(transaction => (
                          <TableRow key={transaction.id}>
                            <TableCell className="font-medium">{transaction.reference_number}</TableCell>
                            <TableCell>{transaction.description}</TableCell>
                            <TableCell className="font-medium text-red-600">
                              -₹{transaction.amount}
                            </TableCell>
                            <TableCell>{formatDate(transaction.created_at)}</TableCell>
                            <TableCell>
                              <Badge variant={transaction.status === 'completed' ? 'success' : 'secondary'}>
                                {transaction.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Transaction Dialog */}
      <Dialog open={!!transactionType} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {transactionType === 'deposit' ? 'Add Funds' : 'Withdraw Funds'}
            </DialogTitle>
            <DialogDescription>
              {transactionType === 'deposit' 
                ? 'Add funds to your wallet to make purchases and payments.' 
                : 'Withdraw funds from your wallet to your bank account.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter amount" 
                        type="number"
                        min="1"
                        step="any"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter a description" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={closeDialog}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createTransactionMutation.isPending}
                >
                  {createTransactionMutation.isPending ? 'Processing...' : 'Confirm'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
