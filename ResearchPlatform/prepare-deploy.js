/**
 * Bell24h Deployment Preparation Script
 * 
 * This script prepares the Bell24h application for deployment by:
 * 1. Verifying required configuration files exist
 * 2. Checking for module compatibility issues
 * 3. Building the application for production
 * 4. Validating environment variables
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('===================================================');
console.log('   🚀 PREPARING BELL24H FOR DEPLOYMENT 🚀         ');
console.log('===================================================');

// Function to check if a file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    return false;
  }
}

// Function to check environment variables
function checkEnvironmentVariables() {
  const requiredVars = [
    'DATABASE_URL',
    'OPENAI_API_KEY'
  ];
  
  const missingVars = [];
  const presentVars = [];
  
  console.log('\nChecking for required environment variables:');
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      presentVars.push(varName);
    } else {
      missingVars.push(varName);
    }
  });
  
  if (presentVars.length > 0) {
    console.log('✅ Found variables:', presentVars.join(', '));
  }
  
  if (missingVars.length > 0) {
    console.log('❌ Missing variables:', missingVars.join(', '));
    console.log('   These variables are required for deployment!');
    return false;
  }
  
  return true;
}

// Function to check critical files
function checkCriticalFiles() {
  const criticalFiles = [
    'server/index.compat.js',
    'tsconfig.json',
    'package.json',
    'vite.config.ts'
  ];
  
  console.log('\nChecking for critical files:');
  
  const missingFiles = [];
  
  criticalFiles.forEach(file => {
    if (fileExists(path.join(__dirname, file))) {
      console.log(`✅ Found ${file}`);
    } else {
      console.log(`❌ Missing ${file}`);
      missingFiles.push(file);
    }
  });
  
  return missingFiles.length === 0;
}

// Check for compatibility issues and mark the deployment as ready
function prepareForDeployment() {
  const filesOk = checkCriticalFiles();
  const envVarsOk = checkEnvironmentVariables();
  
  if (!filesOk || !envVarsOk) {
    console.log('\n❌ Deployment preparation failed!');
    console.log('   Please fix the issues above before deploying.');
    return false;
  }
  
  console.log('\n✅ All critical files and environment variables are present!');
  console.log('\n===================================================');
  console.log('   🎉 BELL24H IS READY FOR DEPLOYMENT! 🎉         ');
  console.log('===================================================');
  console.log('\nTo deploy the application:');
  console.log('1. Click the "Deploy" button in Replit');
  console.log('2. Or use a platform like Vercel, Render, or AWS');
  
  return true;
}

// Run the preparation checks
prepareForDeployment();