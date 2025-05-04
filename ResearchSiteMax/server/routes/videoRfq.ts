import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { storage } from '../storage';
import { processVideoRFQ, generateWebViewVideo, extractVideoMetadata } from '../lib/videoProcessing';

// Configure multer for video uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadsDir = path.join(process.cwd(), 'uploads', 'videos');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    // Accept only video files
    const filetypes = /mp4|mov|avi|wmv|flv|mkv|webm/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only video files are allowed!'));
  }
});

/**
 * Process video RFQ and extract information
 */
export async function processVideoRfqHandler(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded" });
    }

    const videoPath = req.file.path;
    const applyFaceBlur = req.body.applyFaceBlur === 'true';
    const applyVoiceMask = req.body.applyVoiceMask === 'true';
    
    // Process the video and apply privacy features if requested
    const processedData = await processVideoRFQ(videoPath, applyFaceBlur, applyVoiceMask);
    
    // Generate a web-optimized version for preview
    const webViewPath = await generateWebViewVideo(processedData.videoPath);
    
    // Extract video metadata
    const metadata = await extractVideoMetadata(webViewPath);
    
    // Generate a reference number
    const referenceNumber = `RFQ-VID-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    
    // Create the complete preview data
    const previewData = {
      ...processedData.rfqData,
      referenceNumber,
      rfqType: 'video',
      mediaUrl: webViewPath.replace(process.cwd(), ''),
      thumbnailUrl: processedData.thumbnailPath.replace(process.cwd(), ''),
      duration: metadata.duration,
      resolution: `${metadata.width}x${metadata.height}`,
      fileSize: metadata.size,
      privacyFeatures: {
        faceBlur: applyFaceBlur,
        voiceMask: applyVoiceMask
      }
    };
    
    // Return the processed data for preview
    res.status(200).json(previewData);
  } catch (error) {
    console.error('Error processing video RFQ:', error);
    res.status(500).json({ 
      message: "Failed to process video RFQ", 
      error: (error as Error).message 
    });
  }
}

/**
 * Create RFQ from processed video data
 */
export async function createVideoRfq(req: Request, res: Response) {
  try {
    const rfqData = req.body;
    const userId = (req.user as any)?.id;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    // Validate required fields
    if (!rfqData.title || !rfqData.description || !rfqData.mediaUrl) {
      return res.status(400).json({ message: "Missing required RFQ fields" });
    }
    
    // Create the RFQ in storage
    const newRfq = await storage.createRfq({
      userId,
      title: rfqData.title,
      description: rfqData.description,
      category: rfqData.category || 'Other',
      quantity: rfqData.quantity || '1',
      deadline: new Date(rfqData.deadline || new Date().setDate(new Date().getDate() + 30)),
      specifications: rfqData.specifications || {},
      referenceNumber: rfqData.referenceNumber,
      rfqType: 'video',
      mediaUrl: rfqData.mediaUrl,
      status: 'open',
      matchSuccessRate: rfqData.matchSuccessRate || 80
    });
    
    // Add metadata about the video to blockchain storage for integrity verification
    // This step would typically involve storing a hash of the video file to verify it hasn't been altered
    
    res.status(201).json(newRfq);
  } catch (error) {
    console.error('Error creating video RFQ:', error);
    res.status(500).json({ 
      message: "Failed to create video RFQ", 
      error: (error as Error).message 
    });
  }
}

// Export middlewares for route configuration
export const videoUpload = upload.single('video');