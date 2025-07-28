import { jest } from '@jest/globals';
import { PerplexityClient } from '../src/lib/perplexity.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

describe('PerplexityClient', () => {
  let client: PerplexityClient;
  
  beforeAll(() => {
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error('PERPLEXITY_API_KEY is not set in environment variables');
    }
    
    client = new PerplexityClient({
      apiKey: process.env.PERPLEXITY_API_KEY
    });
  });

  describe('testConnection', () => {
    it('should connect to the API and return available models', async () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      const result = await client.testConnection();
      
      expect(consoleSpy).toHaveBeenCalledWith('Testing Perplexity API connection...');
      expect(consoleSpy).toHaveBeenCalledWith('Connection successful!');
      expect(Array.isArray(result.data)).toBe(true);
      
      // Verify model structure
      if (result.data.length > 0) {
        const model = result.data[0];
        expect(model).toHaveProperty('id');
        expect(model).toHaveProperty('object');
        expect(model).toHaveProperty('created');
        expect(model).toHaveProperty('owned_by');
      }
      
      consoleSpy.mockRestore();
    }, 10000); // Increased timeout for API call
    
    it('should handle API errors', async () => {
      const invalidClient = new PerplexityClient({
        apiKey: 'invalid-api-key'
      });
      
      await expect(invalidClient.testConnection()).rejects.toThrow();
    });
  });
});
