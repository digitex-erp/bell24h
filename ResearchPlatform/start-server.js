/**
 * Bell24h Unified Server Starter
 * 
 * This script intelligently starts the Bell24h application server
 * handling both ESM and CommonJS compatibility issues.
 * 
 * It attempts multiple startup methods in sequence, falling back
 * to compatibility mode if needed:
 * 1. Direct ESM import (Node.js >= 14 with ESM support)
 * 2. TypeScript execution via tsx (for development)
 * 3. esbuild-register execution (fallback for TS)
 * 4. Compatibility mode (CJS) as final fallback
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Set environment variables if not already set
process.env.PORT = process.env.PORT || '5000';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

console.log('===================================================');
console.log('   🚀 STARTING BELL24H APPLICATION SERVER 🚀      ');
console.log('===================================================');
console.log(`Environment: ${process.env.NODE_ENV}`);
console.log(`Port: ${process.env.PORT}`);

// Function to check if a module exists
function moduleExists(modulePath) {
  try {
    return fs.existsSync(modulePath);
  } catch (err) {
    return false;
  }
}

// Function to execute a command and handle errors
function executeCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    console.log(`Executing: ${command} ${args.join(' ')}`);
    
    const childProcess = spawn(command, args, {
      stdio: 'inherit',
      ...options
    });
    
    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });
    
    childProcess.on('error', (err) => {
      reject(err);
    });
  });
}

// Main function to start the server
async function startServer() {
  try {
    // Check for compatibility mode file
    if (moduleExists(path.join(__dirname, 'server/index.compat.js'))) {
      console.log('Detected compatibility mode file, using it for stable startup...');
      console.log('===================================================');
      
      // Use require for compatibility mode (CJS)
      require('./server/index.compat.js');
      return;
    }
    
    // Try starting with direct tsx execution first
    try {
      console.log('Attempting to start with tsx (TypeScript + ESM)...');
      await executeCommand('npx', ['tsx', 'server/index.ts']);
      return;
    } catch (error) {
      console.log('tsx execution failed, trying next method...');
      console.error(error.message);
    }
    
    // Try with esbuild-register
    try {
      console.log('Attempting to start with esbuild-register...');
      await executeCommand('node', ['-r', 'esbuild-register', 'server/index.ts']);
      return;
    } catch (error) {
      console.log('esbuild-register execution failed, trying next method...');
      console.error(error.message);
    }
    
    // Final fallback - try to start with direct node execution
    try {
      console.log('Attempting to start with direct node execution...');
      await executeCommand('node', ['server/index.js']);
      return;
    } catch (error) {
      console.log('All automatic startup methods failed.');
      console.error(error.message);
      
      // Check if the compatibility file exists, but we didn't start with it
      if (moduleExists(path.join(__dirname, 'server/index.compat.js'))) {
        console.log('Falling back to compatibility mode...');
        require('./server/index.compat.js');
        return;
      }
      
      console.error('No viable startup method found. Please check your configuration.');
      process.exit(1);
    }
  } catch (error) {
    console.error('Unexpected error during server startup:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});