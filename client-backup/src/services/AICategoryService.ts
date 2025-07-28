import axios from 'axios';

interface AICategorySuggestion {
  name: string;
  description: string;
  subcategories: string[];
}

export class AICategoryService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.perplexity.ai/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate new category suggestions using AI
   * @param industry The industry to generate categories for
   * @param count Number of suggestions to generate (1-10)
   */
  async generateCategorySuggestions(
    industry: string,
    count: number = 5
  ): Promise<AICategorySuggestion[]> {
    try {
      const prompt = `Generate ${count} B2B category suggestions for the ${industry} industry. ` +
        `For each category, provide a brief description and 3-5 relevant subcategories. ` +
        `Format the response as a JSON array of objects with 'name', 'description', and 'subcategories' fields.`;

      const response = await axios.post(
        this.baseUrl,
        {
          model: 'sonar-reasoning',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that generates relevant B2B categories and subcategories.'
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
          }
        }
      );

      // Extract and parse the AI's response
      const content = response.data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content in AI response');
      }

      // Parse the JSON response
      const suggestions = JSON.parse(content);
      if (!Array.isArray(suggestions)) {
        throw new Error('Invalid response format from AI');
      }

      return suggestions as AICategorySuggestion[];
    } catch (error) {
      console.error('Error generating category suggestions:', error);
      throw new Error('Failed to generate category suggestions');
    }
  }

  /**
   * Generate a complete category page content
   */
  async generateCategoryPageContent(category: string): Promise<string> {
    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: 'sonar-reasoning',
          messages: [
            {
              role: 'system',
              content: 'You are a content writer that creates engaging B2B category pages.'
            },
            {
              role: 'user',
              content: `Create a comprehensive B2B category page for '${category}'. Include an introduction, key benefits, and common use cases.`
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

      return response.data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating category page content:', error);
      throw new Error('Failed to generate category page content');
    }
  }
}

// Example usage:
/*
const aiService = new AICategoryService(process.env.PERPLEXITY_API_KEY!);

// Generate category suggestions
const suggestions = await aiService.generateCategorySuggestions('technology');
console.log('AI-generated suggestions:', suggestions);

// Generate category page content
const pageContent = await aiService.generateCategoryPageContent('AI & Machine Learning');
console.log('Generated page content:', pageContent);
*/
