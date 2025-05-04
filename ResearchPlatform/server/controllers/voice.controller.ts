import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { VoiceService } from '../services/voice.service';

// Initialize the Voice service
const voiceService = new VoiceService();

export function registerVoiceRoutes(app: Express) {
  // Transcribe voice/audio
  app.post('/api/voice/transcribe', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        audioData: z.string().min(1), // Base64 encoded audio data
        language: z.string().optional().default('en')
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: 'Invalid request format', 
          errors: result.error.errors 
        });
      }
      
      const { audioData, language } = result.data;
      const transcription = await voiceService.transcribeAudio(audioData, language);
      
      return res.status(200).json(transcription);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      return res.status(500).json({ message: 'Failed to transcribe audio' });
    }
  });

  // Create RFQ from voice
  app.post('/api/voice/create-rfq', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        audioData: z.string().min(1), // Base64 encoded audio data
        userId: z.number().optional(),
        language: z.string().optional().default('en')
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: 'Invalid request format', 
          errors: result.error.errors 
        });
      }
      
      const { audioData, userId, language } = result.data;
      const rfq = await voiceService.createRfqFromVoice(audioData, userId, language);
      
      return res.status(200).json(rfq);
    } catch (error) {
      console.error('Error creating RFQ from voice:', error);
      return res.status(500).json({ message: 'Failed to create RFQ from voice' });
    }
  });

  // Process voice command
  app.post('/api/voice/process-command', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        audioData: z.string().min(1), // Base64 encoded audio data
        language: z.string().optional().default('en')
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: 'Invalid request format', 
          errors: result.error.errors 
        });
      }
      
      const { audioData, language } = result.data;
      const commandResult = await voiceService.processVoiceCommand(audioData, language);
      
      return res.status(200).json(commandResult);
    } catch (error) {
      console.error('Error processing voice command:', error);
      return res.status(500).json({ message: 'Failed to process voice command' });
    }
  });

  // Extract business entities from voice
  app.post('/api/voice/extract-entities', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        audioData: z.string().min(1), // Base64 encoded audio data
        language: z.string().optional().default('en')
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: 'Invalid request format', 
          errors: result.error.errors 
        });
      }
      
      const { audioData, language } = result.data;
      const entities = await voiceService.extractBusinessEntities(audioData, language);
      
      return res.status(200).json(entities);
    } catch (error) {
      console.error('Error extracting entities from voice:', error);
      return res.status(500).json({ message: 'Failed to extract entities from voice' });
    }
  });

  // Analyze sentiment of voice
  app.post('/api/voice/analyze-sentiment', async (req: Request, res: Response) => {
    try {
      // Validate request body
      const schema = z.object({
        audioData: z.string().min(1), // Base64 encoded audio data
        language: z.string().optional().default('en')
      });
      
      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          message: 'Invalid request format', 
          errors: result.error.errors 
        });
      }
      
      const { audioData, language } = result.data;
      const sentiment = await voiceService.analyzeSentiment(audioData, language);
      
      return res.status(200).json(sentiment);
    } catch (error) {
      console.error('Error analyzing sentiment from voice:', error);
      return res.status(500).json({ message: 'Failed to analyze sentiment from voice' });
    }
  });

  // Get supported languages
  app.get('/api/voice/supported-languages', async (req: Request, res: Response) => {
    try {
      const languages = await voiceService.getSupportedLanguages();
      return res.status(200).json(languages);
    } catch (error) {
      console.error('Error fetching supported languages:', error);
      return res.status(500).json({ message: 'Failed to fetch supported languages' });
    }
  });
}
