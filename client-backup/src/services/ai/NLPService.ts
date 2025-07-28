import { RFQ, Review } from '../../types/rfq';
import { CategoryConfig } from '../../config/categories';

interface SentimentAnalysis {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  aspects: {
    [key: string]: {
      sentiment: number;
      mentions: number;
    };
  };
}

interface TextAnalysis {
  keywords: string[];
  categories: string[];
  entities: {
    type: string;
    text: string;
    confidence: number;
  }[];
  summary: string;
}

interface LanguageDetection {
  language: string;
  confidence: number;
}

export class NLPService {
  private readonly supportedLanguages = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar'];

  async analyzeRFQDescription(rfq: RFQ): Promise<TextAnalysis> {
    const description = rfq.description;
    
    // Extract keywords
    const keywords = await this.extractKeywords(description);
    
    // Identify categories
    const categories = await this.identifyCategories(description);
    
    // Extract entities
    const entities = await this.extractEntities(description);
    
    // Generate summary
    const summary = await this.generateSummary(description);

    return {
      keywords,
      categories,
      entities,
      summary
    };
  }

  async analyzeSentiment(text: string): Promise<SentimentAnalysis> {
    // Basic sentiment analysis
    const words = text.toLowerCase().split(/\s+/);
    const positiveWords = new Set(['good', 'great', 'excellent', 'amazing', 'perfect']);
    const negativeWords = new Set(['bad', 'poor', 'terrible', 'awful', 'horrible']);
    
    let positiveCount = 0;
    let negativeCount = 0;
    let aspects: { [key: string]: { sentiment: number; mentions: number } } = {};

    words.forEach(word => {
      if (positiveWords.has(word)) positiveCount++;
      if (negativeWords.has(word)) negativeCount++;
    });

    const totalWords = words.length;
    const score = (positiveCount - negativeCount) / totalWords;
    
    // Identify aspects
    const aspectKeywords = {
      quality: ['quality', 'standard', 'grade'],
      price: ['price', 'cost', 'value'],
      service: ['service', 'support', 'help'],
      delivery: ['delivery', 'shipping', 'time']
    };

    Object.entries(aspectKeywords).forEach(([aspect, keywords]) => {
      const mentions = keywords.filter(keyword => text.toLowerCase().includes(keyword)).length;
      if (mentions > 0) {
        aspects[aspect] = {
          sentiment: score,
          mentions
        };
      }
    });

    return {
      score,
      label: this.getSentimentLabel(score),
      aspects
    };
  }

  async generateResponse(rfq: RFQ, context: any): Promise<string> {
    const analysis = await this.analyzeRFQDescription(rfq);
    const template = this.selectResponseTemplate(analysis);
    
    return this.fillResponseTemplate(template, {
      ...rfq,
      ...analysis,
      ...context
    });
  }

  async detectLanguage(text: string): Promise<LanguageDetection> {
    // Simple language detection based on common words
    const languageScores = this.supportedLanguages.map(lang => ({
      language: lang,
      score: this.calculateLanguageScore(text, lang)
    }));

    const bestMatch = languageScores.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    return {
      language: bestMatch.language,
      confidence: bestMatch.score
    };
  }

  private async extractKeywords(text: string): Promise<string[]> {
    // Remove common words and extract meaningful terms
    const words = text.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to']);
    
    return words
      .filter(word => !stopWords.has(word))
      .filter(word => word.length > 3)
      .slice(0, 10);
  }

  private async identifyCategories(text: string): Promise<string[]> {
    const keywords = await this.extractKeywords(text);
    const categories: string[] = [];

    // Match keywords with category names
    Object.entries(CategoryConfig).forEach(([category, config]) => {
      if (keywords.some(keyword => 
        category.toLowerCase().includes(keyword) ||
        config.description.toLowerCase().includes(keyword)
      )) {
        categories.push(category);
      }
    });

    return categories;
  }

  private async extractEntities(text: string): Promise<{ type: string; text: string; confidence: number }[]> {
    // Basic entity extraction
    const entities: { type: string; text: string; confidence: number }[] = [];
    
    // Extract numbers
    const numbers = text.match(/\d+(\.\d+)?/g) || [];
    numbers.forEach(num => {
      entities.push({
        type: 'number',
        text: num,
        confidence: 0.9
      });
    });

    // Extract dates
    const dates = text.match(/\d{1,2}\/\d{1,2}\/\d{2,4}/g) || [];
    dates.forEach(date => {
      entities.push({
        type: 'date',
        text: date,
        confidence: 0.8
      });
    });

    return entities;
  }

  private async generateSummary(text: string): Promise<string> {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length <= 2) return text;
    
    // Simple extractive summarization
    return sentences.slice(0, 2).join('. ') + '.';
  }

  private getSentimentLabel(score: number): 'positive' | 'negative' | 'neutral' {
    if (score > 0.1) return 'positive';
    if (score < -0.1) return 'negative';
    return 'neutral';
  }

  private selectResponseTemplate(analysis: TextAnalysis): string {
    // Select appropriate response template based on analysis
    if (analysis.keywords.some(k => k.includes('urgent'))) {
      return 'urgent_response';
    }
    if (analysis.keywords.some(k => k.includes('quote'))) {
      return 'quote_request';
    }
    return 'standard_response';
  }

  private fillResponseTemplate(template: string, data: any): string {
    // Fill template with actual data
    const templates = {
      urgent_response: `Thank you for your urgent request. We understand the importance of your ${data.category} needs. Our team will review your requirements and respond within 24 hours.`,
      quote_request: `Thank you for your interest in our ${data.category} services. We will prepare a detailed quote based on your requirements and send it to you shortly.`,
      standard_response: `Thank you for your inquiry regarding ${data.category}. We have received your request and will process it according to your specifications.`
    };

    return templates[template] || templates.standard_response;
  }

  private calculateLanguageScore(text: string, language: string): number {
    // Simple language detection based on common words
    const commonWords = {
      en: ['the', 'and', 'is', 'in', 'to'],
      es: ['el', 'la', 'y', 'en', 'de'],
      fr: ['le', 'la', 'et', 'en', 'de'],
      de: ['der', 'die', 'das', 'und', 'in'],
      zh: ['的', '是', '在', '和', '了'],
      ja: ['の', 'は', 'に', 'を', 'が'],
      ar: ['ال', 'في', 'من', 'على', 'إلى']
    };

    const words = text.toLowerCase().split(/\s+/);
    const languageWords = commonWords[language] || [];
    
    const matches = words.filter(word => languageWords.includes(word)).length;
    return matches / words.length;
  }
}

export const nlpService = new NLPService(); 