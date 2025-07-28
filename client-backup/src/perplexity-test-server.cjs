// CommonJS version of the Perplexity test server for Windows compatibility
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.TEST_PORT || 3001;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello Express app!');
});

// Add a test endpoint for your Perplexity API
app.get('/api/perplexity/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Perplexity API test endpoint',
    timestamp: new Date().toISOString()
  });
});

// Mock test routes since we can't import TypeScript files in CommonJS
app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Test routes are working (CommonJS version)',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test/perplexity', (req, res) => {
  res.json({
    status: 'success',
    entityType: 'test',
    modelType: 'mock',
    perplexityResult: {
      score: 0.78,
      complexity: 'Medium',
      readabilityIndex: 65,
      perplexityFactors: [
        { factor: 'Vocabulary', impact: 0.45 },
        { factor: 'Sentence Structure', impact: 0.32 },
        { factor: 'Technical Content', impact: 0.23 }
      ]
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test/trends', (req, res) => {
  res.json({
    status: 'success',
    trends: [
      { period: '2025-01', complexity: 0.82, industryAverage: 0.75 },
      { period: '2025-02', complexity: 0.79, industryAverage: 0.76 },
      { period: '2025-03', complexity: 0.83, industryAverage: 0.77 },
      { period: '2025-04', complexity: 0.80, industryAverage: 0.78 },
      { period: '2025-05', complexity: 0.78, industryAverage: 0.78 }
    ],
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Test server started on port ${PORT}`);
});
