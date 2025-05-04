# Bell24h Marketplace - Hosting Platform Guide

This guide provides specific deployment instructions for popular hosting platforms.

## Railway.app

Railway offers an excellent platform for deploying Node.js applications with PostgreSQL databases.

### Deployment Steps

1. Sign up at [Railway.app](https://railway.app/)

2. Install the Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

3. Login to Railway:
   ```bash
   railway login
   ```

4. Initialize a new project:
   ```bash
   railway init
   ```

5. Add a PostgreSQL database:
   ```bash
   railway add
   # Select PostgreSQL from the menu
   ```

6. Set environment variables:
   ```bash
   railway variables set SESSION_SECRET=your_secure_random_string
   railway variables set OPENAI_API_KEY=your_openai_api_key
   # Add any other required variables
   ```

7. Deploy your project:
   ```bash
   railway up
   ```

Railway will automatically detect your Node.js application and build it according to your package.json scripts.

## Render.com

Render provides a developer-friendly cloud platform with free tiers for small projects.

### Deployment Steps

1. Sign up at [Render.com](https://render.com/)

2. Create a new PostgreSQL database:
   - From the dashboard, select "New" > "PostgreSQL"
   - Choose a name and region
   - Note the connection details provided

3. Create a new Web Service:
   - Select "New" > "Web Service"
   - Connect your GitHub repository
   - Use the following settings:
     - **Environment**: Node
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`

4. Set environment variables:
   - Under the "Environment" tab, add:
     - `DATABASE_URL`: (use the connection string from your Render PostgreSQL)
     - `SESSION_SECRET`: (generate a secure random string)
     - `OPENAI_API_KEY`: (your OpenAI API key)
     - `NODE_ENV`: production
     - Add any other required variables

5. Deploy your application:
   - Click "Create Web Service"
   - Wait for the build and deployment to complete

## DigitalOcean App Platform

DigitalOcean's App Platform provides a fully managed solution with good scaling options.

### Deployment Steps

1. Sign up at [DigitalOcean](https://www.digitalocean.com/)

2. From the dashboard, click "Create" > "Apps"

3. Connect your GitHub repository

4. Configure your app:
   - **Environment**: Node.js
   - **Build Command**: `npm install && npm run build`
   - **Run Command**: `npm start`

5. Add a database:
   - Click "Add Resource" > "Database"
   - Select "PostgreSQL"
   - Choose an appropriate plan

6. Set environment variables:
   - Add the required environment variables:
     - `SESSION_SECRET`: (generate a secure random string)
     - `OPENAI_API_KEY`: (your OpenAI API key)
     - `NODE_ENV`: production
     - DigitalOcean will automatically set the `DATABASE_URL`

7. Launch your application:
   - Click "Launch App"
   - Wait for the build and deployment to complete

## AWS Elastic Beanstalk

For more advanced deployments with greater control, AWS Elastic Beanstalk is a good option.

### Deployment Steps

1. Sign up for [AWS](https://aws.amazon.com/) if you haven't already

2. Install the AWS EB CLI:
   ```bash
   pip install awsebcli
   ```

3. Configure your application for Elastic Beanstalk:
   ```bash
   # Create a .ebextensions directory
   mkdir .ebextensions
   
   # Create a configuration file
   cat > .ebextensions/nodecommand.config << EOL
   option_settings:
     aws:elasticbeanstalk:container:nodejs:
       NodeCommand: "npm start"
   EOL
   ```

4. Initialize your EB application:
   ```bash
   eb init
   # Follow the prompts to select your region and create a new application
   ```

5. Create an RDS PostgreSQL database:
   - Use the AWS Console to create an RDS instance
   - Note the connection details

6. Configure environment variables:
   ```bash
   eb setenv DATABASE_URL=your_postgres_connection_string SESSION_SECRET=your_secure_string OPENAI_API_KEY=your_openai_key NODE_ENV=production
   ```

7. Deploy your application:
   ```bash
   eb create
   # Follow the prompts to set up your environment
   ```

## Heroku

Although Heroku's free tier is no longer available, it remains a popular and user-friendly option.

### Deployment Steps

1. Sign up at [Heroku](https://www.heroku.com/)

2. Install the Heroku CLI:
   ```bash
   npm install -g heroku
   ```

3. Login to Heroku:
   ```bash
   heroku login
   ```

4. Create a new Heroku app:
   ```bash
   heroku create bell24h-marketplace
   ```

5. Add a PostgreSQL database:
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

6. Set environment variables:
   ```bash
   heroku config:set SESSION_SECRET=your_secure_random_string
   heroku config:set OPENAI_API_KEY=your_openai_api_key
   heroku config:set NODE_ENV=production
   # Heroku automatically sets the DATABASE_URL
   ```

7. Deploy your application:
   ```bash
   git push heroku main
   ```

## Vercel

While Vercel is primarily designed for frontend applications, it can also host full-stack applications.

### Deployment Steps

1. Sign up at [Vercel](https://vercel.com/)

2. Install the Vercel CLI:
   ```bash
   npm i -g vercel
   ```

3. Login to Vercel:
   ```bash
   vercel login
   ```

4. Create a `vercel.json` configuration file:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "package.json",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/api/(.*)",
         "dest": "/server/index.ts"
       },
       {
         "src": "/(.*)",
         "dest": "/client/$1"
       }
     ]
   }
   ```

5. Set up a PostgreSQL database:
   - Use a service like Supabase or Neon for your PostgreSQL database
   - Note the connection details

6. Set environment variables:
   ```bash
   vercel env add SESSION_SECRET
   vercel env add DATABASE_URL
   vercel env add OPENAI_API_KEY
   # Add any other required variables
   ```

7. Deploy your application:
   ```bash
   vercel
   ```

## Docker-based Deployment

For greater control and consistency across environments, Docker-based deployment is recommended.

### Deployment Steps

1. Build your Docker image:
   ```bash
   docker-compose build
   ```

2. Configure your environment:
   Create a `.env` file with your environment variables

3. Start your application:
   ```bash
   docker-compose up -d
   ```

This approach can be used on any hosting platform that supports Docker, including:
- AWS ECS/EKS
- Google Cloud Run
- Azure Container Instances
- DigitalOcean Kubernetes
- Self-hosted servers

## Monitoring and Scaling Considerations

Regardless of the hosting platform you choose, consider:

1. **Monitoring**: Set up monitoring tools like New Relic, Datadog, or the built-in monitoring of your platform.

2. **Logging**: Configure centralized logging with systems like ELK Stack or use platform-specific logging.

3. **Scaling**: Configure auto-scaling rules based on CPU/memory usage or request rates.

4. **Backups**: Set up regular database backups as described in DATABASE_MIGRATION.md.

5. **CDN**: Consider using a CDN like Cloudflare for static assets to improve global performance.