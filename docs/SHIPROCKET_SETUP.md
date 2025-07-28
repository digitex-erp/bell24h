# Shiprocket Integration Setup Guide

## 🚚 Phase 2 - Priority 1: Shiprocket Logistics Integration (₹5 Crore Revenue Activation)

### Overview
This guide helps you set up the Shiprocket logistics integration that activates ₹5 crore logistics revenue potential through real-time shipping rates, order tracking, and cost optimization.

### Prerequisites
1. Shiprocket account (https://shiprocket.in/)
2. Active Shiprocket API access
3. Node.js server running Bell24H

### Step 1: Shiprocket Account Setup

1. **Create Shiprocket Account**
   - Visit https://shiprocket.in/
   - Sign up for a business account
   - Complete KYC verification
   - Activate API access in your account settings

2. **Get API Credentials**
   - Login to Shiprocket panel
   - Go to Settings > API
   - Note down your email and password for API authentication

### Step 2: Environment Configuration

Add these environment variables to your `.env` file:

```bash
# Shiprocket Logistics Integration
SHIPROCKET_EMAIL=your_shiprocket_email@example.com
SHIPROCKET_PASSWORD=your_shiprocket_password

# Optional: Webhook configuration
SHIPROCKET_WEBHOOK_URL=https://yourdomain.com/api/logistics/webhook
```

### Step 3: Features Activated

#### ✅ Real-time Shipping Rates
- Multiple courier partner rates (Blue Dart, Delhivery, Ekart, DTDC)
- Weight-based pricing
- COD charges calculation
- Delivery time estimates

#### ✅ Order Management
- Create shipments directly from RFQs
- Automatic AWB generation
- Pickup scheduling
- Order tracking

#### ✅ Live Tracking
- Real-time status updates
- Location tracking
- Delivery notifications
- Exception handling

#### ✅ Analytics & Optimization
- Courier performance analysis
- Cost optimization recommendations
- Delivery time analytics
- Success rate monitoring

### Step 4: API Endpoints Available

```bash
# Calculate shipping rates
POST /api/logistics/rates
{
  "pickupPincode": "110001",
  "deliveryPincode": "400001", 
  "weight": 2.5,
  "declaredValue": 5000,
  "codAmount": 0
}

# Create shipment
POST /api/logistics/shipments
{
  "orderId": "ORD123",
  "orderDate": "2024-01-15",
  "pickupLocation": "New Delhi",
  "billingCustomerName": "John Doe",
  // ... other required fields
}

# Track shipment
GET /api/logistics/track/AWB123456789

# Get analytics
GET /api/logistics/analytics?startDate=2024-01-01&endDate=2024-01-31

# Get dashboard data
GET /api/logistics/dashboard
```

### Step 5: Frontend Integration

The shipping calculator is automatically integrated into:

#### 🔍 Search Results
- Each RFQ shows "Shipping Calculator" section
- Click "Calculate Rates" to expand
- Enter pickup/delivery pincodes and weight
- View live rates from multiple couriers
- Select best option for cost optimization

#### 📊 Dashboard Integration
- Logistics metrics in main dashboard
- Shipping cost trends
- Courier performance comparison
- Real-time tracking updates

### Step 6: Business Impact

#### Revenue Activation: ₹5 Crore Logistics
- **Shipping Rate Markup**: 10-15% commission on shipping rates
- **Premium Logistics**: Express delivery premium services
- **Bulk Shipping**: Volume discounts for enterprise clients
- **Insurance Services**: Transit insurance revenue share

#### Cost Optimization Features
- **Smart Routing**: Automatic best-rate selection
- **Bulk Discounts**: Volume-based pricing
- **Zone Optimization**: Regional courier selection
- **Performance Analytics**: Data-driven decisions

### Step 7: Testing

#### Test Shipping Calculator
1. Open any RFQ search result
2. Click "Calculate Rates" in shipping section
3. Enter test pincodes (e.g., 110001 to 400001)
4. Enter weight (e.g., 2.5 kg)
5. Click "Get Live Rates"
6. Verify multiple courier options appear

#### Test API Endpoints
```bash
# Test rate calculation
curl -X POST http://localhost:5000/api/logistics/rates \
  -H "Content-Type: application/json" \
  -d '{
    "pickupPincode": "110001",
    "deliveryPincode": "400001",
    "weight": 2.5,
    "declaredValue": 5000
  }'

# Test tracking
curl http://localhost:5000/api/logistics/track/AWB123456789
```

### Step 8: Production Deployment

#### Environment Variables
- Set production Shiprocket credentials
- Configure webhook URLs
- Enable SSL for API calls
- Set up monitoring

#### Monitoring & Analytics
- Track API usage and performance
- Monitor shipping cost savings
- Analyze courier performance
- Generate revenue reports

### Step 9: Revenue Optimization

#### Smart Pricing Strategy
- Dynamic markup based on route
- Premium rates for express delivery
- Volume discounts for bulk orders
- Seasonal pricing adjustments

#### Client Acquisition
- Highlight shipping cost savings
- Provide courier performance data
- Offer logistics consultancy
- Integrate with existing workflows

### Troubleshooting

#### Common Issues
1. **Authentication Failed**: Check email/password in .env
2. **Rate Calculation Failed**: Verify pincode format (6 digits)
3. **Tracking Not Working**: Ensure valid AWB code
4. **Webhook Issues**: Check URL configuration

#### Debug Mode
Set `NODE_ENV=development` to see detailed logs for API calls and responses.

### Support

For technical support with Shiprocket integration:
- Email: support@bell24h.com
- Documentation: https://docs.bell24h.com/logistics
- Shiprocket API Docs: https://apidocs.shiprocket.in/

---

## 🎯 Next Steps: Phase 2 Priority 2

After completing Shiprocket integration, proceed to:
- **Share Market Integration** (₹8 crore trading revenue)
- **ESG Scoring Dashboard** (₹15 crore enterprise revenue)  
- **Smart Contract Escrow** (₹12 crore blockchain revenue)

**Total Phase 2 Target: ₹40+ crore additional revenue activation** 