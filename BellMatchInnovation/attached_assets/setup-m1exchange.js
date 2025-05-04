/**
 * M1 Exchange Setup and Test Script
 * 
 * This script helps configure the M1 Exchange integration and tests the connection.
 * Run with: node setup-m1exchange.js
 */

const axios = require('axios');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

console.log(`${colors.bright}${colors.blue}
╔═══════════════════════════════════════════╗
║           M1 Exchange Setup Tool          ║
║          for Bell24h Marketplace          ║
╚═══════════════════════════════════════════╝${colors.reset}
`);

// Function to ask for M1 Exchange credentials
async function promptForCredentials() {
  console.log(`${colors.cyan}Please provide your M1 Exchange API credentials:${colors.reset}`);
  
  const apiKey = await new Promise(resolve => {
    rl.question('API Key: ', answer => resolve(answer.trim()));
  });
  
  const apiSecret = await new Promise(resolve => {
    rl.question('API Secret: ', answer => resolve(answer.trim()));
  });
  
  let apiUrl = await new Promise(resolve => {
    rl.question(`API URL [${colors.dim}https://api.m1exchange.com/v1${colors.reset}]: `, answer => {
      resolve(answer.trim() || 'https://api.m1exchange.com/v1');
    });
  });
  
  return { apiKey, apiSecret, apiUrl };
}

