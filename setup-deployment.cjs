#!/usr/bin/env node

/**
 * Bell24h Deployment Setup Script
 * Sets up environment variables and runs automated deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class DeploymentSetup {
  constructor() {
    this.projectRoot = process.cwd();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  }

  async setup() {
    try {
      this.log('🚀 Setting up Bell24h Automated Deployment...');
      
      // Step 1: Create environment file
      await this.createEnvironmentFile();
      
      // Step 2: Install Railway CLI
      await this.installRailwayCLI();
      
      // Step 3: Run automated deployment
      await this.runAutoDeployment();
      
      this.log('✅ Deployment setup completed successfully!', 'success');
      
    } catch (error) {
      this.log(`❌ Setup failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async createEnvironmentFile() {
    this.log('📝 Creating environment configuration...');
    
    const envContent = `# Bell24h Production Environment Variables
# Auto-generated for deployment

# GitHub Configuration
GITHUB_USERNAME=your-github-username
GITHUB_TOKEN=your-github-personal-access-token

# Railway Configuration
RAILWAY_TOKEN=your-railway-token

# Database
DATABASE_URL=postgresql://[user]:[password]@[host]:[port]/[database]

# Application
JWT_SECRET=bell24h-super-secret-jwt-key-32-characters-long
NODE_ENV=production
NEXTAUTH_URL=https://bell24h-production.up.railway.app
NEXT_PUBLIC_API_URL=https://bell24h-production.up.railway.app

# Optional: Additional API Keys
# NANO_BANANA_API_KEY=your-nano-banana-api-key
# N8N_WEBHOOK_URL=your-n8n-webhook-url`;

    // Create .env.production file
    const envPath = path.join(this.projectRoot, '.env.production');
    fs.writeFileSync(envPath, envContent);
    
    this.log('✅ Environment file created: .env.production');
    this.log('⚠️ Please edit .env.production with your actual tokens before deployment', 'warn');
  }

  async installRailwayCLI() {
    this.log('📦 Installing Railway CLI...');
    
    try {
      // Check if Railway CLI is already installed
      execSync('railway --version', { stdio: 'pipe' });
      this.log('✅ Railway CLI is already installed');
    } catch {
      try {
        execSync('npm install -g @railway/cli', { stdio: 'inherit' });
        this.log('✅ Railway CLI installed successfully');
      } catch (error) {
        this.log('⚠️ Failed to install Railway CLI globally, trying local install...', 'warn');
        try {
          execSync('npm install @railway/cli', { stdio: 'inherit' });
          this.log('✅ Railway CLI installed locally');
        } catch (localError) {
          this.log('❌ Failed to install Railway CLI. Please install manually: npm install -g @railway/cli', 'error');
          throw localError;
        }
      }
    }
  }

  async runAutoDeployment() {
    this.log('🚀 Running automated deployment...');
    
    // Check if deploy-auto.js exists
    const deployScriptPath = path.join(this.projectRoot, 'deploy-auto.js');
    if (!fs.existsSync(deployScriptPath)) {
      this.log('❌ deploy-auto.js not found. Please ensure the auto-deployment script is present.', 'error');
      return;
    }

    // Check if environment variables are set
    const envPath = path.join(this.projectRoot, '.env.production');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      
      if (envContent.includes('your-github-username') || envContent.includes('your-github-personal-access-token')) {
        this.log('⚠️ Environment variables not configured. Please edit .env.production first.', 'warn');
        this.log('📋 Required tokens:', 'info');
        this.log('   • GITHUB_USERNAME: Your GitHub username', 'info');
        this.log('   • GITHUB_TOKEN: GitHub Personal Access Token', 'info');
        this.log('   • RAILWAY_TOKEN: Railway API Token', 'info');
        this.log('', 'info');
        this.log('🔗 Get tokens from:', 'info');
        this.log('   • GitHub: https://github.com/settings/tokens', 'info');
        this.log('   • Railway: https://railway.app/dashboard', 'info');
        return;
      }
    }

    try {
      // Load environment variables
      require('dotenv').config({ path: envPath });
      
      // Run the auto deployment script
      this.log('🚀 Starting automated deployment...');
      execSync('node deploy-auto.js', { stdio: 'inherit' });
      
    } catch (error) {
      this.log(`❌ Auto deployment failed: ${error.message}`, 'error');
      this.log('💡 Please check your environment variables and try again.', 'info');
    }
  }
}

// Run setup
if (require.main === module) {
  const setup = new DeploymentSetup();
  setup.setup().catch(console.error);
}

module.exports = DeploymentSetup;
