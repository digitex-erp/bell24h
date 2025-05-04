/**
 * API Routes for Bell24h application
 */
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer } from 'http';
import { upload, processVoiceRfq, getVoiceRfqs, handleUploadError } from './lib/voiceRfq';

/**
 * Register all routes for the application
 */
export async function registerRoutes(app: express.Application) {
  // Health check route
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Voice RFQ routes
  app.post('/api/voice-rfq/process', upload.single('audio'), handleUploadError, processVoiceRfq);
  app.get('/api/voice-rfq', getVoiceRfqs);

  // Serve uploaded files
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  // API 404 handler for non-existent API routes
  app.all('/api/*', (req: Request, res: Response) => {
    return res.status(404).json({ error: 'API endpoint not found' });
  });

  // Catch-all route for front-end routing
  app.get('*', (req: Request, res: Response) => {
    // Serve main index.html for client-side routes
    res.sendFile(path.resolve(__dirname, '../public/index.html'));
  });

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message || 'Unknown error occurred' });
  });

  // Create HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}
