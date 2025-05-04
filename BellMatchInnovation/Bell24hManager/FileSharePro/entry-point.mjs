#!/usr/bin/env node

// Bell24h Entry Point
// This file serves as the entry point for Bell24h and decides which server to start

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Log function with timestamp
function log(message) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

log('Bell24h Entry Point Starting...');

// Check which server to start
const useMinimalServer = true; // Set to true to use the minimal server

// Command to run
let command = 'node';
let args = [];

if (useMinimalServer) {
  log('Using minimal server for compatibility');
  args = ['minimal_server.js'];
} else {
  log('Using standard server with TypeScript');
  // Original dev command from package.json
  process.env.NODE_OPTIONS = '--loader ts-node/esm';
  args = ['server/index.ts'];
}

// Start the server
log(`Starting Bell24h with command: ${command} ${args.join(' ')}`);
const serverProcess = spawn(command, args, {
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

// Handle server process events
serverProcess.on('error', (error) => {
  log(`Error starting server: ${error.message}`);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  log(`Server process exited with code ${code}`);
  process.exit(code);
});

// Handle process termination
process.on('SIGINT', () => {
  log('Received SIGINT signal. Shutting down...');
  serverProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  log('Received SIGTERM signal. Shutting down...');
  serverProcess.kill('SIGTERM');
});