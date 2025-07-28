# Bell24H Load Testing System

A comprehensive, AI-powered load testing system built with TypeScript for the Bell24H B2B marketplace platform.

## 🚀 Features

### Core Load Testing
- **Multi-protocol Support**: HTTP/HTTPS, WebSocket, GraphQL
- **Real-time Metrics**: Live performance monitoring and analysis
- **Scenario-based Testing**: Complex user journey simulation
- **Data-driven Testing**: Dynamic data extraction and correlation
- **Think Time Simulation**: Realistic user behavior modeling

### AI-Powered Analysis
- **Anomaly Detection**: Intelligent detection of performance issues
- **Trend Analysis**: Historical performance pattern recognition
- **Performance Prediction**: ML-based load capacity forecasting
- **Bottleneck Identification**: Automated performance bottleneck detection
- **Smart Recommendations**: AI-generated optimization suggestions

### Advanced Features
- **Session Management**: Save, load, and compare test sessions
- **Execution Policies**: Production-safe testing with resource limits
- **Browser Dashboard**: Real-time monitoring and control interface
- **Comprehensive Reporting**: Detailed performance analysis and insights
- **Export Capabilities**: Multiple format support (JSON, CSV, HTML)

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Dashboard Usage](#dashboard-usage)
- [Advanced Features](#advanced-features)
- [Testing](#testing)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## 🛠️ Installation

### Prerequisites
- Node.js 18+ 
- TypeScript 5.0+
- npm or yarn

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd bell24h/load-testing

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test
```

### Environment Configuration
Create a `.env` file in the load-testing directory:

```env
# Test Configuration
NODE_ENV=development
LOG_LEVEL=info
MAX_CONCURRENT_TESTS=5

# API Endpoints
TARGET_BASE_URL=https://api.bell24h.com
WEBSOCKET_URL=wss://api.bell24h.com/ws

# Resource Limits
MAX_MEMORY_USAGE=80
MAX_CPU_USAGE=85
MAX_DISK_USAGE=90

# AI Model Configuration
ML_MODEL_ENABLED=true
ANOMALY_DETECTION_THRESHOLD=0.8
PREDICTION_CONFIDENCE_THRESHOLD=0.7

# Dashboard Configuration
DASHBOARD_PORT=3001
DASHBOARD_HOST=localhost
```

## 🚀 Quick Start

### Basic Load Test
```typescript
import { LoadTestProcessor } from './src/load-test-processor';
import { TestConfig } from './src/types';

const config: TestConfig = {
  name: 'Basic Load Test',
  description: 'Simple performance test',
  environment: 'development',
  maxUsers: 100,
  duration: 300, // 5 minutes
  scenarios: [
    {
      name: 'User Login Flow',
      weight: 1,
      flow: [
        {
          type: 'http',
          http: {
            method: 'GET',
            url: 'https://api.bell24h.com/health',
            headers: { 'Content-Type': 'application/json' }
          }
        },
        {
          type: 'http',
          http: {
            method: 'POST',
            url: 'https://api.bell24h.com/auth/login',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'test@example.com',
              password: 'password123'
            })
          },
          extract: {
            token: 'token'
          }
        }
      ]
    }
  ]
};

const processor = new LoadTestProcessor();
const results = await processor.runTest(config);
console.log('Test completed:', results.summary);
```

### AI-Powered Analysis
```typescript
import { WindsurfMetricsAnalyzer } from './src/windsurf-metrics-analyzer';

const analyzer = new WindsurfMetricsAnalyzer();
const analysis = await analyzer.analyzeResults(results);

console.log('Anomalies detected:', analysis.anomalies.length);
console.log('Performance score:', analysis.performanceScore);
console.log('Recommendations:', analysis.recommendations);
```

### Session Management
```typescript
import { SessionManager } from './src/session-manager';

const sessionManager = new SessionManager();

// Save test session
const sessionId = await sessionManager.saveSession(config, results);

// Load session
const session = await sessionManager.loadSession(sessionId);

// Compare sessions
const comparison = await sessionManager.compareSessions(sessionId1, sessionId2);
```

## ⚙️ Configuration

### Test Configuration Schema
```typescript
interface TestConfig {
  name: string;                    // Test name
  description?: string;            // Test description
  environment: 'development' | 'staging' | 'production';
  maxUsers: number;               // Maximum concurrent users
  duration: number;               // Test duration in seconds
  scenarios: TestScenario[];      // Test scenarios
  variables?: Record<string, any>; // Global variables
  headers?: Record<string, string>; // Global headers
  timeout?: number;               // Request timeout (ms)
  thinkTime?: number;             // Default think time (ms)
}
```

### Scenario Configuration
```typescript
interface TestScenario {
  name: string;                   // Scenario name
  weight: number;                 // Execution weight
  flow: TestStep[];               // Test steps
  variables?: Record<string, any>; // Scenario variables
  thinkTime?: number;             // Scenario think time
}
```

### Test Step Types
```typescript
// HTTP Request
{
  type: 'http',
  http: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    headers?: Record<string, string>,
    body?: string,
    timeout?: number
  },
  think?: number,
  extract?: Record<string, string>
}

