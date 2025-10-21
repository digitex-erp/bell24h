# Bell24h.com - AI-Powered RFQ Marketplace

An intelligent RFQ (Request for Quote) marketplace using AI for matching buyers with suppliers, featuring explainable recommendations and GST compliance.

## Features

- 🤖 AI-Driven RFQ Matching
- 📊 SHAP/LIME Explainable Recommendations
- 💳 RazorpayX Escrow Integration
- ✅ GST Auto-Validation
- 🔄 Real-time Updates
- 🎯 Predictive Analytics

## Tech Stack

- Frontend: Next.js
- Backend: FastAPI
- Database: Supabase
- AI: HuggingFace Transformers, TensorFlow
- Payments: RazorpayX
- Automation: Make.com

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Run the development server:
```bash
uvicorn app.main:app --reload
```

## Project Structure

```
Bell24h/
├── backend/           # FastAPI backend
├── frontend/         # Next.js frontend
├── ai/              # AI models and utilities
└── docs/            # Documentation
```
