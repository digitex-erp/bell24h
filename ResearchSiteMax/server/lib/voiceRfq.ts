/**
 * Voice RFQ Processing Library
 * Handles voice recording uploads, transcription, and AI analysis
 */
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import OpenAI from 'openai';
import { eq, desc } from 'drizzle-orm';
import { db } from '../../db';
import { rfqs } from '../../shared/schema';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Configure multer storage for audio files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads/audio');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.wav';
    cb(null, 'voice-rfq-' + uniqueSuffix + ext);
  }
});

// Configure upload middleware
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept audio files only
    const filetypes = /wav|mp3|m4a|ogg|webm/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Only audio file uploads are allowed.'));
    }
  }
});

// Handle upload errors middleware
export function handleUploadError(err: any, req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds the limit of 15MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
}

// Process voice RFQ handler
export async function processVoiceRfq(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioPath = req.file.path;
    const languagePreference = req.body.languagePreference || 'auto';

    // Transcribe audio
    console.log(`Transcribing audio file: ${audioPath}`);
    const transcription = await transcribeAudio(audioPath, languagePreference);
    
    // Extract RFQ details using AI
    console.log(`Analyzing transcript: ${transcription.transcript}`);
    const analyzedRfq = await analyzeRfqContent(transcription.transcript, transcription.translation);
    
    // Store RFQ in database (optional - for demo we just return the analysis)
    // const createdRfq = await saveRfqToDatabase(analyzedRfq, req.file.path, transcription.detectedLanguage);
    
    // Return results to client
    return res.status(200).json({
      success: true,
      transcript: transcription.transcript,
      translation: transcription.translation,
      detectedLanguage: transcription.detectedLanguage,
      analyzedRfq
    });
  } catch (error) {
    console.error('Error processing voice RFQ:', error);
    return res.status(500).json({
      error: 'Failed to process voice RFQ',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get voice RFQs handler
export async function getVoiceRfqs(req: Request, res: Response) {
  try {
    // Get user ID from query params for filtering (if provided)
    const userId = req.query.userId ? Number(req.query.userId) : null;
    
    // Get voice RFQs from database with optional user filter
    let rfqsResult = [];
    
    if (userId) {
      // Filter by user ID
      rfqsResult = await db.query.rfqs.findMany({
        where: (cols, { eq }) => eq(cols.userId, userId),
      });
    } else {
      // Get all RFQs ordered by creation date
      rfqsResult = await db.query.rfqs.findMany({
        orderBy: (cols, { desc }) => [desc(cols.createdAt)],
      });
    }
    
    return res.status(200).json({
      success: true,
      rfqs: rfqsResult
    });
  } catch (error) {
    console.error('Error fetching voice RFQs:', error);
    return res.status(500).json({
      error: 'Failed to fetch voice RFQs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper function to transcribe audio
async function transcribeAudio(audioPath: string, preferredLanguage: string) {
  try {
    const audioReadStream = fs.createReadStream(audioPath);
    
    // Determine language based on preference
    let language = preferredLanguage !== 'auto' ? preferredLanguage : undefined;
    
    // Transcribe audio using OpenAI's Whisper model
    const transcription = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
      language,
      response_format: "verbose_json"
    });
    
    // Get detected language
    const detectedLanguage = transcription.language || 'en';
    
    // If detected language is not English, translate the transcript
    let translation = null;
    if (detectedLanguage !== 'en') {
      console.log(`Translating from ${detectedLanguage} to English`);
      try {
        translation = await translateText(transcription.text, detectedLanguage);
      } catch (error) {
        console.warn('Translation error, using original text:', error);
        // If translation fails, we continue with the original text
      }
    }
    
    return {
      transcript: transcription.text,
      detectedLanguage,
      translation
    };
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to translate text
async function translateText(text: string, sourceLanguage: string): Promise<string> {
  try {
    // Use GPT for translation
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following ${sourceLanguage} text to English. Maintain all information, details, numbers, and structure. Only respond with the translation, nothing else.`
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.3,
    });
    
    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error translating text:', error);
    throw new Error(`Failed to translate text: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to analyze RFQ content using GPT
async function analyzeRfqContent(transcript: string, translation: string | null): Promise<any> {
  try {
    // Use the English translation if available, otherwise use the original transcript
    const textToAnalyze = translation || transcript;
    
    const prompt = `Extract RFQ (Request for Quote) details from the following text. The text is a voice recording from a business user seeking quotes:

${textToAnalyze}

Extract the following key details in JSON format:
1. title: A concise title for this RFQ
2. description: Detailed description of what's being requested
3. quantity: The quantity requested (as a number, if mentioned)
4. budget: Budget information or price range (if mentioned)
5. deadline: When they need it by (if mentioned)`;
    
    // Use GPT for analysis
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that helps extract structured information from RFQ text. Respond only with valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });
    
    // Parse the JSON response
    const jsonString = response.choices[0].message.content;
    if (!jsonString) {
      throw new Error('Empty response from AI analysis');
    }
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error analyzing RFQ content:', error);
    throw new Error(`Failed to analyze RFQ content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to save RFQ to database
async function saveRfqToDatabase(rfq: any, voiceUrl: string, originalLanguage: string) {
  try {
    // Insert RFQ into database
    const [createdRfq] = await db.insert(rfqs).values({
      title: rfq.title || 'Untitled RFQ',
      description: rfq.description,
      quantity: rfq.quantity ? Number(rfq.quantity) : null,
      budget: rfq.budget || null,
      deadline: null, // We'll handle deadline separately if needed
      status: 'pending',
      voiceUrl,
      originalLanguage,
      // If you have user authentication, add userId here
      // userId: req.user.id,
    }).returning();
    
    return createdRfq;
  } catch (error) {
    console.error('Error saving RFQ to database:', error);
    throw new Error(`Failed to save RFQ to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}