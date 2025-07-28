import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSnackbar } from 'notistack';

// Types
type PaymentProvider = 'stripe' | 'paypal' | 'razorpay';
type PaymentStatus = 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded' | 'failed';

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'bank_account' | 'wallet';
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
  createdAt: string;
}

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  clientSecret?: string;
  paymentMethod?: string;
  error?: {
    message: string;
    code?: string;
  };
  metadata?: Record<string, any>;
  created: number;
}

interface PaymentContextType {
  // State
  paymentIntent: PaymentIntent | null;
  paymentMethods: PaymentMethod[];
  selectedPaymentMethod: string | null;
  loading: boolean;
  processing: boolean;
  error: string | null;
  
  // Actions
  createPaymentIntent: (amount: number, currency: string, metadata?: Record<string, any>) => Promise<PaymentIntent | null>;
  confirmPayment: (paymentMethodId: string, savePaymentMethod?: boolean) => Promise<boolean>;
  fetchPaymentMethods: () => Promise<void>;
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<boolean>;
  removePaymentMethod: (paymentMethodId: string) => Promise<boolean>;
  clearPaymentIntent: () => void;
  setError: (error: string | null) => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { enqueueSnackbar } = useSnackbar();
  
  // State
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch payment methods on mount
  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  // Create a payment intent
  const createPaymentIntent = async (
    amount: number, 
    currency: string, 
    metadata: Record<string, any> = {}
  ): Promise<PaymentIntent | null> => {
    try {
      setProcessing(true);
      setError(null);
      
      // In a real app, you would make an API call to your backend
      // const response = await fetch('/api/payments/create-intent', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //   },
      //   body: JSON.stringify({ amount, currency, metadata }),
      // });
      // const data = await response.json();
      
      // Mock response for demonstration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockPaymentIntent: PaymentIntent = {
        id: `pi_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        currency,
        status: 'requires_payment_method',
        clientSecret: `pi_${Math.random().toString(36).substr(2, 9)}_secret_${Math.random().toString(36).substr(2, 9)}`,
        metadata,
        created: Date.now(),
      };
      
      setPaymentIntent(mockPaymentIntent);
      return mockPaymentIntent;
    } catch (err) {
      console.error('Error creating payment intent:', err);
      setError('Failed to create payment. Please try again.');
      enqueueSnackbar('Failed to create payment', { variant: 'error' });
      return null;
    } finally {
      setProcessing(false);
    }
  };

  // Confirm a payment
  const confirmPayment = async (
    paymentMethodId: string, 
    savePaymentMethod: boolean = false
  ): Promise<boolean> => {
    if (!paymentIntent) {
      setError('No payment intent found');
      return false;
    }
    
    try {
      setProcessing(true);
      setError(null);
      
      // In a real app, you would make an API call to confirm the payment
      // const response = await fetch('/api/payments/confirm', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //   },
      //   body: JSON.stringify({
      //     paymentIntentId: paymentIntent.id,
      //     paymentMethodId,
      //     savePaymentMethod,
      //   }),
      // });
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful payment
      const updatedPaymentIntent: PaymentIntent = {
        ...paymentIntent,
        status: 'succeeded',
        paymentMethod: paymentMethodId,
      };
      
      setPaymentIntent(updatedPaymentIntent);
      
      // If saving payment method, refresh the payment methods list
      if (savePaymentMethod) {
        await fetchPaymentMethods();
      }
      
      enqueueSnackbar('Payment successful!', { variant: 'success' });
      return true;
    } catch (err) {
      console.error('Error confirming payment:', err);
      setError('Payment failed. Please try again.');
      enqueueSnackbar('Payment failed', { variant: 'error' });
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // Fetch payment methods
  const fetchPaymentMethods = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // In a real app, you would make an API call to fetch payment methods
      // const response = await fetch('/api/payment-methods', {
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //   },
      // });
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data for demonstration
      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: 'pm_1',
          type: 'card',
          card: {
            brand: 'visa',
            last4: '4242',
            expMonth: 12,
            expYear: 2025,
          },
          isDefault: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'pm_2',
          type: 'paypal',
          isDefault: false,
          createdAt: new Date().toISOString(),
        },
      ];
      
      setPaymentMethods(mockPaymentMethods);
      
      // Set the first payment method as selected if none is selected
      if (mockPaymentMethods.length > 0 && !selectedPaymentMethod) {
        const defaultMethod = mockPaymentMethods.find(m => m.isDefault) || mockPaymentMethods[0];
        setSelectedPaymentMethod(defaultMethod.id);
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      enqueueSnackbar('Failed to load payment methods', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Set default payment method
  const setDefaultPaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
    try {
      setProcessing(true);
      
      // In a real app, you would make an API call to update the default payment method
      // const response = await fetch(`/api/payment-methods/${paymentMethodId}/default`, {
      //   method: 'PUT',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //   },
      // });
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update local state
      setPaymentMethods(prev =>
        prev.map(method => ({
          ...method,
          isDefault: method.id === paymentMethodId,
        }))
      );
      
      setSelectedPaymentMethod(paymentMethodId);
      enqueueSnackbar('Default payment method updated', { variant: 'success' });
      return true;
    } catch (err) {
      console.error('Error setting default payment method:', err);
      enqueueSnackbar('Failed to update default payment method', { variant: 'error' });
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // Remove a payment method
  const removePaymentMethod = async (paymentMethodId: string): Promise<boolean> => {
    try {
      setProcessing(true);
      
      // In a real app, you would make an API call to remove the payment method
      // const response = await fetch(`/api/payment-methods/${paymentMethodId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`,
      //   },
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update local state
      setPaymentMethods(prev => prev.filter(method => method.id !== paymentMethodId));
      
      // Reset selected payment method if it was removed
      if (selectedPaymentMethod === paymentMethodId) {
        setSelectedPaymentMethod(null);
      }
      
      enqueueSnackbar('Payment method removed', { variant: 'success' });
      return true;
    } catch (err) {
      console.error('Error removing payment method:', err);
      enqueueSnackbar('Failed to remove payment method', { variant: 'error' });
      return false;
    } finally {
      setProcessing(false);
    }
  };

  // Clear the current payment intent
  const clearPaymentIntent = (): void => {
    setPaymentIntent(null);
    setError(null);
  };

  // Context value
  const value = {
    // State
    paymentIntent,
    paymentMethods,
    selectedPaymentMethod,
    loading,
    processing,
    error,
    
    // Actions
    createPaymentIntent,
    confirmPayment,
    fetchPaymentMethods,
    setDefaultPaymentMethod,
    removePaymentMethod,
    clearPaymentIntent,
    setError,
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

// Custom hook to use the payment context
export const usePayment = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};

export default PaymentContext;
