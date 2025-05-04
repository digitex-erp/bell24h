# Bell24h Marketplace

An advanced AI-powered RFQ marketplace revolutionizing global procurement through intelligent supplier matching, blockchain security, and intuitive user experience.

## Overview

Bell24h is a comprehensive Request for Quote (RFQ) marketplace designed to connect buyers and suppliers through an intelligent, AI-driven platform. With features like blockchain-secured transactions, voice/video RFQ submission, and multi-language support, Bell24h aims to modernize the procurement landscape for businesses of all sizes.

## Core Features (✅ Production Ready)

- **AI-Powered Supplier Matching**: Production-ready algorithms with real-time matching
- **Voice & Video RFQ Creation**: Submit RFQs using voice commands with audio feedback confirmation
- **Blockchain Payment Security**: Secure transactions with blockchain verification and educational resources
- **Dual Financial Services**: KredX and M1 Exchange integrations for invoice financing and early payments
- **Multi-language Support**: Platform available in English, Hindi, Spanish, Arabic, and Chinese
- **Interactive Procurement Challenges**: Learn best practices through gamified scenarios
- **Comprehensive Analytics**: Data visualization tools for market insights
- **One-Click Industry Trend Generator**: Instantly generate comprehensive industry trend snapshots with minimal input
- **Weekly Trend Reports**: Email subscription for regular industry trend updates

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

## One-Click Industry Trend Generator

The One-Click Industry Trend Generator provides instant market intelligence with minimal user input:

- **Instant Trend Snapshots**: Generate comprehensive industry trend reports with just one click
- **Template-Based Generation**: Apply customized templates for consistent report formatting
- **Regional Focus**: Filter trend data by geographic regions for targeted insights
- **AI-Powered Analysis**: Utilizes OpenAI's latest models to deliver accurate, up-to-date industry data
- **Key Data Points**: Includes market size estimates, growth projections, emerging technologies, and top players
- **Weekly Email Reports**: Subscribe to weekly industry trend updates via email
- **Enhanced User Interface**: Tabbed interface separating "One-Click" and "Custom Search" options
- **Featured Industry Cards**: Quick access to popular industries with visual indicators

### Usage

1. Navigate to the Industry Trends page
2. Choose between "One-Click" or "Custom Search" tabs
3. On One-Click tab:
   - Select a featured industry card or use the dropdown
   - (Optional) Select a region focus
   - Click to generate your snapshot
4. On Custom Search tab:
   - Enter detailed industry parameters
   - Select template and timeframe options
   - Generate custom reports
5. View, save, export (PDF), or share the generated trend report
6. (Optional) Subscribe to weekly email updates for your industry of interest

The system automatically applies the appropriate report templates and optimal parameters, giving users immediate access to valuable market intelligence without configuration complexity. Audio feedback confirms successful report generation.

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

### Key Project Documentation

- [FEATURES.md](./FEATURES.md): Comprehensive feature list and capabilities
- [TODO.md](./TODO.md): Current project status and completion details (100% complete)
- [sitemap.md](./sitemap.md): Complete site structure and user journey flows
- [deployment-readiness-report.md](./deployment-readiness-report.md): Detailed deployment preparation guide
- [future-roadmap.md](./future-roadmap.md): Strategic roadmap for optimization and expansion
- [performance-optimization-guide.md](./performance-optimization-guide.md): Technical guide for scaling and optimizing performance
- [mobile-app-strategy.md](./mobile-app-strategy.md): Comprehensive mobile application development plan

### Integration Documentation

- [M1_EXCHANGE_INTEGRATION.md](./attached_assets/M1_EXCHANGE_INTEGRATION.md): M1 Exchange integration details
- [FINANCIAL_SERVICES_COMPARISON.md](./attached_assets/FINANCIAL_SERVICES_COMPARISON.md): Comparing KredX and M1 Exchange
- [GST_VALIDATION_SERVICE_DOCS.md](./GST_VALIDATION_SERVICE_DOCS.md): GST validation service documentation

## License

This project is proprietary software. All rights reserved.

## Contact

For any inquiries, please contact support@bell24h.com.