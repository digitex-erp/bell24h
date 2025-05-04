// Minimal Bell24h Server - ES Module Version
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Convert ESM-specific variables to CommonJS-like equivalents
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
app.use(express.json());
app.use(express.static('client'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Bell24h minimal server is running',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint for PDF generation
app.get('/api/test-pdf', (req, res) => {
  try {
    // Check if the test file exists
    const pdfPath = path.join(__dirname, 'test-rfq-analytics-report.pdf');
    
    if (fs.existsSync(pdfPath)) {
      res.json({
        status: 'success',
        message: 'PDF generation test has been run successfully',
        pdfExists: true,
        pdfPath: pdfPath
      });
    } else {
      res.json({
        status: 'warning',
        message: 'PDF file does not exist. Try running the PDF test first.',
        pdfExists: false
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Error checking PDF status',
      error: error.message
    });
  }
});

// Sample RFQ analytics data
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

// Simple HTML for testing
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bell24h Minimal Server</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #3b82f6; }
        .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; }
        button { background-color: #3b82f6; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; }
        button:hover { background-color: #2563eb; }
        pre { background-color: #f8fafc; padding: 12px; border-radius: 4px; overflow-x: auto; }
      </style>
    </head>
    <body>
      <h1>Bell24h Minimal Server</h1>
      <div class="card">
        <h2>Server Status</h2>
        <p>The minimal Bell24h server is running correctly.</p>
        <button id="checkHealth">Check Health</button>
        <div id="healthResult"></div>
      </div>
      
      <div class="card">
        <h2>PDF Export Test</h2>
        <p>Check if the PDF export functionality is working:</p>
        <button id="checkPdf">Check PDF Status</button>
        <div id="pdfResult"></div>
      </div>
      
      <div class="card">
        <h2>RFQ Analytics Data</h2>
        <button id="loadAnalytics">Load Analytics Data</button>
        <pre id="analyticsResult"></pre>
      </div>
      
      <script>
        // Health check
        document.getElementById('checkHealth').addEventListener('click', async () => {
          try {
            const response = await fetch('/api/health');
            const data = await response.json();
            document.getElementById('healthResult').innerHTML = 
              '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
          } catch (error) {
            document.getElementById('healthResult').innerHTML = 
              '<p style="color:red">Error: ' + error.message + '</p>';
          }
        });
        
        // PDF check
        document.getElementById('checkPdf').addEventListener('click', async () => {
          try {
            const response = await fetch('/api/test-pdf');
            const data = await response.json();
            document.getElementById('pdfResult').innerHTML = 
              '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
          } catch (error) {
            document.getElementById('pdfResult').innerHTML = 
              '<p style="color:red">Error: ' + error.message + '</p>';
          }
        });
        
        // Load analytics
        document.getElementById('loadAnalytics').addEventListener('click', async () => {
          try {
            const response = await fetch('/api/rfq-analytics');
            const data = await response.json();
            document.getElementById('analyticsResult').innerHTML = 
              JSON.stringify(data, null, 2);
          } catch (error) {
            document.getElementById('analyticsResult').innerHTML = 
              'Error: ' + error.message;
          }
        });
      </script>
    </body>
    </html>
  `);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Bell24h minimal server running on port ${PORT}`);
});