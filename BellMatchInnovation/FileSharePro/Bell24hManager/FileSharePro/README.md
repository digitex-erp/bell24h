# Bell24h RFQ Marketplace

Bell24h is an AI-powered B2B procurement platform designed to streamline industrial supply chain interactions. The application facilitates request for quotation (RFQ) processes across multiple industries including Manufacturing, Electronics, Chemicals, Automotive, and Textiles.

## Features

- **RFQ Management**: Create, publish, and manage RFQs with detailed requirements
- **AI-Powered Supplier Matching**: Automatically find the best suppliers for each RFQ
- **Real-time Communication**: WebSocket integration for instant notifications
- **Trading Analytics**: Track performance metrics and market trends
- **Security Features**: Rate limiting, input validation, and XSS protection

## Technology Stack

- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Real-time Communication**: WebSockets
- **Frontend**: React.js (TypeScript)
- **ORM**: Drizzle ORM

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- Git

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-organization/bell24h.git
   cd bell24h
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the project root with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/bell24h
   PORT=5000
   ```

4. Run database migrations:
   ```
   npm run db:push
   ```

5. Seed the database (optional):
   ```
   node seed_data.js
   ```

### Running the Application

You can start the application using one of the following methods:

#### Method 1: Using npm script
```
npm run dev
```

#### Method 2: Using start script
```
./start_app.sh
```

#### Method 3: Direct node command
```
node server.js
```

The application will be available at http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user

### RFQs
- `GET /api/rfqs` - Get all published RFQs
- `GET /api/rfqs/:id` - Get RFQ by ID
- `POST /api/rfqs` - Create a new RFQ
- `PATCH /api/rfqs/:id` - Update an RFQ
- `GET /api/rfqs/:id/matches` - Get matching suppliers for an RFQ
- `POST /api/rfqs/:id/submit` - Submit RFQ to suppliers

### Quotes
- `GET /api/quotes/:id` - Get quote by ID
- `POST /api/quotes` - Submit a quote
- `PATCH /api/quotes/:id` - Update a quote

### Analytics
- `GET /api/analytics/trading` - Get trading analytics

## WebSocket API

The application exposes a WebSocket server for real-time updates. Connect to:
```
ws://localhost:5000
```

### WebSocket Events

- `welcome` - Connection confirmation
- `rfq_submitted` - When an RFQ is submitted to suppliers
- `new_rfq_received` - When a supplier receives a new RFQ
- `rfq_match_requested` - When a buyer requests supplier matches

## Testing

To run tests on the trading features:
```
node test_trading.js
```

To test WebSocket functionality, open `/websocket-test.html` in your browser after starting the server.

## Project Structure

- `server.js` - Main application entry point
- `shared/` - Shared TypeScript definitions and schemas
- `client/` - Frontend React application
- `server/` - Backend server components (TypeScript)
- `docs/` - Documentation files
- `frontend/` - Static frontend files

## License

[MIT License](LICENSE)

## Contributors

- Bell24h Team