# Bell24h Deployment Structure Architecture

## Overview
This document outlines the comprehensive deployment architecture for Bell24h, including containerization, environment configuration, continuous integration, and infrastructure requirements.

## Deployment Architecture Diagram

```
                                    ┌─────────────────┐
                                    │  Load Balancer  │
                                    └────────┬────────┘
                                             │
                                             ▼
                            ┌────────────────────────────────┐
                            │        Nginx Web Server        │
                            │     (SSL/TLS Termination)      │
                            └──────────────┬─────────────────┘
                                           │
                    ┌─────────────────────┴────────────────────┐
                    │                                          │
                    ▼                                          ▼
     ┌───────────────────────────┐               ┌───────────────────────────┐
     │      Bell24h API          │               │     Bell24h Frontend      │
     │      Container(s)         │◄──────────────►      Container(s)         │
     └───────────┬───────────────┘               └───────────────────────────┘
                 │                                           
     ┌───────────┴───────────────┐               ┌───────────────────────────┐
     │     PostgreSQL DB         │               │        Redis Cache        │
     │      Container            │◄──────────────►        Container          │
     └───────────────────────────┘               └───────────────────────────┘
                 │
                 ▼
     ┌───────────────────────────┐               ┌───────────────────────────┐
     │     Backup Service        │               │   Prometheus/Grafana      │
     │      Container            │               │      Monitoring           │
     └───────────────────────────┘               └───────────────────────────┘
                                                             ▲
                                                             │
     ┌───────────────────────────┐                           │
     │   CI/CD Pipeline          ├───────────────────────────┘
     │   (GitHub Actions)        │
     └───────────────────────────┘
```

## Container Structure

### 1. Application Containers

#### Main Application Container
- **Image**: `bell24h:latest`
- **Components**:
  - Node.js server (Express)
  - API endpoints
  - Background workers
- **Configuration**:
  - Environment: Production/Staging/Development
  - Resource limits: 2 CPU, 4GB RAM
  - Health check endpoint: `/api/health`

#### Frontend Container
- **Image**: `bell24h-client:latest`
- **Components**:
  - React application
  - Static assets
- **Configuration**:
  - Environment variables for API endpoints
  - Cache configuration
  - Build optimization

### 2. Infrastructure Containers

#### Database Container
- **Image**: `postgres:15-alpine`
- **Components**:
  - PostgreSQL database
  - Persistent volume
- **Configuration**:
  - Credentials via environment variables
  - Initialization scripts
  - Backup configuration

#### Redis Cache Container
- **Image**: `redis:alpine`
- **Components**:
  - Redis server
  - Cache persistence
- **Configuration**:
  - Memory limits
  - Eviction policy
  - Password protection

#### Nginx Container
- **Image**: `nginx:alpine`
- **Components**:
  - Reverse proxy
  - SSL termination
  - Static file serving
- **Configuration**:
  - Virtual hosts
  - SSL certificates
  - Caching rules
  - Rate limiting

#### Monitoring Container
- **Image**: `prom/prometheus` and `grafana/grafana`
- **Components**:
  - Prometheus server
  - Grafana dashboards
  - Alert manager
- **Configuration**:
  - Scrape configurations
  - Alert rules
  - Dashboard provisioning

## Docker Compose Configuration

```yaml
version: '3.8'

services:
  # API server
  api:
    image: bell24h:latest
    build:
      context: .
      dockerfile: deployment/containers/main/Dockerfile
    restart: always
    depends_on:
      - db
      - redis
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://user:password@db:5432/bell24h
      - REDIS_URL=redis://redis:6379
      - PORT=3000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    volumes:
      - uploads:/app/uploads
    networks:
      - bell24h-net

  # Frontend client
  client:
    image: bell24h-client:latest
    build:
      context: ./client
      dockerfile: ../deployment/containers/frontend/Dockerfile
    restart: always
    volumes:
      - client-build:/app/build
    environment:
      - NODE_ENV=production
    networks:
      - bell24h-net

  # Nginx web server
  web:
    image: nginx:alpine
    restart: always
    depends_on:
      - api
      - client
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./deployment/config/nginx/default.conf:/etc/nginx/conf.d/default.conf
      - ./deployment/config/nginx/ssl:/etc/nginx/ssl
      - client-build:/usr/share/nginx/html
    networks:
      - bell24h-net

  # PostgreSQL database
  db:
    image: postgres:15-alpine
    restart: always
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=bell24h
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./db/init:/docker-entrypoint-initdb.d
    networks:
      - bell24h-net

  # Redis cache
  redis:
    image: redis:alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    networks:
      - bell24h-net

  # Prometheus monitoring
  prometheus:
    image: prom/prometheus
    restart: always
    volumes:
      - ./deployment/config/monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus-data:/prometheus
    networks:
      - bell24h-net

  # Grafana dashboards
  grafana:
    image: grafana/grafana
    restart: always
    depends_on:
      - prometheus
    volumes:
      - ./deployment/config/monitoring/grafana/provisioning:/etc/grafana/provisioning
      - ./deployment/config/monitoring/grafana/dashboards:/var/lib/grafana/dashboards
      - grafana-data:/var/lib/grafana
    networks:
      - bell24h-net

networks:
  bell24h-net:
    driver: bridge

volumes:
  postgres-data:
  redis-data:
  prometheus-data:
  grafana-data:
  uploads:
  client-build:
```

## Environment Configuration