// WebSocket Message
{
  type: 'websocket',
  websocket: {
    action: 'send' | 'connect' | 'close',
    message?: any,
    waitFor?: string
  }
}

// Custom Function
{
  type: 'function',
  function: {
    name: string,
    parameters?: any[]
  }
}
```

## 📊 API Reference

### LoadTestProcessor

#### `runTest(config: TestConfig): Promise<TestResults>`
Execute a load test with the given configuration.

```typescript
const processor = new LoadTestProcessor();
const results = await processor.runTest(config);
```

#### `validateConfig(config: TestConfig): ValidationResult`
Validate test configuration before execution.

```typescript
const validation = processor.validateConfig(config);
if (!validation.isValid) {
  console.error('Configuration errors:', validation.errors);
}
```

#### `exportResults(results: TestResults, format: 'json' | 'csv'): string`
Export test results in specified format.

```typescript
const jsonExport = processor.exportResults(results, 'json');
const csvExport = processor.exportResults(results, 'csv');
```

### WindsurfMetricsAnalyzer

#### `analyzeResults(results: TestResults): Promise<AnalysisResult>`
Analyze test results with AI-powered insights.

```typescript
const analyzer = new WindsurfMetricsAnalyzer();
const analysis = await analyzer.analyzeResults(results);
```

#### `predictLoad(currentMetrics: Metrics, targetLoad: number): Promise<Prediction>`
Predict performance under target load.

```typescript
const prediction = await analyzer.predictLoad(currentMetrics, 1000);
console.log('Predicted capacity:', prediction.estimatedCapacity);
```

#### `analyzeBottlenecks(results: TestResults): Promise<BottleneckAnalysis>`
Analyze performance bottlenecks.

```typescript
const bottlenecks = await analyzer.analyzeBottlenecks(results);
console.log('Bottlenecks found:', bottlenecks.bottlenecks.length);
```

### SessionManager

#### `saveSession(config: TestConfig, results?: TestResults): Promise<string>`
Save test configuration and results.

```typescript
const sessionId = await sessionManager.saveSession(config, results);
```

#### `loadSession(sessionId: string): Promise<SessionData>`
Load saved session.

```typescript
const session = await sessionManager.loadSession(sessionId);
```

#### `compareSessions(sessionId1: string, sessionId2: string): Promise<ComparisonResult>`
Compare two test sessions.

```typescript
const comparison = await sessionManager.compareSessions(sessionId1, sessionId2);
```

### ExecutionPolicyManager

#### `validateTestConfig(config: TestConfig, policyName: string): Promise<ValidationResult>`
Validate test configuration against execution policy.

```typescript
const policyManager = new ExecutionPolicyManager();
const validation = await policyManager.validateTestConfig(config, 'production');
```

#### `monitorTestExecution(config: TestConfig, metrics: any, policyName: string): Promise<MonitoringResult>`
Monitor test execution for policy violations.

```typescript
const monitoring = await policyManager.monitorTestExecution(config, metrics, 'production');
if (monitoring.shouldStop) {
  console.log('Test stopped due to policy violation');
}
```

## 🖥️ Dashboard Usage

### Starting the Dashboard
```bash
# Start the dashboard server
npm run dashboard

# Or open the HTML file directly
open src/dashboard/index.html
```

### Dashboard Features
- **Real-time Metrics**: Live performance monitoring
- **Test Control**: Start, pause, stop tests
- **Session Management**: Load, save, compare sessions
- **Visual Analytics**: Charts and progress indicators
- **Alert System**: Real-time notifications

### Dashboard Controls
1. **Test Configuration**: Set test parameters
2. **Test Control**: Start/pause/stop tests
3. **Session Management**: Load/save/compare sessions
4. **Live Monitoring**: Real-time metrics display
5. **Export Results**: Download test results

## 🔧 Advanced Features

### Custom Functions
```typescript
// Define custom function
const customFunctions = {
  generateRandomEmail: () => `user${Date.now()}@example.com`,
  calculateDiscount: (price: number, percentage: number) => price * (1 - percentage / 100)
};

// Use in test step
{
  type: 'function',
  function: {
    name: 'generateRandomEmail',
    parameters: []
  },
  extract: {
    email: 'result'
  }
}
```

### Data Correlation
```typescript
// Extract data from response
{
  type: 'http',
  http: {
    method: 'POST',
    url: 'https://api.bell24h.com/auth/login',
    body: JSON.stringify({ email: '{{email}}', password: 'password' })
  },
  extract: {
    token: 'token',
    userId: 'user.id'
  }
}

