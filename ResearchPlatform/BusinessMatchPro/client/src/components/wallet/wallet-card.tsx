import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface WalletCardProps {
  balance: string;
  onDeposit: () => void;
  onWithdraw: () => void;
}

export default function WalletCard({ balance, onDeposit, onWithdraw }: WalletCardProps) {
  // Format wallet balance
  const formattedBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(parseFloat(balance));

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="bg-gradient-to-r from-primary-700 to-primary-500 p-6 text-white">
          <div className="flex items-center mb-4">
            <Wallet className="h-6 w-6 mr-2" />
            <h3 className="text-lg font-medium">Wallet Balance</h3>
          </div>
          
          <p className="text-4xl font-bold mb-4">{formattedBalance}</p>
          
          <div className="text-sm opacity-80 mb-6">
            <p>Securely manage your funds for RFQ transactions</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              className="bg-white text-primary-700 hover:bg-gray-100" 
              onClick={onDeposit}
            >
              <ArrowDownLeft className="mr-2 h-4 w-4" />
              Add Money
            </Button>
            <Button 
              variant="outline" 
              className="bg-transparent border-white text-white hover:bg-primary-600" 
              onClick={onWithdraw}
            >
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Withdraw
            </Button>
          </div>
        </div>
        
        <div className="p-6 bg-white">
          <h4 className="font-medium text-gray-900 mb-2">Wallet Features</h4>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-center">
              <svg className="h-4 w-4 mr-2 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Secure transactions with suppliers and buyers
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 mr-2 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Milestone-based payments via escrow system
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 mr-2 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Instant deposits and fast withdrawals
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
