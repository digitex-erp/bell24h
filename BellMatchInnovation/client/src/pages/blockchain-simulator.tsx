import React, { useState } from 'react';
import MainLayout from '../components/layout/main-layout';
import { useBlockchainSimulator, SimulatedTransaction } from '../hooks/use-blockchain-simulator';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Copy, AlertTriangle, CheckCircle, Lock, Unlock, FileText, HelpCircle, ExternalLink } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

const BlockchainSimulator = () => {
  const { 
    simulatedTransactions, 
    createSimulatedTransaction, 
    releaseSimulatedTransaction,
    disputeSimulatedTransaction,
    clearAllSimulatedTransactions
  } = useBlockchainSimulator();
  
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isReleaseOpen, setIsReleaseOpen] = useState(false);
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isClearOpen, setIsClearOpen] = useState(false);
  
  const [selectedTransaction, setSelectedTransaction] = useState<SimulatedTransaction | null>(null);
  
  // Form states
  const [amount, setAmount] = useState('500');
  const [description, setDescription] = useState('');
  const [recipientId, setRecipientId] = useState('SUPL-12345');
  const [recipientName, setRecipientName] = useState('Sample Supplier');
  const [disputeReason, setDisputeReason] = useState('');
  
  // Handlers
  const handleCreateTransaction = async () => {
    try {
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        toast({
          title: 'Invalid Amount',
          description: 'Please enter a valid amount.',
          variant: 'destructive'
        });
        return;
      }
      
      if (!description.trim()) {
        toast({
          title: 'Missing Description',
          description: 'Please provide a description for this transaction.',
          variant: 'destructive'
        });
        return;
      }
      
      if (!recipientId.trim() || !recipientName.trim()) {
        toast({
          title: 'Invalid Recipient',
          description: 'Please provide both a recipient ID and name.',
          variant: 'destructive'
        });
        return;
      }
      
      await createSimulatedTransaction({
        amount: parseFloat(amount),
        description,
        recipientId,
        recipientName
      });
      
      setIsCreateOpen(false);
      // Reset form
      setDescription('');
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };
  
  const handleReleaseTransaction = async () => {
    if (!selectedTransaction) return;
    
    try {
      await releaseSimulatedTransaction(selectedTransaction.id);
      setIsReleaseOpen(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error('Error releasing transaction:', error);
    }
  };
  
  const handleDisputeTransaction = async () => {
    if (!selectedTransaction || !disputeReason.trim()) {
      toast({
        title: 'Missing Reason',
        description: 'Please provide a reason for this dispute.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      await disputeSimulatedTransaction(selectedTransaction.id, disputeReason);
      setIsDisputeOpen(false);
      setSelectedTransaction(null);
      setDisputeReason('');
    } catch (error) {
      console.error('Error disputing transaction:', error);
    }
  };
  
  const handleClearAllTransactions = () => {
    clearAllSimulatedTransactions();
    setIsClearOpen(false);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to Clipboard',
      description: 'The hash has been copied to your clipboard.',
    });
  };
  
  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'locked':
        return <Badge className="bg-blue-100 text-blue-800">Locked</Badge>;
      case 'released':
        return <Badge className="bg-green-100 text-green-800">Released</Badge>;
      case 'disputed':
        return <Badge className="bg-red-100 text-red-800">Disputed</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Blockchain Simulator</h1>
            <p className="text-gray-500">
              Experience blockchain-based escrow payments with zero risk using our simulator
            </p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Lock className="h-4 w-4 mr-2" />
                  Create Escrow
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Simulated Escrow Payment</DialogTitle>
                  <DialogDescription>
                    Lock funds in a smart contract escrow to secure a transaction
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount (₹)</label>
                    <Input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Payment for supplies"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Recipient ID</label>
                      <Input
                        value={recipientId}
                        onChange={(e) => setRecipientId(e.target.value)}
                        placeholder="SUPL-12345"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Recipient Name</label>
                      <Input
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="ABC Suppliers"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateTransaction}>
                    Create Escrow
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Dialog open={isClearOpen} onOpenChange={setIsClearOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Reset Simulator
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Blockchain Simulator</DialogTitle>
                  <DialogDescription>
                    This will delete all simulated transactions. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsClearOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleClearAllTransactions}
                  >
                    Reset Simulator
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Simulated Transactions</CardTitle>
                <CardDescription>
                  These transactions exist only within this simulator and do not involve real cryptocurrency
                </CardDescription>
              </CardHeader>
              <CardContent>
                {simulatedTransactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 mb-4">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700">No Transactions Yet</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                      Create your first simulated blockchain escrow payment to see it appear here
                    </p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setIsCreateOpen(true)}
                    >
                      Create Escrow Payment
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {simulatedTransactions.map((transaction) => (
                      <div 
                        key={transaction.id} 
                        className="p-4 border border-gray-200 rounded-lg transition-colors hover:border-blue-200 hover:bg-blue-50/30"
                      >
                        <div className="flex justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-800">
                              Payment to {transaction.recipientName}
                            </h3>
                            {getStatusBadge(transaction.status)}
                          </div>
                          <div className="text-right font-medium">
                            ₹{transaction.amount.toLocaleString()}
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3">
                          {transaction.description}
                        </p>
                        
                        <div className="text-xs text-gray-500 flex items-center mb-3">
                          <div className="truncate flex-1">
                            TX: {transaction.hash.substring(0, 16)}...
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2"
                            onClick={() => copyToClipboard(transaction.hash)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTransaction(transaction);
                              setIsViewOpen(true);
                            }}
                          >
                            View Details
                          </Button>
                          
                          {transaction.status === 'locked' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setIsReleaseOpen(true);
                                }}
                              >
                                <Unlock className="h-3 w-3 mr-1" />
                                Release Funds
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTransaction(transaction);
                                  setIsDisputeOpen(true);
                                }}
                              >
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Dispute
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
                <CardTitle>How It Works</CardTitle>
                <CardDescription className="text-blue-100">
                  Understanding blockchain escrow payments
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 text-blue-800 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">
                        1
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Create Escrow</h3>
                        <p className="text-xs text-gray-500">
                          Funds are locked in a smart contract that acts as a neutral third party
                        </p>
                      </div>
                    </div>
                    <Progress value={33} className="h-1" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 text-blue-800 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">
                        2
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Supplier Delivers</h3>
                        <p className="text-xs text-gray-500">
                          The supplier provides goods or services knowing payment is secured
                        </p>
                      </div>
                    </div>
                    <Progress value={66} className="h-1" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 text-blue-800 h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">
                        3
                      </div>
                      <div>
                        <h3 className="text-sm font-medium">Release Payment</h3>
                        <p className="text-xs text-gray-500">
                          Upon confirmation of delivery, funds are released to the supplier
                        </p>
                      </div>
                    </div>
                    <Progress value={100} className="h-1" />
                  </div>
                </div>
                
                <div className="mt-6 text-xs text-gray-500">
                  <p>
                    <span className="font-semibold">Note:</span> In case of disputes, our smart contract includes a resolution mechanism that allows for arbitration.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://bell24h.com/blockchain" target="_blank" rel="noopener noreferrer">
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Learn More About Blockchain
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Ready for Real Payments?</CardTitle>
                <CardDescription>
                  Transition to actual blockchain transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100 mb-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium text-gray-800">
                      Benefits of Real Blockchain Payments
                    </h3>
                  </div>
                  <ul className="pl-8 text-sm text-gray-600 space-y-1 list-disc">
                    <li>Immutable transaction records</li>
                    <li>Global payments without currency conversion</li>
                    <li>Reduced transaction fees</li>
                    <li>Fast international settlements</li>
                    <li>Enhanced security and transparency</li>
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="pt-0">
                <Button className="w-full" asChild>
                  <a href="/blockchain-payment">
                    Make a Real Blockchain Payment
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      
      {/* View Transaction Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Full details of the simulated blockchain transaction
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="py-4">
              <Tabs defaultValue="details">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="json">JSON Data</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Status</p>
                      <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Amount</p>
                      <p className="mt-1 font-medium">₹{selectedTransaction.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Description</p>
                    <p className="mt-1 text-sm">{selectedTransaction.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Recipient ID</p>
                      <p className="mt-1 text-sm font-mono">{selectedTransaction.recipientId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Recipient Name</p>
                      <p className="mt-1 text-sm">{selectedTransaction.recipientName}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">Transaction Hash</p>
                    <div className="mt-1 flex items-center">
                      <code className="text-xs bg-gray-100 p-1 rounded font-mono flex-1 truncate">
                        {selectedTransaction.hash}
                      </code>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-2"
                        onClick={() => copyToClipboard(selectedTransaction.hash)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created</p>
                      <p className="mt-1 text-sm">
                        {selectedTransaction.createdAt.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Updated</p>
                      <p className="mt-1 text-sm">
                        {selectedTransaction.updatedAt.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="json" className="pt-4">
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto max-h-80">
                    <pre className="text-xs font-mono whitespace-pre-wrap">
                      {JSON.stringify(selectedTransaction, null, 2)}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Release Transaction Dialog */}
      <Dialog open={isReleaseOpen} onOpenChange={setIsReleaseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Release Funds</DialogTitle>
            <DialogDescription>
              Release the locked funds to the recipient upon satisfactory completion
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="py-4">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-md mb-4">
                <div className="flex items-start">
                  <Unlock className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-blue-800">Confirm Release</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      You are about to release ₹{selectedTransaction.amount.toLocaleString()} to {selectedTransaction.recipientName}. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReleaseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReleaseTransaction}>
              Confirm Release
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dispute Transaction Dialog */}
      <Dialog open={isDisputeOpen} onOpenChange={setIsDisputeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Dispute</DialogTitle>
            <DialogDescription>
              Create a dispute if there's an issue with the transaction
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="py-4">
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-100 p-4 rounded-md">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-amber-800">Important</h4>
                      <p className="text-sm text-amber-700 mt-1">
                        Creating a dispute will initiate a resolution process. Please provide detailed information about the issue.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dispute Reason</label>
                  <Textarea
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    placeholder="Explain the reason for this dispute in detail..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDisputeOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDisputeTransaction}
            >
              Create Dispute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default BlockchainSimulator;