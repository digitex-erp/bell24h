"use client";

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { useWallet, Wallet as WalletType } from '@/hooks/useWallet';
import { AuthContext } from './AuthProvider'; // Import AuthContext directly

interface WalletContextType {
  wallet: WalletType | null;
  isLoading: boolean;
  error: any;
  transactions: any[];
  deposit: (data: { amount: number; paymentMethodId: string }) => Promise<any>;
  withdraw: (data: { amount: number; bankAccountId: string }) => Promise<any>;
  formatBalance: (value?: number) => string;
  formatDate: (dateString: string) => string;
  refetchWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const userId = isAuthenticated && user?.id ? user.id : null;
  
  const {
    wallet = null,
    isLoading = false,
    walletError: error = null,
    transactions = [],
    deposit = async () => {
      throw new Error('User not authenticated');
    },
    withdraw = async () => {
      throw new Error('User not authenticated');
    },
    formatBalance = (value: number = 0) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value);
    },
    formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString();
    },
    refetchWallet = () => Promise.resolve(),
  } = useWallet(userId) || {};

  // Automatically refetch wallet when user changes
  useEffect(() => {
    if (user?.id) {
      refetchWallet();
    }
  }, [user?.id, refetchWallet]);

  const value = {
    wallet,
    isLoading,
    error,
    transactions,
    deposit,
    withdraw,
    formatBalance,
    formatDate,
    refetchWallet
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};

export default WalletProvider;
