import React, { useState, useEffect } from 'react';
import { useBlockchainSimulator } from '../../hooks/use-blockchain-simulator';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '../ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '../ui/accordion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Switch } from '../ui/switch';
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ArrowRight, 
  RefreshCw, 
  AlertTriangle,
  Copy,
  ExternalLink,
  PlayCircle,
  Info
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

// Define the transactions for each simulation
const SIMULATION_SCENARIOS = [
  {
    id: 'simple-payment',
    name: 'Simple Payment',
    description: 'Simulate a simple payment flow from buyer to supplier',
    steps: [
      { type: 'deposit', description: 'Deposit funds to escrow', amount: '0.5' },
      { type: 'release', description: 'Release funds to supplier', amount: '0.5' }
    ]
  },
  {
    id: 'milestone-payment',
    name: 'Milestone Payment',
    description: 'Simulate a payment broken down into milestones',
    steps: [
      { type: 'create-milestone', description: 'Create milestone 1 payment', amount: '0.2', milestone: 1, totalMilestones: 3 },
      { type: 'fund', description: 'Fund milestone 1 payment', amount: '0.2' },
      { type: 'release-payment', description: 'Release milestone 1 payment', amount: '0.2' },
      { type: 'create-milestone', description: 'Create milestone 2 payment', amount: '0.3', milestone: 2, totalMilestones: 3 },
      { type: 'fund', description: 'Fund milestone 2 payment', amount: '0.3' },
      { type: 'release-payment', description: 'Release milestone 2 payment', amount: '0.3' },
    ]
  },
  {
    id: 'dispute-resolution',
    name: 'Dispute Resolution',
    description: 'Simulate a payment dispute and resolution process',
    steps: [
      { type: 'deposit', description: 'Deposit funds to escrow', amount: '1.0' },
      { type: 'dispute', description: 'Create a payment dispute', reason: 'Quality issues with delivered goods' },
      { type: 'resolve-refund', description: 'Resolve dispute with refund to buyer', amount: '1.0' }
    ]
  },
  {
    id: 'multi-supplier',
    name: 'Multi-Supplier Payment',
    description: 'Simulate payments to multiple suppliers',
    steps: [
      { type: 'deposit', description: 'Deposit funds to escrow', amount: '2.0' },
      { type: 'release-supplier', description: 'Release funds to supplier 1', amount: '0.7', supplier: 'supplier1' },
      { type: 'release-supplier', description: 'Release funds to supplier 2', amount: '0.8', supplier: 'supplier2' },
      { type: 'release-supplier', description: 'Release funds to supplier 3', amount: '0.5', supplier: 'supplier3' }
    ]
  }
];

interface TransactionSimulatorProps {
  orderId?: number;
}

