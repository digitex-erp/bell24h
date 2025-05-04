import { formatDistanceToNow } from "date-fns";
import { Transaction } from "@shared/schema";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export default function TransactionList({ transactions, isLoading }: TransactionListProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-gray-500">Loading transactions...</p>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500 mb-2">No transactions yet</p>
          <p className="text-sm text-gray-400">
            Your transaction history will appear here once you add money or make payments.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => {
        const isDeposit = transaction.type === "deposit";
        const amount = parseFloat(transaction.amount.toString());
        
        return (
          <Card key={transaction.id} className="overflow-hidden">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-2 rounded-full ${isDeposit ? 'bg-green-100' : 'bg-blue-100'} mr-4`}>
                  {isDeposit ? (
                    <TrendingUp className={`h-5 w-5 ${isDeposit ? 'text-green-600' : 'text-blue-600'}`} />
                  ) : (
                    <TrendingDown className={`h-5 w-5 ${isDeposit ? 'text-green-600' : 'text-blue-600'}`} />
                  )}
                </div>
                
                <div>
                  <p className="font-medium text-gray-900">
                    {isDeposit ? 'Added to wallet' : 'Withdrawn from wallet'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDistanceToNow(new Date(transaction.createdAt), { addSuffix: true })}
                    {transaction.reference && (
                      <span className="ml-2 opacity-70">Ref: {transaction.reference.substring(0, 10)}</span>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end">
                <p className={`font-medium ${isDeposit ? 'text-green-600' : 'text-blue-600'}`}>
                  {isDeposit ? '+' : '-'}₹{amount.toLocaleString('en-IN')}
                </p>
                <div className="mt-1">
                  {getStatusBadge(transaction.status)}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
