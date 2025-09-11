# Bell24H Enterprise API Documentation

## Base URL
```
https://api.bell24h.com/v1
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting
- 100 requests per 15 minutes per IP address
- Rate limit headers included in responses

## Common Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Response Format
```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/endpoint"
}
```

---

## Authentication Endpoints

### POST /auth/login
Login with email and password
```json
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false,
  "twoFactorCode": "123456"
}
```

### POST /auth/register
Register new user account
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "role": "buyer",
  "acceptTerms": true
}
```

### POST /auth/logout
Logout current user (requires auth)

### POST /auth/refresh
Refresh access token
```json
{
  "refreshToken": "refresh-token-here"
}
```

### POST /auth/password/reset
Request password reset
```json
{
  "email": "user@example.com"
}
```

### POST /auth/password/reset/confirm
Confirm password reset
```json
{
  "token": "reset-token",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

### GET /auth/profile
Get user profile (requires auth)

### PUT /auth/profile
Update user profile (requires auth)
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "preferences": {
    "language": "en",
    "timezone": "Asia/Kolkata",
    "notifications": {
      "email": true,
      "push": true,
      "sms": false
    }
  }
}
```

---

## RFQ Endpoints

### GET /rfq
Get all RFQs with pagination and filters
```
?page=1&limit=20&status=open&category=electronics
```

### GET /rfq/:id
Get specific RFQ by ID

### POST /rfq
Create new RFQ
```json
{
  "title": "Electronic Components Supply",
  "description": "Need electronic components for manufacturing",
  "category": "electronics",
  "budget": 50000,
  "quantity": 1000,
  "deadline": "2024-02-01T00:00:00.000Z",
  "requirements": ["ISO certified", "Fast delivery"],
  "attachments": ["file1.pdf", "file2.pdf"]
}
```

### PUT /rfq/:id
Update RFQ
```json
{
  "title": "Updated RFQ Title",
  "description": "Updated description",
  "budget": 60000
}
```

### DELETE /rfq/:id
Delete RFQ (requires auth)

### POST /rfq/:id/submit
Submit RFQ for processing

### GET /rfq/:id/matches
Get supplier matches for RFQ

### POST /rfq/voice
Process voice RFQ (requires audio file)
```
Content-Type: multipart/form-data
audio: <audio-file>
```

### GET /rfq/:id/explain
Get AI matching explanation

---

## Supplier Endpoints

### GET /supplier
Get all suppliers with filters
```
?page=1&limit=20&category=electronics&location=Mumbai
```

### GET /supplier/:id
Get specific supplier

### POST /supplier
Create new supplier (requires admin role)
```json
{
  "name": "Tech Solutions Ltd",
  "email": "contact@techsolutions.com",
  "phone": "+91-9876543210",
  "address": {
    "street": "123 Tech Street",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "postalCode": "400001"
  },
  "businessType": "manufacturer",
  "categories": ["electronics", "components"],
  "certifications": ["ISO 9001", "ISO 14001"],
  "contactPerson": {
    "name": "John Smith",
    "email": "john@techsolutions.com",
    "phone": "+91-9876543211",
    "position": "Sales Manager"
  }
}
```

### PUT /supplier/:id
Update supplier (requires admin role)

### DELETE /supplier/:id
Delete supplier (requires admin role)

### GET /supplier/:id/qualification
Get supplier qualification status

### POST /supplier/:id/qualify
Qualify supplier (requires admin role)

### GET /supplier/:id/performance
Get supplier performance metrics

### GET /supplier/:id/compliance
Get supplier compliance status

### POST /supplier/search
Search suppliers
```json
{
  "query": "electronics manufacturer",
  "category": "electronics",
  "location": "Mumbai",
  "certification": "ISO 9001"
}
```

### GET /supplier/:id/risk-assessment
Get supplier risk assessment

---

## Wallet Endpoints

### GET /wallet
Get all wallets (requires auth)

### GET /wallet/:id
Get specific wallet (requires auth)

### GET /wallet/user/:userId
Get user's wallet (requires auth)

### POST /wallet
Create new wallet (requires admin role)
```json
{
  "userId": "user-id",
  "currency": "INR",
  "type": "personal",
  "description": "Main wallet"
}
```

### POST /wallet/:id/deposit
Deposit funds to wallet
```json
{
  "amount": 10000,
  "currency": "INR",
  "method": "bank_transfer",
  "reference": "TXN123456",
  "description": "Initial deposit"
}
```

