import express, { type Request, Response, NextFunction } from 'express';

import { log } from './server/utils';
import cookieParser from 'cookie-parser';
import { authenticate } from './server/middleware/auth';
import { ModelMonitorFactory } from './models/ai-explainer';
import * as path from 'path';
import * as tf from '@tensorflow/tfjs';
import rfqRoutes from './server/routes/rfq.routes'; // Import rfqRoutes

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Apply authentication middleware to all routes
app.use(authenticate);

// Request logger middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Intercept the json method to capture response data for logging
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // Log the request/response details after the response is finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + '…';
      }

      console.log(logLine);
    }
  });

  next();
});

// IIFE to allow async/await in top-level code
(async () => {
  // Initialize ModelMonitor
  const modelMonitor = ModelMonitorFactory.createMonitor('supplier-matching-model', {
    storagePath: path.join(process.cwd(), 'model-data'),
    logLevel: 'info'
  });
  await modelMonitor.initialize();

  // Register a dummy model version for testing
  const dummyModelPath = path.join(process.cwd(), 'model-data', 'dummy-tfjs-model'); // Placeholder path
  await modelMonitor.registerModelVersion({
    modelId: 'supplier-matching-model',
    version: '1.0.0',
    metrics: { accuracy: 0.85 },
    path: dummyModelPath,
    active: true,
    description: 'Dummy TensorFlow.js model for supplier matching',
    trainingData: {
      source: 'simulated',
      size: 1000,
      features: ['feature1', 'feature2'],
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString()
    }
  });
  await modelMonitor.activateModelVersion(modelMonitor.getActiveVersion()!.id);

    app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/rfqs', rfqRoutes(modelMonitor));

  // Global error handler middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({ message });
    log(`Server error: ${message}`, 'error');
    
    // Only rethrow in development for better debugging
    if (process.env.NODE_ENV !== 'production') {
      throw err;
    }
  });

  // 404 handler for API routes
  app.use('/api/*', (_req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
  });



  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen(
    {
      port,
      host: '0.0.0.0',
      reusePort: true,
    },
    () => {
      log(`API server running on port ${port}`, 'info');
    }
  );
})().catch(err => {
  log(`Failed to start server: ${err}`, 'error');
  process.exit(1);
});
