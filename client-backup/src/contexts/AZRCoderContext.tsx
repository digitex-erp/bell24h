import React, { createContext, useContext, ReactNode, useState, useCallback, useEffect } from 'react';
import { azrCoderService, AZRCodeAnalysis, AZRCodeCompletion, AZRTestGeneration } from '../services/azrCoderService';
import { AZR_CODER_CONFIG, getLanguageConfig } from '../config/azrCoderConfig';

interface AZRCoderContextType {
  // Core functions
  analyzeCode: (code: string, filePath?: string) => Promise<AZRCodeAnalysis | null>;
  getCodeCompletions: (prefix: string, suffix?: string, context?: Record<string, any>) => Promise<AZRCodeCompletion>;
  generateTests: (code: string, testFramework?: 'jest' | 'mocha' | 'jasmine' | 'pytest', options?: any) => Promise<AZRTestGeneration>;
  refactorCode: (code: string, goals?: Array<'performance' | 'readability' | 'security' | 'best-practices'>) => Promise<{ original: string; refactored: string; explanation: string }>;
  generateDocumentation: (code: string, format?: 'jsdoc' | 'tsdoc' | 'markdown', options?: any) => Promise<{ documentation: string; examples?: string[] }>;
  
  // State
  isAnalyzing: boolean;
  error: Error | null;
  config: typeof AZR_CODER_CONFIG;
  setConfig: (newConfig: Partial<typeof AZR_CODER_CONFIG>) => void;
  language: string;
  setLanguage: (language: string) => void;
  languageConfig: ReturnType<typeof getLanguageConfig>;
  
  // Utilities
  clearError: () => void;
}

const AZRCoderContext = createContext<AZRCoderContextType | undefined>(undefined);

interface AZRCoderProviderProps {
  children: ReactNode;
}

export const AZRCoderProvider: React.FC<AZRCoderProviderProps> = ({ children }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [config, setConfig] = useState(AZR_CODER_CONFIG);
  const [language, setLanguage] = useState<string>(AZR_CODER_CONFIG.DEFAULT_LANGUAGE);
  const [languageConfig, setLanguageConfig] = useState(getLanguageConfig(AZR_CODER_CONFIG.DEFAULT_LANGUAGE));

  const handleError = useCallback((err: any) => {
    console.error('AZR-CODER-7B Error:', err);
    const error = err instanceof Error ? err : new Error('An unknown error occurred');
    setError(error);
    throw error;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update language config when language changes
  useEffect(() => {
    setLanguageConfig(getLanguageConfig(language));
  }, [language]);

  // Update service configuration when config changes
  useEffect(() => {
    // Here you would update the service configuration if needed
    // For example, setting the API key or base URL
  }, [config]);

  const analyzeCode = useCallback(async (code: string, filePath?: string) => {
    if (!config.ANALYSIS.AUTO_ANALYZE) {
      return null;
    }
    
    setIsAnalyzing(true);
    try {
      const result = await azrCoderService.analyzeCode(code, filePath);
      return result;
    } catch (err) {
      return handleError(err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [config.ANALYSIS.AUTO_ANALYZE, handleError]);

  const getCodeCompletions = useCallback(async (prefix: string, suffix: string = '', context: Record<string, any> = {}) => {
    setIsAnalyzing(true);
    try {
      const result = await azrCoderService.getCodeCompletions(prefix, suffix, context);
      return result;
    } catch (err) {
      return handleError(err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [handleError]);

  const generateTests = useCallback(async (code: string, testFramework: 'jest' | 'mocha' | 'jasmine' | 'pytest' = 'jest', options: any = {}) => {
    setIsAnalyzing(true);
    try {
      const result = await azrCoderService.generateTests(code, testFramework, options);
      return result;
    } catch (err) {
      return handleError(err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [handleError]);

  const refactorCode = useCallback(async (code: string, goals: Array<'performance' | 'readability' | 'security' | 'best-practices'> = ['best-practices']) => {
    setIsAnalyzing(true);
    try {
      const result = await azrCoderService.refactorCode(code, goals);
      return result;
    } catch (err) {
      return handleError(err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [handleError]);

  const generateDocumentation = useCallback(async (code: string, format: 'jsdoc' | 'tsdoc' | 'markdown' = 'jsdoc', options: any = {}) => {
    setIsAnalyzing(true);
    try {
      const result = await azrCoderService.generateDocumentation(code, format, options);
      return result;
    } catch (err) {
      return handleError(err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [handleError]);

  return (
    <AZRCoderContext.Provider
      value={{
        analyzeCode,
        getCodeCompletions,
        generateTests,
        refactorCode,
        generateDocumentation,
        isAnalyzing,
        error,
        clearError,
        config,
        setConfig: (newConfig: any) => setConfig({ ...config, ...newConfig }),
        language,
        setLanguage,
        languageConfig,
      }}
    >
      {children}
    </AZRCoderContext.Provider>
  );
};

export const useAZRCoder = (): AZRCoderContextType => {
  const context = useContext(AZRCoderContext);
  if (context === undefined) {
    throw new Error('useAZRCoder must be used within an AZRCoderProvider');
  }
  return context;
};