### POST /wallet/:id/withdraw
Withdraw funds from wallet
```json
{
  "amount": 5000,
  "currency": "INR",
  "method": "bank_transfer",
  "accountDetails": {
    "accountNumber": "1234567890",
    "ifscCode": "SBIN0001234"
  }
}
```

### POST /wallet/:id/transfer
Transfer funds between wallets
```json
{
  "toWalletId": "target-wallet-id",
  "amount": 1000,
  "currency": "INR",
  "description": "Payment for services"
}
```

### GET /wallet/:id/balance
Get wallet balance

### GET /wallet/:id/transactions
Get wallet transactions

### GET /wallet/:id/statement
Get wallet statement

### GET /wallet/:id/razorpayx-account
Get RazorpayX account details

### POST /wallet/:id/sync-razorpayx
Sync wallet with RazorpayX

---

## Escrow Endpoints

### GET /escrow
Get all escrows (requires auth)

### GET /escrow/:id
Get specific escrow (requires auth)

### GET /escrow/rfq/:rfqId
Get escrow by RFQ ID

### GET /escrow/user/:userId
Get user's escrows

### POST /escrow
Create new escrow
```json
{
  "rfqId": "rfq-id",
  "buyerId": "buyer-id",
  "supplierId": "supplier-id",
  "amount": 50000,
  "currency": "INR",
  "terms": "Payment on delivery",
  "deadline": "2024-02-01T00:00:00.000Z"
}
```

### POST /escrow/:id/release
Release escrow funds
```json
{
  "reason": "Successful delivery",
  "evidence": ["delivery-receipt.pdf"]
}
```

### POST /escrow/:id/refund
Refund escrow funds
```json
{
  "reason": "Cancelled order",
  "evidence": ["cancellation-notice.pdf"]
}
```

### POST /escrow/:id/dispute
Create escrow dispute
```json
{
  "reason": "Quality issues",
  "description": "Products received are defective",
  "evidence": ["photos.pdf", "test-results.pdf"]
}
```

### POST /escrow/:id/resolve-dispute
Resolve escrow dispute (requires admin role)
```json
{
  "resolution": "refund",
  "reason": "Evidence supports buyer's claim",
  "amount": 50000
}
```

### GET /escrow/:id/status
Get escrow status

### GET /escrow/:id/transactions
Get escrow transactions

### GET /escrow/analytics/summary
Get escrow analytics

---

## Payment Endpoints

### GET /payment
Get all payments (requires auth)

### GET /payment/:id
Get specific payment (requires auth)

### GET /payment/user/:userId
Get user's payments

### POST /payment
Create new payment
```json
{
  "amount": 10000,
  "currency": "INR",
  "method": "razorpayx",
  "description": "Service payment",
  "metadata": {
    "orderId": "order-123"
  }
}
```

### POST /payment/razorpayx/initiate
Initiate RazorpayX payment
```json
{
  "amount": 10000,
  "currency": "INR",
  "description": "Payment for services",
  "callbackUrl": "https://app.bell24h.com/payment/callback"
}
```

### POST /payment/razorpayx/verify
Verify RazorpayX payment
```json
{
  "paymentId": "pay_1234567890",
  "signature": "payment-signature"
}
```

### POST /payment/webhook/razorpayx
RazorpayX webhook endpoint (no auth required)

### POST /payment/:id/capture
Capture payment
```json
{
  "amount": 10000
}
```

### POST /payment/:id/refund
Refund payment
```json
{
  "amount": 5000,
  "reason": "Customer request"
}
```

### GET /payment/:id/status
Get payment status

### GET /payment/methods/available
Get available payment methods

### POST /payment/methods/add
Add payment method
```json
{
  "type": "bank_account",
  "details": {
    "accountNumber": "1234567890",
    "ifscCode": "SBIN0001234",
    "accountHolderName": "John Doe"
  }
}
```

### GET /payment/analytics/summary
Get payment analytics

---

## Analytics Endpoints

### GET /analytics/dashboard
Get dashboard analytics
```
?period=30d&userId=user-id
```

### GET /analytics/rfq/summary
Get RFQ analytics
```
?period=30d&category=electronics
```

### GET /analytics/supplier/performance
Get supplier performance analytics

### GET /analytics/financial/summary
Get financial analytics

### GET /analytics/user/activity
Get user activity analytics

### GET /analytics/market/trends
Get market trends

### GET /analytics/risk/assessment
Get risk assessment analytics

### GET /analytics/compliance/status
Get compliance status analytics

### GET /analytics/revenue/analysis
Get revenue analysis

### GET /analytics/cost/analysis
Get cost analysis

