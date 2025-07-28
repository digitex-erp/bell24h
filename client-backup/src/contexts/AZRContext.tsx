import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { AZRExplanation, AZRRequestOptions, azrService } from '../services/azrService';

interface AZRContextType {
  explanation: AZRExplanation | null;
  loading: boolean;
  error: string | null;
  getExplanation: (options: AZRRequestOptions) => Promise<AZRExplanation>;
  getSupplierRiskScore: (supplierData: any) => Promise<any>;
  clearExplanation: () => void;
  isServiceAvailable: boolean;
  checkServiceStatus: () => Promise<boolean>;
}

const AZRContext = createContext<AZRContextType | undefined>(undefined);

export const AZRProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [explanation, setExplanation] = useState<AZRExplanation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isServiceAvailable, setIsServiceAvailable] = useState<boolean>(false);

  // Check if AZR service is available on mount
  useEffect(() => {
    checkServiceStatus();
  }, []);

  const checkServiceStatus = useCallback(async (): Promise<boolean> => {
    try {
      const isAvailable = await azrService.checkHealth();
      setIsServiceAvailable(isAvailable);
      return isAvailable;
    } catch (error) {
      console.error('Failed to check AZR service status:', error);
      setIsServiceAvailable(false);
      return false;
    }
  }, []);

  const getExplanation = useCallback(async (options: AZRRequestOptions) => {
    setLoading(true);
    setError(null);
    
    try {
      const isAvailable = await checkServiceStatus();
      if (!isAvailable) {
        throw new Error('AZR service is currently unavailable');
      }
      
      const result = await azrService.getExplanation(options);
      setExplanation(result);
      return result;
    } catch (err) {
      console.error('Failed to get AZR explanation:', err);
      setError(err.message || 'Failed to get explanation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkServiceStatus]);

  const getSupplierRiskScore = useCallback(async (supplierData: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const isAvailable = await checkServiceStatus();
      if (!isAvailable) {
        throw new Error('AZR service is currently unavailable');
      }
      
      const result = await azrService.getSupplierRiskScore(supplierData);
      return result;
    } catch (err) {
      console.error('Failed to get supplier risk score:', err);
      setError(err.message || 'Failed to analyze supplier risk');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [checkServiceStatus]);

  const clearExplanation = useCallback(() => {
    setExplanation(null);
    setError(null);
  }, []);

  return (
    <AZRContext.Provider
      value={{
        explanation,
        loading,
        error,
        getExplanation,
        getSupplierRiskScore,
        clearExplanation,
        isServiceAvailable,
        checkServiceStatus,
      }}
    >
      {children}
    </AZRContext.Provider>
  );
};

export const useAZR = (): AZRContextType => {
  const context = useContext(AZRContext);
  if (context === undefined) {
    throw new Error('useAZR must be used within an AZRProvider');
  }
  return context;
};

export default AZRContext;
