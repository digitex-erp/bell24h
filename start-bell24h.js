/**
 * Bell24h Server Starter Script
 * 
 * This script starts the Bell24h application server
 * using the simplified server implementation.
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Bell24h application server...');

// Ensure execution permissions for the start script
const chmod = spawn('chmod', ['+x', 'start-app.sh']);
chmod.on('close', (code) => {
  if (code !== 0) {
    console.error('Failed to set execution permissions for start-app.sh');
    return;
  }
  
  // Execute the start script
  const startProcess = spawn('./start-app.sh', [], {
    stdio: 'inherit',
    env: { ...process.env, PORT: 8080 },
  });
  
  startProcess.on('error', (error) => {
    console.error('Error starting Bell24h server:', error.message);
  });
  
  // Log process ID for debugging purposes
  console.log(`Server process started with PID: ${startProcess.pid}`);
});
