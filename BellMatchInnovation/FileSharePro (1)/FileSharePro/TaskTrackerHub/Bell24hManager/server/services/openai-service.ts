import fetch from 'node-fetch';
import fs from 'fs';
import FormData from 'form-data';
import { Request, Response } from 'express';
import { log } from '../vite';

/**
 * Service for OpenAI API integration
 * Handles Whisper speech-to-text and other OpenAI API features
 */
export class OpenAIService {
  private apiKey: string;
  private baseUrl: string = 'https://api.openai.com/v1';

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    
    if (!this.apiKey) {
      log('OpenAI API key is not set. Whisper speech-to-text will not be available.', 'openai-service');
    }
  }

  /**
   * Transcribe audio using OpenAI Whisper API
   * @param audioBuffer Audio file buffer
   * @param options Additional options for transcription
   * @returns Promise with transcription text
   */
  async transcribeAudio(audioBuffer: Buffer, options: { 
    language?: string, 
    prompt?: string,
    temperature?: number
  } = {}): Promise<{ text: string; }> {
    try {
      if (!this.apiKey) {
        throw new Error('OpenAI API key is not set');
      }

      const form = new FormData();
      form.append('file', audioBuffer, {
        filename: 'audio.webm',
        contentType: 'audio/webm',
      });
      form.append('model', 'whisper-1');
      
      if (options.language) {
        form.append('language', options.language);
      }
      
      if (options.prompt) {
        form.append('prompt', options.prompt);
      }
      
      if (options.temperature !== undefined) {
        form.append('temperature', options.temperature.toString());
      }

      const response = await fetch(`${this.baseUrl}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          ...form.getHeaders(),
        },
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json() as { text: string };
      return data;
    } catch (error) {
      log(`Error transcribing audio: ${error}`, 'openai-service');
      throw error;
    }
  }

  /**
   * Process a voice command with more advanced understanding
   * Uses GPT-4o for command understanding when transcription needs clarification
   * @param text The transcribed text from Whisper
   * @returns Enhanced understanding of the command
   */
  async processVoiceCommand(text: string): Promise<{ 
    command: string; 
    intent: string;
    confidence: number;
  }> {
    try {
      if (!this.apiKey) {
        return {
          command: text,
          intent: 'unknown',
          confidence: 0.5,
        };
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
          messages: [
            {
              role: 'system',
              content: `You are an AI assistant for a B2B procurement platform. 
              Your task is to understand voice commands related to RFQs (Request for Quotations),
              supplier management, and procurement processes. 
              Parse the command, identify the intent, and respond with a clean version of the command and intent category.
              Possible intent categories: rfq_creation, rfq_list, supplier_search, analytics, navigation, help, unknown.
              Format your response as JSON with these fields: command (cleaned up version), intent, confidence (0-1).`
            },
            {
              role: 'user',
              content: text
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json() as any;
      const result = JSON.parse(data.choices[0].message.content);
      
      return {
        command: result.command || text,
        intent: result.intent || 'unknown',
        confidence: result.confidence || 0.5,
      };
    } catch (error) {
      log(`Error processing voice command: ${error}`, 'openai-service');
      // Return original text if processing fails
      return {
        command: text,
        intent: 'unknown',
        confidence: 0.5,
      };
    }
  }
}

export const openAIService = new OpenAIService();