# Bell24h Marketplace

An advanced AI-powered RFQ marketplace revolutionizing global procurement through intelligent supplier matching, blockchain security, and intuitive user experience.

## Overview

Bell24h is a comprehensive Request for Quote (RFQ) marketplace designed to connect buyers and suppliers through an intelligent, AI-driven platform. With features like blockchain-secured transactions, voice/video RFQ submission, and multi-language support, Bell24h aims to modernize the procurement landscape for businesses of all sizes.

## Core Features

- **AI-Powered Supplier Matching**: Advanced algorithms match buyers with the most suitable suppliers
- **Voice & Video RFQ Creation**: Submit RFQs using voice commands or video recordings
- **Blockchain Payment Security**: Secure transactions with blockchain verification
- **Dual Financial Services**: KredX and M1 Exchange integrations for invoice financing and early payments
- **Multi-language Support**: Platform available in English, Hindi, Spanish, Arabic, and Chinese
- **Interactive Procurement Challenges**: Learn best practices through gamified scenarios
- **Comprehensive Analytics**: Data visualization tools for market insights

## Technology Stack

- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI, Gemini, and Hugging Face
- **Blockchain**: Ethereum/Polygon integration
- **Real-time Communication**: WebSocket for instant updates
- **Internationalization**: Multi-language support via i18n
- **Authentication**: Secure, role-based access control

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (v14+)
- API keys for external services (as needed)

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

3. Create a `.env` file based on `.env.example` and fill in your API keys:
   ```
   cp .env.example .env
   ```

4. Initialize the database:
   ```
   npm run db:push
   npm run db:seed
   ```

5. Start the development server:
   ```
   npm run dev
   ```

### Configuration

Various integrations require specific API keys:

#### Financial Services

- **KredX**: For invoice discounting services
  - Required keys: `KREDX_API_KEY`, `KREDX_API_SECRET`

- **M1 Exchange**: For early milestone payments
  - Required keys: `M1EXCHANGE_API_KEY`, `M1EXCHANGE_API_SECRET`, `M1EXCHANGE_API_URL`

#### AI Services

- **OpenAI**: For chatbot and recommendation engine
  - Required key: `OPENAI_API_KEY`

- **Gemini**: For alternative AI functions
  - Required key: `GEMINI_API_KEY`

#### Blockchain Services

- **Ethereum Provider**: For blockchain integration
  - Required key: `ETHEREUM_PROVIDER_URL`

## Financial Services Integration

Bell24h offers two complementary financial service providers:

### KredX Integration

KredX provides invoice discounting services that allow suppliers to:
- Convert unpaid invoices into immediate cash
- Access working capital against accounts receivable
- Benefit from competitive rates based on buyer credit profiles

### M1 Exchange Integration

M1 Exchange offers milestone-based early payment services that enable:
- Immediate payment upon milestone approval
- Direct integration with the platform's escrow system
- Flexible early payment options for specific milestones

See the [Financial Services Comparison](./attached_assets/FINANCIAL_SERVICES_COMPARISON.md) for detailed information on when to use each service.

## Project Structure

- `client/`: React frontend application
  - `src/components/`: Reusable UI components
  - `src/pages/`: Application page components
  - `src/lib/`: Utility functions and services
  - `src/hooks/`: Custom React hooks

- `server/`: Node.js backend application
  - `controllers/`: API route handlers
  - `services/`: Business logic implementation
  - `routes.ts`: API endpoint definitions

- `shared/`: Code shared between client and server
  - `schema.ts`: Database schema and type definitions

- `db/`: Database related files
  - `index.ts`: Database connection setup
  - `seed.ts`: Seed data for development

## Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the application for production
- `npm run start`: Start the production server
- `npm run db:push`: Update the database schema based on the Drizzle schema
- `npm run db:seed`: Seed the database with initial data
- `npm run test`: Run the test suite

## Documentation

Additional documentation can be found in the `attached_assets/` directory:

- [FEATURES.md](./attached_assets/FEATURES.md): Detailed feature list
- [M1_EXCHANGE_INTEGRATION.md](./attached_assets/M1_EXCHANGE_INTEGRATION.md): M1 Exchange integration details
- [FINANCIAL_SERVICES_COMPARISON.md](./attached_assets/FINANCIAL_SERVICES_COMPARISON.md): Comparing KredX and M1 Exchange

## License

This project is proprietary software. All rights reserved.

## Contact

For any inquiries, please contact support@bell24h.com.