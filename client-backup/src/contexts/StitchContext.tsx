import React, { createContext, useContext, useEffect, useState } from 'react';
import { StitchAppClient } from 'mongodb-stitch-browser-sdk';
import { initializeStitch } from '../lib/stitch';

interface StitchContextType {
  stitchClient: StitchAppClient | null;
  isLoading: boolean;
  error: Error | null;
}

const StitchContext = createContext<StitchContextType>({
  stitchClient: null,
  isLoading: true,
  error: null,
});

export const StitchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stitchClient, setStitchClient] = useState<StitchAppClient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initStitch = async () => {
      try {
        const client = await initializeStitch();
        setStitchClient(client);
      } catch (err) {
        console.error('Failed to initialize Stitch:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    initStitch();
  }, []);

  return (
    <StitchContext.Provider value={{ stitchClient, isLoading, error }}>
      {children}
    </StitchContext.Provider>
  );
};

export const useStitch = () => useContext(StitchContext);