export const TransactionSimulator: React.FC<TransactionSimulatorProps> = ({
  orderId = 12345  // Default orderId for simulation
}) => {
  const {
    account,
    isConnected,
    connecting,
    balance,
    connectWallet,
    disconnectWallet,
    createPayment,
    fundPayment,
    deposit,
    releasePayment,
    releaseToSupplier,
    createDispute,
    transactions,
    refreshTransactions,
    resetSimulation,
    mockAddresses
  } = useBlockchainSimulator();
  
  const { toast } = useToast();
  const [selectedScenario, setSelectedScenario] = useState<string>('simple-payment');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [stepResults, setStepResults] = useState<Array<{ success: boolean; txHash?: string; error?: string }>>([]);
  const [lastCreatedPaymentId, setLastCreatedPaymentId] = useState<number | null>(null);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  
  // Get the current scenario
  const currentScenario = SIMULATION_SCENARIOS.find(s => s.id === selectedScenario);
  
  // Calculate simulation progress
  const progress = currentScenario 
    ? Math.floor((currentStep / currentScenario.steps.length) * 100) 
    : 0;
  
  // Handle scenario selection
  const handleSelectScenario = (scenario: string) => {
    if (isRunning) return;
    
    setSelectedScenario(scenario);
    setCurrentStep(0);
    setStepResults([]);
    setLastCreatedPaymentId(null);
  };
  
  // Copy transaction hash to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Transaction hash has been copied to clipboard",
    });
  };
  
  // Run a single step of the simulation
  const runStep = async (step: any, index: number) => {
    try {
      setIsRunning(true);
      let result: any;
      
      switch (step.type) {
        case 'deposit':
          result = await deposit(orderId, step.amount);
          break;
          
        case 'create-milestone':
          const paymentId = await createPayment({
            orderId,
            supplierAddress: mockAddresses.supplier1,
            amount: step.amount,
            paymentType: 1, // Milestone
            milestoneNumber: step.milestone,
            totalMilestones: step.totalMilestones
          });
          setLastCreatedPaymentId(paymentId);
          result = { success: true };
          break;
          
        case 'fund':
          if (lastCreatedPaymentId === null) {
            throw new Error('No payment ID available to fund');
          }
          await fundPayment(lastCreatedPaymentId, step.amount);
          result = { success: true };
          break;
          
        case 'release-payment':
          if (lastCreatedPaymentId === null) {
            throw new Error('No payment ID available to release');
          }
          await releasePayment(lastCreatedPaymentId);
          result = { success: true };
          break;
          
        case 'release':
          await releaseToSupplier(orderId, mockAddresses.supplier1);
          result = { success: true };
          break;
          
        case 'release-supplier':
          const supplierAddress = mockAddresses[step.supplier] || mockAddresses.supplier1;
          await releaseToSupplier(orderId, supplierAddress);
          result = { success: true };
          break;
          
        case 'dispute':
          if (lastCreatedPaymentId === null) {
            // Create a payment first
            const paymentId = await createPayment({
              orderId,
              supplierAddress: mockAddresses.supplier1,
              amount: step.amount || '1.0',
              paymentType: 0 // Full payment
            });
            setLastCreatedPaymentId(paymentId);
            await fundPayment(paymentId, step.amount || '1.0');
          }
          await createDispute(
            lastCreatedPaymentId as number, 
            step.reason || 'Quality issues', 
            'evidence-hash-123'
          );
          result = { success: true };
          break;
          
        default:
          throw new Error(`Unknown step type: ${step.type}`);
      }
      
      // Get latest transactions to find the hash
      await refreshTransactions();
      const txHash = transactions[0]?.hash || 'simulated-tx-hash';
      
      setStepResults(prev => [
        ...prev, 
        { success: true, txHash }
      ]);
      
      // Update progress
      setCurrentStep(index + 1);
      
    } catch (error: any) {
      console.error(`Error running step ${index}:`, error);
      setStepResults(prev => [
        ...prev, 
        { success: false, error: error.message || 'Unknown error occurred' }
      ]);
      setIsRunning(false);
    }
  };
  
  // Run the entire simulation
  const runSimulation = async () => {
    if (!currentScenario) return;
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first to run the simulation",
        variant: "destructive"
      });
      return;
    }
    
    // Reset state
    setCurrentStep(0);
    setStepResults([]);
    setLastCreatedPaymentId(null);
    setIsRunning(true);
    
    // Run steps sequentially
    for (let i = 0; i < currentScenario.steps.length; i++) {
      if (stepResults[i]?.success === false) {
        // Skip already failed steps
        continue;
      }
      
      try {
        await runStep(currentScenario.steps[i], i);
        
        // Add delay between steps based on speed
        if (i < currentScenario.steps.length - 1) {
          const delay = speed === 'fast' ? 500 : speed === 'normal' ? 1000 : 2000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        // Error is handled in runStep
        break;
      }
    }
    
    setIsRunning(false);
  };
  
  // Reset the simulation
  const handleReset = () => {
    setCurrentStep(0);
    setStepResults([]);
    setLastCreatedPaymentId(null);
    resetSimulation();
  };
  
  // Get delay label based on speed
  const getSpeedLabel = () => {
    switch (speed) {
      case 'slow': return 'Slow (2s delay)';
      case 'normal': return 'Normal (1s delay)';
      case 'fast': return 'Fast (0.5s delay)';
      default: return 'Normal';
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlayCircle className="h-5 w-5 text-primary" />
          Blockchain Transaction Simulator
        </CardTitle>
        <CardDescription>
          Learn how blockchain transactions work with one-click simulations
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-gray-50">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Wallet Not Connected</h3>
            <p className="text-gray-500 text-center mb-4">
              Connect your simulated wallet to run blockchain transaction simulations.
            </p>
            <Button onClick={connectWallet} disabled={connecting}>
              {connecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect Simulator Wallet"
              )}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-500">Simulator Wallet</p>
                <p className="font-mono text-sm">{account?.slice(0, 6)}...{account?.slice(-4)}</p>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-sm font-medium text-gray-500">Balance</p>
                <p className="font-semibold">{balance} ETH</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Simulation Scenario</Label>
                <Select
                  value={selectedScenario}
                  onValueChange={handleSelectScenario}
                  disabled={isRunning}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIMULATION_SCENARIOS.map(scenario => (
                      <SelectItem key={scenario.id} value={scenario.id}>
                        {scenario.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {currentScenario && (
                  <p className="text-sm text-gray-500">{currentScenario.description}</p>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <Button 
                  onClick={runSimulation} 
                  disabled={isRunning || !currentScenario}
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running Simulation...
                    </>
                  ) : (
                    "Run Entire Simulation"
                  )}
                </Button>
                
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleReset}
                    disabled={isRunning}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reset
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                  >
                    {showAdvanced ? "Hide Advanced" : "Show Advanced"}
                  </Button>
                </div>
              </div>
              
              {showAdvanced && (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <Label htmlFor="sim-speed">Simulation Speed</Label>
                    <Select
                      value={speed}
                      onValueChange={(value: any) => setSpeed(value)}
                    >
                      <SelectTrigger id="sim-speed" className="w-40">
                        <SelectValue placeholder="Simulation speed" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="slow">Slow (2s delay)</SelectItem>
                        <SelectItem value="normal">Normal (1s delay)</SelectItem>
                        <SelectItem value="fast">Fast (0.5s delay)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="order-id">Order ID</Label>
                      <Input 
                        id="order-id" 
                        value={orderId} 
                        disabled 
                        className="w-40 text-right" 
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label>Default Supplier</Label>
                      <div className="font-mono text-xs">
                        {mockAddresses.supplier1.slice(0, 6)}...{mockAddresses.supplier1.slice(-4)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentScenario && (
                <div className="space-y-4 mt-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">Simulation Steps</h3>
                      <Badge variant="outline">
                        {currentStep}/{currentScenario.steps.length} Steps
                      </Badge>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500 ease-in-out" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {currentScenario.steps.map((step, index) => {
                      const isCompleted = index < currentStep;
                      const isCurrent = index === currentStep;
                      const result = stepResults[index];
                      
                      return (
                        <div 
                          key={index}
                          className={`p-3 border rounded-lg flex items-center justify-between ${
                            isCompleted 
                              ? result?.success ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100' 
                              : isCurrent ? 'bg-blue-50 border-blue-100' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0">
                              {isCompleted ? (
                                result?.success ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )
                              ) : isCurrent ? (
                                <div className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border border-gray-300" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {step.description} {step.amount ? `(${step.amount} ETH)` : ''}
                              </p>
                              {result?.txHash && (
                                <div className="flex items-center mt-1">
                                  <p className="text-xs font-mono text-gray-500 mr-1">
                                    Tx: {result.txHash.slice(0, 8)}...{result.txHash.slice(-6)}
                                  </p>
                                  <button 
                                    onClick={() => copyToClipboard(result.txHash as string)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                              {result?.error && (
                                <p className="text-xs text-red-500 mt-1">{result.error}</p>
                              )}
                            </div>
                          </div>
                          
                          {!isCompleted && !isRunning && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => runStep(step, index)}
                              disabled={isCurrent && isRunning}
                            >
                              {isCurrent && isRunning ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Run Step"
                              )}
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {stepResults.some(r => !r.success) && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Simulation Error</AlertTitle>
                  <AlertDescription>
                    One or more steps failed in the simulation. Check the error messages and try again.
                  </AlertDescription>
                </Alert>
              )}
              
              {currentStep === currentScenario?.steps.length && !stepResults.some(r => !r.success) && (
                <Alert className="mt-4 bg-green-50 border-green-100">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-700">Simulation Complete</AlertTitle>
                  <AlertDescription className="text-green-600">
                    All transaction steps were completed successfully.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <Accordion type="single" collapsible className="mt-4">
              <AccordionItem value="transactions">
                <AccordionTrigger>
                  <span className="flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Transaction History
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  {transactions.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2">No transactions found. Run a simulation to see transactions.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>From</TableHead>
                          <TableHead>To</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.slice(0, 5).map(tx => (
                          <TableRow key={tx.id}>
                            <TableCell>
                              <Badge variant="outline">{tx.type}</Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {tx.from.slice(0, 6)}...{tx.from.slice(-4)}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                            </TableCell>
                            <TableCell className="text-right">{tx.amount} ETH</TableCell>
                            <TableCell className="text-right text-xs">
                              {new Date(tx.timestamp).toLocaleTimeString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex-col items-start gap-2 border-t pt-6">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 text-blue-500" />
          <div className="text-sm text-gray-600">
            <p>This simulator demonstrates blockchain transactions without using real cryptocurrency. 
              It's a safe way to understand how blockchain payments work in Bell24h.</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};