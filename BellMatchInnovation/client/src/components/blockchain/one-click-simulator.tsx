import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { useBlockchainSimulator } from '../../hooks/use-blockchain-simulator';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

/**
 * One-click blockchain transaction simulator
 * Provides an extremely simplified way for users to experience the entire
 * blockchain payment flow with a single click
 */
export const OneClickSimulator: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const { 
    createSimulatedTransaction, 
    releaseSimulatedTransaction,
  } = useBlockchainSimulator();

  // Define steps for the demo
  const steps = [
    { 
      title: 'Try Blockchain Payments', 
      description: 'Experience the entire flow with one click', 
      buttonText: 'Start Demo', 
      progress: 0 
    },
    { 
      title: 'Creating Payment', 
      description: 'Generating blockchain transaction...', 
      buttonText: 'Processing...', 
      progress: 25 
    },
    { 
      title: 'Payment Created', 
      description: 'Funds locked in smart contract', 
      buttonText: 'Continue', 
      progress: 50 
    },
    { 
      title: 'Releasing Funds', 
      description: 'Processing transaction...', 
      buttonText: 'Processing...', 
      progress: 75 
    },
    { 
      title: 'Payment Complete', 
      description: 'Blockchain transaction successful', 
      buttonText: 'Try Again', 
      progress: 100 
    }
  ];

  const handleClick = async () => {
    // If we're at the final step, reset and start over
    if (step === 4) {
      setStep(0);
      setTransactionId(null);
      return;
    }
    
    // Starting the demo
    if (step === 0) {
      setStep(1);
      setLoading(true);
      
      try {
        // Create a simulated transaction
        const transaction = await createSimulatedTransaction({
          amount: 500,
          description: 'One-click demo payment',
          recipientId: 'DEMO-1234',
          recipientName: 'Demo Supplier'
        });
        
        setTransactionId(transaction.id);
        setStep(2);
      } catch (error) {
        console.error('Error creating transaction:', error);
        toast({
          title: 'Simulation Error',
          description: 'Failed to create the demo transaction.',
          variant: 'destructive'
        });
        setStep(0);
      } finally {
        setLoading(false);
      }
      return;
    }
    
    // Continue to release funds
    if (step === 2) {
      setStep(3);
      setLoading(true);
      
      try {
        // Only proceed if we have a transaction ID
        if (transactionId) {
          await releaseSimulatedTransaction(transactionId);
          setStep(4);
        } else {
          throw new Error('No transaction ID available');
        }
      } catch (error) {
        console.error('Error releasing transaction:', error);
        toast({
          title: 'Simulation Error',
          description: 'Failed to release the demo transaction.',
          variant: 'destructive'
        });
        setStep(2); // Stay at current step on error
      } finally {
        setLoading(false);
      }
    }
  };

  const currentStep = steps[step];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-white">{currentStep.title}</CardTitle>
            <CardDescription className="text-blue-100">
              {currentStep.description}
            </CardDescription>
          </div>
          {step === 4 && (
            <Badge className="bg-green-500 text-white border-0">
              <CheckCircle className="h-3 w-3 mr-1" />
              Success
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <Progress value={currentStep.progress} className="h-2 mb-4" />
        
        <div className="space-y-2 py-2">
          {step >= 2 && (
            <div className="flex items-center space-x-2 text-sm">
              <Badge variant="outline" className="bg-blue-50 text-blue-700">Step 1</Badge>
              <span className="font-medium">Payment created and locked in smart contract</span>
            </div>
          )}
          
          {step >= 4 && (
            <div className="flex items-center space-x-2 text-sm">
              <Badge variant="outline" className="bg-green-50 text-green-700">Step 2</Badge>
              <span className="font-medium">Funds released successfully to supplier</span>
            </div>
          )}
          
          {step === 0 && (
            <div className="text-sm text-gray-500 py-2">
              Experience how blockchain payments work in just a few clicks, with no cryptocurrency required.
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {step > 0 ? `Step ${step} of 4` : 'Blockchain Demo'}
        </div>
        <Button 
          onClick={handleClick} 
          disabled={loading || step === 1 || step === 3}
          className="relative"
        >
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {currentStep.buttonText}
          {!loading && step !== 1 && step !== 3 && <ArrowRight className="h-4 w-4 ml-2" />}
        </Button>
      </CardFooter>
    </Card>
  );
};