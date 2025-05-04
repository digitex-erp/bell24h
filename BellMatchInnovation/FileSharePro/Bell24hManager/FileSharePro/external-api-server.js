/**
 * Standalone External API Server for Bell24h
 *
 * This file provides a standalone server that implements the external API
 * integration functionality and can be run independently of the main application.
 * Later, the same code patterns can be integrated into the main application.
 */

import express from 'express';
import cors from 'cors';
import http from 'http';

// Initialize the app
const app = express();
const PORT = process.env.PORT || 3030; // Using a different port to avoid conflicts

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// External API configurations
const externalApis = {
  kotak: {
    name: "Kotak Securities",
    baseUrl: "https://api.kotaksecurities.com/",
    isConfigured: () => {
      return !!(process.env.KOTAK_SECURITIES_API_KEY && process.env.KOTAK_SECURITIES_API_SECRET);
    },
    requiredEnvVars: ["KOTAK_SECURITIES_API_KEY", "KOTAK_SECURITIES_API_SECRET"],
    endpoints: ["/kotak/market-data", "/kotak/orders"]
  },
  
  kredx: {
    name: "KredX",
    baseUrl: "https://api.kredx.com/",
    isConfigured: () => {
      return !!(process.env.KREDX_API_KEY && process.env.KREDX_API_SECRET);
    },
    requiredEnvVars: ["KREDX_API_KEY", "KREDX_API_SECRET"],
    endpoints: ["/kredx/invoices", "/kredx/vendors"]
  },
  
  razorpayx: {
    name: "RazorpayX",
    baseUrl: "https://api.razorpay.com/v1/",
    isConfigured: () => {
      return !!(process.env.RAZORPAYX_API_KEY && process.env.RAZORPAYX_API_SECRET);
    },
    requiredEnvVars: ["RAZORPAYX_API_KEY", "RAZORPAYX_API_SECRET"],
    endpoints: ["/razorpayx/contacts", "/razorpayx/payouts"]
  },
  
  fsat: {
    name: "FSAT",
    baseUrl: process.env.FSAT_BASE_URL || "https://api.fsat.com/v1/",
    isConfigured: () => {
      return !!(process.env.FSAT_API_KEY && process.env.FSAT_API_SECRET && process.env.FSAT_BASE_URL);
    },
    requiredEnvVars: ["FSAT_API_KEY", "FSAT_API_SECRET", "FSAT_BASE_URL"],
    endpoints: ["/fsat/services", "/fsat/orders"]
  }
};

// Common handler for API requests
function handleExternalApiRequest(apiKey, req, res) {
  const api = externalApis[apiKey];
  
  if (!api) {
    return res.status(404).json({
      status: "error",
      message: `API '${apiKey}' not found`
    });
  }
  
  if (!api.isConfigured()) {
    return res.status(503).json({
      status: "error",
      message: `${api.name} API is not configured. Missing required environment variables.`,
      required: api.requiredEnvVars
    });
  }
  
  try {
    // Here we'd implement specific API client logic
    // For now, return a placeholder response
    return res.json({
      status: "success",
      api: api.name,
      message: "The API is configured correctly",
      note: "This is a placeholder response. Actual API integration will be implemented in later phases."
    });
  } catch (error) {
    console.error(`Error processing ${api.name} request:`, error);
    return res.status(500).json({
      status: "error",
      message: `Error processing ${api.name} request`,
      error: error.message
    });
  }
}

// Register routes
console.log('Setting up API routes...');

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Bell24h External API Server is operational',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Status endpoint
app.get('/status', (req, res) => {
  const status = Object.entries(externalApis).map(([key, api]) => {
    return {
      name: api.name,
      configured: api.isConfigured(),
      endpoints: api.endpoints.map(e => `/api${e}`)
    };
  });
  
  const configuredCount = status.filter(api => api.configured).length;
  
  res.json({
    status: 'success',
    message: `${configuredCount} of ${status.length} external APIs are configured`,
    apis: status
  });
});

// Register API endpoints
Object.entries(externalApis).forEach(([key, api]) => {
  api.endpoints.forEach(endpoint => {
    const fullPath = `/api${endpoint}`;
    console.log(`Registering endpoint: ${fullPath}`);
    app.get(fullPath, (req, res) => handleExternalApiRequest(key, req, res));
  });
});

// Check environment variables
function logEnvironmentStatus() {
  let allConfigured = true;
  
  console.log('External API Configuration Status:');
  console.log('==================================');
  
  Object.entries(externalApis).forEach(([key, api]) => {
    const configured = api.isConfigured();
    console.log(`${api.name}: ${configured ? 'Configured ✓' : 'Not configured ✗'}`);
    
    if (!configured) {
      allConfigured = false;
      console.log('  Missing environment variables:');
      api.requiredEnvVars.forEach(varName => {
        if (!process.env[varName]) {
          console.log(`    - ${varName}`);
        }
      });
    }
  });
  
  console.log('==================================');
  console.log(`${allConfigured ? 'All' : 'Not all'} external APIs are configured.`);
  console.log('==================================');
}

// Start the server
const server = http.createServer(app);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
========================================
   Bell24h External API Server
========================================
Server running at: http://localhost:${PORT}
Health check: http://localhost:${PORT}/health
API Status: http://localhost:${PORT}/status

API Endpoints:
${Object.entries(externalApis).flatMap(([key, api]) => 
  api.endpoints.map(e => `- http://localhost:${PORT}/api${e}`)
).join('\n')}
========================================
  `);
  
  logEnvironmentStatus();
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});