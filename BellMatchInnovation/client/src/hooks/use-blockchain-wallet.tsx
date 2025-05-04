import { useState, useEffect, useCallback } from 'react';
import { blockchainService, Payment, PaymentType } from '../lib/blockchain';
import { useToast } from './use-toast';

interface UseBlockchainWalletReturn {
  account: string | null;
  isConnected: boolean;
  isMetaMaskAvailable: boolean;
  connecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  createPayment: (params: CreatePaymentParams) => Promise<number>;
  fundPayment: (paymentId: number, amount: string) => Promise<void>;
  deposit: (orderId: number, amount: string) => Promise<void>;
  releasePayment: (paymentId: number) => Promise<void>;
  releaseToSupplier: (orderId: number, supplierAddress: string) => Promise<void>;
  createDispute: (paymentId: number, reason: string, evidence: string) => Promise<void>;
  getBalance: (orderId: number) => Promise<string>;
  getPayment: (paymentId: number) => Promise<Payment>;
  getOrderPayments: (orderId: number) => Promise<number[]>;
}

interface CreatePaymentParams {
  orderId: number;
  supplierAddress: string;
  amount: string;
  paymentType: PaymentType;
  milestoneNumber?: number;
  totalMilestones?: number;
  documentHash?: string;
}

/**
 * Hook for interacting with blockchain wallet and smart contract
 */
export function useBlockchainWallet(): UseBlockchainWalletReturn {
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Check if MetaMask is available
  const isMetaMaskAvailable = blockchainService.isMetaMaskAvailable();
  
  // Handle account changes
  const handleAccountsChanged = useCallback((accounts: string[]) => {
    if (accounts.length === 0) {
      // Disconnected
      setAccount(null);
      setIsConnected(false);
    } else {
      // Connected with new account
      setAccount(accounts[0]);
      setIsConnected(true);
    }
  }, []);
  
  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskAvailable) {
      toast({
        title: "MetaMask not available",
        description: "Please install MetaMask to use blockchain features",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setConnecting(true);
      const connectedAccount = await blockchainService.connectWallet();
      if (connectedAccount) {
        setAccount(connectedAccount);
        setIsConnected(true);
        toast({
          title: "Wallet Connected",
          description: "Your blockchain wallet is now connected",
        });
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive"
      });
    } finally {
      setConnecting(false);
    }
  }, [isMetaMaskAvailable, toast]);
  
  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setIsConnected(false);
    toast({
      title: "Wallet Disconnected",
      description: "Your blockchain wallet has been disconnected",
    });
  }, [toast]);
  
  // Create a new payment
  const createPayment = useCallback(async ({
    orderId,
    supplierAddress,
    amount,
    paymentType,
    milestoneNumber = 0,
    totalMilestones = 0,
    documentHash = ''
  }: CreatePaymentParams): Promise<number> => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      const paymentId = await blockchainService.createPayment(
        orderId,
        supplierAddress,
        amount,
        paymentType,
        milestoneNumber,
        totalMilestones,
        documentHash
      );
      
      toast({
        title: "Payment Created",
        description: `Payment #${paymentId} has been created successfully`,
      });
      
      return paymentId;
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast({
        title: "Payment Creation Failed",
        description: error.message || "Failed to create payment",
        variant: "destructive"
      });
      throw error;
    }
  }, [isConnected, toast]);
  
  // Fund a payment
  const fundPayment = useCallback(async (paymentId: number, amount: string): Promise<void> => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      await blockchainService.fundPayment(paymentId, amount);
      
      toast({
        title: "Payment Funded",
        description: `Payment #${paymentId} has been funded with ${amount} ETH`,
      });
    } catch (error: any) {
      console.error('Error funding payment:', error);
      toast({
        title: "Funding Failed",
        description: error.message || "Failed to fund payment",
        variant: "destructive"
      });
      throw error;
    }
  }, [isConnected, toast]);
  
  // Deposit funds for an order
  const deposit = useCallback(async (orderId: number, amount: string): Promise<void> => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      await blockchainService.deposit(orderId, amount);
      
      toast({
        title: "Deposit Successful",
        description: `${amount} ETH has been deposited for order #${orderId}`,
      });
    } catch (error: any) {
      console.error('Error depositing funds:', error);
      toast({
        title: "Deposit Failed",
        description: error.message || "Failed to deposit funds",
        variant: "destructive"
      });
      throw error;
    }
  }, [isConnected, toast]);
  
  // Release a payment
  const releasePayment = useCallback(async (paymentId: number): Promise<void> => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      await blockchainService.releasePayment(paymentId);
      
      toast({
        title: "Payment Released",
        description: `Payment #${paymentId} has been released to the supplier`,
      });
    } catch (error: any) {
      console.error('Error releasing payment:', error);
      toast({
        title: "Release Failed",
        description: error.message || "Failed to release payment",
        variant: "destructive"
      });
      throw error;
    }
  }, [isConnected, toast]);
  
  // Release funds to supplier
  const releaseToSupplier = useCallback(async (orderId: number, supplierAddress: string): Promise<void> => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      await blockchainService.release(orderId, supplierAddress);
      
      toast({
        title: "Funds Released",
        description: `Funds for order #${orderId} have been released to supplier`,
      });
    } catch (error: any) {
      console.error('Error releasing funds:', error);
      toast({
        title: "Release Failed",
        description: error.message || "Failed to release funds",
        variant: "destructive"
      });
      throw error;
    }
  }, [isConnected, toast]);
  
  // Create a dispute
  const createDispute = useCallback(async (paymentId: number, reason: string, evidence: string): Promise<void> => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      await blockchainService.createDispute(paymentId, reason, evidence);
      
      toast({
        title: "Dispute Created",
        description: `Dispute for payment #${paymentId} has been created`,
      });
    } catch (error: any) {
      console.error('Error creating dispute:', error);
      toast({
        title: "Dispute Creation Failed",
        description: error.message || "Failed to create dispute",
        variant: "destructive"
      });
      throw error;
    }
  }, [isConnected, toast]);
  
  // Get balance for an order
  const getBalance = useCallback(async (orderId: number): Promise<string> => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      return await blockchainService.getBalance(orderId);
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }, [isConnected]);
  
  // Get payment details
  const getPayment = useCallback(async (paymentId: number): Promise<Payment> => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      return await blockchainService.getPayment(paymentId);
    } catch (error) {
      console.error('Error getting payment:', error);
      throw error;
    }
  }, [isConnected]);
  
  // Get all payments for an order
  const getOrderPayments = useCallback(async (orderId: number): Promise<number[]> => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      return await blockchainService.getOrderPayments(orderId);
    } catch (error) {
      console.error('Error getting order payments:', error);
      throw error;
    }
  }, [isConnected]);
  
  // Set up event listeners for MetaMask
  useEffect(() => {
    if (isMetaMaskAvailable) {
      // Check initial connection status
      blockchainService.getAccount().then(currentAccount => {
        if (currentAccount) {
          setAccount(currentAccount);
          setIsConnected(true);
        }
      });
      
      // Listen for account changes
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      // Listen for chain changes
      window.ethereum.on('chainChanged', () => {
        // Reload the page on chain change
        window.location.reload();
      });
      
      // Clean up listeners
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [isMetaMaskAvailable, handleAccountsChanged]);
  
  return {
    account,
    isConnected,
    isMetaMaskAvailable,
    connecting,
    connectWallet,
    disconnectWallet,
    createPayment,
    fundPayment,
    deposit,
    releasePayment,
    releaseToSupplier,
    createDispute,
    getBalance,
    getPayment,
    getOrderPayments,
  };
}