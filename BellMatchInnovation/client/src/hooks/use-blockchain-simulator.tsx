import { useState, useCallback, useEffect } from 'react';
import { useToast } from './use-toast';

/**
 * Simulate a delay to match real-world blockchain transaction timing
 * @param ms Time in milliseconds to delay
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Types for the blockchain simulator
export interface SimulatedTransaction {
  id: string;
  amount: number;
  description: string;
  recipientId: string;
  recipientName: string;
  status: 'pending' | 'locked' | 'released' | 'disputed';
  hash: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateTransactionParams {
  amount: number;
  description: string;
  recipientId: string;
  recipientName: string;
}

/**
 * Hook to simulate blockchain functionality without requiring real crypto
 * This allows users to interact with and understand the blockchain payment process
 * before using real crypto assets
 */
export const useBlockchainSimulator = () => {
  const [simulatedTransactions, setSimulatedTransactions] = useState<SimulatedTransaction[]>([]);
  const { toast } = useToast();
  
  // Initialize from localStorage
  useEffect(() => {
    try {
      const savedTransactions = localStorage.getItem('simulatedTransactions');
      if (savedTransactions) {
        const parsed = JSON.parse(savedTransactions);
        
        // Convert date strings back to Date objects
        const transactions = parsed.map((tx: any) => ({
          ...tx,
          createdAt: new Date(tx.createdAt),
          updatedAt: new Date(tx.updatedAt)
        }));
        
        setSimulatedTransactions(transactions);
      }
    } catch (error) {
      console.error('Failed to restore simulated transactions:', error);
    }
  }, []);
  
  // Save to localStorage when transactions change
  useEffect(() => {
    localStorage.setItem('simulatedTransactions', JSON.stringify(simulatedTransactions));
  }, [simulatedTransactions]);
  
  // Generate a fake blockchain hash
  const generateHash = () => {
    return '0x' + Array.from({ length: 64 }, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('');
  };

  // Generate a unique ID
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };
  
  // Create a new simulated transaction
  const createSimulatedTransaction = useCallback(async (params: CreateTransactionParams) => {
    try {
      // Simulate network delay for blockchain transaction
      await delay(1500);
      
      const newTransaction: SimulatedTransaction = {
        id: generateId(),
        amount: params.amount,
        description: params.description,
        recipientId: params.recipientId,
        recipientName: params.recipientName,
        status: 'locked',
        hash: generateHash(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setSimulatedTransactions(prev => [newTransaction, ...prev]);
      
      // Only show toast notification for standard simulator, not one-click simulator
      // This prevents duplicate notifications when the one-click simulator is showing its own UI
      if (!params.description.includes('One-click demo')) {
        toast({
          title: 'Escrow Created',
          description: `₹${params.amount} locked in a simulated blockchain escrow contract.`,
        });
      }
      
      return newTransaction;
    } catch (error) {
      console.error('Error creating simulated transaction', error);
      toast({
        title: 'Simulation Error',
        description: 'Failed to create the simulated transaction.',
        variant: 'destructive'
      });
      throw error;
    }
  }, [toast]);
  
  // Release funds from an escrow
  const releaseSimulatedTransaction = useCallback(async (transactionId: string) => {
    try {
      // Simulate network delay for blockchain transaction
      await delay(1500);
      
      // Find the transaction first (before updating)
      const transaction = simulatedTransactions.find(tx => tx.id === transactionId);
      const isOneClickDemo = transaction?.description.includes('One-click demo');
      
      // Update the transaction status
      setSimulatedTransactions(prev => 
        prev.map(tx => 
          tx.id === transactionId 
            ? { 
                ...tx, 
                status: 'released', 
                updatedAt: new Date(),
                hash: generateHash() // Generate a new hash for the release transaction
              } 
            : tx
        )
      );
      
      // Only show toast notification for standard simulator, not one-click simulator
      if (!isOneClickDemo) {
        toast({
          title: 'Funds Released',
          description: transaction 
            ? `₹${transaction.amount} has been released to ${transaction.recipientName}.`
            : 'The funds have been released successfully.',
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error releasing simulated transaction', error);
      toast({
        title: 'Simulation Error',
        description: 'Failed to release the simulated transaction.',
        variant: 'destructive'
      });
      throw error;
    }
  }, [simulatedTransactions, toast]);
  
  // Create a dispute for a transaction
  const disputeSimulatedTransaction = useCallback(async (transactionId: string, reason: string) => {
    try {
      // Simulate network delay for blockchain transaction
      await delay(1500);
      
      // Find the transaction first (before updating)
      const transaction = simulatedTransactions.find(tx => tx.id === transactionId);
      const isOneClickDemo = transaction?.description.includes('One-click demo');
      
      setSimulatedTransactions(prev => 
        prev.map(tx => 
          tx.id === transactionId 
            ? { 
                ...tx, 
                status: 'disputed', 
                updatedAt: new Date(),
                description: `${tx.description} (Disputed: ${reason})`
              } 
            : tx
        )
      );
      
      // Only show toast notification for standard simulator, not one-click simulator
      if (!isOneClickDemo) {
        toast({
          title: 'Dispute Created',
          description: 'A dispute has been created for this transaction.',
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error disputing simulated transaction', error);
      toast({
        title: 'Simulation Error',
        description: 'Failed to create a dispute for this transaction.',
        variant: 'destructive'
      });
      throw error;
    }
  }, [simulatedTransactions, toast]);
  
  // Clear all simulated transactions
  const clearAllSimulatedTransactions = useCallback(() => {
    setSimulatedTransactions([]);
    localStorage.removeItem('simulatedTransactions');
    
    toast({
      title: 'Simulator Reset',
      description: 'All simulated blockchain transactions have been cleared.',
    });
  }, [toast]);
  
  return {
    simulatedTransactions,
    createSimulatedTransaction,
    releaseSimulatedTransaction,
    disputeSimulatedTransaction,
    clearAllSimulatedTransactions
  };
};