### GET /analytics/efficiency/metrics
Get efficiency metrics

### GET /analytics/predictions/forecast
Get predictions and forecasts

### POST /analytics/export
Export analytics data (requires admin role)
```json
{
  "type": "rfq_summary",
  "format": "csv",
  "period": "30d",
  "filters": {
    "category": "electronics"
  }
}
```

### GET /analytics/export/:id/status
Get export status

### GET /analytics/export/:id/download
Download exported data

### GET /analytics/kpi/dashboard
Get KPI dashboard

---

## Logistics Endpoints

### GET /logistics/shipments
Get all shipments
```
?status=in_transit&carrier=fedex
```

### GET /logistics/shipments/:id
Get specific shipment

### POST /logistics/shipments
Create new shipment
```json
{
  "rfqId": "rfq-id",
  "carrier": "fedex",
  "service": "express",
  "origin": {
    "address": "123 Supplier St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "country": "India",
    "postalCode": "400001"
  },
  "destination": {
    "address": "456 Buyer Ave",
    "city": "Delhi",
    "state": "Delhi",
    "country": "India",
    "postalCode": "110001"
  },
  "packages": [
    {
      "weight": 10.5,
      "dimensions": {
        "length": 50,
        "width": 30,
        "height": 20
      },
      "description": "Electronic components"
    }
  ]
}
```

### PUT /logistics/shipments/:id
Update shipment

### GET /logistics/shipments/:id/tracking
Get shipment tracking

### POST /logistics/shipments/:id/track
Update tracking information

### GET /logistics/tracking/:trackingNumber
Track by tracking number

### GET /logistics/carriers
Get available carriers

### GET /logistics/carriers/:id/services
Get carrier services

### POST /logistics/rates/calculate
Calculate shipping rates
```json
{
  "origin": {
    "postalCode": "400001",
    "country": "India"
  },
  "destination": {
    "postalCode": "110001",
    "country": "India"
  },
  "packages": [
    {
      "weight": 10.5,
      "dimensions": {
        "length": 50,
        "width": 30,
        "height": 20
      }
    }
  ]
}
```

### POST /logistics/shipments/:id/label
Generate shipping label

### GET /logistics/shipments/:id/label/download
Download shipping label

### GET /logistics/warehouses
Get warehouses

### GET /logistics/warehouses/:id/inventory
Get warehouse inventory

### GET /logistics/analytics/shipping
Get shipping analytics

---

## Risk Endpoints

### GET /risk/dashboard
Get risk dashboard

### GET /risk/assessments
Get all risk assessments

### GET /risk/assessments/:id
Get specific risk assessment

### POST /risk/assessments
Create risk assessment
```json
{
  "entityId": "supplier-id",
  "entityType": "supplier",
  "riskFactors": {
    "financial": 0.3,
    "operational": 0.2,
    "compliance": 0.1,
    "market": 0.4
  },
  "overallRisk": 0.25,
  "recommendations": ["Monitor financial health", "Regular audits"]
}
```

### PUT /risk/assessments/:id
Update risk assessment

### GET /risk/supplier/:supplierId/assessment
Get supplier risk assessment

### POST /risk/supplier/:supplierId/assess
Assess supplier risk

### GET /risk/financial/analysis
Get financial risk analysis

### GET /risk/operational/analysis
Get operational risk analysis

### GET /risk/compliance/analysis
Get compliance risk analysis

### GET /risk/market/analysis
Get market risk analysis

### POST /risk/mitigation
Create risk mitigation plan
```json
{
  "assessmentId": "assessment-id",
  "actions": [
    {
      "action": "Increase monitoring",
      "priority": "high",
      "deadline": "2024-02-01T00:00:00.000Z"
    }
  ]
}
```

### GET /risk/mitigation/:id
Get risk mitigation plan

### POST /risk/mitigation/:id/execute
Execute mitigation plan

### GET /risk/alerts
Get risk alerts

### POST /risk/alerts/configure
Configure risk alerts (requires admin role)

### GET /risk/scenarios
Get risk scenarios

### POST /risk/scenarios/simulate
Simulate risk scenario

### GET /risk/explainability/:assessmentId
Get risk explainability

---

## Video Endpoints

### GET /video
Get all videos (requires auth)

### GET /video/:id
Get specific video (requires auth)

### POST /video/upload
Upload video file
```
Content-Type: multipart/form-data
video: <video-file>
metadata: {
  "title": "Product Demo",
  "description": "Product demonstration video",
  "category": "marketing"
}
```

