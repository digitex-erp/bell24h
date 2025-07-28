import axios from 'axios';
import { Category, Subcategory } from '../types/categories';

export interface SearchResult {
  type: 'category' | 'subcategory' | 'supplier' | 'product';
  id: string;
  name: string;
  description: string;
  relevance: number;
  metadata: Record<string, any>;
}

export interface SearchOptions {
  filters?: {
    category?: string;
    minRating?: number;
    location?: string;
    priceRange?: [number, number];
  };
  limit?: number;
  offset?: number;
}

export class AISearchService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.perplexity.ai/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Perform a semantic search across categories, subcategories, suppliers, and products
   */
  async semanticSearch(
    query: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    try {
      const prompt = this.buildSearchPrompt(query, options);
      
      const response = await axios.post(
        this.baseUrl,
        {
          model: 'sonar-reasoning',
          messages: [
            {
              role: 'system',
              content: `You are an advanced B2B search assistant for Bell24H.com. 
              Your task is to understand the user's search intent and return relevant 
              results from our marketplace.`
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 seconds timeout
        }
      );

      // Parse the response and map to SearchResult format
      return this.parseAISearchResponse(response.data, query, options);
    } catch (error) {
      console.error('Error performing semantic search:', error);
      throw new Error('Failed to perform search. Please try again.');
    }
  }

  /**
   * Get search suggestions based on partial query
   */
  async getSearchSuggestions(query: string): Promise<string[]> {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: 'sonar-reasoning',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that generates search query suggestions.'
            },
            {
              role: 'user',
              content: `Generate 5 search suggestions for the query: "${query}". 
              Return only a JSON array of strings.`
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Parse and return suggestions
      return JSON.parse(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  private buildSearchPrompt(query: string, options: SearchOptions): string {
    let prompt = `Search query: "${query}"\n\n`;
    
    // Add filters to prompt
    if (options.filters) {
      prompt += 'Filters:\n';
      if (options.filters.category) {
        prompt += `- Category: ${options.filters.category}\n`;
      }
      if (options.filters.minRating) {
        prompt += `- Minimum Rating: ${options.filters.minRating}+\n`;
      }
      if (options.filters.location) {
        prompt += `- Location: ${options.filters.location}\n`;
      }
      if (options.filters.priceRange) {
        prompt += `- Price Range: $${options.filters.priceRange[0]} - $${options.filters.priceRange[1]}\n`;
      }
    }

    prompt += `\nReturn the results in the following JSON format:
    [
      {
        "type": "category|subcategory|supplier|product",
        "id": "unique-identifier",
        "name": "Result name",
        "description": "Detailed description",
        "relevance": 0.95,
        "metadata": {}
      }
    ]`;

    return prompt;
  }

  private parseAISearchResponse(response: any, query: string, options: SearchOptions): SearchResult[] {
    try {
      const content = response.choices[0]?.message?.content;
      if (!content) return [];
      
      // Parse the JSON response from the AI
      const results = JSON.parse(content);
      
      // Validate and normalize the results
      return results.map((result: any) => ({
        type: this.validateType(result.type),
        id: result.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
        name: result.name || 'Unnamed',
        description: result.description || '',
        relevance: Math.min(1, Math.max(0, result.relevance || 0.5)),
        metadata: result.metadata || {}
      }));
    } catch (error) {
      console.error('Error parsing AI search response:', error);
      return [];
    }
  }

  private validateType(type: string): 'category' | 'subcategory' | 'supplier' | 'product' {
    const validTypes = ['category', 'subcategory', 'supplier', 'product'];
    return validTypes.includes(type) ? type as any : 'product';
  }
}

// Export a singleton instance
export const aiSearchService = new AISearchService(process.env.REACT_APP_PERPLEXITY_API_KEY || '');
