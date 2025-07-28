interface ShiprocketOrder {
  order_id: string;
  shipment_id: string;
  status: string;
}

interface ShiprocketTrackingData {
  shipment_id: string;
  status: string;
  current_location: string;
  eta: string;
}

interface ShiprocketAWB {
  shipment_id: string;
  awb_code: string;
  courier_name: string;
}

interface ShiprocketCourierData {
  courier_id: string;
  courier_name: string;
  rate: number;
  eta: string;
}

abstract class ShiprocketAPI {
  protected token: string | null = null;
  protected baseUrl = 'https://apiv2.shiprocket.in/v1';

  constructor() {
    this.token = null;
  }

  protected async makeRequest(method: string, endpoint: string, data?: any) {
    const url = `https://apiv2.shiprocket.in/v1/external/${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Shiprocket API error: ${error}`);
      throw error;
    }
  }
}

class ShiprocketService extends ShiprocketAPI {
  constructor() {
    super();
    this.authenticate();
  }

  // Authenticate with Shiprocket
  private async authenticate() {
    try {
      const response = await this.makeRequest('POST', 'auth/login', {
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD
      });

      this.token = response.token;
    } catch (error) {
      console.error('Shiprocket authentication error:', error);
      throw error;
    }
  }

  // Get authenticated headers
  private getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    };
  }

  // Create a new order
  async createOrder(orderData: any): Promise<ShiprocketOrder> {
    try {
      return await this.makeRequest('POST', 'orders/create/adhoc', orderData);
    } catch (error) {
      console.error('Shiprocket create order error:', error);
      throw error;
    }
  }

  // Track shipment
  async trackShipment(shipmentId: string): Promise<ShiprocketTrackingData> {
    try {
      return await this.makeRequest('GET', `courier/track/shipment/${shipmentId}`);
    } catch (error) {
      console.error('Shiprocket tracking error:', error);
      throw error;
    }
  }

  // Generate AWB (Airway Bill)
  async generateAWB(shipmentId: string, courier_id: string): Promise<ShiprocketAWB> {
    try {
      return await this.makeRequest('POST', 'courier/assign/awb', {
        shipment_id: shipmentId,
        courier_id: courier_id
      });
    } catch (error) {
      console.error('Shiprocket AWB generation error:', error);
      throw error;
    }
  }

  // Get available courier services
  async getCourierServiceability(pincode: string, weight: number, cod: boolean = false): Promise<ShiprocketCourierData[]> {
    try {
      return await this.makeRequest('GET', 'courier/serviceability', {
        pickup_postcode: process.env.SHIPROCKET_PICKUP_PINCODE,
        delivery_postcode: pincode,
        weight,
        cod
      });
    } catch (error) {
      console.error('Shiprocket serviceability check error:', error);
      throw error;
    }
  }

  // Cancel shipment
  async cancelShipment(shipmentId: string): Promise<{ message: string }> {
    try {
      return await this.makeRequest('POST', 'orders/cancel', { ids: [shipmentId] });
    } catch (error) {
      console.error('Shiprocket cancel shipment error:', error);
      throw error;
    }
  }
}

export const shiprocketService = new ShiprocketService();
