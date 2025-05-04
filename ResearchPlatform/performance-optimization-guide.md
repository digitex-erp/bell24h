# Bell24h Performance Optimization Guide

This guide outlines strategies and implementations for optimizing the Bell24h platform for high performance, scalability, and reliability. These optimizations should be prioritized as the platform scales to serve more users and process more transactions.

## 1. Database Optimization

### Query Optimization

- **Indexed Queries**
  ```sql
  -- Add indexes for frequently queried columns
  CREATE INDEX idx_rfqs_category ON rfqs(category_id);
  CREATE INDEX idx_suppliers_region ON suppliers(region_id);
  CREATE INDEX idx_users_created_at ON users(created_at);
  CREATE INDEX idx_alert_logs_user_id ON alert_logs(user_id);
  ```

- **Query Optimization Examples**
  ```sql
  -- Before optimization
  SELECT * FROM suppliers 
  WHERE region_id = 5 AND category_id IN (1, 2, 3);

  -- After optimization
  SELECT supplier_id, name, rating, contact_info 
  FROM suppliers 
  WHERE region_id = 5 AND category_id IN (1, 2, 3);
  ```

### Connection Pooling

```typescript
// Implementation in server/db.ts
import { Pool } from '@neondatabase/serverless';

// Configure connection pool with optimal settings
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum connections in pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000, // Return error after 2 seconds if connection not established
});

// Monitoring connection usage
pool.on('connect', (client) => {
  console.debug('New client connected to database pool');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
});
```

### Database Migrations Strategy

- Use incremental migrations instead of complete schema rebuilds
- Schedule migrations during off-peak hours
- Implement zero-downtime migration strategies
- Test migrations thoroughly in staging environment

## 2. Redis Caching Implementation

### Installation and Setup

```typescript
// server/cache.ts
import { createClient } from 'redis';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable must be set');
}

export const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis client error:', err));

export async function connectRedisClient() {
  await redisClient.connect();
  console.log('Redis client connected successfully');
}
```

### Caching Strategies

#### RFQ Data Caching

```typescript
// Example implementation for caching RFQ data
import { redisClient } from './cache';

export async function getRfqById(id: string): Promise<RfqData | null> {
  // Try to get from cache first
  const cachedRfq = await redisClient.get(`rfq:${id}`);
  
  if (cachedRfq) {
    console.log('Cache hit for RFQ:', id);
    return JSON.parse(cachedRfq);
  }
  
  // If not in cache, get from database
  const rfq = await db.select().from(rfqs).where(eq(rfqs.id, id)).first();
  
  if (rfq) {
    // Cache the result with 15 minute expiration
    await redisClient.set(`rfq:${id}`, JSON.stringify(rfq), {
      EX: 900 // 15 minutes in seconds
    });
  }
  
  return rfq;
}
```

#### Session Storage

```typescript
// Configure express-session with Redis store
import session from 'express-session';
import RedisStore from 'connect-redis';

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'bell24h-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));
```

#### Cache Invalidation Strategies

```typescript
// Implement cache invalidation on data updates
export async function updateRfq(id: string, data: Partial<RfqData>): Promise<RfqData> {
  // Update in database
  const updatedRfq = await db
    .update(rfqs)
    .set(data)
    .where(eq(rfqs.id, id))
    .returning();
  
  // Invalidate cache
  await redisClient.del(`rfq:${id}`);
  
  // Optionally, update cache with new data
  await redisClient.set(`rfq:${id}`, JSON.stringify(updatedRfq), {
    EX: 900 // 15 minutes
  });
  
  return updatedRfq;
}
```

## 3. CDN Integration

### Static Asset Configuration

```typescript
// vite.config.ts adjustments for production builds
export default defineConfig({
  build: {
    // Generate unique filenames with content hash for optimal caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'wouter', '@tanstack/react-query'],
          ui: ['@/components/ui'],
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  }
});
```

### CDN Provider Setup

- **Setup with Cloudflare**
  1. Register domain with Cloudflare
  2. Configure DNS settings
  3. Enable Cloudflare CDN
  4. Set appropriate cache rules

- **Cache Control Headers**
  ```typescript
  // Express middleware for static assets
  app.use('/assets', express.static('dist/assets', {
    maxAge: '30d', // Cache for 30 days
    immutable: true, // Files with content hash never change
    setHeaders: (res, path) => {
      // Add cache control headers
      res.setHeader('Cache-Control', 'public, max-age=2592000, immutable');
    }
  }));
  ```

### Image Optimization Pipeline

```typescript
// Implementation for optimized image serving
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export async function optimizeImage(
  imagePath: string, 
  width: number, 
  quality: number = 80
): Promise<string> {
  const filename = path.basename(imagePath);
  const outputDir = 'dist/assets/images';
  const outputFilename = `${path.parse(filename).name}-w${width}-q${quality}.webp`;
  const outputPath = path.join(outputDir, outputFilename);
  
  // Check if optimized version already exists
  if (fs.existsSync(outputPath)) {
    return `/assets/images/${outputFilename}`;
  }
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Optimize and save image
  await sharp(imagePath)
    .resize(width)
    .webp({ quality })
    .toFile(outputPath);
  
  return `/assets/images/${outputFilename}`;
}
```

## 4. Server Optimization

### Node.js Performance Tuning

```javascript
// Example cluster setup for production
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  console.log(`Master process ${process.pid} is running`);

  // Fork workers equal to CPU count
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // Workers share the TCP connection
  require('./server');
  console.log(`Worker ${process.pid} started`);
}
```

### Memory Optimization

- Implement garbage collection optimization
- Set appropriate Node.js memory limits
- Use streaming for large data operations
- Implement pagination for large data sets

