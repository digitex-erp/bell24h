import { Express } from 'express';
import * as geminiController from './gemini.controller';

export function registerGeminiRoutes(app: Express) {
  // Generate text with Gemini
  app.post('/api/ai/gemini/generate', geminiController.generateText);
  
  // Industry trend analysis
  app.post('/api/ai/gemini/industry-trends', geminiController.analyzeIndustryTrends);
  
  // RFQ categorization
  app.post('/api/ai/gemini/categorize-rfq', geminiController.categorizeRfq);
  
  // Supplier matching
  app.post('/api/ai/gemini/match-suppliers', geminiController.matchSuppliers);
  
  // Business analysis
  app.post('/api/ai/gemini/business-analysis', geminiController.analyzeBusinessTrends);
}