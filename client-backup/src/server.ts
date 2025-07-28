console.log('=== Bell24H.com server.ts is running and starting up... ===');

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

import 'dotenv/config'; // Added for environment variables
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';

import { validate } from './middleware/validateRequest'; // <-- Import middleware
import { createRfqSchema } from './api/rfqs/rfq.schema';        // <-- Import schema
import { registerRoutes } from './server/routes'; // Correct import for route registration
import { connectDatabase } from './database.ts'; // Assuming database connection is here
import { N8nApp } from './n8n-app.ts'; // Assuming n8n app definition is here

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

// Basic Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicPath = path.join(__dirname, '../public');
console.log('Serving static files from', publicPath);
app.use(express.static(publicPath));

// API routes will be registered by registerRoutes function after server starts

// Register RFQ webhook endpoint that can trigger n8n workflows
app.post(
  '/api/rfq/new',
  validate(createRfqSchema) as express.RequestHandler,
  async (req: express.Request, res: express.Response) => {
  const { rfqData } = req.body as unknown as { rfqData: any };

  try {
    // This would normally be handled by a n8n workflow
    // But here we're showing what would happen in the workflow
    // In a real implementation, you'd make a request to trigger the workflow
      const prisma = (req.app as any).locals.prisma;
    await prisma?.rfq.create({ data: rfqData });

    // Simulate sending an email
    console.log(`Would send email to ${rfqData.buyerEmail}`);

      // Broadcast via WebSocket
      io.emit('rfq-submitted', rfqData);

      res.status(200).json({ status: 'success', message: 'RFQ submitted and workflow triggered' });
    } catch (error) {
      console.error('Error processing RFQ:', error);
      res.status(500).json({ status: 'error', message: 'Failed to process RFQ' });
    }
  });

  // Register the root route
  console.log('Registering root route...');
  app.get('/', (_req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
  });

  // Connect to database
  connectDatabase();

// Initialize n8n (Option B: Integrated approach)
const initN8n = async () => {
    try {
      const n8n = new N8nApp({
        express: app,
        endpoint: '/api/workflow',
        credentialsOverwrite: {
          basicAuth: {
            active: process.env.N8N_BASIC_AUTH_ACTIVE === 'true',
            user: process.env.N8N_BASIC_AUTH_USER || 'admin',
            password: process.env.N8N_BASIC_AUTH_PASSWORD || 'your-secure-password'
          }
        }
      });

      await n8n.init();
      console.log('✅ n8n workflow engine initialized successfully');
      console.log('n8n Username:', process.env.N8N_USERNAME);
      console.log('n8n Port:', process.env.N8N_PORT);
    } catch (error) {
      console.error('❌ Failed to initialize n8n:', error);
    }
  };

  // Start the server
  const PORT = process.env.PORT || 3000;
  console.log('About to call httpServer.listen...');
  httpServer.listen(PORT, async () => {
    console.log('============================================================');
    console.log(`🚀 SERVER SUCCESSFULLY STARTED on port ${PORT}`);
    console.log(`🔗 Access: http://localhost:${PORT}`);
    console.log(`🔗 n8n Dashboard: http://localhost:${PORT}/api/workflow`);
    console.log('============================================================');

    // Initialize n8n after server starts
    await initN8n();
    // Register API routes after server and n8n start
    await registerRoutes(app);
  });

  // WebSocket connection handler
  io.on('connection', (socket) => {
    console.log('New WebSocket connection established');

    socket.on('join-room', (roomId) => {
      socket.join(roomId);
      console.log(`Socket joined room: ${roomId}`);
    });

    socket.on('leave-room', (roomId) => {
      socket.leave(roomId);
      console.log(`Socket left room: ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket connection closed');
    });
  });

  // Helper function to broadcast WebSocket messages (used by n8n workflows)
  export const broadcastWebSocketMessage = (event: string, data: any) => {
    io.emit(event, data);
    console.log(`Broadcasted WebSocket message: ${event}`);
  };

  export { io }; // Export io for use in other modules