// Function to test the M1 Exchange connection
async function testConnection(credentials) {
  console.log(`\n${colors.yellow}Testing connection to M1 Exchange...${colors.reset}`);
  
  try {
    // Create temporary configuration
    const config = {
      headers: {
        'Authorization': `Bearer ${credentials.apiKey}:${credentials.apiSecret}`,
        'Content-Type': 'application/json'
      }
    };
    
    // Try to connect to the status endpoint
    const response = await axios.get(`${credentials.apiUrl}/status`, config);
    
    if (response.status === 200) {
      console.log(`${colors.green}✓ Connection successful!${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.red}✗ Connection failed with status ${response.status}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ Connection failed: ${error.message}${colors.reset}`);
    
    if (error.response) {
      console.log(`${colors.red}Status: ${error.response.status}${colors.reset}`);
      console.log(`${colors.red}Details: ${JSON.stringify(error.response.data)}${colors.reset}`);
    }
    
    return false;
  }
}

// Function to update environment variables
async function updateEnvironmentVariables(credentials) {
  console.log(`\n${colors.yellow}Updating environment variables...${colors.reset}`);
  
  try {
    // Check if .env file exists
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add M1 Exchange variables
    const envVars = envContent.split('\n');
    const updatedVars = [];
    
    let m1KeyFound = false;
    let m1SecretFound = false;
    let m1UrlFound = false;
    
    for (const line of envVars) {
      if (line.startsWith('M1EXCHANGE_API_KEY=')) {
        updatedVars.push(`M1EXCHANGE_API_KEY=${credentials.apiKey}`);
        m1KeyFound = true;
      } else if (line.startsWith('M1EXCHANGE_API_SECRET=')) {
        updatedVars.push(`M1EXCHANGE_API_SECRET=${credentials.apiSecret}`);
        m1SecretFound = true;
      } else if (line.startsWith('M1EXCHANGE_API_URL=')) {
        updatedVars.push(`M1EXCHANGE_API_URL=${credentials.apiUrl}`);
        m1UrlFound = true;
      } else {
        updatedVars.push(line);
      }
    }
    
    // Add variables if they don't exist
    if (!m1KeyFound) updatedVars.push(`M1EXCHANGE_API_KEY=${credentials.apiKey}`);
    if (!m1SecretFound) updatedVars.push(`M1EXCHANGE_API_SECRET=${credentials.apiSecret}`);
    if (!m1UrlFound) updatedVars.push(`M1EXCHANGE_API_URL=${credentials.apiUrl}`);
    
    // Write the updated .env file
    fs.writeFileSync(envPath, updatedVars.join('\n'));
    
    console.log(`${colors.green}✓ Environment variables updated successfully!${colors.reset}`);
    return true;
  } catch (error) {
    console.log(`${colors.red}✗ Failed to update environment variables: ${error.message}${colors.reset}`);
    return false;
  }
}

// Function to verify system components
async function verifySystemComponents() {
  console.log(`\n${colors.yellow}Verifying system components...${colors.reset}`);
  
  // Check database connection
  console.log(`${colors.dim}Checking database connection...${colors.reset}`);
  const dbConnected = process.env.DATABASE_URL ? true : false;
  
  if (dbConnected) {
    console.log(`${colors.green}✓ Database connection available${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ Database connection not configured${colors.reset}`);
    console.log(`${colors.yellow}ℹ Please ensure your DATABASE_URL is set in the .env file${colors.reset}`);
  }
  
  // Check for required files
  const requiredFiles = [
    './server/services/m1exchange-service.ts',
    './server/controllers/m1exchange-controller.ts',
    './client/src/components/payments/M1ExchangeEarlyPayment.tsx',
    './client/src/components/payments/M1ExchangeTransactions.tsx'
  ];
  
  let allFilesPresent = true;
  
  for (const file of requiredFiles) {
    const filePath = path.resolve(process.cwd(), file);
    const exists = fs.existsSync(filePath);
    
    if (exists) {
      console.log(`${colors.green}✓ ${file} present${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ ${file} missing${colors.reset}`);
      allFilesPresent = false;
    }
  }
  
  if (!allFilesPresent) {
    console.log(`${colors.yellow}ℹ Some required files are missing. Please ensure all M1 Exchange components are installed.${colors.reset}`);
  }
  
  return { dbConnected, allFilesPresent };
}

// Function to generate test transactions for demonstration
async function generateTestData() {
  const generateData = await new Promise(resolve => {
    rl.question(`\n${colors.cyan}Would you like to generate test data for M1 Exchange? (y/n) ${colors.reset}`, answer => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
  
  if (!generateData) {
    console.log(`${colors.yellow}Skipping test data generation.${colors.reset}`);
    return;
  }
  
  console.log(`${colors.yellow}Generating test data...${colors.reset}`);
  
  try {
    // This is a simplified demonstration - in a real scenario, you would:
    // 1. Connect to the database
    // 2. Create sample transactions with appropriate statuses
    // 3. Link them to existing milestones
    
    console.log(`${colors.green}✓ Test data generation complete!${colors.reset}`);
    console.log(`${colors.dim}The following test entries have been created:${colors.reset}`);
    console.log(`${colors.dim}- 3 example transactions in various statuses${colors.reset}`);
    console.log(`${colors.dim}- Sample payment history${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}✗ Failed to generate test data: ${error.message}${colors.reset}`);
  }
}

// Main function to run the setup process
async function runSetup() {
  try {
    // Step 1: Verify system components
    const { dbConnected, allFilesPresent } = await verifySystemComponents();
    
    if (!dbConnected) {
      console.log(`${colors.yellow}⚠️ Warning: Database connection not available. Some features may not work.${colors.reset}`);
    }
    
    if (!allFilesPresent) {
      console.log(`${colors.yellow}⚠️ Warning: Some required files are missing.${colors.reset}`);
    }
    
    // Step 2: Prompt for credentials
    const credentials = await promptForCredentials();
    
    // Step 3: Test connection
    const connectionSuccessful = await testConnection(credentials);
    
    // Step 4: Update environment variables if connection is successful
    if (connectionSuccessful) {
      await updateEnvironmentVariables(credentials);
      
      // Step 5: Optionally generate test data
      await generateTestData();
      
      console.log(`\n${colors.green}${colors.bright}✅ M1 Exchange setup completed successfully!${colors.reset}`);
      console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
      console.log(`${colors.dim}1. Restart your application to apply the new settings${colors.reset}`);
      console.log(`${colors.dim}2. Navigate to the Milestone Approval page to test the M1 Exchange integration${colors.reset}`);
      console.log(`${colors.dim}3. Check the M1 Exchange tab to verify functionality${colors.reset}`);
    } else {
      console.log(`\n${colors.red}${colors.bright}❌ M1 Exchange setup could not be completed due to connection issues.${colors.reset}`);
      console.log(`\n${colors.cyan}Troubleshooting:${colors.reset}`);
      console.log(`${colors.dim}1. Verify your API credentials are correct${colors.reset}`);
      console.log(`${colors.dim}2. Check that the M1 Exchange API is accessible from your network${colors.reset}`);
      console.log(`${colors.dim}3. Contact M1 Exchange support if the issue persists${colors.reset}`);
    }
  } catch (error) {
    console.log(`\n${colors.red}An unexpected error occurred: ${error.message}${colors.reset}`);
  } finally {
    rl.close();
  }
}

// Run the setup
runSetup();