# Bell24H WebSocket Server

This is the WebSocket server for the Bell24H Dashboard project, handling real-time communication and auto-scaling capabilities.

## Features

- Real-time bidirectional communication using Socket.IO
- Auto-scaling based on connection load
- Health check and metrics endpoints
- Connection monitoring and logging
- Load testing utilities

## Prerequisites

- Node.js 16+
- npm or yarn
- AWS Account (for auto-scaling)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
4. Update the `.env` file with your configuration

## Development

Start the development server with hot-reload:

```bash
npm run dev
```

## Production

Build and start the production server:

```bash
npm run build
npm start
```

## Testing

### Run All Tests

```bash
npm test
```

### Individual Tests

- **Basic WebSocket Test**: `npm run test:ws`
- **Metrics Endpoint Test**: `npm run test:metrics`
- **Health Check Test**: `npm run test:health`
- **Load Test**: `npm run test:load`

## Monitoring

Monitor server resources:

```bash
npm run monitor
```

## API Endpoints

- **Health Check**: `GET /health`
- **Metrics**: `GET /metrics`

## Environment Variables

See `.env.example` for all available environment variables.

## Auto-scaling

The server includes auto-scaling capabilities using AWS Auto Scaling. Configure the following environment variables:

- `AWS_REGION`: AWS region
- `AWS_ASG_NAME`: Auto Scaling Group name
- `AWS_SCALE_OUT_POLICY`: Scale-out policy name
- `AWS_SCALE_IN_POLICY`: Scale-in policy name
- `MAX_CONNECTIONS_PER_INSTANCE`: Maximum connections per instance (default: 10000)
- `SCALE_UP_THRESHOLD`: Scale-out threshold (0-1, default: 0.8)
- `SCALE_DOWN_THRESHOLD`: Scale-in threshold (0-1, default: 0.3)

## License

ISC
