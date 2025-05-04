import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useProcurementChatbot } from './use-procurement-chatbot';
import { useLocation } from 'wouter';

// RFQ type definition
export interface RFQ {
  id: number;
  title: string;
  description: string;
  category: string;
  requirements: string[];
  deadline: Date;
  budget: string;
  quantity: number;
}

// Supplier type definition
export interface Supplier {
  id: number;
  name: string;
  industry: string;
  products: string[];
  rating: number;
  region: string;
  yearsOfPartnership: number;
}

// Types
export interface PageContext {
  page: string;
  route: string;
  params: Record<string, string>;
  title?: string;
  keywords?: string[];
}

interface ContextualProcurementContextType {
  contextualSuggestions: string[];
  pageContext: PageContext;
  hasSuggestions: boolean;
  newSuggestionCount: number;
  resetNewSuggestionCount: () => void;
  refreshSuggestions: () => Promise<void>;
  // Current RFQ and supplier context
  currentRfq: RFQ | null;
  currentSupplier: Supplier | null;
  setCurrentRfq: (rfq: RFQ | null) => void;
  setCurrentSupplier: (supplier: Supplier | null) => void;
}

// Context
const ContextualProcurementContext = createContext<ContextualProcurementContextType | undefined>(undefined);

// Provider Props
interface ContextualProcurementProviderProps {
  children: ReactNode;
}

/**
 * Provider component for contextual procurement suggestions
 */
export function ContextualProcurementProvider({ children }: ContextualProcurementProviderProps) {
  // Get current location from wouter
  const [location] = useLocation();
  
  // Get procurement chatbot
  const procurementChatbot = useProcurementChatbot();
  
  // State
  const [contextualSuggestions, setContextualSuggestions] = useState<string[]>([]);
  const [pageContext, setPageContext] = useState<PageContext>({
    page: 'home',
    route: '/',
    params: {},
  });
  const [newSuggestionCount, setNewSuggestionCount] = useState(0);
  const [currentRfq, setCurrentRfq] = useState<RFQ | null>(null);
  const [currentSupplier, setCurrentSupplier] = useState<Supplier | null>(null);
  
  // Determine if we have suggestions
  const hasSuggestions = useMemo(() => contextualSuggestions.length > 0, [contextualSuggestions]);
  
  // Reset new suggestion count
  const resetNewSuggestionCount = useCallback(() => {
    setNewSuggestionCount(0);
  }, []);
  
  // Refresh suggestions based on current context
  const refreshSuggestions = useCallback(async () => {
    // This would typically call an API or AI service to get contextual suggestions
    // For now, we'll simulate this with the procurementChatbot hook
    try {
      // Use the chatbot's getContextualSuggestions method (which should be implemented)
      const suggestions = procurementChatbot.getContextualSuggestions 
        ? await procurementChatbot.getContextualSuggestions() 
        : [];
      
      // If we have new suggestions that are different from the current ones, update
      if (JSON.stringify(suggestions) !== JSON.stringify(contextualSuggestions)) {
        setContextualSuggestions(suggestions);
        setNewSuggestionCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error refreshing contextual suggestions:', error);
    }
  }, [procurementChatbot, contextualSuggestions]);
  
  // Update page context when location changes
  useEffect(() => {
    // Extract page name from route
    const routeParts = location.split('/').filter(Boolean);
    const page = routeParts.length > 0 ? routeParts[0] : 'home';
    
    // Extract params from route (if needed)
    const params: Record<string, string> = {};
    if (routeParts.length > 1) {
      // Simple param extraction for routes like /suppliers/123
      params.id = routeParts[1];
    }
    
    // Get page title
    const pageTitle = document.title;
    
    // Update context
    setPageContext({
      page,
      route: location,
      params,
      title: pageTitle,
      keywords: ['procurement', page], // This would typically be more dynamic
    });
    
    // Refresh suggestions when page changes
    refreshSuggestions();
  }, [location, refreshSuggestions]);
  
  // Periodically refresh suggestions (e.g., every 2 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshSuggestions();
    }, 2 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [refreshSuggestions]);
  
  // Memoize context value
  const contextValue = useMemo(() => ({
    contextualSuggestions,
    pageContext,
    hasSuggestions,
    newSuggestionCount,
    resetNewSuggestionCount,
    refreshSuggestions,
    currentRfq,
    currentSupplier,
    setCurrentRfq,
    setCurrentSupplier,
  }), [
    contextualSuggestions,
    pageContext,
    hasSuggestions,
    newSuggestionCount,
    resetNewSuggestionCount,
    refreshSuggestions,
    currentRfq,
    currentSupplier,
    setCurrentRfq,
    setCurrentSupplier,
  ]);
  
  return (
    <ContextualProcurementContext.Provider value={contextValue}>
      {children}
    </ContextualProcurementContext.Provider>
  );
}

/**
 * Hook to access the contextual procurement context
 */
export function useContextualProcurement() {
  const context = useContext(ContextualProcurementContext);
  
  if (context === undefined) {
    throw new Error('useContextualProcurement must be used within a ContextualProcurementProvider');
  }
  
  return context;
}