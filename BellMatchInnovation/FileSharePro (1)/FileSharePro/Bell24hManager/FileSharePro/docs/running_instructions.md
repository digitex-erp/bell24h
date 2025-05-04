# Bell24h Marketplace - Running Instructions

This document provides detailed instructions for running the Bell24h Marketplace after migration to the new account (samplinghub@gmail.com).

## Quick Start

The fastest way to start the application is using our startup script:

```bash
./start_app.sh
```

This script will:
1. Check for required dependencies
2. Verify database connection
3. Start the server on port 5000

## Alternative Startup Methods

If you prefer to start the application manually, you can use one of these commands:

### Using Node.js directly

```bash
node server.js
```

### Using npm script (if TypeScript is working)

```bash
npm run dev
```

## Important Configuration

### Environment Variables

The application requires the following environment variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/bell24h
```

These should be set in the Replit environment already, but check if you encounter any database connection issues.

## Verifying the Server is Running

Once started, you can:

1. Open the webview in Replit to see the frontend
2. Test the API by accessing `http://localhost:5000/api/health`
3. Check WebSocket functionality with the test page at `http://localhost:5000/websocket-test.html`

## Testing Trading Features

To run tests that verify the trading features are working correctly:

```bash
node test_trading.js
```

This will verify:
- Health check endpoint
- RFQ endpoints
- RFQ matching algorithm
- WebSocket connectivity
- Trading analytics

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL is correctly set
   - Check that the PostgreSQL service is running
   - Try running `npm run db:push` to ensure schema is updated

2. **TypeScript Errors**
   - If you encounter TypeScript issues, use the JavaScript server instead
   - Run `node server.js` directly

3. **WebSocket Connection Issues**
   - WebSockets run on the same port as the HTTP server
   - Check for any proxy or firewall issues that might block WebSocket connections

4. **Port Conflicts**
   - If port 5000 is in use, modify the PORT environment variable

## Workflow Issues

If you experience issues with the workflow:

1. Stop any running workflows
2. Run the server manually with `./start_app.sh`

## Migration Notes

This application was migrated from exportlead.hub@gmail.com to samplinghub@gmail.com. The migration included:

- Database schema and data transfer
- Configuration settings and environment variables
- All application code and assets
- Trading features and WebSocket functionality

For full details of the migration process, see `docs/migration_guide.md`.