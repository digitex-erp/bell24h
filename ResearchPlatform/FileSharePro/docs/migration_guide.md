# Bell24h Marketplace - Migration Guide

This document outlines the process of migrating the Bell24h Marketplace application from exportlead.hub@gmail.com to samplinghub@gmail.com Replit account.

## Migration Overview

The migration process involved:
1. Replicating the project structure in the new account
2. Setting up the database and environment variables
3. Migrating code and assets
4. Testing functionality to ensure feature parity
5. Implementing additional trading features and WebSocket capabilities

## Database Migration

### Schema Migration

The database schema was migrated using Drizzle ORM's schema definition files. This involved:

1. Copying the schema definitions from `shared/schema.ts`
2. Setting up the `DATABASE_URL` environment variable in the new account
3. Running `npm run db:push` to create the schema in the new database

### Data Migration

Data was migrated using a seed script (`seed_data.js`) that populates the database with:

- Industries (Manufacturing, Electronics, etc.)
- Categories (Metal Fabrication, PCB Assembly, etc.)
- Users (Buyers and Suppliers)
- RFQs with requirements and specifications
- Supplier metrics for performance tracking

## Code Migration

### Backend Migration

The backend code migration involved:

1. Switching from TypeScript to JavaScript for the main server for better stability
2. Implementing WebSocket support for real-time communication
3. Adding security features including:
   - Rate limiting
   - Input validation
   - XSS protection
4. Implementing trading features including:
   - RFQ creation and management
   - Supplier matching algorithms
   - Quote submission and management
   - Analytics endpoints

### Frontend Migration

The frontend migration included:

1. Replicating the React application structure
2. Setting up WebSocket client functionality
3. Creating a WebSocket test page for verification
4. Ensuring proper asset handling

## Environment Setup

The following environment variables were configured in the new account:

- `DATABASE_URL`: For PostgreSQL database connection
- `PORT`: For server port configuration (default: 5000)

## Testing and Verification

To ensure successful migration, we implemented:

1. A test script (`test_trading.js`) that verifies:
   - API endpoints functionality
   - RFQ matching algorithm
   - WebSocket connectivity
   - Trading analytics

2. A WebSocket test page (`websocket-test.html`) that allows interactive testing of WebSocket communications

## Running the Migrated Application

For instructions on running the migrated application, see `docs/running_instructions.md`.

## Known Issues

1. The TypeScript server initialization may fail in the Replit workflow. Use the JavaScript server (`server.js`) as an alternative.
2. The `supplier_categories` table may need to be created for advanced supplier matching. The system falls back to a simpler matching algorithm if this table doesn't exist.

## Next Steps

1. Complete the UI/UX implementation
2. Implement user testing with suppliers and buyers
3. Set up CI/CD pipeline for continuous deployment
4. Develop monitoring and logging infrastructure

## Contact Information

For questions about the migration process, contact:
- Bell24h Team (bell24h.support@example.com)