import axios from 'axios';
import { SearchResult, SearchFilters, SearchSuggestion } from './types';

// Configuration for the AI search service
const AI_SEARCH_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_AI_SEARCH_API_URL || 'https://api.bell24h.com/search',
  apiKey: process.env.NEXT_PUBLIC_AI_SEARCH_API_KEY,
  defaultLimit: 10,
  defaultOffset: 0,
};

/**
 * AI Search Service for handling semantic and hybrid search functionality
 */
class AISearchService {
  /**
   * Perform a semantic search across products, suppliers, and RFQs
   */
  static async semanticSearch(
    query: string,
    filters: Partial<SearchFilters> = {},
    limit: number = AI_SEARCH_CONFIG.defaultLimit,
    offset: number = AI_SEARCH_CONFIG.defaultOffset
  ): Promise<SearchResult[]> {
    try {
      const response = await axios.post(
        `${AI_SEARCH_CONFIG.baseUrl}/semantic`,
        {
          query,
          filters,
          limit,
          offset,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AI_SEARCH_CONFIG.apiKey}`,
          },
        }
      );

      return response.data.results || [];
    } catch (error) {
      console.error('Error performing semantic search:', error);
      throw new Error('Failed to perform search. Please try again.');
    }
  }

  /**
   * Get search suggestions based on partial query
   */
  static async getSearchSuggestions(
    query: string,
    limit: number = 5
  ): Promise<SearchSuggestion[]> {
    try {
      // First check local storage for recent searches
      const recentSearches = this.getRecentSearches();
      const localMatches = recentSearches
        .filter(search => search.toLowerCase().includes(query.toLowerCase()))
        .slice(0, limit);

      if (localMatches.length >= limit) {
        return localMatches.map(text => ({ type: 'recent', text }));
      }

      // If not enough local matches, fetch from API
      const response = await axios.get(
        `${AI_SEARCH_CONFIG.baseUrl}/suggest`,
        {
          params: { query, limit: limit - localMatches.length },
          headers: {
            'Authorization': `Bearer ${AI_SEARCH_CONFIG.apiKey}`,
          },
        }
      );

      const apiSuggestions = (response.data.suggestions || []).map((suggestion: any) => ({
        type: 'suggestion' as const,
        text: suggestion.text,
        category: suggestion.category,
        score: suggestion.score,
      }));

      // Combine local and API results
      return [
        ...localMatches.map(text => ({ type: 'recent' as const, text })),
        ...apiSuggestions,
      ].slice(0, limit);
    } catch (error) {
      console.error('Error fetching search suggestions:', error);
      return [];
    }
  }

  /**
   * Get recent searches from local storage
   */
  static getRecentSearches(): string[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const recentSearches = localStorage.getItem('recentSearches');
      return recentSearches ? JSON.parse(recentSearches) : [];
    } catch (error) {
      console.error('Error retrieving recent searches:', error);
      return [];
    }
  }

  /**
   * Save a search query to recent searches
   */
  static saveRecentSearch(query: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      const recentSearches = this.getRecentSearches();
      const updatedSearches = [
        query,
        ...recentSearches.filter(search => search.toLowerCase() !== query.toLowerCase())
      ].slice(0, 10); // Keep only the 10 most recent searches
      
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  }

  /**
   * Get popular searches (could be cached or from API)
   */
  static async getPopularSearches(limit: number = 5): Promise<SearchSuggestion[]> {
    try {
      const response = await axios.get(
        `${AI_SEARCH_CONFIG.baseUrl}/popular`,
        {
          params: { limit },
          headers: {
            'Authorization': `Bearer ${AI_SEARCH_CONFIG.apiKey}`,
          },
        }
      );

      return (response.data.popularSearches || []).map((item: any) => ({
        type: 'popular',
        text: item.term,
        count: item.count,
      }));
    } catch (error) {
      console.error('Error fetching popular searches:', error);
      return [];
    }
  }
}

export default AISearchService;
