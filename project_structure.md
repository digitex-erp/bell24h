# Bell24H.com Project Structure

## Main Project Structure
```
bell24h/
├── client/                   # Frontend React application
│   ├── src/
│   │   ├── components/       # UI components
│   │   ├── hooks/            # React hooks for shared functionality
│   │   ├── lib/              # Utility functions and helpers
│   │   │   ├── queryClient.ts 
│   │   │   ├── protected-route.tsx
│   │   │   └── utils.ts
│   │   ├── pages/            # Page components
│   │   │   ├── analytics-page.tsx
│   │   │   ├── auth-page.tsx
│   │   │   ├── bids-page.tsx
│   │   │   ├── contracts-page.tsx
│   │   │   ├── dashboard-page.tsx
│   │   │   ├── messages-page.tsx
│   │   │   ├── not-found.tsx
│   │   │   ├── rfq-page.tsx
│   │   │   └── wallet-page.tsx
│   │   ├── App.tsx           # Main application component
│   │   ├── index.css         # Global styles
│   │   └── main.tsx          # Entry point
│   └── index.html           # HTML template
├── server/                   # Backend server
│   ├── auth.ts               # Authentication module
│   ├── blockchain.ts         # Blockchain integration
│   ├── db.ts                 # Database connection
│   ├── index.ts              # Main server entry point
│   ├── openai.ts             # OpenAI integration
│   ├── routes.ts             # API routes
│   ├── storage.ts            # Data storage layer
│   └── vite.ts               # Vite configuration
├── shared/                   # Shared code between frontend and backend
│   └── schema.ts             # Database schema and types
├── src/                      # Additional source files
│   ├── api/                  # API implementations
│   │   ├── auth.ts
│   │   ├── index.ts
│   │   ├── rfq.ts
│   │   └── voiceRfq.ts
│   ├── db/                   # Database utilities
│   │   ├── index.ts
│   │   └── seed.ts
│   ├── middleware/           # Middleware functions
│   │   └── auth.ts
│   ├── models/               # Data models
│   │   └── schema.ts
│   ├── services/             # Service implementations
│   │   └── openai.ts
│   ├── db-migrator.ts        # Database migration tool
│   ├── db.ts                 # Database connection
│   └── index.ts              # Entry point
├── test files                # Various test scripts
│   ├── test-analytics-api.js
│   ├── test-analytics-frontend.js
│   ├── test-auth.js
│   ├── test-database.js
│   ├── test-db-connection.js
│   ├── test-db-data.js
│   ├── test-voice-rfq.js
│   └── test-websocket.js
├── utility scripts
│   ├── bell24h-unified-startup.js
│   ├── download-project.js
│   ├── package-for-deployment.js
│   ├── run.js
│   ├── simple-api-server.js
│   ├── simple-server.ts
│   ├── start-app.js
│   ├── start-app.sh
│   └── start-bell24h.sh
└── documentation
    ├── todo.md                 # Todo list and completion status
    ├── updated_features.md     # Updated feature lists
    ├── features.md             # Feature documentation
    └── additional documentation files
```

## Key Component Structure

### Database Schema (shared/schema.ts)
- Users table: Authentication and user profile data
- Suppliers table: Supplier-specific information
- RFQs table: Request for quotations
- Bids table: Supplier bids on RFQs
- Contracts table: Agreements between buyers and suppliers
- Messages table: Communication system
- Transactions table: Financial transaction records

### Server Components
- Auth system: User authentication using Passport.js
- Storage layer: Database operations using Drizzle ORM
- Blockchain integration: Polygon-based smart contracts
- OpenAI integration: Voice RFQ and AI features
- API routes: RESTful endpoints for all platform features

### Client Pages
- Authentication: User login and registration
- Dashboard: Overview of user activity
- RFQ management: Create and manage RFQs
- Bid management: Submit and track bids
- Contract management: Review and manage contracts
- Messaging: Communication between users
- Wallet: Financial transactions and escrow
- Analytics: Platform insights and visualizations

## Testing Infrastructure
- Database connection testing
- Authentication testing
- API endpoint testing
- WebSocket communication testing
- Voice RFQ feature testing
- Analytics data testing

## Deployment and Execution
- Startup scripts for development and production
- Configuration for various environments
- Deployment packaging utilities