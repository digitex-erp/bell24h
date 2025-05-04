/**
 * Bell24h Application Preview Starter
 */

console.log(`${colors.blue}Starting Bell24h Preview Verification...${colors.reset}\n`);

// Health check endpoints
const endpoints = [
  { path: '/api/health', name: 'Core API' },
  { path: '/api/perplexity/status', name: 'Perplexity API' },
  { path: '/api/gst/status', name: 'GST Service' }
];

// Set required environment variables
if (!process.env.PORT) {
  process.env.PORT = '5000';
  console.log('Setting PORT to 5000');
}

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
  console.log('Setting NODE_ENV to development');
}

// Verify environment variables
const requiredEnvVars = [
  'PERPLEXITY_API_KEY',
  'GST_API_KEY',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);
if (missingEnvVars.length > 0) {
  console.warn('\nWarning: Missing environment variables:', missingEnvVars.join(', '));
  console.warn('Please set these in the Secrets tab\n');
}

console.log('Using compatibility mode for preview...');
require('./server/index.compat.js');

console.log(`
=================================================
Bell24h application preview is now available!
=================================================
Application is running on port ${process.env.PORT}
=================================================
`);

const http = require('http');
const fetch = require('node-fetch'); // Added node-fetch dependency
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m"
};

async function verifyEndpoints() {
  const endpoints = [
    { path: '/api/health', name: 'Health Check', method: 'GET' },
    { path: '/api/gst/validate', name: 'GST Validation', method: 'POST' },
    { path: '/api/stock/analysis', name: 'Stock Analysis', method: 'GET' },
    { path: '/api/industry/trends', name: 'Industry Trends', method: 'GET' },
    { path: '/api/perplexity/status', name: 'Perplexity API', method: 'GET' },
    { path: '/api/global-trade/insights', name: 'Trade Insights', method: 'GET' }
  ];

  console.log(`${colors.yellow}Starting preview verification...${colors.reset}\n`);

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(`http://0.0.0.0:5000${endpoint.path}`);
      console.log(`${colors.green}✓${colors.reset} ${endpoint.name} endpoint available`);
    } catch (err) {
      console.error(`${colors.red}✗${colors.reset} ${endpoint.name} endpoint error:`, err.message);
    }
  }
}

verifyEndpoints().catch(console.error);