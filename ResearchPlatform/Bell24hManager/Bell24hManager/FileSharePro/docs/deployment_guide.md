# Bell24h Marketplace - Deployment Guide

This document provides detailed instructions for deploying the Bell24h Marketplace project to various environments.

## Deployment in Replit

### Method 1: Manual Deployment

The most reliable way to deploy the application in Replit is to run the startup script manually:

1. Open the Shell in Replit
2. Run the following command:
   ```bash
   ./start_app.sh
   ```
3. The application should start on port 5000
4. Access the application via the Preview window

### Method 2: Custom Workflow Setup

To create a custom workflow that uses the JavaScript server:

1. Click on "Add Workflow" in the Replit interface
2. Enter a name like "Start JavaScript Server"
3. Set the command to:
   ```bash
   node server.js
   ```
4. Save the workflow and run it

### Method 3: Override Default Workflow

If you want to modify the default workflow:

1. Click on the "Start application" workflow
2. Edit the command to:
   ```bash
   node server.js
   ```
3. Save the changes

## Production Deployment

For production deployment, we recommend one of the following approaches:

### Option 1: Deploying to a VPS

1. Clone the repository to your server
   ```bash
   git clone https://github.com/your-organization/bell24h.git
   cd bell24h
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Set up environment variables
   Create a `.env` file with:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/bell24h
   PORT=5000
   ```

4. Set up the database
   ```bash
   npm run db:push
   ```

5. Seed the database (optional)
   ```bash
   node seed_data.js
   ```

6. Set up a process manager like PM2
   ```bash
   npm install -g pm2
   pm2 start server.js --name "bell24h"
   pm2 save
   pm2 startup
   ```

### Option 2: Docker Deployment

1. Create a Dockerfile:
   ```dockerfile
   FROM node:18

   WORKDIR /app

   COPY package*.json ./
   RUN npm install

   COPY . .

   EXPOSE 5000

   CMD ["node", "server.js"]
   ```

2. Build and run the Docker image:
   ```bash
   docker build -t bell24h .
   docker run -p 5000:5000 -d --name bell24h \
     -e DATABASE_URL=postgresql://username:password@host:5432/bell24h \
     bell24h
   ```

### Option 3: Cloud Platform Deployment

#### Deploying to Heroku

1. Create a new Heroku app
   ```bash
   heroku create bell24h
   ```

2. Add PostgreSQL
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev
   ```

3. Push code to Heroku
   ```bash
   git push heroku main
   ```

4. Run database migrations
   ```bash
   heroku run npm run db:push
   ```

#### Deploying to AWS Elastic Beanstalk

1. Initialize Elastic Beanstalk
   ```bash
   eb init
   ```

2. Create an environment
   ```bash
   eb create bell24h-env
   ```

3. Set environment variables
   ```bash
   eb setenv DATABASE_URL=postgresql://username:password@host:5432/bell24h
   ```

4. Deploy the application
   ```bash
   eb deploy
   ```

## Monitoring and Maintenance

### Logging

For production environments, we recommend setting up a centralized logging solution:

1. Install Winston for structured logging
   ```bash
   npm install winston
   ```

2. Set up log rotation and storage
   ```bash
   npm install winston-daily-rotate-file
   ```

### Backups

Set up regular database backups:

```bash
# Create a backup script
echo '#!/bin/bash
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
pg_dump -U $PGUSER -h $PGHOST $PGDATABASE > backup_$TIMESTAMP.sql
' > backup.sh

# Make it executable
chmod +x backup.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /path/to/backup.sh") | crontab -
```

### Monitoring

Set up monitoring using tools like:

1. Prometheus and Grafana for metrics
2. Healthchecks.io for uptime monitoring
3. New Relic or DataDog for application performance monitoring

## Troubleshooting

Common deployment issues:

1. **Database Connection Errors**
   - Verify DATABASE_URL is correctly set
   - Check network connectivity between app and database
   - Ensure database user has proper permissions

2. **Port Binding Issues**
   - Make sure no other application is using port 5000
   - For cloud platforms, ensure port forwarding is properly configured

3. **Memory/CPU Issues**
   - Monitor resource usage and scale as needed
   - Implement rate limiting to prevent abuse

## Security Considerations

1. **HTTPS/TLS**
   - Always use HTTPS in production
   - Set up auto-renewal for SSL certificates

2. **API Security**
   - Implement proper authentication and authorization
   - Use rate limiting to prevent abuse
   - Sanitize all inputs to prevent injection attacks

3. **Database Security**
   - Use strong, unique passwords
   - Restrict network access to the database
   - Regularly backup and update the database

## CI/CD Pipeline

For continuous integration and deployment:

1. Set up GitHub Actions:
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
         - name: Deploy to production
           # Add deployment steps specific to your platform
   ```

## Future Enhancements

For future deployments, consider:

1. Implementing a CDN for static assets
2. Setting up a load balancer for high availability
3. Implementing a microservices architecture for better scalability
4. Containerizing with Kubernetes for orchestration