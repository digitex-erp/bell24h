/**
 * Bell24h Application Preview Script
 * 
 * This script starts the Bell24h application in preview mode.
 * It uses compatibility mode for reliable preview in the Replit environment.
 */

console.log('===================================================');
console.log('   🚀 STARTING BELL24H APPLICATION PREVIEW 🚀     ');
console.log('===================================================');
console.log('Preview will start on port 5000');
console.log('Click the Webview button when server is ready');
console.log('===================================================');

// Set environment variables for preview mode
process.env.PORT = '5000';
process.env.NODE_ENV = 'development';
process.env.PREVIEW_MODE = 'true';

// Start the application in compatibility mode
try {
  // Simply require the compatibility mode server
  require('./server/index.compat.js');
  
  console.log('Preview server started successfully!');
  console.log('You can now view the application in the Webview.');
} catch (error) {
  console.error('Failed to start preview server:', error);
  console.log('Trying alternative method...');
  
  try {
    // Try using the start-preview.js script as a fallback
    require('./start-preview.js');
  } catch (fallbackError) {
    console.error('All preview methods failed. Please check your configuration.');
    console.error(fallbackError);
    process.exit(1);
  }
}