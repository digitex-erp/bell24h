import { NextRequest, NextResponse } from 'next/server';

const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1';
const SHIPROCKET_TOKEN = process.env.SHIPROCKET_TOKEN;

interface ShiprocketCredentials {
  email: string;
  password: string;
}

interface ShippingRate {
  courier_id: number;
  courier_name: string;
  rate: number;
  estimated_delivery_days: number;
  cod_available: boolean;
}

interface CreateOrderRequest {
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  shipping_customer_name: string;
  shipping_last_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_pincode: string;
  shipping_state: string;
  shipping_country: string;
  shipping_phone: string;
  order_items: Array<{
    name: string;
    sku: string;
    units: number;
    selling_price: number;
    discount: number;
    tax: number;
    hsn: number;
  }>;
  payment_method: string;
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

// Get authentication token
async function getShiprocketToken(): Promise<string> {
  try {
    const credentials: ShiprocketCredentials = {
      email: process.env.SHIPROCKET_EMAIL || '',
      password: process.env.SHIPROCKET_PASSWORD || ''
    };

    const response = await fetch(`${SHIPROCKET_API_URL}/external/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    if (data.token) {
      return data.token;
    } else {
      throw new Error('Failed to get Shiprocket token');
    }
  } catch (error) {
    console.error('Shiprocket authentication error:', error);
    throw error;
  }
}

// Calculate shipping rates
async function calculateShippingRates(
  pickupPincode: string,
  deliveryPincode: string,
  weight: number,
  cod: boolean = false
): Promise<ShippingRate[]> {
  try {
    const token = await getShiprocketToken();
    
    const response = await fetch(`${SHIPROCKET_API_URL}/external/courier/serviceability/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    const data = await response.json();
    
    if (data.status === 200) {
      return data.data.available_courier_companies.map((courier: any) => ({
        courier_id: courier.courier_id,
        courier_name: courier.courier_name,
        rate: courier.rate,
        estimated_delivery_days: courier.estimated_delivery_days,
        cod_available: courier.cod_available
      }));
    } else {
      throw new Error(data.message || 'Failed to calculate shipping rates');
    }
  } catch (error) {
    console.error('Shipping rate calculation error:', error);
    throw error;
  }
}

// Create shipping order
async function createShippingOrder(orderData: CreateOrderRequest): Promise<any> {
  try {
    const token = await getShiprocketToken();
    
    const response = await fetch(`${SHIPROCKET_API_URL}/external/orders/create/adhoc`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const data = await response.json();
    
    if (data.status === 200) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to create shipping order');
    }
  } catch (error) {
    console.error('Create shipping order error:', error);
    throw error;
  }
}

// Track shipment
async function trackShipment(awb: string): Promise<any> {
  try {
    const token = await getShiprocketToken();
    
    const response = await fetch(`${SHIPROCKET_API_URL}/external/courier/track/shipment/${awb}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (data.status === 200) {
      return data.data;
    } else {
      throw new Error(data.message || 'Failed to track shipment');
    }
  } catch (error) {
    console.error('Shipment tracking error:', error);
    throw error;
  }
}

// API Routes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    switch (action) {
      case 'rates':
        const pickupPincode = searchParams.get('pickup_pincode');
        const deliveryPincode = searchParams.get('delivery_pincode');
        const weight = parseFloat(searchParams.get('weight') || '0');
        const cod = searchParams.get('cod') === 'true';
        
        if (!pickupPincode || !deliveryPincode || !weight) {
          return NextResponse.json(
            { success: false, error: 'Missing required parameters' },
            { status: 400 }
          );
        }
        
        const rates = await calculateShippingRates(pickupPincode, deliveryPincode, weight, cod);
        return NextResponse.json({ success: true, data: rates });
        
      case 'track':
        const awb = searchParams.get('awb');
        if (!awb) {
          return NextResponse.json(
            { success: false, error: 'AWB number is required' },
            { status: 400 }
          );
        }
        
        const trackingData = await trackShipment(awb);
        return NextResponse.json({ success: true, data: trackingData });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Shiprocket API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...data } = body;
    
    switch (action) {
      case 'create_order':
        const orderResult = await createShippingOrder(data);
        return NextResponse.json({ success: true, data: orderResult });
        
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Shiprocket API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 