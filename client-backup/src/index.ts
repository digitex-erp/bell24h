/**
 * Bell24H Server Entry Point
 */
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { connectToDatabase } from './db';
import routes from '../server/routes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectToDatabase().then((connected) => {
  if (!connected) {
    console.error('Failed to connect to database. Exiting...');
    process.exit(1);
  }
});

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, '../public')));

// Apply routes
app.use(routes);

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start the server
const portNumber = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;

app.listen(portNumber, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${portNumber}`);
  console.log(`Voice RFQ Demo available at http://localhost:${portNumber}/voice-rfq.html`);
});

export default app;
