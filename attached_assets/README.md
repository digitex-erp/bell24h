# Bell24h: AI-Powered RFQ Marketplace

Bell24h is an AI-powered RFQ (Request for Quote) marketplace that connects global buyers and suppliers through intelligent matching and real-time communication technologies. The platform aims to disrupt traditional B2B marketplaces by providing innovative features focused on AI-driven matching, voice/video RFQ submission, and a complete business ecosystem.

## Core USPs (Compared to IndiaMART)

- **AI-Powered Matching**: SHAP/LIME explainability + real-time scoring versus basic keyword matching
- **Voice-Based RFQ**: NLP-powered submission in Hindi/English for Tier-2 Indian users
- **Predictive Analytics**: Stock market-linked insights for supply chain planning
- **Supplier Risk Scoring**: Aladin-inspired risk assessment algorithm
- **Video RFQ/Product**: Masked buyer identity + video responses for better product understanding
- **Dynamic Pricing**: AI-suggested optimal pricing based on market trends
- **Escrow Wallet**: Secure milestone-based payments via RazorpayX
- **Global Trade Insights**: Export/import data for SMEs
- **Logistics Tracking**: Real-time shipment updates via Shiprocket/DHL API integration

## Technology Stack

- **Frontend**: React, Tailwind CSS, shadcn/ui components
- **Backend**: Node.js, Express, PostgreSQL
- **AI/ML**: OpenAI GPT-4, Whisper for voice, SHAP/LIME explainability
- **Payments**: RazorpayX, KredX for invoice discounting
- **Database**: PostgreSQL with Drizzle ORM
- **Real-Time**: WebSocket for bi-directional communication
- **Cloud Services**: Cloudinary for video storage and processing

## Features

### Real-Time Communication
1. **WebSockets**: Bi-directional real-time messaging and notifications
2. **Voice Assistant**: AI-powered voice command processing
3. **Video RFQs**: Video-based RFQ submission with buyer privacy protection

### AI Features
- **Intelligent Supplier Matching**: Transparency with SHAP/LIME explanations
- **Voice Recognition**: Voice-based RFQ submission with Hindi language support
- **Market Analysis**: Stock market trend analysis via Alpha Vantage API
- **Risk Scoring**: Comprehensive supplier risk assessment algorithm
- **Predictive Analytics**: RFQ success rates, supplier reliability forecasts

### Payment & Financial Features
- **Secure Escrow System**: Milestone-based payment protection
- **Invoice Discounting**: Integration with KredX (0.5% fee)
- **Wallet System**: Compulsory RazorpayX wallet with incentives
- **Blockchain Integration**: Planned integration for tamper-proof transactions

## Revenue Model (₹100 Crore Target)

- **Supplier Subscriptions**: ₹96 crore (12,500 suppliers × ₹8,000/year)
- **Transaction Fees**: ₹18 crore (2-5% fee on ₹30 crore/month)
- **Escrow Services**: ₹6 crore (1-2% fee on ₹50 crore/month)
- **Ad Revenue**: ₹24 crore (Promoted listings, featured RFQs)
- **Invoice Discounting**: ₹12 crore (0.5% fee via KredX)

## Pricing Strategy

- **Free Tier**: 5 RFQs/month, basic AI matching, wallet access
- **Pro (Monthly)**: ₹1,500/month, unlimited RFQs, SHAP explanations, GST compliance
- **Pro (Yearly)**: ₹15,000/year (20% discount), all Pro features
- **Enterprise**: ₹50,000/month, custom AI models, API access, escrow integration
- **Lifetime Free**: Early adopters get 10 RFQs/month for life

## Implementation Roadmap

1. **Core Platform**: RFQ management, user authentication, supplier matching
2. **Voice RFQ System**: OpenAI Whisper integration with Hindi support
3. **Video RFQ & Showcase**: Cloudinary integration with buyer identity masking
4. **Payment & Escrow**: RazorpayX wallet and escrow implementation
5. **Blockchain Integration**: Polygon-based secure transactions

## Getting Started

### Running in Development Environment

1. Click "Run" to start the development server
2. Access the application at the provided URL
3. Use the test credentials in the development environment

### Importing Project to VS Code

1. **Download the Project**:
   - Download the entire project directory structure
   - Ensure all folders and files are preserved

2. **Open in VS Code**:
   ```
   File > Open Folder > Select the Bell24h directory
   ```

3. **Install Dependencies**:
   ```bash
   npm install
   ```

4. **Configure Environment Variables**:
   - Copy `.env.local.example` to `.env.local`
   - Add your API keys and database credentials:
     ```
     DATABASE_URL=postgresql://...
     OPENAI_API_KEY=your_openai_key
     ```

5. **Initialize Database**:
   ```bash
   npm run db:push
   npm run db:seed
   ```

6. **Start Development Server**:
   ```bash
   npm run dev
   ```

7. **Access Application**:
   - Frontend: http://localhost:3000
   - API: http://localhost:3000/api

### Production Deployment

For production deployment, refer to the detailed instructions in `DEPLOYMENT_PLAN.md`.

## Testing

The project includes comprehensive test suites:

```bash
# Run all tests
npm run test

# Run specific test categories
npm run test:api      # API endpoint tests
npm run test:components  # React component tests
npm run test:integration # Full integration tests
```

Refer to `INTEGRATION_TESTING.md` for detailed testing strategies.

## Folder Structure

```
Bell24h/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   ├── pages/          # Page components
│   │   ├── App.tsx         # Main application component
│   │   └── main.tsx        # Application entry point
├── server/                 # Backend Express server
├── db/                     # Database layer
├── shared/                 # Shared code
└── [configuration files]   # Various config files
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.