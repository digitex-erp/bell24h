import axios from 'axios';

interface GeminiGenerationParams {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  model?: 'gemini-1.5-pro' | 'gemini-1.5-flash';
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
    finishReason: string;
  }[];
  promptFeedback?: {
    blockReason?: string;
    safetyRatings?: {
      category: string;
      probability: string;
    }[];
  };
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
}

export class GeminiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    if (!process.env.GOOGLE_API_KEY) {
      throw new Error('GOOGLE_API_KEY environment variable is not set');
    }
    this.apiKey = process.env.GOOGLE_API_KEY;
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  async generateContent(params: GeminiGenerationParams) {
    const { prompt, maxTokens = 1024, temperature = 0.7, model = 'gemini-1.5-pro' } = params;
    
    try {
      const response = await axios.post<GeminiResponse>(
        `${this.baseUrl}/models/${model}:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            topP: 0.8,
            topK: 40
          }
        }
      );

      const data = response.data;
      
      // If we hit a safety filter or other error
      if (data.promptFeedback?.blockReason) {
        throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
      }
      
      // Extract the generated text
      const text = data.candidates[0]?.content.parts[0]?.text || '';
      
      return {
        text,
        model,
        usage: {
          promptTokens: data.usageMetadata?.promptTokenCount || 0,
          completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: data.usageMetadata?.totalTokenCount || 0
        }
      };
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      throw error;
    }
  }

  // Helper method to parse JSON from text responses
  async generateStructuredOutput<T>(prompt: string, model: 'gemini-1.5-pro' | 'gemini-1.5-flash' = 'gemini-1.5-pro'): Promise<T> {
    const jsonPrompt = `${prompt}\n\nPlease provide your response in valid JSON format only, with no additional text.`;
    
    const response = await this.generateContent({
      prompt: jsonPrompt,
      model,
      temperature: 0.2 // Lower temperature for more predictable JSON output
    });
    
    try {
      // Try to parse the response as JSON
      return JSON.parse(response.text.trim());
    } catch (error) {
      console.error('Failed to parse Gemini response as JSON:', error);
      throw new Error('The model response could not be parsed as JSON');
    }
  }
}

// Create a singleton instance
export const geminiClient = new GeminiClient();