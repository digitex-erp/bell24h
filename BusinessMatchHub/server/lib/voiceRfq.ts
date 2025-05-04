import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { processVoiceRFQ, analyzeRFQ } from './openai';
import { storage } from '../storage';

// Configure multer for audio uploads
const uploadDir = path.join(__dirname, '../../uploads');

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
const multerFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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

    // Get file buffer
    const audioBuffer = fs.readFileSync(req.file.path);

    // Process the voice with OpenAI
    const rfqData = await processVoiceRFQ(audioBuffer);

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
    const rfqData = req.body;
    
    // Validate required fields
    if (!rfqData.title || !rfqData.description) {
      return res.status(400).json({ error: 'Missing required RFQ fields' });
    }

    // Create the RFQ in storage
    const newRfq = await storage.createRfq({
      ...rfqData,
      userId: req.user?.id || 1, // Default to first user for demo
      rfqType: 'voice'
    });

    res.status(201).json(newRfq);
  } catch (error) {
    console.error('Error creating voice RFQ:', error);
    res.status(500).json({ error: 'Failed to create RFQ', details: (error as Error).message });
  }
}