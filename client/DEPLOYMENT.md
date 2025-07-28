# BELL24H Deployment Guide

This guide covers all deployment options for the BELL24H marketplace platform.

## 🚀 Quick Deployment Options

### Option 1: Vercel (Recommended for Production)

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy to Vercel
vercel --prod
```

### Option 2: Docker Compose (Local/Staging)

```bash
# 1. Build and start all services
docker-compose up -d

# 2. Check status
docker-compose ps

# 3. View logs
docker-compose logs -f bell24h-app
```

### Option 3: Manual Deployment

```bash
# 1. Run deployment script
chmod +x scripts/deploy.sh
./scripts/deploy.sh production
```

## 📋 Prerequisites

### System Requirements

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Docker**: 20.x or higher (for containerized deployment)
- **PostgreSQL**: 15.x or higher
- **Redis**: 7.x or higher

### Environment Setup

1. Copy environment template:

   ```bash
   cp env.example .env.local
   ```

2. Configure environment variables:

   ```bash
   # Required for all deployments
   DATABASE_URL="postgresql://username:password@localhost:5432/bell24h"
   NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"
   NEXTAUTH_URL="https://your-domain.com"

   # For production
   NODE_ENV="production"
   NEXT_TELEMETRY_DISABLED="1"
   ```

## 🐳 Docker Deployment

### Single Container

```bash
# Build image
docker build -t bell24h .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="..." \
  bell24h
```

### Multi-Service with Docker Compose

```bash
# Start all services
docker-compose up -d

# Scale application
docker-compose up -d --scale bell24h-app=3

# Update services
docker-compose pull
docker-compose up -d
```

### Production Docker Compose

```bash
# Use production configuration
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# With custom environment
docker-compose --env-file .env.production up -d
```

## ☁️ Cloud Deployment

### Vercel (Recommended)

1. **Connect Repository**:

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables

2. **Environment Variables**:

   ```bash
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=your-secret
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### AWS ECS

```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker build -t bell24h .
docker tag bell24h:latest your-account.dkr.ecr.us-east-1.amazonaws.com/bell24h:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/bell24h:latest

# Deploy to ECS
aws ecs update-service --cluster bell24h-cluster --service bell24h-service --force-new-deployment
```

### Google Cloud Run

```bash
# Build and deploy
gcloud builds submit --tag gcr.io/your-project/bell24h
gcloud run deploy bell24h --image gcr.io/your-project/bell24h --platform managed
```

### Azure Container Instances

```bash
# Build and push to ACR
az acr build --registry yourregistry --image bell24h .
az container create --resource-group your-rg --name bell24h --image yourregistry.azurecr.io/bell24h:latest
```

## 🗄️ Database Setup

### PostgreSQL Setup

```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb bell24h
sudo -u postgres createuser bell24h_user

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

### Cloud Database Options

#### AWS RDS

```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier bell24h-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username bell24h \
  --master-user-password your-password \
  --allocated-storage 20
```

#### Google Cloud SQL

```bash
# Create Cloud SQL instance
gcloud sql instances create bell24h-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1
```

#### Azure Database for PostgreSQL

```bash
# Create Azure Database
az postgres flexible-server create \
  --name bell24h-db \
  --resource-group your-rg \
  --admin-user bell24h \
  --admin-password your-password \
  --sku-name Standard_B1ms
```

## 🔒 SSL/HTTPS Setup

### Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt-get install certbot

# Get certificate
sudo certbot certonly --standalone -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Cloudflare (Recommended)

1. Add domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS encryption mode: Full (strict)
4. Configure Page Rules for caching

### Custom SSL Certificate

```bash
# Generate self-signed certificate (development)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem
```

## 📊 Monitoring Setup

### Application Monitoring

```bash
# Install monitoring tools
npm install --save-dev @next/bundle-analyzer

# Run bundle analysis
npm run analyze
```

### Infrastructure Monitoring

```bash
# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Access Grafana
open http://localhost:3001
# Username: admin, Password: admin
```

### Log Management

```bash
# View application logs
docker-compose logs -f bell24h-app

# View nginx logs
docker-compose logs -f bell24h-nginx

# View database logs
docker-compose logs -f bell24h-db
```

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
stages:
  - test
  - build
  - deploy

test:
  stage: test
  script:
    - npm ci
    - npm run test
    - npm run lint

build:
  stage: build
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - .next/

deploy:
  stage: deploy
  script:
    - docker build -t bell24h .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  only:
    - main
```

## 🚨 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clear cache
rm -rf .next
rm -rf node_modules
npm cache clean --force
npm install
```

#### Database Connection Issues

```bash
# Check database connection
npx prisma db pull

# Reset database
npx prisma migrate reset

# Generate client
npx prisma generate
```

#### Performance Issues

```bash
# Analyze bundle size
npm run analyze

# Check memory usage
docker stats

# Monitor CPU usage
htop
```

#### SSL Issues

```bash
# Test SSL configuration
openssl s_client -connect your-domain.com:443

# Check certificate
echo | openssl s_client -servername your-domain.com -connect your-domain.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Health Checks

```bash
# Application health
curl -f http://localhost:3000/api/health

# Database health
npx prisma db execute --stdin <<< "SELECT 1"

# Redis health
redis-cli ping
```

## 📈 Performance Optimization

### Production Optimizations

```bash
# Enable compression
gzip on;

# Enable caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Enable HTTP/2
listen 443 ssl http2;
```

### CDN Setup

```bash
# Configure Cloudflare
# 1. Add domain to Cloudflare
# 2. Enable Auto Minify for JS, CSS, HTML
# 3. Enable Brotli compression
# 4. Set up Page Rules for caching
```

### Database Optimization

```bash
# Add indexes
npx prisma db push

# Optimize queries
npx prisma studio

# Monitor slow queries
SELECT query, mean_time, calls FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;
```

## 🔐 Security Checklist

- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Database access restricted
- [ ] Regular backups scheduled
- [ ] Monitoring alerts configured
- [ ] Dependencies updated
- [ ] Secrets rotated regularly

## 📞 Support

For deployment issues:

- **Documentation**: Check this guide and README.md
- **Issues**: Create GitHub issue with deployment logs
- **Community**: Join our Discord server
- **Email**: deployment@bell24h.com

---

**Happy Deploying! 🚀**

_For the latest updates, check our [deployment documentation](https://docs.bell24h.com/deployment)._
