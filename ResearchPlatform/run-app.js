// Custom startup wrapper to handle ESM/CJS compatibility issues
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting Bell24h application with compatibility layer...');

// Function to run a command and handle process management
function runCommand(command, args, options = {}) {
  console.log(`Running: ${command} ${args.join(' ')}`);
  
  const childProcess = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    ...options
  });

  childProcess.on('error', (error) => {
    console.error(`Error executing command: ${error.message}`);
    process.exit(1);
  });

  return new Promise((resolve, reject) => {
    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        console.error(`Command failed with exit code ${code}`);
        reject(new Error(`Command exited with code ${code}`));
      }
    });
  });
}

// Set environment variables to help with compatibility
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// First try to start with tsx (preferred for ESM compatibility)
runCommand('npx', ['tsx', 'server/index.ts'])
  .catch((error) => {
    console.log('TSX execution failed, trying fallback method...');
    console.log(error.message);
    
    // Fallback to esbuild-register
    return runCommand('node', ['-r', 'esbuild-register', 'server/index.ts']);
  })
  .catch((error) => {
    console.log('All startup methods failed.');
    console.error(error.message);
    process.exit(1);
  });