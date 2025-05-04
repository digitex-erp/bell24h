// Run Server Script for Bell24h
// This script handles starting the server directly

import { spawn } from 'child_process';

console.log('Starting Bell24h server...');

// Function to log with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

// Start the server
const server = spawn('node', ['server.js'], {
  stdio: 'inherit'
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