### 1. Development Environment
- **Purpose**: Local development and testing
- **Configuration**:
  - Local database
  - Mock third-party APIs
  - Development certificates
  - Debug logging
  - Hot reloading

### 2. Testing Environment
- **Purpose**: Automated testing and QA
- **Configuration**:
  - Isolated test database
  - Test coverage reporting
  - API mocking for third parties
  - Error tracking

### 3. Staging Environment
- **Purpose**: Pre-production validation
- **Configuration**:
  - Production-like setup
  - Real third-party integrations (test accounts)
  - Performance monitoring
  - Data anonymization

### 4. Production Environment
- **Purpose**: Live application serving
- **Configuration**:
  - High availability setup
  - Database replication
  - CDN integration
  - Enhanced security measures
  - Automated backups

## Deployment Workflow

### 1. Build Process
1. Source code checkout from GitHub
2. Dependency installation
3. Unit and integration testing
4. Static asset compilation
5. Docker image building
6. Image tagging and versioning

### 2. Deployment Process
1. Environment preparation
2. Database migration verification
3. Canary deployment
4. Health check validation
5. Full deployment
6. Post-deployment verification

### 3. Rollback Process
1. Deployment failure detection
2. Previous version restoration
3. Database rollback if needed
4. Service verification
5. Alert notification

## CI/CD Pipeline Configuration

### GitHub Actions Workflow

```yaml
name: Bell24h CI/CD Pipeline

on:
  push:
    branches: [ main, staging ]
  pull_request:
    branches: [ main, staging ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm test
      - name: Run linting
        run: npm run lint
      - name: Run integration tests
        run: npm run test:integration

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push'
    steps:
      - uses: actions/checkout@v2
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v1
      - name: Login to Docker Hub
        uses: docker/login-action@v1
        with:
          username: ${{ secrets.DOCKER_HUB_USERNAME }}
          password: ${{ secrets.DOCKER_HUB_ACCESS_TOKEN }}
      - name: Build and push API image
        uses: docker/build-push-action@v2
        with:
          context: .
          file: ./deployment/containers/main/Dockerfile
          push: true
          tags: bell24h/api:latest
      - name: Build and push client image
        uses: docker/build-push-action@v2
        with:
          context: ./client
          file: ./deployment/containers/frontend/Dockerfile
          push: true
          tags: bell24h/client:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to production
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            cd /opt/bell24h
            docker-compose pull
            docker-compose up -d
            docker system prune -af
```

## Secrets Management

### 1. Environment Variables
- **Development**: `.env.development` file (git-ignored)
- **Testing**: CI/CD environment variables
- **Staging/Production**: Secure environment variable storage

### 2. Sensitive Credentials
- **API Keys**: Stored in environment variables
- **Database Credentials**: Managed via Docker secrets
- **SSL Certificates**: Mounted as encrypted volumes

### 3. Rotation Policy
- **Database Credentials**: Quarterly rotation
- **API Keys**: Monthly rotation
- **SSL Certificates**: Auto-renewal with Let's Encrypt

## Backup Strategy

### 1. Database Backups
- **Frequency**: Daily full backups, hourly incremental
- **Retention**: 7 daily, 4 weekly, 3 monthly
- **Storage**: Off-site encrypted storage
- **Verification**: Weekly restore testing

### 2. File Backups
- **Content**: Uploaded files, configurations
- **Frequency**: Daily
- **Storage**: Off-site object storage
- **Retention**: 30 days

### 3. Configuration Backups
- **Content**: Nginx configs, environment settings
- **Storage**: Version controlled repository
- **Recovery**: Automated restoration scripts

## Monitoring Setup

### 1. Application Metrics
- **Server Metrics**: CPU, memory, disk usage
- **Application Metrics**: Request rate, response time, error rate
- **Business Metrics**: User activity, transactions, RFQ creation

### 2. Alerting Rules
- **Critical Alerts**: Service unavailability, database issues
- **Warning Alerts**: High resource usage, slow response times
- **Information Alerts**: Deployment completions, backup completions

### 3. Dashboard Setup
- **Operations Dashboard**: System health, resource usage
- **Business Dashboard**: User activity, transaction volumes
- **Error Dashboard**: Error rates, types, and patterns

## Scaling Strategy

### 1. Horizontal Scaling
- **API Servers**: Auto-scaling based on CPU/memory usage
- **Frontend**: CDN with auto-scaling origin servers
- **Workers**: Queue-based auto-scaling for background jobs

### 2. Database Scaling
- **Read Replicas**: For high-read operations
- **Connection Pooling**: For efficient connection management
- **Sharding Strategy**: Future implementation plan

### 3. Caching Strategy
- **Application Cache**: Redis for session and data caching
- **API Response Cache**: TTL-based caching for frequent requests
- **Static Asset Cache**: CDN with long-term caching

## Disaster Recovery Plan

### 1. Data Recovery
- **RPO (Recovery Point Objective)**: < 1 hour
- **RTO (Recovery Time Objective)**: < 4 hours
- **Procedure**: Restore from latest backup, replay transaction logs

### 2. Service Recovery
- **Cold Standby**: Secondary environment preparation
- **Recovery Procedure**: DNS cutover, database restoration
- **Verification**: Automated testing of restored services

### 3. Communication Plan
- **Internal Notification**: Team alert protocols
- **External Communication**: User status page updates
- **Escalation Procedure**: Defined roles and responsibilities