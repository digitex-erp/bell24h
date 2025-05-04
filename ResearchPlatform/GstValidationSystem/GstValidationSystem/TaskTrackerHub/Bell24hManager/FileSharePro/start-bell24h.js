// Bell24h Startup Script
// This script provides a compatible way to start the Bell24h application
// resolving type module conflicts and other startup issues

import { spawn } from 'child_process';

console.log('Starting Bell24h marketplace...');

// Function to log with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Start the server using our working server.js file
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

server.on('error', (error) => {
  log(`Error starting server: ${error.message}`);
  process.exit(1);
});

server.on('close', (code) => {
  log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  log('Received SIGINT signal. Shutting down...');
  server.kill('SIGINT');
});

process.on('SIGTERM', () => {
  log('Received SIGTERM signal. Shutting down...');
  server.kill('SIGTERM');
});