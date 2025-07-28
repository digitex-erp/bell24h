# Bell24H API Documentation

## Overview

The Bell24H API provides a comprehensive set of endpoints for managing RFQs, suppliers, buyers, and transactions. This documentation covers all available endpoints, their request/response formats, and authentication requirements.

## Base URL

```
https://api.bell24h.com/v1
```

## Authentication

All API requests require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Obtaining a Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "buyer"
  }
}
```

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1620000000
```

## Error Handling

All errors follow this format:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

Common error codes:
- `INVALID_REQUEST`: Invalid request parameters
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Endpoints

### RFQ Management

#### Create RFQ
```http
POST /rfqs
Content-Type: application/json

{
  "title": "RFQ Title",
  "description": "Detailed description",
  "category": "category_id",
  "subcategory": "subcategory_id",
  "quantity": 100,
  "unit": "pcs",
  "budget": {
    "amount": 1000,
    "currency": "USD"
  },
  "timeline": {
    "start": "2024-03-01",
    "end": "2024-03-31"
  },
  "requirements": [
    {
      "type": "certification",
      "value": "ISO9001"
    }
  ]
}
```

#### Get RFQ Details
```http
GET /rfqs/{rfq_id}
```

#### List RFQs
```http
GET /rfqs?page=1&limit=10&category=category_id&status=open
```

#### Update RFQ
```http
PUT /rfqs/{rfq_id}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}
```

#### Delete RFQ
```http
DELETE /rfqs/{rfq_id}
```

### Supplier Management

#### Register Supplier
```http
POST /suppliers
Content-Type: application/json

{
  "companyName": "Company Name",
  "email": "company@example.com",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "City",
    "country": "Country"
  },
  "certifications": [
    {
      "type": "ISO9001",
      "expiry": "2025-12-31"
    }
  ]
}
```

#### Get Supplier Profile
```http
GET /suppliers/{supplier_id}
```

#### Update Supplier Profile
```http
PUT /suppliers/{supplier_id}
Content-Type: application/json

{
  "companyName": "Updated Name",
  "phone": "+1987654321"
}
```

### Buyer Management

#### Register Buyer
```http
POST /buyers
Content-Type: application/json

{
  "companyName": "Buyer Company",
  "email": "buyer@example.com",
  "phone": "+1234567890",
  "address": {
    "street": "456 Market St",
    "city": "City",
    "country": "Country"
  }
}
```

#### Get Buyer Profile
```http
GET /buyers/{buyer_id}
```

#### Update Buyer Profile
```http
PUT /buyers/{buyer_id}
Content-Type: application/json

{
  "companyName": "Updated Buyer Company",
  "phone": "+1987654321"
}
```

### Quotation Management

#### Submit Quotation
```http
POST /rfqs/{rfq_id}/quotations
Content-Type: application/json

{
  "price": {
    "amount": 900,
    "currency": "USD"
  },
  "deliveryTime": "2024-04-15",
  "validity": "2024-04-30",
  "terms": "Payment terms and conditions",
  "attachments": [
    {
      "type": "certificate",
      "url": "https://example.com/cert.pdf"
    }
  ]
}
```

#### Get Quotation
```http
GET /quotations/{quotation_id}
```

#### List Quotations
```http
GET /rfqs/{rfq_id}/quotations
```

### Order Management

#### Create Order
```http
POST /orders
Content-Type: application/json

{
  "rfqId": "rfq_id",
  "quotationId": "quotation_id",
  "quantity": 100,
  "deliveryAddress": {
    "street": "789 Order St",
    "city": "City",
    "country": "Country"
  },
  "paymentMethod": "escrow"
}
```

#### Get Order
```http
GET /orders/{order_id}
```

#### List Orders
```http
GET /orders?status=active&page=1&limit=10
```

### Escrow Management

#### Create Escrow
```http
POST /escrows
Content-Type: application/json

{
  "orderId": "order_id",
  "amount": {
    "amount": 90000,
    "currency": "USD"
  }
}
```

#### Release Escrow
```http
POST /escrows/{escrow_id}/release
```

#### Get Escrow Status
```http
GET /escrows/{escrow_id}
```

### Analytics

#### Get RFQ Analytics
```http
GET /analytics/rfqs?period=monthly
```

#### Get Supplier Analytics
```http
GET /analytics/suppliers/{supplier_id}?period=monthly
```

#### Get Buyer Analytics
```http
GET /analytics/buyers/{buyer_id}?period=monthly
```

## Webhooks

### Configure Webhook
```http
POST /webhooks
Content-Type: application/json

{
  "url": "https://your-domain.com/webhook",
  "events": ["rfq.created", "order.completed"],
  "secret": "your_webhook_secret"
}
```

### List Webhooks
```http
GET /webhooks
```

### Delete Webhook
```http
DELETE /webhooks/{webhook_id}
```

## WebSocket Events

Connect to the WebSocket endpoint:
```
wss://api.bell24h.com/v1/ws
```

Available events:
- `rfq.created`
- `rfq.updated`
- `quotation.submitted`
- `order.created`
- `order.updated`
- `escrow.created`
- `escrow.released`

## SDKs

Official SDKs are available for:
- [JavaScript/TypeScript](https://github.com/bell24h/sdk-js)
- [Python](https://github.com/bell24h/sdk-python)
- [Java](https://github.com/bell24h/sdk-java)

## Support

For API support, contact:
- Email: api-support@bell24h.com
- Documentation: https://docs.bell24h.com
- Status Page: https://status.bell24h.com 