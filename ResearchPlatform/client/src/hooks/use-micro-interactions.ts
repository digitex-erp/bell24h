import { useState, useCallback, useRef, useEffect } from "react";

interface UseMicroInteractionsProps {
  successDuration?: number;
  feedbackDuration?: number;
  disableInteractions?: boolean;
}

export const useMicroInteractions = ({
  successDuration = 2000,
  feedbackDuration = 200,
  disableInteractions = false,
}: UseMicroInteractionsProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  // Reset all states
  const resetState = useCallback(() => {
    setIsLoading(false);
    setIsSuccess(false);
    setIsError(false);
    setErrorMessage(null);
  }, []);
  
  // Handle loading state start
  const startLoading = useCallback(() => {
    resetState();
    setIsLoading(true);
  }, [resetState]);
  
  // Handle success state with auto-reset
  const showSuccess = useCallback((autoHide = true) => {
    setIsLoading(false);
    setIsError(false);
    setErrorMessage(null);
    setIsSuccess(true);
    
    if (autoHide && !disableInteractions) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setIsSuccess(false);
      }, successDuration);
    }
  }, [successDuration, disableInteractions]);
  
  // Handle error state with auto-reset
  const showError = useCallback((message?: string, autoHide = true) => {
    setIsLoading(false);
    setIsSuccess(false);
    setIsError(true);
    
    if (message) {
      setErrorMessage(message);
    }
    
    if (autoHide && !disableInteractions) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        setIsError(false);
        setErrorMessage(null);
      }, successDuration);
    }
  }, [successDuration, disableInteractions]);
  
  // Execute a function with automatic loading, success, and error handling
  const withFeedback = useCallback(async <T,>(
    promiseFunction: () => Promise<T>,
    options?: {
      successMessage?: string;
      errorMessage?: string;
      onSuccess?: (result: T) => void;
      onError?: (error: any) => void;
    }
  ): Promise<T | undefined> => {
    if (disableInteractions) {
      try {
        const result = await promiseFunction();
        options?.onSuccess?.(result);
        return result;
      } catch (error) {
        options?.onError?.(error);
        throw error;
      }
    }
    
    try {
      startLoading();
      const result = await promiseFunction();
      showSuccess();
      options?.onSuccess?.(result);
      return result;
    } catch (error: any) {
      showError(options?.errorMessage || error?.message || "An error occurred");
      options?.onError?.(error);
      return undefined;
    }
  }, [startLoading, showSuccess, showError, disableInteractions]);
  
  return {
    isLoading,
    isSuccess,
    isError,
    errorMessage,
    startLoading,
    showSuccess,
    showError,
    resetState,
    withFeedback,
  };
};

export default useMicroInteractions;