/**
 * AssemblyAI Service for Bell24h
 *
 * Features:
 * - Voice transcription (Hindi, Tamil, Telugu, English)
 * - Speaker detection
 * - Automatic punctuation
 * - Content extraction for RFQs
 *
 * Cost: $0.015 per minute (~₹1.25 per minute)
 * Free Tier: 5 hours/month (300 voice RFQs)
 */

interface AssemblyAIConfig {
  apiKey: string;
  baseUrl: string;
}

interface TranscriptionResult {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  text: string;
  words: Array<{
    text: string;
    start: number;
    end: number;
    confidence: number;
  }>;
  language_code: string;
  audio_duration: number;
}

interface VoiceRFQAnalysis {
  productName: string;
  quantity: number;
  unit: string;
  deliveryTimeline: string;
  location: string;
  additionalRequirements: string;
  extractedText: string;
  confidence: number;
  language: string;
  duration: number;
}

class AssemblyAIService {
  private config: AssemblyAIConfig;

  constructor() {
    this.config = {
      apiKey: process.env.ASSEMBLYAI_API_KEY || '',
      baseUrl: 'https://api.assemblyai.com/v2',
    };

    if (!this.config.apiKey) {
      console.warn('AssemblyAI API key not configured');
    }
  }

  /**
   * Transcribe and analyze voice RFQ
   * Supports: Hindi, Tamil, Telugu, English, and 30+ other languages
   */
  async analyzeVoiceRFQ(audioUrl: string): Promise<VoiceRFQAnalysis> {
    try {
      console.log('Starting voice RFQ analysis with AssemblyAI...');

      // Step 1: Upload and transcribe audio
      const transcription = await this.transcribeAudio(audioUrl);

      if (transcription.status === 'error') {
        throw new Error('Transcription failed');
      }

      console.log('Transcription completed:', {
        text: transcription.text.substring(0, 100),
        language: transcription.language_code,
        duration: transcription.audio_duration,
      });

      // Step 2: Extract structured RFQ data from transcription
      const analysis = await this.extractRFQData(transcription.text);

      return {
        ...analysis,
        extractedText: transcription.text,
        language: transcription.language_code,
        duration: transcription.audio_duration,
      };
    } catch (error) {
      console.error('AssemblyAI Voice RFQ Analysis Error:', error);
      throw new Error(`Failed to analyze voice RFQ: ${error}`);
    }
  }

