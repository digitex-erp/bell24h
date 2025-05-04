import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response } from 'express';
import { processVoiceRFQ, analyzeRFQ } from '../services/openai';
import { rfqs, rfqsInsertSchema } from '../models/schema';
import { db } from '../db';

// Configure multer for audio uploads
const uploadDir = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'voice-rfq-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure upload filter
const multerFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['audio/webm', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mpeg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only audio files are allowed.'));
  }
};

// Create multer upload object
export const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

/**
 * Process voice RFQ submission
 */
export async function processVoiceSubmission(req: Request, res: Response) {
  try {
    // Validate file exists
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    // Get language preference from the request body (defaults to 'auto')
    const language = req.body?.language || 'auto';

    // Get file buffer
    const audioBuffer = fs.readFileSync(req.file.path);

    // Convert Buffer to file path for OpenAI processing
    const tempFilePath = path.join(uploadDir, `temp-${Date.now()}.webm`);
    fs.writeFileSync(tempFilePath, audioBuffer);
    
    // Process the voice with OpenAI
    const rfqData = await processVoiceRFQ(tempFilePath, language);
    
    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);

    // Add default fields for the RFQ
    const now = new Date();
    const referenceNumber = `RFQ-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

    // Analyze RFQ quality
    const analysis = await analyzeRFQ(rfqData);

    // Create complete RFQ data
    const completeRfqData = {
      ...rfqData,
      userId: req.user?.id || 1, // Default to 1 for demo
      referenceNumber,
      rfqType: 'voice',
      status: 'open',
      matchSuccessRate: analysis.matchSuccessRate || 80,
    };

    // Return the processed RFQ data for client preview
    res.json(completeRfqData);

    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting temporary audio file:', err);
    });
  } catch (error) {
    console.error('Error processing voice RFQ:', error);
    res.status(500).json({ error: 'Failed to process voice RFQ', details: (error as Error).message });
  }
}

/**
 * Create RFQ from voice processed data
 */
export async function createVoiceRfq(req: Request, res: Response) {
  try {
    const rfqData = req.body || {};
    
    // Validate required fields
    if (!rfqData.title || !rfqData.description) {
      return res.status(400).json({ error: 'Missing required RFQ fields' });
    }

    // Create the RFQ in database
    const [newRfq] = await db.insert(rfqs).values({
      userId: req.user?.id || 1, // Default to first user for demo
      title: rfqData.title,
      description: rfqData.description,
      category: rfqData.category || 'Other',
      quantity: rfqData.quantity || '1',
      deadline: new Date(rfqData.deadline || Date.now() + 30 * 24 * 60 * 60 * 1000),
      specifications: rfqData.specifications || {},
      referenceNumber: rfqData.referenceNumber || `RFQ-${Date.now()}`,
      rfqType: 'voice',
      status: 'open',
      detectedLanguage: rfqData.detectedLanguage,
      originalTranscript: rfqData.originalTranscript,
      matchSuccessRate: rfqData.matchSuccessRate || 80
    }).returning();

    res.status(201).json(newRfq);
  } catch (error) {
    console.error('Error creating voice RFQ:', error);
    res.status(500).json({ error: 'Failed to create RFQ', details: (error as Error).message });
  }
}