# Bell24h API Documentation

## Overview
Bell24h provides a comprehensive API for managing RFQ marketplace operations, including wallet management, escrow services, and dispute resolution.

## Base URL
```
https://api.bell24h.com/v1
```

## Authentication
All API requests require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Wallet API

### Get Wallet Balance
```http
GET /wallet/balance
```

Returns current wallet balance and recent transactions.

**Response**
```json
{
    "balance": 5000.00,
    "kyc_verified": true,
    "recent_transactions": [
        {
            "id": 1,
            "type": "DEPOSIT",
            "amount": 1000.00,
            "status": "COMPLETED",
            "description": "Wallet deposit",
            "created_at": "2025-04-01T14:30:00Z"
        }
    ]
}
```

### Create Deposit
```http
POST /wallet/deposit
```

Create a new deposit request.

**Request Body**
```json
{
    "amount": 1000.00
}
```

**Response**
```json
{
    "payment_link": "https://rzp.io/i/abcd1234",
    "transaction_id": 123
}
```

### Withdraw Funds
```http
POST /wallet/withdraw
```

Withdraw funds from wallet.

**Request Body**
```json
{
    "amount": 500.00
}
```

**Response**
```json
{
    "transaction_id": 124,
    "amount": 500.00,
    "status": "completed"
}
```

## Dispute API

### Create Dispute
```http
POST /disputes/
```

Create a new dispute for an escrow transaction.

**Request Body**
```json
{
    "escrow_id": 1,
    "type": "QUALITY",
    "amount": 5000.00,
    "description": "Product received does not match specifications"
}
```

**Response**
```json
{
    "message": "Dispute created successfully",
    "dispute_id": 1
}
```

### Add Dispute Message
```http
POST /disputes/{dispute_id}/messages
```

Add a message to a dispute thread.

**Request Body**
```json
{
    "message": "We have reviewed the product and found quality issues"
}
```

**Response**
```json
{
    "message": "Message added successfully",
    "message_id": 1
}
```

### Resolve Dispute
```http
POST /disputes/{dispute_id}/resolve
```

Resolve a dispute (Admin only).

**Request Body**
```json
{
    "buyer_refund": 3000.00,
    "supplier_payment": 1800.00,
    "notes": "Split resolution based on product quality assessment"
}
```

**Response**
```json
{
    "message": "Dispute resolved successfully",
    "resolution": {
        "buyer_refund": 3000.00,
        "supplier_payment": 1800.00,
        "platform_fee": 200.00
    }
}
```

## Export API

### Export Transactions
```http
GET /export/transactions
```

Export transaction data in CSV or Excel format.

**Query Parameters**
- `start_date` (optional): Start date for filtering (ISO format)
- `end_date` (optional): End date for filtering (ISO format)
- `type` (optional): Filter by transaction type
- `format`: Export format ("csv" or "excel")

**Response**
File download with transaction data.

### Export Disputes
```http
GET /export/disputes
```

Export dispute data in CSV or Excel format.

**Query Parameters**
- `status` (optional): Filter by dispute status
- `start_date` (optional): Start date for filtering (ISO format)
- `end_date` (optional): End date for filtering (ISO format)
- `format`: Export format ("csv" or "excel")

**Response**
File download with dispute data.

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid parameters |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource doesn't exist |
| 409  | Conflict - Resource state conflict |
| 500  | Internal Server Error |

## Rate Limits
- 100 requests per minute per IP
- 1000 requests per hour per user
- Export API: 10 requests per hour per user

## Webhooks
Bell24h can send webhook notifications for:
- Wallet transactions
- Dispute updates
- Escrow status changes

Configure webhooks in your dashboard settings.

## Support
For API support, contact:
- Email: api@bell24h.com
- Documentation: https://docs.bell24h.com
- Status: https://status.bell24h.com
