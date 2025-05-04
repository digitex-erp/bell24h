# Bell24h: AI-Powered RFQ Marketplace

Bell24h is an AI-powered RFQ (Request for Quote) marketplace that connects global buyers and suppliers through intelligent matching and real-time communication technologies.

## Project Overview

Bell24h uses AI to match suppliers with buyers based on multiple criteria including price, delivery time, past performance, and GST compliance. The platform provides explainable supplier recommendations using Hugging Face Transformers and SHAP/LIME technologies.

Key features include:
- Secure payments through a wallet and escrow system
- Real-time updates via notifications
- GST validation for suppliers in India
- AI-driven matching with transparency and explanations
- Mobile-friendly design for users in Tier-2 cities

## Real-Time Communication

Bell24h implements a progressive enhancement approach to real-time communications:

1. **WebSockets (Primary)**: True bi-directional communication with low latency
2. **Server-Sent Events (Secondary)**: One-way server-to-client real-time updates
3. **HTTP Long Polling (Fallback)**: Compatible with all environments

See our [full real-time communication strategy](docs/real-time-communication-strategy.md) for more details.

## Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: FastAPI, Python, PostgreSQL
- **AI/ML**: Hugging Face Transformers, SHAP, LIME, OpenAI GPT-4
- **Payments**: RazorpayX, Stripe
- **Database**: Supabase with PGVector
- **Hosting**: Vercel, Render.com

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/bell24h.git
cd bell24h
```

2. Install backend dependencies
```
pip install -r requirements.txt
```

3. Install frontend dependencies
```
cd frontend
npm install
```

4. Set up environment variables
```
cp .env.example .env
```

5. Start development servers
```
# Backend server
python backend/main.py

# WebSocket server
python backend/pure_python_websocket.py

# Frontend development server
cd frontend
npm run dev
```

## Demo Implementations

The project includes several demo implementations to showcase different real-time communication approaches:

- WebSocket Demo: `frontend/websocket-test.html`
- WebSocket Emulation (HTTP Polling): `frontend/websocket-emulated.html`
- Hybrid Approach: `frontend/hybrid-websocket.html`
- Server-Sent Events: `frontend/sse-test.html`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.