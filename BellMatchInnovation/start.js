// Simple starter script to run the application
const { execSync } = require('child_process');

console.log('Starting Bell24h application...');

try {
  // Check the database
  console.log('Checking database connection...');
  execSync('node -e "require(\'./db\').db.select(1).then(() => console.log(\'Database connection successful\'))"');
  
  // Start the application
  console.log('Starting server...');
  execSync('node server/index.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Error starting application:', error.message);
  process.exit(1);
}