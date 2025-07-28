# 🔗 Bell24H API Documentation - Complete B2B Marketplace

## **Base URL**
```
Production: https://api.bell24h.com
Development: http://localhost:3000
```

## **Authentication**
All API endpoints require authentication using JWT tokens in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## **🎤 Voice RFQ Endpoints**

### **POST /api/rfq/voice**
Create RFQ from voice input using OpenAI Whisper
```json
{
  "audioFile": "base64_encoded_audio",
  "language": "en",
  "category": "electronics"
}
```
**Response:**
```json
{
  "rfqId": "rfq_123",
  "transcription": "I need 1000 LED bulbs...",
  "extractedData": {
    "title": "LED Bulbs Supply",
    "description": "Need 1000 LED bulbs...",
    "quantity": 1000,
    "category": "electronics"
  }
}
```

---

## **🎥 Video RFQ Endpoints**

### **POST /api/rfq/video**
Upload video RFQ with privacy masking
```json
{
  "videoFile": "video_data",
  "title": "Product Showcase",
  "description": "Detailed product requirements",
  "privacyMasking": true,
  "category": "machinery"
}
```

### **GET /api/rfq/video/:id**
Get video RFQ details
```json
{
  "rfqId": "rfq_123",
  "videoUrl": "https://cloudinary.com/...",
  "title": "Product Showcase",
  "status": "active",
  "matches": ["supplier_1", "supplier_2"]
}
```

---

## **🤖 AI Explainability Endpoints**

### **POST /api/rfq/:id/explain-matches**
Get detailed explanation of supplier matches
```json
{
  "explanations": [
    {
      "supplierId": "supplier_1",
      "explanation": {
        "matchScore": 0.85,
        "features": [
          {
            "feature": "industry_match",
            "importance": 0.4,
            "description": "This factor strongly positively influences the match"
          }
        ],
        "localExplanation": "Industry match positively impacts the score by 0.40 points",
        "globalExplanation": "This match is primarily based on industry_match, capacity, quality_metrics",
        "confidenceScore": 0.78
      }
    }
  ]
}
```

### **GET /api/supplier/:id/explain-score**
Explain supplier risk score
```json
{
  "supplierId": "supplier_1",
  "explanation": {
    "matchScore": 0.72,
    "features": [
      {
        "feature": "financial_stability",
        "importance": 0.3,
        "description": "This factor moderately increases the risk score"
      }
    ],
    "localExplanation": "Financial stability moderately increases the risk score by 0.30 points",
    "globalExplanation": "Key risk factors include financial_stability and delivery_history",
    "confidenceScore": 0.85
  }
}
```

---

## **📊 Stock Market Integration Endpoints**

### **GET /api/market/insights**
Get market insights for industry
```
Query Parameters:
- industry: string (optional, default: "default")
```
**Response:**
```json
{
  "trend": "bullish",
  "confidence": 0.75,
  "factors": [
    "Positive market momentum",
    "High trading volume",
    "Industry growth"
  ],
  "recommendation": "Consider expanding capacity and inventory",
  "impact": "high"
}
```

### **GET /api/market/predict/:rfqId**
Get predictive analytics for RFQ
```json
{
  "demandForecast": 120,
  "pricePrediction": 125000,
  "marketTrend": {
    "trend": "bullish",
    "confidence": 0.75,
    "factors": ["Market growth", "High demand"],
    "recommendation": "Consider premium pricing",
    "impact": "high"
  },
  "supplierRecommendations": [
    "Focus on suppliers with high capacity",
    "Consider premium suppliers for quality"
  ],
  "riskFactors": [
    "High demand may lead to capacity constraints",
    "Price increases could affect budget"
  ]
}
```

### **GET /api/market/trends**
Get real-time stock market trends
```
Query Parameters:
- symbols: string (comma-separated, default: "NIFTY50,SENSEX")
```
**Response:**
```json
[
  {
    "symbol": "NIFTY50",
    "price": 18500.25,
    "change": 125.50,
    "changePercent": 0.68,
    "volume": 2500000,
    "marketCap": 8500000000000,
    "timestamp": "2024-06-09T10:30:00Z"
  }
]
```

---

## **💲 Dynamic Pricing Endpoints**

### **POST /api/pricing/suggest**
Get AI-powered price suggestions
```json
{
  "rfqId": "rfq_123"
}
```
**Response:**
```json
{
  "suggestedPrice": 125000,
  "marketTrend": "bullish",
  "confidence": 0.75
}
```

### **POST /api/pricing/optimize**
Get optimized pricing recommendations
```json
{
  "rfqId": "rfq_123"
}
```
**Response:**
```json
{
  "optimizedPrice": 118000,
  "marketTrend": "bullish",
  "confidence": 0.80
}
```

### **GET /api/pricing/market-based**
Get market-based pricing index
```
Query Parameters:
- industry: string (optional, default: "default")
```
**Response:**
```json
{
  "priceIndex": 105,
  "marketTrend": "bullish",
  "confidence": 0.75
}
```

---

## **🌍 Global Trade Insights Endpoints**

### **GET /api/trade/insights**
Get global trade intelligence
```
Query Parameters:
- country: string (optional, default: "India")
- product: string (optional, default: "All")
```
**Response:**
```json
{
  "country": "India",
  "product": "Electronics",
  "trends": [
    {
      "year": 2023,
      "export": 120000,
      "import": 90000
    }
  ],
  "summary": "Exports are growing steadily in electronics sector"
}
```

