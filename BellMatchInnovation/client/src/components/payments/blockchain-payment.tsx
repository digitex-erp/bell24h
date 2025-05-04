import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { useBlockchainWallet } from '../../hooks/use-blockchain-wallet';
import { PaymentType, Payment } from '../../lib/blockchain';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { InfoIcon, AlertCircle, CheckCircle, XCircle, Loader2, Clock, ListChecks } from 'lucide-react';

interface BlockchainPaymentProps {
  orderId: number;
  rfqId?: number;
  supplierId?: number;
  supplierAddress?: string;
  totalAmount?: string;
  useMilestones?: boolean;
  milestones?: Array<{
    id: number;
    name: string;
    amount: string;
    completed: boolean;
  }>;
  onPaymentComplete?: () => void;
}

export const BlockchainPayment: React.FC<BlockchainPaymentProps> = ({
  orderId,
  rfqId,
  supplierId,
  supplierAddress = '',
  totalAmount = '0',
  useMilestones = false,
  milestones = [],
  onPaymentComplete
}) => {
  const {
    account,
    isConnected,
    isMetaMaskAvailable,
    connecting,
    connectWallet,
    createPayment,
    fundPayment,
    deposit,
    releasePayment,
    releaseToSupplier,
    getBalance,
    getOrderPayments,
    getPayment
  } = useBlockchainWallet();
  
  const [tab, setTab] = useState<string>('deposit');
  const [amount, setAmount] = useState<string>(totalAmount);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [enableMilestones, setEnableMilestones] = useState<boolean>(useMilestones);
  
  // Fetch order balance and payments
  const fetchOrderData = async () => {
    if (!isConnected) return;
    
    try {
      setRefreshing(true);
      // Get order balance
      const orderBalance = await getBalance(orderId);
      setBalance(orderBalance);
      
      // Get order payments
      const paymentIds = await getOrderPayments(orderId);
      
      // Fetch each payment details
      const paymentDetails = await Promise.all(
        paymentIds.map(id => getPayment(id))
      );
      
      setPayments(paymentDetails);
    } catch (error: any) {
      console.error('Error fetching order data:', error);
      setError(error.message || 'Failed to fetch order data');
    } finally {
      setRefreshing(false);
    }
  };
  
  // Handle deposit funds
  const handleDeposit = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await deposit(orderId, amount);
      
      setSuccess(`Successfully deposited ${amount} ETH for order #${orderId}`);
      fetchOrderData();
      
      if (onPaymentComplete) {
        onPaymentComplete();
      }
    } catch (error: any) {
      console.error('Error depositing funds:', error);
      setError(error.message || 'Failed to deposit funds');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle create and fund payment
  const handleCreatePayment = async (
    milestone?: {
      id: number;
      name: string;
      amount: string;
    }
  ) => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!supplierAddress) {
      setError('Supplier address is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const paymentAmount = milestone ? milestone.amount : amount;
      
      // Create payment
      const paymentId = await createPayment({
        orderId,
        supplierAddress,
        amount: paymentAmount,
        paymentType: enableMilestones ? PaymentType.Milestone : PaymentType.FullPayment,
        milestoneNumber: milestone ? milestone.id : 0,
        totalMilestones: milestones.length,
      });
      
      // Fund payment
      await fundPayment(paymentId, paymentAmount);
      
      setSuccess(`Successfully created and funded payment #${paymentId} with ${paymentAmount} ETH`);
      fetchOrderData();
      
      if (onPaymentComplete) {
        onPaymentComplete();
      }
    } catch (error: any) {
      console.error('Error creating payment:', error);
      setError(error.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle release payment
  const handleReleasePayment = async (paymentId: number) => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await releasePayment(paymentId);
      
      setSuccess(`Successfully released payment #${paymentId}`);
      fetchOrderData();
      
      if (onPaymentComplete) {
        onPaymentComplete();
      }
    } catch (error: any) {
      console.error('Error releasing payment:', error);
      setError(error.message || 'Failed to release payment');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle release to supplier
  const handleReleaseToSupplier = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
    
    if (!supplierAddress) {
      setError('Supplier address is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await releaseToSupplier(orderId, supplierAddress);
      
      setSuccess(`Successfully released funds to supplier`);
      fetchOrderData();
      
      if (onPaymentComplete) {
        onPaymentComplete();
      }
    } catch (error: any) {
      console.error('Error releasing to supplier:', error);
      setError(error.message || 'Failed to release funds to supplier');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch order data when connected
  useEffect(() => {
    if (isConnected) {
      fetchOrderData();
    }
  }, [isConnected, orderId]);
  
  // Format payment state
  const formatPaymentState = (state: number): JSX.Element => {
    switch (state) {
      case 0: // Created
        return <Badge variant="outline">Created</Badge>;
      case 1: // Funded
        return <Badge variant="secondary">Funded</Badge>;
      case 2: // Released
        return <Badge variant="success">Released</Badge>;
      case 3: // Refunded
        return <Badge variant="warning">Refunded</Badge>;
      case 4: // Disputed
        return <Badge variant="destructive">Disputed</Badge>;
      case 5: // Resolved
        return <Badge variant="default">Resolved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Blockchain Payment</CardTitle>
        <CardDescription>
          Secure your transaction with blockchain technology
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isMetaMaskAvailable ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>MetaMask Required</AlertTitle>
            <AlertDescription>
              Please install MetaMask browser extension to use blockchain payments.
            </AlertDescription>
          </Alert>
        ) : !isConnected ? (
          <div className="flex flex-col items-center justify-center p-6">
            <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Wallet Not Connected</h3>
            <p className="text-gray-500 text-center mb-4">
              Connect your Ethereum wallet to make secure blockchain payments.
            </p>
            <Button onClick={connectWallet} disabled={connecting}>
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Wallet"
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500">Connected Account</div>
                <div className="font-mono text-sm">{account?.slice(0, 6)}...{account?.slice(-4)}</div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Order Balance</div>
                <div className="font-semibold">{balance} ETH</div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="deposit">Deposit</TabsTrigger>
                <TabsTrigger value="create">Create Payment</TabsTrigger>
                <TabsTrigger value="view">View Payments</TabsTrigger>
              </TabsList>
              
              <TabsContent value="deposit">
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (ETH)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.0001"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleDeposit}
                    className="w-full"
                    disabled={loading || !amount || parseFloat(amount) <= 0}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Deposit Funds"
                    )}
                  </Button>
                  
                  <div className="mt-2">
                    <Button
                      onClick={handleReleaseToSupplier}
                      variant="outline"
                      className="w-full"
                      disabled={loading || parseFloat(balance) <= 0 || !supplierAddress}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Release All Funds to Supplier"
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="create">
                <div className="space-y-4">
                  {useMilestones && (
                    <div className="flex items-center space-x-2 mb-4">
                      <Switch
                        id="milestone-mode"
                        checked={enableMilestones}
                        onCheckedChange={setEnableMilestones}
                      />
                      <Label htmlFor="milestone-mode">Enable Milestone Payments</Label>
                    </div>
                  )}
                  
                  {enableMilestones && milestones.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm font-medium">Milestone Payments</div>
                        <Link href={`/milestone-approval/${orderId}`}>
                          <a className="text-xs text-blue-600 hover:text-blue-800 flex items-center">
                            <ListChecks className="h-3 w-3 mr-1" />
                            Manage Approval
                          </a>
                        </Link>
                      </div>
                      
                      {/* Milestone progress */}
                      <div className="bg-gray-50 rounded-md p-3 border border-gray-200">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>Milestone Progress</span>
                          <span>
                            {milestones.filter(m => m.completed).length} of {milestones.length} completed
                          </span>
                        </div>
                        <Progress 
                          value={milestones.length > 0 
                            ? (milestones.filter(m => m.completed).length / milestones.length) * 100 
                            : 0
                          } 
                          className="h-1.5"
                        />
                      </div>
                      
                      {milestones.map((milestone) => (
                        <Card key={milestone.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{milestone.name}</div>
                            <Badge variant={milestone.completed ? "success" : "outline"}>
                              {milestone.completed ? "Completed" : "Pending"}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-sm text-gray-500">Amount</div>
                            <div className="font-medium">{milestone.amount} ETH</div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleCreatePayment(milestone)}
                              className="flex-1"
                              disabled={loading || !milestone.amount || parseFloat(milestone.amount) <= 0 || !supplierAddress}
                              variant={milestone.completed ? "outline" : "default"}
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                "Pay Milestone"
                              )}
                            </Button>
                            {milestone.completed && (
                              <Link href={`/milestone-approval/${orderId}`}>
                                <a>
                                  <Button size="icon" variant="outline" className="h-10 w-10">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  </Button>
                                </a>
                              </Link>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="create-amount">Amount (ETH)</Label>
                        <Input
                          id="create-amount"
                          type="number"
                          step="0.0001"
                          min="0"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.0"
                        />
                      </div>
                      
                      <Button
                        onClick={() => handleCreatePayment()}
                        className="w-full"
                        disabled={loading || !amount || parseFloat(amount) <= 0 || !supplierAddress}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Create & Fund Payment"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="view">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Payment History</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchOrderData}
                      disabled={refreshing}
                    >
                      {refreshing ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Refresh"
                      )}
                    </Button>
                  </div>
                  
                  {payments.length === 0 ? (
                    <div className="text-center p-4 border rounded-md bg-gray-50">
                      <p className="text-sm text-gray-500">No payments found for this order.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {payments.map((payment) => (
                        <Card key={payment.id} className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">Payment #{payment.id}</div>
                            {formatPaymentState(payment.state)}
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-500">Amount</div>
                              <div className="font-medium">{payment.amount} ETH</div>
                            </div>
                            
                            {payment.paymentType === PaymentType.Milestone && (
                              <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">Milestone</div>
                                <div className="font-medium">
                                  {payment.milestoneNumber} of {payment.totalMilestones}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="text-sm text-gray-500">Created</div>
                              <div className="text-sm">
                                {payment.createdAt.toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          {payment.state === 1 && ( // Funded
                            <Button
                              onClick={() => handleReleasePayment(payment.id)}
                              className="w-full"
                              disabled={loading}
                            >
                              {loading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                "Release Payment"
                              )}
                            </Button>
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert variant="success" className="mt-4 bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-green-700">Success</AlertTitle>
                <AlertDescription className="text-green-600">{success}</AlertDescription>
              </Alert>
            )}
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col items-start">
        <div className="flex items-start space-x-2 text-sm text-gray-500">
          <InfoIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            Blockchain payments are secure, transparent, and immutable. 
            All transactions are recorded on the blockchain and cannot be altered.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
};