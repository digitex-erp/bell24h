import { log } from "../vite";

export interface TrackingStep {
  date: string;
  status: string;
  activity: string;
  location?: string;
}

export interface ShipmentTrackingResponse {
  shipmentId: string;
  currentStatus: string;
  expectedDelivery: string;
  steps: TrackingStep[];
  trackingUrl: string;
  progressPercent: number;
}

export interface CreateShipmentRequest {
  orderId: string;
  orderDate: string;
  pickupLocation: string;
  billingCustomerName: string;
  billingAddress: string;
  billingCity: string;
  billingPincode: string;
  billingState: string;
  billingCountry: string;
  billingEmail: string;
  billingPhone: string;
  shippingCustomerName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingPincode: string;
  shippingState: string;
  shippingCountry: string;
  shippingEmail: string;
  shippingPhone: string;
  items: Array<{
    name: string;
    sku: string;
    units: number;
    sellingPrice: number;
  }>;
}

export class ShiprocketService {
  private apiKey: string;
  private isInitialized: boolean;
  private token: string | null = null;
  private tokenExpiry: Date | null = null;
  
  constructor() {
    this.apiKey = process.env.SHIPROCKET_API_KEY || "";
    this.isInitialized = !!this.apiKey;
    
    if (!this.isInitialized) {
      log("Warning: Shiprocket API key not set. Logistics tracking will be simulated.", "shiprocket");
    }
  }
  
  /**
   * Gets an authentication token for Shiprocket API
   * @returns Authentication token
   */
  private async getAuthToken(): Promise<string> {
    // Check if we have a valid token already
    if (this.token && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.token;
    }
    
    try {
      if (!this.isInitialized) {
        // Return a dummy token
        this.token = "simulated_token_" + Date.now();
        this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // Valid for 1 day
        return this.token;
      }
      
      const response = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: "your_registered_email@bell24h.com", // Replace with actual email
          password: this.apiKey
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Shiprocket API error: ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      this.token = data.token;
      // Token valid for 24 hours
      this.tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
      
      return this.token;
    } catch (error) {
      log(`Error getting Shiprocket auth token: ${error}`, "shiprocket");
      throw error;
    }
  }
  
  /**
   * Creates a shipment in Shiprocket
   * @param shipmentData Shipment details
   * @returns Shipment ID
   */
  async createShipment(shipmentData: CreateShipmentRequest): Promise<string> {
    try {
      if (!this.isInitialized) {
        // Return a simulated shipment ID
        return `SH-2023-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      
      const token = await this.getAuthToken();
      
      const response = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(shipmentData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Shiprocket API error: ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      return data.order_id.toString();
    } catch (error) {
      log(`Error creating shipment: ${error}`, "shiprocket");
      throw error;
    }
  }
  
  /**
   * Gets tracking information for a shipment
   * @param shipmentId Shipment ID to track
   * @returns Tracking information
   */
  async trackShipment(shipmentId: string): Promise<ShipmentTrackingResponse> {
    try {
      if (!this.isInitialized) {
        // Return simulated tracking data
        return this.generateSimulatedTrackingData(shipmentId);
      }
      
      const token = await this.getAuthToken();
      
      const response = await fetch(`https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Shiprocket API error: ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      
      // Transform the response into our expected format
      const steps: TrackingStep[] = data.tracking_data.shipment_track.map((track: any) => ({
        date: track.date,
        status: track.status,
        activity: track.activity,
        location: track.location
      }));
      
      // Calculate progress percentage
      let progressPercent = 0;
      const currentStatus = data.tracking_data.shipment_status;
      
      switch (currentStatus.toLowerCase()) {
        case "pickup scheduled":
          progressPercent = 10;
          break;
        case "pickup booked":
          progressPercent = 20;
          break;
        case "pickup error":
          progressPercent = 0;
          break;
        case "pickup generated":
          progressPercent = 25;
          break;
        case "shipped":
          progressPercent = 40;
          break;
        case "in transit":
          progressPercent = 60;
          break;
        case "out for delivery":
          progressPercent = 80;
          break;
        case "delivered":
          progressPercent = 100;
          break;
        default:
          progressPercent = 30;
      }
      
      return {
        shipmentId,
        currentStatus: data.tracking_data.shipment_status,
        expectedDelivery: data.tracking_data.expected_delivery_date,
        steps,
        trackingUrl: data.tracking_data.track_url,
        progressPercent
      };
    } catch (error) {
      log(`Error tracking shipment: ${error}`, "shiprocket");
      
      // Return simulated data if there's an API error
      return this.generateSimulatedTrackingData(shipmentId);
    }
  }
  
  /**
   * Generates simulated tracking data for development and when API is not configured
   * @param shipmentId Shipment ID to generate tracking for
   * @returns Simulated tracking data
   */
  private generateSimulatedTrackingData(shipmentId: string): ShipmentTrackingResponse {
    // Random status based on shipment ID last character
    const lastChar = shipmentId.slice(-1);
    const lastDigit = parseInt(lastChar, 10) || 5;
    
    let status: string;
    let progressPercent: number;
    
    if (lastDigit < 3) {
      status = "Delivered";
      progressPercent = 100;
    } else if (lastDigit < 5) {
      status = "Out for Delivery";
      progressPercent = 80;
    } else if (lastDigit < 7) {
      status = "In Transit";
      progressPercent = 60;
    } else {
      status = "Shipped";
      progressPercent = 40;
    }
    
    // Generate tracking steps based on status
    const steps: TrackingStep[] = [];
    const today = new Date();
    
    // Always add "Shipped" step
    steps.push({
      date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "Shipped",
      activity: "Shipment picked up from Mumbai",
      location: "Mumbai"
    });
    
    // Add "In Transit" if progress >= 60%
    if (progressPercent >= 60) {
      steps.push({
        date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: "In Transit",
        activity: "Shipment arrived at hub",
        location: "Delhi"
      });
    }
    
    // Add "Out for Delivery" if progress >= 80%
    if (progressPercent >= 80) {
      steps.push({
        date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: "Out for Delivery",
        activity: "Shipment out for delivery",
        location: "Bengaluru"
      });
    }
    
    // Add "Delivered" if progress = 100%
    if (progressPercent === 100) {
      steps.push({
        date: today.toISOString().split('T')[0],
        status: "Delivered",
        activity: "Shipment delivered",
        location: "Bengaluru"
      });
    }
    
    return {
      shipmentId,
      currentStatus: status,
      expectedDelivery: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      steps,
      trackingUrl: `https://shiprocket.co/tracking/${shipmentId}`,
      progressPercent
    };
  }
}

// Create singleton instance
export const shiprocketService = new ShiprocketService();
