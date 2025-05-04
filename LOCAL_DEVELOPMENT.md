# Bell24h Marketplace - Local Development Guide

This guide will help you set up and run the Bell24h Marketplace project on your local machine, preparing it for deployment to a production environment.

## Prerequisites

Before getting started, make sure you have the following installed:

- **Node.js** (v18 or later)
- **PostgreSQL** (v15 or later)
- **Git** (for version control)
- A code editor like **Visual Studio Code**

## Step 1: Download and Extract the Project

1. Run the packaging script on Replit to create a ZIP file:
   ```bash
   node package-for-deployment.js
   ```

2. Download the generated ZIP file from the `deployments` folder in Replit.

3. Extract the ZIP file to your desired location on your local machine.

## Step 2: Install Dependencies

1. Open a terminal and navigate to the project directory:
   ```bash
   cd path/to/bell24h-marketplace
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

## Step 3: Configure Environment Variables

1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file in your code editor and fill in the required values:
   ```
   # Database connection
   DATABASE_URL=postgresql://username:password@localhost:5432/bell24h

   # Session configuration
   SESSION_SECRET=your_secure_random_string_here

   # OpenAI API configuration
   OPENAI_API_KEY=your_openai_api_key_here

   # Optional: Perplexity API (if needed)
   # PERPLEXITY_API_KEY=your_perplexity_api_key_here

   # Optional: SendGrid (if email functionality is needed)
   # SENDGRID_API_KEY=your_sendgrid_api_key_here
   ```

## Step 4: Set Up the Database

1. Create a PostgreSQL database:
   ```bash
   createdb bell24h
   ```

2. Push the database schema:
   ```bash
   npm run db:push
   ```

## Step 5: Start the Development Server

1. Run the development server:
   ```bash
   npm run dev
   ```

2. The application should now be running at [http://localhost:5000](http://localhost:5000)

## Step 6: Building for Production

When you're ready to deploy the application to a production environment:

1. Build the client-side application:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Deployment Options

Here are some recommended platforms for deploying your application:

### 1. Railway.app
- Easy PostgreSQL setup
- Integrated CI/CD
- Automatic HTTPS

### 2. Render.com
- Free tier available
- PostgreSQL database service
- Automatic deployments from GitHub

### 3. DigitalOcean App Platform
- Managed database services
- Horizontal scaling
- Automatic HTTPS

### 4. Traditional VPS (AWS EC2, DigitalOcean Droplet)
1. Set up a Ubuntu 22.04 server
2. Install Node.js and PostgreSQL
3. Clone your repository
4. Set up environment variables
5. Install PM2 for process management
6. Set up Nginx as a reverse proxy
7. Configure SSL with Let's Encrypt

## CI/CD Setup with GitHub Actions

Create a `.github/workflows/deploy.yml` file in your repository with the following content:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build client
        run: npm run build
        
      # Add your deployment steps here based on your chosen platform
```

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check your DATABASE_URL environment variable
- Ensure the database user has proper permissions

### Missing Environment Variables
- Double-check your `.env` file
- Verify all required variables are set correctly

### API Key Problems
- Validate your OpenAI API key is active
- Ensure you have sufficient API credits

## Support

If you encounter any issues with the local development setup, please:

1. Check the project documentation
2. Search for similar issues on GitHub
3. Create a new issue with detailed information about your problem

Happy coding!