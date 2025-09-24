'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slot } from '@radix-ui/react-slot';
import { 
  Wallet, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Banknote,
  History,
  Settings,
  Plus,
  Minus
} from 'lucide-react';
import Header from '@/components/Header';

interface Transaction {
  id: string;
  type: 'credit' | 'debit' | 'subscription' | 'escrow';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface WalletData {
  balance: number;
  kycStatus: 'pending' | 'verified' | 'rejected' | 'not_started';
  bankAccountLinked: boolean;
  subscriptionActive: boolean;
}

export default function WalletPage() {
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    kycStatus: 'not_started',
    bankAccountLinked: false,
    subscriptionActive: false
  });

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'credit',
      amount: 5000,
      description: 'Initial wallet top-up',
      date: '2024-01-15',
      status: 'completed'
    },
    {
      id: '2',
      type: 'subscription',
      amount: -500,
      description: 'Premium subscription payment',
      date: '2024-01-10',
      status: 'completed'
    },
    {
      id: '3',
      type: 'escrow',
      amount: -2000,
      description: 'Escrow payment for RFQ #12345',
      date: '2024-01-08',
      status: 'pending'
    }
  ]);

  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');

  const handleAddMoney = async () => {
    if (!addMoneyAmount || parseFloat(addMoneyAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    // Simulate Razorpay payment
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: parseFloat(addMoneyAmount) * 100, // Convert to paise
      currency: 'INR',
      name: 'Bell24h',
      description: 'Wallet Top-up',
      handler: function (response: any) {
        // Handle successful payment
        setWalletData(prev => ({
          ...prev,
          balance: prev.balance + parseFloat(addMoneyAmount)
        }));
        
        setTransactions(prev => [{
          id: Date.now().toString(),
          type: 'credit',
          amount: parseFloat(addMoneyAmount),
          description: 'Wallet top-up',
          date: new Date().toISOString().split('T')[0],
          status: 'completed'
        }, ...prev]);

        setShowAddMoney(false);
        setAddMoneyAmount('');
        alert('Money added successfully!');
      },
      prefill: {
        email: 'user@example.com',
        contact: '9999999999'
      },
      theme: {
        color: '#2563eb'
      }
    };

    // @ts-ignore
    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getKYCStatusText = (status: string) => {
    switch (status) {
      case 'verified': return 'Verified';
      case 'pending': return 'Under Review';
      case 'rejected': return 'Rejected';
      default: return 'Not Started';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit': return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
      case 'debit': return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      case 'subscription': return <CreditCard className="h-4 w-4 text-blue-600" />;
      case 'escrow': return <Shield className="h-4 w-4 text-purple-600" />;
      default: return <Banknote className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Wallet" />
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Wallet Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{walletData.balance.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Available for transactions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">KYC Status</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <Badge className={getKYCStatusColor(walletData.kycStatus)}>
                  {getKYCStatusText(walletData.kycStatus)}
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  {walletData.kycStatus === 'verified' ? 'Full access enabled' : 'Complete KYC for full access'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bank Account</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {walletData.bankAccountLinked ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                  <span className="text-sm">
                    {walletData.bankAccountLinked ? 'Linked' : 'Not Linked'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {walletData.bankAccountLinked ? 'Ready for transactions' : 'Link bank account for withdrawals'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button 
                  onClick={() => setShowAddMoney(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Money
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4" />
                  Withdraw
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Transaction History
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Manage Account
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Tabs */}
          <Tabs defaultValue="transactions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
              <TabsTrigger value="subscription">Subscription</TabsTrigger>
              <TabsTrigger value="kyc">KYC & Verification</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-sm text-gray-600">{transaction.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString()}
                          </p>
                          <Badge className={getTransactionStatusColor(transaction.status)}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subscription" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Premium Subscription</h3>
                        <p className="text-gray-600">Access to advanced features and priority support</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹500/month</p>
                        <Badge className={walletData.subscriptionActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {walletData.subscriptionActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <Button className="w-full">
                      {walletData.subscriptionActive ? 'Manage Subscription' : 'Activate Subscription'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="kyc" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>KYC & Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="h-6 w-6 text-blue-600" />
                        <div>
                          <h3 className="font-semibold">Identity Verification</h3>
                          <p className="text-gray-600">Verify your identity for enhanced security</p>
                        </div>
                      </div>
                      <Badge className={getKYCStatusColor(walletData.kycStatus)}>
                        {getKYCStatusText(walletData.kycStatus)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-6 w-6 text-green-600" />
                        <div>
                          <h3 className="font-semibold">Bank Account Verification</h3>
                          <p className="text-gray-600">Link and verify your bank account</p>
                        </div>
                      </div>
                      <Badge className={walletData.bankAccountLinked ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                        {walletData.bankAccountLinked ? 'Verified' : 'Pending'}
                      </Badge>
                    </div>

                    <Button className="w-full">
                      {walletData.kycStatus === 'not_started' ? 'Start KYC Process' : 'Update KYC Information'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Wallet Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Transaction Limits</h3>
                        <p className="text-gray-600">Set daily and monthly transaction limits</p>
                      </div>
                      <Button variant="outline">Configure</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Security Settings</h3>
                        <p className="text-gray-600">Manage PIN, OTP, and security preferences</p>
                      </div>
                      <Button variant="outline">Manage</Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">Notifications</h3>
                        <p className="text-gray-600">Configure transaction and balance alerts</p>
                      </div>
                      <Button variant="outline">Configure</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Add Money Modal */}
          {showAddMoney && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Add Money to Wallet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={addMoneyAmount}
                      onChange={(e) => setAddMoneyAmount(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddMoney} className="flex-1">
                      Pay with Razorpay
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowAddMoney(false);
                        setAddMoneyAmount('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}