### **GET /api/trade/opportunities**
Get trade opportunities for SMEs
```
Query Parameters:
- country: string (optional, default: "India")
- sector: string (optional, default: "All")
```
**Response:**
```json
[
  {
    "sector": "Textiles",
    "country": "Bangladesh",
    "opportunity": "High demand for organic cotton"
  }
]
```

### **GET /api/trade/export-data**
Get export/import data
```
Query Parameters:
- country: string (optional, default: "India")
- hsCode: string (optional, default: "All")
```
**Response:**
```json
{
  "country": "India",
  "hsCode": "8504",
  "data": [
    {
      "year": 2023,
      "value": 50000
    }
  ]
}
```

---

## **📦 Logistics Integration Endpoints**

### **POST /api/logistics/shiprocket/track**
Track Shiprocket shipments
```json
{
  "shipmentId": "SR123456789"
}
```
**Response:**
```json
{
  "shipmentId": "SR123456789",
  "status": "In Transit",
  "lastUpdate": "2024-06-09T10:30:00Z",
  "checkpoints": [
    {
      "location": "Delhi Hub",
      "time": "2024-06-09T10:00:00Z",
      "status": "Dispatched"
    }
  ]
}
```

### **POST /api/logistics/real-time-updates**
Webhook for real-time shipment updates
```json
{
  "shipmentId": "SR123456789",
  "status": "Delivered",
  "timestamp": "2024-06-09T15:30:00Z",
  "location": "Mumbai"
}
```

---

## **💰 Payment & Escrow Endpoints**

### **POST /api/wallet/deposit**
Deposit funds to wallet
```json
{
  "amount": 100000,
  "paymentMethod": "razorpay"
}
```

### **POST /api/escrow/create**
Create escrow for transaction
```json
{
  "rfqId": "rfq_123",
  "supplierId": "supplier_1",
  "amount": 50000
}
```

### **POST /api/escrow/release**
Release escrow funds
```json
{
  "escrowId": "escrow_123",
  "reason": "delivery_completed"
}
```

---

## **📱 Mobile App Specific Endpoints**

### **GET /api/mobile/dashboard**
Get mobile dashboard data
```json
{
  "userStats": {
    "totalRFQs": 25,
    "activeMatches": 12,
    "walletBalance": 75000
  },
  "recentActivity": [
    {
      "type": "rfq_created",
      "title": "LED Bulbs Supply",
      "timestamp": "2024-06-09T10:30:00Z"
    }
  ],
  "marketInsights": {
    "trend": "bullish",
    "recommendation": "Consider expanding capacity"
  }
}
```

---

## **🔍 Search & Discovery Endpoints**

### **GET /api/search/suppliers**
Search suppliers with AI matching
```
Query Parameters:
- query: string (required)
- category: string (optional)
- location: string (optional)
- rating: number (optional)
```
**Response:**
```json
{
  "suppliers": [
    {
      "id": "supplier_1",
      "name": "ABC Electronics",
      "rating": 4.5,
      "matchScore": 0.85,
      "location": "Mumbai",
      "categories": ["electronics", "components"]
    }
  ],
  "totalCount": 150,
  "aiRecommendations": [
    "Consider supplier_1 for best quality-price ratio"
  ]
}
```

---

## **📊 Analytics Endpoints**

### **GET /api/analytics/user-activity**
Get user activity analytics
```
Query Parameters:
- userId: string (required)
- period: string (optional, default: "30d")
```
**Response:**
```json
{
  "rfqsCreated": 15,
  "suppliersContacted": 8,
  "transactionsCompleted": 5,
  "totalSpent": 250000,
  "activityTrend": [
    {
      "date": "2024-06-01",
      "rfqs": 2,
      "contacts": 1
    }
  ]
}
```

---

## **Error Responses**

All endpoints return consistent error responses:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-06-09T10:30:00Z"
}
```

Common error codes:
- `AUTH_REQUIRED`: Authentication required
- `INVALID_INPUT`: Invalid request data
- `NOT_FOUND`: Resource not found
- `RATE_LIMITED`: Too many requests
- `SERVER_ERROR`: Internal server error

---

## **Rate Limits**

- **Standard endpoints**: 100 requests/minute
- **AI/ML endpoints**: 20 requests/minute
- **File upload endpoints**: 10 requests/minute
- **Analytics endpoints**: 50 requests/minute

---

## **SDK & Libraries**

### **JavaScript/TypeScript**
```bash
npm install bell24h-sdk
```

### **React Native**
```bash
npm install bell24h-react-native
```

### **Python**
```bash
pip install bell24h-python
```

---

## **Webhook Configuration**

Configure webhooks for real-time updates:
```
POST /api/webhooks/configure
{
  "url": "https://your-app.com/webhook",
  "events": ["rfq_created", "match_found", "payment_completed"]
}
```

---

## **🚀 Getting Started**

1. **Register** for API access at https://bell24h.com/developers
2. **Get API key** from your dashboard
3. **Install SDK** for your platform
4. **Start building** with the most advanced B2B marketplace APIs

**Your Bell24H marketplace is now 100% complete and ready to disrupt the Indian B2B market!** 🎉 