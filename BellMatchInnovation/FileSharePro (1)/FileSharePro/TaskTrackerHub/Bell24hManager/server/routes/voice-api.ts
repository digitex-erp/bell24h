import express from 'express';
import { storage } from '../storage';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import crypto from 'crypto';

const router = express.Router();

// Helper function to generate a random ID
function generateId() {
  return crypto.randomBytes(16).toString('hex');
}

// Configure file upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Endpoint to transcribe audio using OpenAI's Whisper API
 * POST /api/whisper/transcribe
 */
router.post('/api/whisper/transcribe', express.raw({ type: 'audio/*', limit: '10mb' }), async (req, res) => {
  try {
    // Handle JSON content type with base64 data
    if (req.is('application/json')) {
      const { audio, language } = req.body;
      
      if (!audio) {
        return res.status(400).json({ error: 'No audio data provided in JSON body' });
      }
      
      // Process base64 data
      const base64Data = audio.split(',')[1] || audio; // Handle both "data:audio/wav;base64,..." and raw base64
      const tempFilePath = path.join(UPLOAD_DIR, `${generateId()}.wav`);
      
      // Write base64 data to temporary file
      fs.writeFileSync(tempFilePath, Buffer.from(base64Data, 'base64'));
      
      // Process with Whisper API
      const transcription = await transcribeWithWhisper(tempFilePath, language || 'en');
      
      // Clean up temporary file
      fs.unlinkSync(tempFilePath);
      
      return res.json({ transcription });
    }
    
    // Handle raw audio binary data
    if (Buffer.isBuffer(req.body)) {
      const language = req.query.language as string || 'en';
      const tempFilePath = path.join(UPLOAD_DIR, `${generateId()}.wav`);
      
      // Write audio data to temporary file
      fs.writeFileSync(tempFilePath, req.body);
      
      // Process with Whisper API
      const transcription = await transcribeWithWhisper(tempFilePath, language);
      
      // Clean up temporary file
      fs.unlinkSync(tempFilePath);
      
      return res.json({ transcription });
    }
    
    return res.status(400).json({ error: 'Unsupported request format' });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

/**
 * Transcribe audio file using OpenAI's Whisper API
 * @param filePath Path to audio file
 * @param language Language code (e.g., 'en', 'hi')
 * @returns Transcription text
 */
async function transcribeWithWhisper(filePath: string, language: string = 'en'): Promise<string> {
  try {
    // Check if API key is set
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    
    // Create form data for API request
    const formData = new FormData();
    // Read file and append to form data
    const fileData = fs.readFileSync(filePath);
    formData.append('file', fileData, {
      filename: path.basename(filePath),
      contentType: 'audio/wav'
    });
    formData.append('model', 'whisper-1');
    
    if (language) {
      formData.append('language', language);
    }
    
    // API request to OpenAI
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders()
      }
    });
    
    return response.data.text;
  } catch (error) {
    console.error('Whisper API error:', error);
    throw new Error('Failed to transcribe with Whisper API');
  }
}

/**
 * Endpoint to enhance voice commands using OpenAI GPT-4o
 * POST /api/voice/enhance
 */
router.post('/api/voice/enhance', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Check if API key is set
    if (!process.env.OPENAI_API_KEY) {
      // Fall back to simple intent detection if no API key
      return res.json({
        command: text.trim(),
        intent: detectSimpleIntent(text),
        confidence: 0.7
      });
    }
    
    // Use GPT-4o to enhance command understanding
    const enhancedCommand = await enhanceWithGPT(text);
    res.json(enhancedCommand);
  } catch (error) {
    console.error('Error enhancing voice command:', error);
    res.status(500).json({ error: 'Failed to enhance voice command' });
  }
});

/**
 * Enhance voice command understanding with GPT-4o
 * @param text Original text from speech recognition
 * @returns Enhanced command with intent and confidence
 */
async function enhanceWithGPT(text: string): Promise<{ command: string; intent: string; confidence: number }> {
  try {
    // Check if API key is set
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is not set');
    }
    
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: 'system',
            content: `You are a B2B procurement assistant that helps clarify voice commands. 
            You receive text from speech recognition which may have errors or be ambiguous.
            Your job is to interpret what the user most likely meant in the context of procurement,
            RFQs (Request for Quotations), supplier management, and B2B trading.
            
            Respond with JSON in the following format:
            {
              "command": "The cleaned up, grammatically correct command",
              "intent": "One of: create_rfq, list_rfqs, view_rfq, find_suppliers, compare_suppliers, analytics, help, navigation, other",
              "confidence": A number between 0 and 1 representing your confidence in this interpretation
            }`
          },
          {
            role: 'user',
            content: text
          }
        ],
        response_format: { type: 'json_object' }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const result = JSON.parse(response.data.choices[0].message.content);
    
    return {
      command: result.command || text,
      intent: result.intent || 'other',
      confidence: result.confidence || 0.5
    };
  } catch (error) {
    console.error('GPT API error:', error);
    // Fall back to simple intent detection
    return {
      command: text.trim(),
      intent: detectSimpleIntent(text),
      confidence: 0.6
    };
  }
}

/**
 * Simple intent detection for voice commands
 * @param text Original text from speech recognition
 * @returns Intent category
 */
function detectSimpleIntent(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (
    lowerText.includes('create rfq') || 
    lowerText.includes('new rfq') || 
    lowerText.includes('make rfq') ||
    lowerText.includes('start rfq')
  ) {
    return 'create_rfq';
  } else if (
    lowerText.includes('list rfq') || 
    lowerText.includes('show rfq') || 
    lowerText.includes('view rfq') ||
    lowerText.includes('my rfq')
  ) {
    return 'list_rfqs';
  } else if (
    lowerText.includes('find supplier') || 
    lowerText.includes('search supplier') || 
    lowerText.includes('look for supplier')
  ) {
    return 'find_suppliers';
  } else if (
    lowerText.includes('compare') || 
    lowerText.includes('evaluation')
  ) {
    return 'compare_suppliers';
  } else if (
    lowerText.includes('analytics') || 
    lowerText.includes('report') || 
    lowerText.includes('metrics') ||
    lowerText.includes('dashboard')
  ) {
    return 'analytics';
  } else if (
    lowerText.includes('help') || 
    lowerText.includes('assistant') || 
    lowerText.includes('what can you do')
  ) {
    return 'help';
  } else if (
    lowerText.includes('home') || 
    lowerText.includes('dashboard') || 
    lowerText.includes('go to')
  ) {
    return 'navigation';
  }
  
  return 'other';
}

// Endpoint to test if the voice API routes are working
router.get('/api/voice/status', (req, res) => {
  res.json({
    status: 'operational',
    features: {
      transcription: !!process.env.OPENAI_API_KEY,
      enhancement: !!process.env.OPENAI_API_KEY
    }
  });
});

export default router;