// Use extracted data in subsequent requests
{
  type: 'http',
  http: {
    method: 'GET',
    url: 'https://api.bell24h.com/user/{{userId}}/profile',
    headers: { 'Authorization': 'Bearer {{token}}' }
  }
}
```

### Conditional Logic
```typescript
{
  type: 'http',
  http: {
    method: 'GET',
    url: 'https://api.bell24h.com/user/profile'
  },
  conditions: [
    {
      if: 'response.status === 200',
      then: [
        {
          type: 'http',
          http: {
            method: 'GET',
            url: 'https://api.bell24h.com/user/preferences'
          }
        }
      ]
    }
  ]
}
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- load-test-processor.test.ts

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure
```
src/__tests__/
├── load-test-processor.test.ts
├── windsurf-metrics-analyzer.test.ts
├── session-manager.test.ts
├── execution-policy.test.ts
└── websocket-load-tester.test.ts
```

### Writing Tests
```typescript
import { LoadTestProcessor } from '../load-test-processor';

describe('LoadTestProcessor', () => {
  let processor: LoadTestProcessor;

  beforeEach(() => {
    processor = new LoadTestProcessor();
  });

  it('should validate correct configuration', () => {
    const config = { /* test config */ };
    const result = processor.validateConfig(config);
    expect(result.isValid).toBe(true);
  });

  it('should execute test successfully', async () => {
    const config = { /* test config */ };
    const results = await processor.runTest(config);
    expect(results).toBeDefined();
    expect(results.metrics.requests.total).toBeGreaterThan(0);
  });
});
```

## 🚀 Deployment

### Production Deployment
```bash
# Build for production
npm run build:prod

# Start production server
npm start

# Or use Docker
docker build -t bell24h-load-testing .
docker run -p 3001:3001 bell24h-load-testing
```

### Docker Configuration
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY src/dashboard/ ./src/dashboard/

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

### Environment Variables
```env
# Production Configuration
NODE_ENV=production
LOG_LEVEL=warn
MAX_CONCURRENT_TESTS=10

# Security
API_KEY=your-api-key
SECRET_KEY=your-secret-key

# Monitoring
METRICS_ENDPOINT=https://metrics.bell24h.com
ALERT_WEBHOOK=https://alerts.bell24h.com/webhook
```

## 🔍 Troubleshooting

### Common Issues

#### Test Execution Fails
```bash
# Check configuration
npm run validate-config

# Check network connectivity
npm run health-check

# Check resource usage
npm run resource-check
```

#### High Memory Usage
- Reduce `maxUsers` in test configuration
- Increase `thinkTime` between requests
- Enable garbage collection optimization

#### Network Timeouts
- Increase `timeout` in test configuration
- Check target server availability
- Verify network connectivity

#### Dashboard Not Loading
- Check if dashboard server is running
- Verify port 3001 is available
- Check browser console for errors

### Debug Mode
```bash
# Enable debug logging
DEBUG=bell24h:* npm start

# Run with verbose output
npm start -- --verbose

# Check detailed metrics
npm run metrics -- --detailed
```

### Performance Optimization
```typescript
// Optimize for high load
const optimizedConfig = {
  ...config,
  maxUsers: Math.min(config.maxUsers, 500),
  timeout: 30000,
  thinkTime: 1000,
  scenarios: config.scenarios.map(scenario => ({
    ...scenario,
    flow: scenario.flow.map(step => ({
      ...step,
      think: (step.think || 0) + 500
    }))
  }))
};
```

## 📈 Performance Benchmarks

### System Requirements
- **Minimum**: 4GB RAM, 2 CPU cores
- **Recommended**: 8GB RAM, 4 CPU cores
- **High Load**: 16GB RAM, 8 CPU cores

### Performance Metrics
- **Max Concurrent Users**: 10,000
- **Max Requests/Second**: 50,000
- **Test Duration**: Up to 24 hours
- **Memory Usage**: 2-8GB depending on load
- **CPU Usage**: 20-80% depending on load

### Scaling Guidelines
- **Horizontal Scaling**: Add more test instances
- **Vertical Scaling**: Increase server resources
- **Load Distribution**: Use multiple target servers
- **Resource Monitoring**: Monitor CPU, memory, network

## 🤝 Contributing

### Development Setup
```bash
# Clone repository
git clone <repository-url>
cd bell24h/load-testing

# Install dependencies
npm install

# Setup development environment
npm run setup:dev

# Start development server
npm run dev
```

### Code Style
```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Update documentation
6. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [API Documentation](./docs/api.md)
- [Configuration Guide](./docs/configuration.md)
- [Troubleshooting Guide](./docs/troubleshooting.md)

### Community
- [GitHub Issues](https://github.com/bell24h/load-testing/issues)
- [Discord Community](https://discord.gg/bell24h)
- [Email Support](mailto:support@bell24h.com)

### Professional Support
- [Enterprise Support](https://bell24h.com/enterprise)
- [Consulting Services](https://bell24h.com/consulting)
- [Training Programs](https://bell24h.com/training) 