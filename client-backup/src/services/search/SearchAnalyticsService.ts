interface SearchAnalytics {
  query: string;
  timestamp: Date;
  resultCount: number;
  selectedResult?: {
    id: string;
    type: 'category' | 'subcategory' | 'rfq';
    title: string;
  };
}

interface SearchStats {
  totalSearches: number;
  averageResultsPerSearch: number;
  mostPopularSearches: Array<{ query: string; count: number }>;
  mostSelectedResults: Array<{ id: string; title: string; count: number }>;
  searchByType: {
    category: number;
    subcategory: number;
    rfq: number;
  };
}

class SearchAnalyticsService {
  private static instance: SearchAnalyticsService;
  private analytics: SearchAnalytics[] = [];

  private constructor() {
    this.loadAnalytics();
  }

  public static getInstance(): SearchAnalyticsService {
    if (!SearchAnalyticsService.instance) {
      SearchAnalyticsService.instance = new SearchAnalyticsService();
    }
    return SearchAnalyticsService.instance;
  }

  private loadAnalytics(): void {
    const savedAnalytics = localStorage.getItem('searchAnalytics');
    if (savedAnalytics) {
      this.analytics = JSON.parse(savedAnalytics);
    }
  }

  private saveAnalytics(): void {
    localStorage.setItem('searchAnalytics', JSON.stringify(this.analytics));
  }

  public trackSearch(analytics: SearchAnalytics): void {
    this.analytics.push(analytics);
    this.saveAnalytics();
  }

  public getSearchStats(): SearchStats {
    const stats: SearchStats = {
      totalSearches: this.analytics.length,
      averageResultsPerSearch: 0,
      mostPopularSearches: [],
      mostSelectedResults: [],
      searchByType: {
        category: 0,
        subcategory: 0,
        rfq: 0
      }
    };

    // Calculate average results per search
    const totalResults = this.analytics.reduce((sum, a) => sum + a.resultCount, 0);
    stats.averageResultsPerSearch = totalResults / stats.totalSearches;

    // Calculate most popular searches
    const searchCounts = this.analytics.reduce((counts, a) => {
      counts[a.query] = (counts[a.query] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    stats.mostPopularSearches = Object.entries(searchCounts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate most selected results
    const resultCounts = this.analytics
      .filter(a => a.selectedResult)
      .reduce((counts, a) => {
        const key = `${a.selectedResult!.id}-${a.selectedResult!.type}`;
        counts[key] = {
          id: a.selectedResult!.id,
          title: a.selectedResult!.title,
          count: (counts[key]?.count || 0) + 1
        };
        return counts;
      }, {} as Record<string, { id: string; title: string; count: number }>);

    stats.mostSelectedResults = Object.values(resultCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Calculate searches by type
    this.analytics
      .filter(a => a.selectedResult)
      .forEach(a => {
        stats.searchByType[a.selectedResult!.type]++;
      });

    return stats;
  }

  public getRecentSearches(limit: number = 10): SearchAnalytics[] {
    return [...this.analytics]
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  public getSearchSuggestions(query: string): string[] {
    const suggestions = new Set<string>();
    
    // Add exact matches
    this.analytics
      .filter(a => a.query.toLowerCase().includes(query.toLowerCase()))
      .forEach(a => suggestions.add(a.query));

    // Add partial matches from selected results
    this.analytics
      .filter(a => a.selectedResult?.title.toLowerCase().includes(query.toLowerCase()))
      .forEach(a => suggestions.add(a.selectedResult!.title));

    return Array.from(suggestions).slice(0, 10);
  }

  public clearAnalytics(): void {
    this.analytics = [];
    this.saveAnalytics();
  }
}

export const searchAnalyticsService = SearchAnalyticsService.getInstance(); 