// Simplified Bell24h Server for Replit
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert ESM-specific variables to CommonJS-like equivalents
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Bell24h API is operational',
    timestamp: new Date().toISOString()
  });
});

// RFQ Analytics data endpoint
app.get('/api/rfq-analytics', (req, res) => {
  res.json({
    status: 'success',
    data: {
      summary: {
        total: 125,
        published: 87,
        draft: 22,
        awarded: 16
      },
      categories: [
        { name: 'Electronic Components', count: 45 },
        { name: 'Industrial Equipment', count: 32 },
        { name: 'Chemicals', count: 18 },
        { name: 'Metals & Alloys', count: 15 },
        { name: 'Packaging Materials', count: 15 }
      ],
      timeline: [
        { date: '2025-01', count: 12 },
        { date: '2025-02', count: 15 },
        { date: '2025-03', count: 22 },
        { date: '2025-04', count: 18 },
        { date: '2025-05', count: 25 },
        { date: '2025-06', count: 33 }
      ],
      quotes: {
        total: 412,
        avgResponseTime: 18, // hours
        avgQuotesPerRfq: 3.5
      }
    }
  });
});

// Serve frontend index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Bell24h simplified server running on port ${PORT}`);
});