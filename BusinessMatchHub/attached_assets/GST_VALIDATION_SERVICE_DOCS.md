# GST Validation Service Documentation

## Overview

The GST Validation Service provides comprehensive functionality for validating Indian Goods and Services Tax (GST) identification numbers and related business information. This service integrates with the official GST API to provide real-time validation, business detail retrieval, invoice verification, and bulk validation capabilities.

## Features

- **GST Number Validation**: Validate the format and authenticity of a GST Identification Number (GSTIN)
- **Business Details Retrieval**: Fetch comprehensive business information including filing history and compliance rating
- **Invoice Verification**: Verify the validity of invoices issued by GST-registered businesses
- **Bulk GST Validation**: Process multiple GST numbers simultaneously

## API Endpoints

### Validate GST Number

```
POST /api/gst/validate
```

**Request Body:**
```json
{
  "gstin": "27AADCB2230M1ZT"
}
```

**Response:**
```json
{
  "valid": true,
  "message": "GSTIN validation successful",
  "gstin": "27AADCB2230M1ZT",
  "legal_name": "COMPANY NAME PVT LTD",
  "trade_name": "COMPANY TRADE NAME",
  "address": "123 Main St, Mumbai, Maharashtra",
  "state_code": "27",
  "state_name": "Maharashtra",
  "business_type": "Regular",
  "tax_payer_type": "Regular",
  "status": "Active",
  "registration_date": "2017-07-01"
}
```

### Get Business Details

```
GET /api/gst/business-details/:gstin
```

**Response:**
```json
{
  "success": true,
  "message": "Business details retrieved successfully",
  "gstin": "27AADCB2230M1ZT",
  "business_details": {
    "legal_name": "COMPANY NAME PVT LTD",
    "trade_name": "COMPANY TRADE NAME",
    "address": "123 Main St, Mumbai, Maharashtra",
    "business_type": "Regular",
    "constitution": "Private Limited Company",
    "status": "Active",
    "registration_date": "2017-07-01"
  },
  "filing_history": [
    {
      "return_period": "2023-03",
      "filing_date": "2023-04-20",
      "return_type": "GSTR-3B",
      "status": "FILED"
    }
  ],
  "compliance_rating": 85
}
```

### Verify Invoice

```
POST /api/gst/verify-invoice
```

**Request Body:**
```json
{
  "gstin": "27AADCB2230M1ZT",
  "invoiceNumber": "INV-001",
  "invoiceDate": "2023-05-15"
}
```

**Response:**
```json
{
  "valid": true,
  "message": "Invoice verification successful",
  "gstin": "27AADCB2230M1ZT",
  "invoiceNumber": "INV-001",
  "invoiceDate": "2023-05-15",
  "filing_status": "FILED"
}
```

### Bulk GST Validation

```
POST /api/gst/bulk-validate
```

**Request Body:**
```json
{
  "gstinList": [
    "27AADCB2230M1ZT",
    "29AAFCD5862R1ZR"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk validation completed",
  "results": [
    {
      "valid": true,
      "message": "GSTIN validation successful",
      "gstin": "27AADCB2230M1ZT",
      "legal_name": "COMPANY NAME PVT LTD",
      "trade_name": "COMPANY TRADE NAME",
      "address": "123 Main St, Mumbai, Maharashtra",
      "state_code": "27",
      "state_name": "Maharashtra",
      "business_type": "Regular",
      "tax_payer_type": "Regular",
      "status": "Active",
      "registration_date": "2017-07-01"
    },
    {
      "valid": true,
      "message": "GSTIN validation successful",
      "gstin": "29AAFCD5862R1ZR",
      "legal_name": "ANOTHER COMPANY PVT LTD",
      "trade_name": "ANOTHER TRADE NAME",
      "address": "456 Other St, Bangalore, Karnataka",
      "state_code": "29",
      "state_name": "Karnataka",
      "business_type": "Regular",
      "tax_payer_type": "Regular",
      "status": "Active",
      "registration_date": "2017-07-01"
    }
  ]
}
```

## Front-end Integration

A comprehensive React component `GSTValidationWidget` is included that provides a user-friendly interface for all GST validation features. You can integrate it into any page as follows:

```tsx
import GSTValidationWidget from '@/components/gst/GSTValidationWidget';

function YourPage() {
  return (
    <div>
      <h1>GST Validation</h1>
      <GSTValidationWidget />
    </div>
  );
}
```

## Environment Configuration

To use the GST Validation Service, you need to configure the following environment variables:

```
GST_API_BASE_URL=https://api.gstvalidate.india.gov.in/v1
GST_API_KEY=your_api_key_here
```

## Error Handling

The service includes comprehensive error handling for various scenarios:

- Invalid GST number format
- API authentication issues
- Rate limiting or quota exceeded
- Service unavailability
- Network errors

Each error is logged appropriately and meaningful messages are returned to the client.

## Security Considerations

- The GST API key is stored securely as an environment variable
- All API requests are made server-side to protect credentials
- Input validation is performed for all user inputs
- Error messages provide necessary information without exposing sensitive details

## Usage Notes

1. Ensure you have proper authorization to access GST information
2. GST validation is performed in real-time against official records
3. For bulk validation, limit the number of GSTINs to 100 per request to avoid timeouts
4. Implement appropriate rate limiting in production to avoid exceeding API quotas