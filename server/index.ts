import express, { Request, Response, NextFunction } from 'express';
// import cors from 'cors'; // Temporarily commented out
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { serveStatic, setupVite, log } from './vite';
import { registerRoutes } from './routes';

async function main() {
  // Create Express app
  const app = express();

  // Apply middleware
  // Temporarily commented out cors middleware
  // app.use(cors({
  //   origin: process.env.NODE_ENV === 'production' 
  //     ? 'https://bell24h.com' 
  //     : ['http://localhost:3000', 'http://127.0.0.1:3000', '*'],
  //   credentials: true
  // }));
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(cookieParser());

  // Debug logging for requests in development
  if (process.env.NODE_ENV !== 'production') {
    app.use((req, _, next) => {
      log(`${req.method} ${req.url}`);
      next();
    });
  }

  // Register API routes
  const server = await registerRoutes(app);

  // Set up Vite for development or serve static files for production
  await setupVite(app, server);

  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Server error:', err);
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(statusCode).json({ error: message });
  });

  // Start server
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });

  return server;
}

// Start the server
main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});