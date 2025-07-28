import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { SearchResult, SearchSuggestion, SearchFilters } from '../services/search/types';
import axios from 'axios';

interface SearchProviderProps {
  children: React.ReactNode;
  initialQuery?: string;
  initialFilters?: Partial<SearchFilters>;
}

const SearchContext = createContext<{
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  search: (query: string, filters?: Partial<SearchFilters>) => Promise<void>;
  clearResults: () => void;
  filters: Partial<SearchFilters>;
  setFilters: (filters: Partial<SearchFilters>) => void;
  totalResults: number;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  recentSearches: SearchSuggestion[];
  popularSearches: SearchSuggestion[];
  getSuggestions: (query: string) => Promise<SearchSuggestion[]>;
} | undefined>(undefined);

export const SearchProvider: React.FC<SearchProviderProps> = ({
  children,
  initialQuery = '',
  initialFilters = {},
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<Partial<SearchFilters>>(initialFilters);
  const [totalResults, setTotalResults] = useState(0);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [recentSearches, setRecentSearches] = useState<SearchSuggestion[]>([]);
  const [popularSearches, setPopularSearches] = useState<SearchSuggestion[]>([]);

  const limit = 10;
  const API_BASE_URL = process.env.NEXT_PUBLIC_AI_SEARCH_API_URL || '/api/search';

  // Load popular searches on mount
  useEffect(() => {
    const loadPopularSearches = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/popular`);
        const searches = response.data.popularSearches || [];
        setPopularSearches(searches.map((item: any) => ({
          type: 'popular',
          text: item.term,
          count: item.count,
        })));
      } catch (err) {
        console.error('Failed to load popular searches:', err);
      }
    };

    loadPopularSearches();
  }, []);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const loadRecentSearches = () => {
      try {
        const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        setRecentSearches(recent.map((text: string) => ({ type: 'recent' as const, text })));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    };
    
    loadRecentSearches();
  }, []);

  // Save recent searches to localStorage when they change
  useEffect(() => {
    if (recentSearches.length > 0) {
      try {
        localStorage.setItem(
          'recentSearches', 
          JSON.stringify(recentSearches.map(s => s.text).slice(0, 10))
        );
      } catch (error) {
        console.error('Error saving recent searches:', error);
      }
    }
  }, [recentSearches]);

  const search = useCallback(async (searchQuery: string, searchFilters: Partial<SearchFilters> = {}) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotalResults(0);
      setHasMore(false);
      return;
    }

    setQuery(searchQuery);
    setLoading(true);
    setError(null);
    setOffset(0);

    try {
      // Update recent searches in state
      setRecentSearches(prev => [
        { type: 'recent' as const, text: searchQuery },
        ...prev
          .filter(s => s.text.toLowerCase() !== searchQuery.toLowerCase())
          .slice(0, 9)
      ]);

      // Merge filters
      const mergedFilters = { ...filters, ...searchFilters };
      setFiltersState(mergedFilters);

      // Prepare request params
      const params: any = {
        q: searchQuery,
        limit,
        offset: 0,
        ...mergedFilters,
      };

      // Perform search
      const response = await axios.get(`${API_BASE_URL}`, { params });
      const { results: searchResults, total } = response.data;

      // Log the search for analytics
      try {
        await axios.post(`${API_BASE_URL}/log`, { term: searchQuery });
      } catch (logError) {
        console.error('Error logging search:', logError);
      }

      setResults(searchResults || []);
      setTotalResults(total || 0);
      setHasMore((searchResults?.length || 0) >= limit);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search. Please try again.');
      setResults([]);
      setTotalResults(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [filters, recentSearches]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    setLoading(true);
    const newOffset = offset + limit;

    try {
      const params: any = {
        q: query,
        limit,
        offset: newOffset,
        ...filters,
      };

      const response = await axios.get(`${API_BASE_URL}`, { params });
      const { results: moreResults } = response.data;

      setResults(prev => [...prev, ...(moreResults || [])]);
      setOffset(newOffset);
      setHasMore((moreResults?.length || 0) >= limit);
    } catch (err) {
      console.error('Error loading more results:', err);
      setError('Failed to load more results');
    } finally {
      setLoading(false);
    }
  }, [query, filters, hasMore, loading, offset]);

  const clearResults = useCallback(() => {
    setResults([]);
    setQuery('');
    setTotalResults(0);
    setHasMore(false);
    setError(null);
    setOffset(0);
  }, []);

  const setFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const getSuggestions = useCallback(async (query: string): Promise<SearchSuggestion[]> => {
    try {
      if (!query.trim()) {
        return [
          ...recentSearches,
          ...popularSearches.filter(p => !recentSearches.some(r => r.text === p.text))
        ].slice(0, 5);
      }
      
      const response = await axios.get(`${API_BASE_URL}/suggest`, { 
        params: { q: query, limit: 5 } 
      });
      
      return response.data.suggestions || [];
    } catch (err) {
      console.error('Error getting suggestions:', err);
      return [];
    }
  }, [recentSearches, popularSearches, API_BASE_URL]);

  return (
    <SearchContext.Provider
      value={{
        query,
        results,
        loading,
        error,
        search,
        clearResults,
        filters,
        setFilters,
        totalResults,
        hasMore,
        loadMore,
        recentSearches,
        popularSearches,
        getSuggestions,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export default SearchContext;
