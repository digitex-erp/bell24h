# Bell24H Logistics Tracking System

The Logistics Tracking System is a comprehensive solution for managing and tracking shipments, integrating with logistics providers (Shiprocket and DHL), generating customs documentation, and optimizing shipping routes.

## Features

### 1. Shipment Management
- Create and manage shipments with detailed information
- Track shipments in real-time
- View shipment history and status updates
- Support for international and domestic shipments

### 2. Customs Documentation
- Generate and manage customs documents
- Support for various document types (invoices, packing lists, certificates of origin, etc.)
- Custom data input for different document types

### 3. Route Optimization
- Find optimal routes between pickup and delivery locations
- Calculate estimated time of arrival (ETA)
- Consider traffic, tolls, and other route factors
- Compare alternative routes

### 4. Analytics Dashboard
- View shipment statistics and trends
- Track delivery performance
- Analyze shipment distribution by status, provider, and country

## Implementation Details

### Architecture
The Logistics Tracking System follows a modular architecture with:
- Database schema for storing shipment data
- API endpoints for interacting with logistics providers
- React components for the user interface
- Service layer for business logic

### Tech Stack
- **Frontend**: React, Next.js, Chakra UI, Recharts
- **Backend**: Node.js, Next.js API Routes
- **Database**: PostgreSQL with Drizzle ORM
- **Maps**: Google Maps API for visualization and route optimization
- **External APIs**: Shiprocket and DHL for tracking and shipping operations

## Setup Instructions

### 1. Database Setup
Run the database migration script to create the necessary tables:

```bash
npm run db:migrate
```

This will apply the `0009_logistics_tracking.sql` migration file.

### 2. Environment Variables
Add the following environment variables to your `.env` file:

```
# Logistics API Keys
SHIPROCKET_API_URL=https://apiv2.shiprocket.in/v1/
SHIPROCKET_EMAIL=your_shiprocket_email
SHIPROCKET_PASSWORD=your_shiprocket_password

# DHL API
DHL_API_URL=https://api-mock.dhl.com/
DHL_CLIENT_ID=your_dhl_client_id
DHL_CLIENT_SECRET=your_dhl_client_secret
DHL_ACCOUNT_NUMBER=your_dhl_account_number

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 3. API Rate Limiting
The system includes rate limiting for API endpoints to prevent abuse:
- Logistics API: 30 requests per minute
- Tracking refresh: 5 requests per minute
- Document generation: 10 requests per minute

## Usage Guide

### Creating a Shipment
1. Navigate to `/logistics/shipments`
2. Click "Create Shipment"
3. Fill in the required information:
   - Order ID/Reference
   - Pickup and delivery details
   - Package information
   - For international shipments, provide customs information

### Tracking a Shipment
1. From the shipments list, click "View" on any shipment
2. The shipment details page shows:
   - Current status and tracking information
   - Timeline of shipment events
   - Map visualization of the route
   - Customs documents

### Generating Customs Documents
1. On a shipment details page, navigate to the "Documents" tab
2. Click "Generate Document"
3. Select the document type and provide required information
4. Download the generated document

### Route Optimization
1. Navigate to `/logistics/route-optimization`
2. Enter origin and destination details
3. Configure optimization options:
   - Optimize for time, distance, or fuel efficiency
   - Select vehicle type
   - Set departure time and traffic model
   - Toggle options for avoiding tolls or highways
4. Click "Optimize Route" to see the results

## Security Considerations

- All API endpoints are authenticated using NextAuth
- Rate limiting prevents abuse of external APIs
- Input validation is implemented for all forms
- Environment variables are used for sensitive credentials

## Troubleshooting

### Common Issues

1. **Shipment tracking not updating**
   - Check that the external provider's API is accessible
   - Verify that the tracking number is valid
   - Use the "Refresh Tracking" button to force an update

2. **Route optimization errors**
   - Ensure Google Maps API key is valid and has the necessary permissions
   - Check that addresses are complete and correctly formatted

3. **Document generation fails**
   - Verify that all required fields are completed
   - Check permissions on temporary file storage directories

## Future Enhancements

1. Support for additional logistics providers
2. Advanced analytics and reporting features
3. Batch operations for bulk shipment creation
4. Mobile app for on-the-go tracking
5. Integration with inventory management system