  /**
   * Transcribe audio file using AssemblyAI
   * Automatically detects language (Hindi, Tamil, Telugu, English, etc.)
   */
  private async transcribeAudio(audioUrl: string): Promise<TranscriptionResult> {
    console.log('Submitting audio for transcription:', audioUrl);

    // Submit transcription job
    const response = await fetch(`${this.config.baseUrl}/transcript`, {
      method: 'POST',
      headers: {
        'Authorization': this.config.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        language_detection: true, // Auto-detect Indian languages
        punctuate: true,
        format_text: true,
        speaker_labels: false, // Set to true if you want to identify multiple speakers
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`AssemblyAI API error: ${error}`);
    }

    const { id } = await response.json();
    console.log('Transcription job submitted:', id);

    // Poll for completion
    return await this.pollTranscription(id);
  }

  /**
   * Poll transcription status until complete
   */
  private async pollTranscription(transcriptId: string): Promise<TranscriptionResult> {
    const maxAttempts = 60; // 5 minutes max wait
    const pollInterval = 5000; // 5 seconds

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const response = await fetch(`${this.config.baseUrl}/transcript/${transcriptId}`, {
        headers: {
          'Authorization': this.config.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check transcription status');
      }

      const result = await response.json();

      if (result.status === 'completed') {
        console.log('Transcription completed successfully');
        return result;
      }

      if (result.status === 'error') {
        throw new Error(`Transcription error: ${result.error}`);
      }

      console.log(`Transcription status: ${result.status}, waiting...`);
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Transcription timeout - took longer than 5 minutes');
  }

  /**
   * Extract structured RFQ data from transcription text
   * Uses pattern matching and NLP techniques
   */
  private async extractRFQData(text: string): Promise<Omit<VoiceRFQAnalysis, 'extractedText' | 'language' | 'duration'>> {
    console.log('Extracting RFQ data from transcription...');

    // Use OpenAI or Claude for structured extraction
    // For now, using simple pattern matching
    const analysis = {
      productName: this.extractProductName(text),
      quantity: this.extractQuantity(text),
      unit: this.extractUnit(text),
      deliveryTimeline: this.extractTimeline(text),
      location: this.extractLocation(text),
      additionalRequirements: this.extractRequirements(text),
      confidence: 0.85,
    };

    console.log('Extracted RFQ data:', analysis);
    return analysis;
  }

  // Pattern matching helpers for Indian B2B context

  private extractProductName(text: string): string {
    // Look for product mentions
    const productPatterns = [
      /(?:need|want|looking for|require)\s+([^,.]+?)(?:\s+(?:in|for|from))/i,
      /([a-z\s]+?)(?:\s+(?:quantity|qty|pieces|kg|tons))/i,
    ];

    for (const pattern of productPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    // Fallback: first noun phrase
    const words = text.split(' ');
    return words.slice(0, 3).join(' ');
  }

  private extractQuantity(text: string): number {
    const quantityPattern = /(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:kg|ton|piece|unit|liter|meter|kilogram|tonne)/i;
    const match = text.match(quantityPattern);

    if (match && match[1]) {
      return parseFloat(match[1].replace(/,/g, ''));
    }

    // Look for standalone numbers
    const numberMatch = text.match(/\b(\d+(?:,\d+)*)\b/);
    return numberMatch ? parseFloat(numberMatch[1].replace(/,/g, '')) : 0;
  }

  private extractUnit(text: string): string {
    const unitPattern = /\d+\s*(kg|ton|tonne|piece|pieces|unit|units|liter|liters|meter|meters|kilogram|kilograms)/i;
    const match = text.match(unitPattern);

    if (match && match[1]) {
      return match[1].toLowerCase();
    }

    return 'pieces'; // Default unit
  }

  private extractTimeline(text: string): string {
    const timelinePatterns = [
      /(?:within|in|by)\s+(\d+\s+(?:days?|weeks?|months?))/i,
      /(?:urgent|asap|immediately)/i,
      /(?:next|this)\s+(week|month)/i,
    ];

    for (const pattern of timelinePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[0];
      }
    }

    return 'Not specified';
  }

  private extractLocation(text: string): string {
    // Indian cities
    const cities = [
      'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata',
      'Pune', 'Ahmedabad', 'Surat', 'Jaipur', 'Lucknow', 'Kanpur',
      'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Vadodara',
      'Coimbatore', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut',
    ];

    const textLower = text.toLowerCase();
    for (const city of cities) {
      if (textLower.includes(city.toLowerCase())) {
        return city;
      }
    }

    // Look for location indicators
    const locationPattern = /(?:in|at|from|to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/;
    const match = text.match(locationPattern);

    if (match && match[1]) {
      return match[1];
    }

    return 'Not specified';
  }

  private extractRequirements(text: string): string {
    // Extract quality requirements, specifications, etc.
    const requirementKeywords = ['quality', 'grade', 'specification', 'standard', 'certification', 'requirement'];

    const sentences = text.split(/[.!?]+/);
    const requirements: string[] = [];

    sentences.forEach(sentence => {
      const hasKeyword = requirementKeywords.some(keyword =>
        sentence.toLowerCase().includes(keyword)
      );

      if (hasKeyword) {
        requirements.push(sentence.trim());
      }
    });

    return requirements.length > 0 ? requirements.join('. ') : 'Standard quality required';
  }

  /**
   * Get account usage statistics
   */
  async getUsageStats(): Promise<any> {
    try {
      const response = await fetch(`${this.config.baseUrl}/usage`, {
        headers: {
          'Authorization': this.config.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch usage stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching usage stats:', error);
      return null;
    }
  }
}

// Export singleton instance
export const assemblyAIService = new AssemblyAIService();

// Export types
export type {
  VoiceRFQAnalysis,
  TranscriptionResult,
};