```typescript
// Memory monitoring and management
import v8 from 'v8';

// Log memory usage every 5 minutes
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  const heapStats = v8.getHeapStatistics();
  
  console.log({
    rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
    heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
    heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
    heapSizeLimit: `${Math.round(heapStats.heap_size_limit / 1024 / 1024)} MB`,
  });
  
  // Force garbage collection if approaching limits
  if (memoryUsage.heapUsed / heapStats.heap_size_limit > 0.85) {
    console.log('Memory usage high, suggesting garbage collection');
    // In production, consider restarting the worker instead
  }
}, 5 * 60 * 1000);
```

## 5. Frontend Optimization

### Code Splitting

```typescript
// React lazy loading implementation
import React, { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/dashboard'));
const IndustryTrends = lazy(() => import('./pages/industry-trends'));
const RfqCreation = lazy(() => import('./pages/rfq-creation'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/industry-trends" component={IndustryTrends} />
        <Route path="/rfqs/create" component={RfqCreation} />
      </Switch>
    </Suspense>
  );
}
```

### Image Optimization and Lazy Loading

```tsx
// Optimized image component
import React, { useState, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  className 
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  
  return (
    <div 
      className={`relative ${className}`} 
      style={{ width, height }}
    >
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}
```

### Bundle Size Optimization

- Use tree-shaking to eliminate unused code
- Implement code splitting based on routes
- Optimize npm dependencies and remove unused ones
- Use compression for all server responses

## 6. Monitoring and Analytics

### Performance Monitoring Setup

```typescript
// server/monitoring.ts
import { collectDefaultMetrics, register, Counter, Histogram } from 'prom-client';
import express from 'express';

// Initialize metrics collection
collectDefaultMetrics();

// Define custom metrics
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
});

const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

// Middleware for monitoring HTTP requests
export function metricsMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const end = httpRequestDuration.startTimer({
    method: req.method,
    route: req.route?.path || req.path
  });
  
  res.on('finish', () => {
    end({ status: res.statusCode });
    httpRequestTotal.inc({ 
      method: req.method, 
      route: req.route?.path || req.path,
      status: res.statusCode
    });
  });
  
  next();
}

// Endpoint for Prometheus metrics
export function metricsEndpoint(req: express.Request, res: express.Response) {
  res.set('Content-Type', register.contentType);
  register.metrics().then((metrics) => {
    res.end(metrics);
  });
}
```

### Error Tracking

```typescript
// Error handling and tracking
import * as Sentry from '@sentry/node';

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.2,
  });
}

// Express error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  
  // Track error in Sentry if available
  if (Sentry.getCurrentHub().getClient()) {
    Sentry.captureException(err);
  }
  
  // Send error response
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message,
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});
```

## 7. Load Testing and Benchmarking

### Load Testing Strategy

- Use tools like k6, Artillery, or JMeter for load testing
- Test with realistic user scenarios
- Gradually increase load to identify bottlenecks
- Monitor system resources during testing

```javascript
// Example k6 script for load testing RFQ creation
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 50 }, // Ramp up to 50 users over 1 minute
    { duration: '3m', target: 50 }, // Stay at 50 users for 3 minutes
    { duration: '1m', target: 100 }, // Ramp up to 100 users over 1 minute
    { duration: '5m', target: 100 }, // Stay at 100 users for 5 minutes
    { duration: '1m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'], // Less than 1% of requests can fail
  },
};

export default function () {
  const payload = JSON.stringify({
    title: `Test RFQ ${Date.now()}`,
    description: 'Load test generated RFQ',
    category_id: 5,
    quantity: 100,
    deadline: new Date(Date.now() + 86400000).toISOString(),
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.AUTH_TOKEN}`,
    },
  };

  const res = http.post('https://api.bell24h.com/api/rfqs', payload, params);
  
  check(res, {
    'status is 201': (r) => r.status === 201,
    'has rfq_id': (r) => JSON.parse(r.body).id !== undefined,
  });

  sleep(Math.random() * 3 + 2); // Random sleep between 2-5 seconds
}
```

### Performance Benchmarking

- Establish baseline performance metrics
- Create automated performance testing scripts
- Set up CI/CD pipeline integration for regular benchmarking
- Track performance trends over time

## 8. Security Optimization

### Security Headers

```typescript
// Implement security headers middleware
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.example.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.example.com"],
      imgSrc: ["'self'", "data:", "https://cdn.example.com", "https://res.cloudinary.com"],
      connectSrc: ["'self'", "wss://api.bell24h.com", "https://api.bell24h.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false, // Adjust according to your needs
}));
```

### Rate Limiting

```typescript
// Implement rate limiting
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from './cache';

// API rate limiter
const apiLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests, please try again later.',
  }
});

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// More strict rate limit for authentication routes
const authLimiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }),
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 login attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many login attempts, please try again later.',
  }
});

app.use('/api/auth/login', authLimiter);
```

## 9. Deployment Optimization

### CI/CD Pipeline Optimization

- Implement build caching for faster deployments
- Use Docker layer caching for container builds
- Run automated tests in parallel
- Use staging environments that mirror production

### Zero Downtime Deployment Strategy

- Implement blue-green deployment
- Use rolling updates for Kubernetes deployments
- Configure proper health checks and readiness probes
- Implement automated rollback on failure

## 10. Monitoring Checklist

- [ ] Set up real-time performance monitoring
- [ ] Configure automated alerting for anomalies
- [ ] Implement log aggregation and analysis
- [ ] Create performance dashboards for key metrics
- [ ] Schedule regular performance reviews

By implementing these optimization strategies, the Bell24h platform will be well-prepared to handle increased load, provide better user experience, and scale efficiently as the user base grows.