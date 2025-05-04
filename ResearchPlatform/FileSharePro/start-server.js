/**
 * Bell24h Server Starter Script
 * 
 * This script provides a simplified way to start the Bell24h API server
 * without the complexity of the full application.
 */

import express from 'express';
import cors from 'express';
import { createServer } from 'http';
import { externalApis, initializeExternalApis, handleExternalApiRequest } from './server/external-apis-config.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORS
app.use(cors());

// API routes
async function setupRoutes() {
  console.log('Setting up API routes...');
  
  // Initialize external APIs
  const apiManager = await initializeExternalApis();
  
  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'success',
      message: 'Bell24h API is operational',
      timestamp: new Date().toISOString(),
      version: '1.0.0-simplified'
    });
  });
  
  // External API status endpoint
  app.get('/api/external/status', (req, res) => {
    const status = apiManager.getStatus();
    
    res.json({
      status: 'success',
      message: `${status.configured} of ${status.total} external APIs are configured`,
      apis: status.apis
    });
  });
  
  // Set up all external API routes
  for (const [key, api] of Object.entries(externalApis)) {
    api.endpoints.forEach(endpoint => {
      console.log(`Registering endpoint: ${endpoint}`);
      app.get(endpoint, (req, res) => handleExternalApiRequest(key, req, res));
    });
  }
  
  console.log('All routes registered successfully!');
}

// Start the server
async function startServer() {
  try {
    // Set up routes first
    await setupRoutes();
    
    // Then start the server
    const server = createServer(app);
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`
========================================
   Bell24h API Server (Simplified)
========================================
Server running at: http://localhost:${PORT}
API health check: http://localhost:${PORT}/api/health
External API status: http://localhost:${PORT}/api/external/status
========================================
      `);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\nShutting down server...');
      server.close(() => {
        console.log('Server closed.');
        process.exit(0);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start everything
startServer().catch(error => {
  console.error('Startup error:', error);
  process.exit(1);
});