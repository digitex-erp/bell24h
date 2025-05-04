import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';

// Types
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  language: string;
  notificationsEnabled: boolean;
  assistantOpen: boolean;
  assistantExpanded: boolean;
  assistantPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  preferredCategories: string[];
  preferredSuppliers: string[];
  preferredRegions: string[];
  preferredPriceRange: {
    min: number | null;
    max: number | null;
  };
}

// Default preferences
export const defaultPreferences: UserPreferences = {
  theme: 'system',
  fontSize: 'medium',
  language: 'en',
  notificationsEnabled: true,
  assistantOpen: false,
  assistantExpanded: false,
  assistantPosition: 'bottom-right',
  preferredCategories: [],
  preferredSuppliers: [],
  preferredRegions: [],
  preferredPriceRange: {
    min: null,
    max: null,
  },
};

// Context type
interface UserPreferencesContextType {
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
  loadPreferences: () => Promise<void>;
  updatePreferences: (updatedPreferences: Partial<UserPreferences>) => Promise<void>;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => Promise<void>;
  resetPreferences: () => Promise<void>;
  updateTheme: (theme: 'light' | 'dark' | 'system') => Promise<void>;
  updateLanguage: (language: string) => Promise<void>;
  updatePreferredCategories: (categories: string[]) => Promise<void>;
  updatePreferredPriceRange: (min?: number, max?: number) => Promise<void>;
}

// Create context
const UserPreferencesContext = createContext<UserPreferencesContextType | undefined>(undefined);

// Provider props
interface UserPreferencesProviderProps {
  children: ReactNode;
}

/**
 * Provider component for user preferences
 */
export function UserPreferencesProvider({ children }: UserPreferencesProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Load preferences from localStorage or API
  const loadPreferences = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First check localStorage
      const storedPrefs = localStorage.getItem('userPreferences');
      
      if (storedPrefs) {
        setPreferences(JSON.parse(storedPrefs));
        setIsLoading(false);
        return;
      }
      
      // If not in localStorage, try to load from API
      // This would normally be an API call, but we'll use defaults for now
      // const response = await apiRequest('GET', '/api/preferences');
      // setPreferences(response.data);
      
      // For now, use defaults
      setPreferences(defaultPreferences);
    } catch (error) {
      console.error('Error loading preferences:', error);
      setError('Failed to load preferences');
      // Fall back to defaults
      setPreferences(defaultPreferences);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Update all preferences
  const updatePreferences = useCallback(async (updatedPreferences: Partial<UserPreferences>) => {
    if (!preferences) return;
    
    const newPreferences = { ...preferences, ...updatedPreferences };
    
    try {
      // Save to localStorage
      localStorage.setItem('userPreferences', JSON.stringify(newPreferences));
      
      // Update state
      setPreferences(newPreferences);
      
      // Sync with API (would be uncommented in production)
      // await apiRequest('PUT', '/api/preferences', newPreferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
      setError('Failed to update preferences');
    }
  }, [preferences]);
  
  // Update a single preference
  const updatePreference = useCallback(async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    if (!preferences) return;
    
    try {
      const updatedPreferences = { ...preferences, [key]: value };
      
      // Save to localStorage
      localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
      
      // Update state
      setPreferences(updatedPreferences);
      
      // Sync with API (would be uncommented in production)
      // await apiRequest('PUT', `/api/preferences/${key}`, { value });
    } catch (error) {
      console.error(`Error updating preference ${String(key)}:`, error);
      setError(`Failed to update ${String(key)}`);
    }
  }, [preferences]);
  
  // Reset preferences to defaults
  const resetPreferences = useCallback(async () => {
    try {
      // Save defaults to localStorage
      localStorage.setItem('userPreferences', JSON.stringify(defaultPreferences));
      
      // Update state
      setPreferences(defaultPreferences);
      
      // Sync with API (would be uncommented in production)
      // await apiRequest('DELETE', '/api/preferences');
    } catch (error) {
      console.error('Error resetting preferences:', error);
      setError('Failed to reset preferences');
    }
  }, []);
  
  // Convenience method for updating theme
  const updateTheme = useCallback(async (theme: 'light' | 'dark' | 'system') => {
    updatePreference('theme', theme);
  }, [updatePreference]);
  
  // Convenience method for updating language
  const updateLanguage = useCallback(async (language: string) => {
    updatePreference('language', language);
  }, [updatePreference]);
  
  // Convenience method for updating preferred categories
  const updatePreferredCategories = useCallback(async (categories: string[]) => {
    updatePreference('preferredCategories', categories);
  }, [updatePreference]);
  
  // Convenience method for updating preferred price range
  const updatePreferredPriceRange = useCallback(async (min?: number, max?: number) => {
    if (!preferences) return;
    
    const currentRange = preferences.preferredPriceRange;
    const newRange = {
      min: min !== undefined ? min : currentRange.min,
      max: max !== undefined ? max : currentRange.max,
    };
    
    updatePreference('preferredPriceRange', newRange);
  }, [preferences, updatePreference]);
  
  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);
  
  // Prepare context value
  const contextValue: UserPreferencesContextType = {
    preferences,
    isLoading,
    error,
    loadPreferences,
    updatePreferences,
    updatePreference,
    resetPreferences,
    updateTheme,
    updateLanguage,
    updatePreferredCategories,
    updatePreferredPriceRange,
  };
  
  return (
    <UserPreferencesContext.Provider value={contextValue}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

/**
 * Hook to access user preferences
 */
export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  
  return context;
}