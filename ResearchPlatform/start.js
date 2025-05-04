// Simple starter script to run the application
const { execSync } = require('child_process');

console.log('Starting Bell24h application...');

try {
  // Skip database checks for now and just start the server
  console.log('Starting server...');
  execSync('npx tsx server/index.ts', { stdio: 'inherit' });
} catch (error) {
  console.error('Error starting application:', error.message);
  process.exit(1);
}