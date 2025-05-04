import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { useBlockchainSimulator } from '../../hooks/use-blockchain-simulator';

/**
 * A compact widget version of the blockchain simulator that can be embedded in 
 * other parts of the application like the dashboard or wallet page.
 */
export const BlockchainSimulatorWidget: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const { 
    createSimulatedTransaction, 
    releaseSimulatedTransaction,
    simulatedTransactions
  } = useBlockchainSimulator();

  const handleSimulate = async () => {
    if (step === 1) {
      // Create a new simulated escrow transaction
      await createSimulatedTransaction({
        amount: 500,
        description: 'Sample Escrow Payment',
        recipientId: '12345',
        recipientName: 'Sample Supplier'
      });
      setStep(2);
    } else if (step === 2) {
      // Release the transaction
      if (simulatedTransactions.length > 0) {
        await releaseSimulatedTransaction(simulatedTransactions[0].id);
      }
      setStep(3);
    } else {
      // Reset the demo
      setStep(1);
    }
  };

  const getStepContent = () => {
    switch (step) {
      case 1:
        return {
          title: 'Create Escrow',
          description: 'Securely lock funds in a smart contract',
          buttonText: 'Create Escrow',
          progress: 0
        };
      case 2:
        return {
          title: 'Funds Locked',
          description: 'Blockchain transaction confirmed',
          buttonText: 'Release Funds',
          progress: 50
        };
      case 3:
        return {
          title: 'Funds Released',
          description: 'Transaction completed successfully',
          buttonText: 'Try Again',
          progress: 100
        };
      default:
        return {
          title: 'Create Escrow',
          description: 'Securely lock funds in a smart contract',
          buttonText: 'Create Escrow',
          progress: 0
        };
    }
  };

  const content = getStepContent();

  return (
    <Card className="bg-blue-50/50 border border-blue-100">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-medium text-blue-800">{content.title}</h3>
            <p className="text-xs text-blue-600">{content.description}</p>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-800 text-xs">
            Simulator
          </Badge>
        </div>
        
        <Progress value={content.progress} className="h-1.5 mb-3" />
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-blue-800">
            <span className="font-medium">Step {step}/3:</span> {step === 1 ? 'Create' : step === 2 ? 'Lock' : 'Release'}
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            className="text-xs h-7 bg-white hover:bg-blue-50"
            onClick={handleSimulate}
          >
            {content.buttonText}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};