### POST /video
Create video record
```json
{
  "title": "Product Demo",
  "description": "Product demonstration video",
  "url": "https://storage.bell24h.com/videos/demo.mp4",
  "category": "marketing",
  "metadata": {
    "duration": 120,
    "resolution": "1080p"
  }
}
```

### PUT /video/:id
Update video

### GET /video/:id/stream
Stream video

### GET /video/:id/thumbnail
Get video thumbnail

### POST /video/:id/transcode
Transcode video
```json
{
  "format": "mp4",
  "resolution": "720p",
  "quality": "high"
}
```

### GET /video/:id/transcode/status
Get transcode status

### POST /video/:id/analyze
Analyze video
```json
{
  "analysisType": "content",
  "options": {
    "detectObjects": true,
    "extractText": true,
    "analyzeSentiment": true
  }
}
```

### GET /video/:id/analysis
Get video analysis

### POST /video/:id/ai/process
Process video with AI
```json
{
  "model": "object-detection",
  "parameters": {
    "confidence": 0.8
  }
}
```

### GET /video/:id/ai/results
Get AI processing results

### POST /video/:id/annotate
Add video annotations
```json
{
  "annotations": [
    {
      "type": "text",
      "content": "Product feature",
      "timestamp": 30,
      "position": { "x": 100, "y": 100 }
    }
  ]
}
```

### GET /video/:id/annotations
Get video annotations

### POST /video/:id/caption
Generate video captions
```json
{
  "language": "en",
  "format": "srt"
}
```

### GET /video/:id/captions
Get video captions

### POST /video/:id/compress
Compress video
```json
{
  "quality": "medium",
  "format": "mp4"
}
```

### GET /video/:id/quality
Get video quality metrics

### POST /video/:id/watermark
Add watermark to video
```json
{
  "text": "Bell24H",
  "position": "bottom-right",
  "opacity": 0.7
}
```

### POST /video/:id/trim
Trim video
```json
{
  "startTime": 10,
  "endTime": 60
}
```

### GET /video/formats/supported
Get supported video formats

### GET /video/codecs/available
Get available video codecs

### GET /video/analytics/usage
Get video usage analytics

### GET /video/storage/status
Get storage status

### POST /video/batch/process
Batch process videos (requires admin role)
```json
{
  "operation": "transcode",
  "videos": ["video1", "video2"],
  "options": {
    "format": "mp4",
    "resolution": "720p"
  }
}
```

### GET /video/batch/:batchId/status
Get batch processing status

---

## Health & Status Endpoints

### GET /health
Health check endpoint
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0",
  "environment": "production"
}
```

### GET /docs
API documentation endpoint

---

## Webhook Endpoints

### POST /payment/webhook/razorpayx
RazorpayX payment webhook (no auth required)

### POST /logistics/webhooks/carrier
Carrier tracking webhook (no auth required)

---

## Error Codes

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Request validation failed |
| AUTHENTICATION_REQUIRED | Authentication is required |
| INSUFFICIENT_PERMISSIONS | User lacks required permissions |
| RESOURCE_NOT_FOUND | Requested resource not found |
| DUPLICATE_ERROR | Duplicate resource creation attempted |
| RATE_LIMIT_EXCEEDED | Rate limit exceeded |
| INTERNAL_ERROR | Internal server error |
| DATABASE_ERROR | Database operation failed |
| EXTERNAL_SERVICE_ERROR | External service error |

---

## Pagination

Most list endpoints support pagination:
```
?page=1&limit=20&sortBy=createdAt&sortOrder=desc
```

Response format:
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## File Upload

File upload endpoints accept multipart/form-data:
```
Content-Type: multipart/form-data
file: <file-data>
metadata: {
  "title": "Document Title",
  "description": "Document description"
}
```

Supported file types and size limits:
- Images: JPG, PNG, GIF (max 10MB)
- Documents: PDF, DOC, DOCX (max 50MB)
- Videos: MP4, AVI, MOV (max 500MB)
- Audio: MP3, WAV, M4A (max 100MB)

---

## SDKs and Libraries

Official SDKs available for:
- JavaScript/TypeScript
- Python
- Java
- PHP
- .NET

Installation examples:
```bash
# JavaScript
npm install @bell24h/api-client

# Python
pip install bell24h-api-client

# Java
<dependency>
    <groupId>com.bell24h</groupId>
    <artifactId>api-client</artifactId>
    <version>1.0.0</version>
</dependency>
```

---

## Support

For API support:
- Email: api-support@bell24h.com
- Documentation: https://docs.bell24h.com
- Status page: https://status.bell24h.com
- Community forum: https://community.bell24h.com 