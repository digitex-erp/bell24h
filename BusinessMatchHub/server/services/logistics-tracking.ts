/**
 * Logistics Tracking Service
 * 
 * This service integrates with Shiprocket/DHL to provide tracking and logistics
 * functionality for shipments in the Bell24h B2B marketplace.
 */

import axios from 'axios';
import { db } from '../db';
import { 
  shipments, 
  shipmentEvents, 
  shipmentItems, 
  shipmentDocuments,
  InsertShipment,
  InsertShipmentEvent,
  InsertShipmentItem,
  InsertShipmentDocument,
  Shipment
} from '../../shared/schema';
import { eq, and, desc } from 'drizzle-orm';

// Environment variables for the shipping providers
const SHIPROCKET_API_KEY = process.env.SHIPROCKET_API_KEY;
const SHIPROCKET_API_URL = 'https://apiv2.shiprocket.in/v1/external';
const DHL_API_KEY = process.env.DHL_API_KEY;
const DHL_API_URL = 'https://api-mock.dhl.com/mydhl/v1'; // Using a mock URL for now

/**
 * Provider Configurations
 */
const PROVIDERS = {
  shiprocket: {
    name: 'Shiprocket',
    baseUrl: SHIPROCKET_API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SHIPROCKET_API_KEY}`
    },
    endpoints: {
      createOrder: '/orders/create/adhoc',
      generateLabel: '/courier/generate/label',
      tracking: '/courier/track',
      shipments: '/shipments',
      manifests: '/manifests',
      pickups: '/courier/generate-pickup',
      cancelShipment: '/orders/cancel',
    }
  },
  dhl: {
    name: 'DHL Express',
    baseUrl: DHL_API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from(`${DHL_API_KEY}:`).toString('base64')}`
    },
    endpoints: {
      createShipment: '/shipments',
      tracking: '/tracking',
      pickups: '/pickups',
      rates: '/rates',
      labels: '/shipments/{id}/label',
      cancelShipment: '/shipments/{id}'
    }
  }
};

/**
 * ShipmentTracking class provides methods for creating, updating, and
 * tracking shipments through multiple logistics providers.
 */
export class ShipmentTracking {
  /**
   * Creates a new shipment in the system and with the specified logistics provider
   * 
   * @param shipmentData Shipment data to create
   * @param items Items to include in the shipment
   * @returns The created shipment
   */
  async createShipment(shipmentData: InsertShipment, items: InsertShipmentItem[]): Promise<Shipment> {
    // First create the shipment in our database
    const [shipment] = await db
      .insert(shipments)
      .values(shipmentData)
      .returning();
    
    // Add the items to the shipment
    if (items && items.length > 0) {
      for (const item of items) {
        await db
          .insert(shipmentItems)
          .values({
            ...item,
            shipmentId: shipment.id
          });
      }
    }
    
    // Create the shipment with the provider
    try {
      let providerResponse;
      
      if (shipmentData.serviceProvider === 'shiprocket') {
        providerResponse = await this.createShiprocketShipment(shipment, items);
      } else if (shipmentData.serviceProvider === 'dhl') {
        providerResponse = await this.createDHLShipment(shipment, items);
      } else {
        throw new Error(`Unsupported logistics provider: ${shipmentData.serviceProvider}`);
      }
      
      // Update shipment with provider response data
      await db
        .update(shipments)
        .set({
          providerData: providerResponse,
          trackingNumber: providerResponse.tracking_number || providerResponse.awbNumber || providerResponse.trackingNumber,
          labelUrl: providerResponse.label_url || providerResponse.labelUrl,
          estimatedDeliveryDate: providerResponse.estimated_delivery_date || providerResponse.estimatedDeliveryDate,
          updatedAt: new Date()
        })
        .where(eq(shipments.id, shipment.id));
      
      // Record shipment event
      await this.recordShipmentEvent(shipment.id, {
        eventType: 'label_created',
        location: 'Shipping origin',
        timestamp: new Date(),
        description: `Shipment created with ${shipmentData.serviceProvider}`,
        eventData: providerResponse
      });
      
      // Fetch the updated shipment
      const [updatedShipment] = await db
        .select()
        .from(shipments)
        .where(eq(shipments.id, shipment.id));
        
      return updatedShipment;
    } catch (error) {
      console.error('Error creating shipment with provider:', error);
      
      // Record the error event
      await this.recordShipmentEvent(shipment.id, {
        eventType: 'exception',
        timestamp: new Date(),
        description: `Error creating shipment: ${error.message}`,
        eventData: { error: error.message }
      });
      
      // Update shipment status to reflect error
      await db
        .update(shipments)
        .set({
          status: 'exception',
          updatedAt: new Date()
        })
        .where(eq(shipments.id, shipment.id));
      
      throw error;
    }
  }
  
  /**
   * Creates a shipment with Shiprocket
   */
  private async createShiprocketShipment(shipment: Shipment, items: InsertShipmentItem[]) {
    try {
      // First login to get token (if not already set in environment)
      let token = SHIPROCKET_API_KEY;
      if (!token) {
        const loginResponse = await axios.post(`${SHIPROCKET_API_URL}/auth/login`, {
          email: process.env.SHIPROCKET_EMAIL,
          password: process.env.SHIPROCKET_PASSWORD
        });
        token = loginResponse.data.token;
      }
      
      // Prepare order items
      const orderItems = items.map(item => ({
        name: item.description,
        sku: `PROD-${item.productId || Math.floor(Math.random() * 1000)}`,
        units: item.quantity,
        selling_price: item.value,
        tax: 0,
        hsn: item.hsTariffCode,
        discount: 0,
        weight: item.weight
      }));
      
      // Create shipment payload
      const payload = {
        order_id: `ORDER-${shipment.id}`,
        order_date: new Date(shipment.createdAt).toISOString().split('T')[0],
        pickup_location: "Primary",
        billing_customer_name: shipment.fromAddress.name,
        billing_last_name: "",
        billing_address: shipment.fromAddress.addressLine1,
        billing_address_2: shipment.fromAddress.addressLine2,
        billing_city: shipment.fromAddress.city,
        billing_pincode: shipment.fromAddress.postalCode,
        billing_state: shipment.fromAddress.state,
        billing_country: shipment.fromAddress.country,
        billing_email: shipment.fromAddress.email,
        billing_phone: shipment.fromAddress.phone,
        shipping_is_billing: false,
        shipping_customer_name: shipment.toAddress.name,
        shipping_last_name: "",
        shipping_address: shipment.toAddress.addressLine1,
        shipping_address_2: shipment.toAddress.addressLine2,
        shipping_city: shipment.toAddress.city,
        shipping_pincode: shipment.toAddress.postalCode,
        shipping_state: shipment.toAddress.state,
        shipping_country: shipment.toAddress.country,
        shipping_email: shipment.toAddress.email,
        shipping_phone: shipment.toAddress.phone,
        order_items: orderItems,
        payment_method: "Prepaid",
        sub_total: items.reduce((sum, item) => sum + (item.value * item.quantity), 0),
        length: shipment.dimensions?.length || 10,
        breadth: shipment.dimensions?.width || 10,
        height: shipment.dimensions?.height || 10,
        weight: shipment.weight
      };
      
      // Create order
      const response = await axios.post(
        `${PROVIDERS.shiprocket.baseUrl}${PROVIDERS.shiprocket.endpoints.createOrder}`,
        payload,
        { headers: { ...PROVIDERS.shiprocket.headers, 'Authorization': `Bearer ${token}` } }
      );
      
      return {
        ...response.data,
        tracking_number: response.data.shipment_id,
        label_url: null, // Will be generated separately
        estimated_delivery_date: null // Will be calculated separately
      };
    } catch (error) {
      console.error('Error creating Shiprocket shipment:', error.response?.data || error.message);
      throw new Error(`Shiprocket API error: ${error.response?.data?.message || error.message}`);
    }
  }
  
  /**
   * Creates a shipment with DHL
   */
  private async createDHLShipment(shipment: Shipment, items: InsertShipmentItem[]) {
    try {
      // Map product items to DHL format
      const packages = [{
        weight: shipment.weight,
        dimensions: {
          length: shipment.dimensions?.length || 10,
          width: shipment.dimensions?.width || 10,
          height: shipment.dimensions?.height || 10
        },
        customerReferences: [
          {
            value: `BELL24H-${shipment.id}`,
            typeCode: 'CU'
          }
        ],
        description: items.map(i => i.description).join(', ')
      }];
      
      // Create DHL-compatible address format
      const senderAddress = {
        postalCode: shipment.fromAddress.postalCode,
        cityName: shipment.fromAddress.city,
        countryCode: shipment.fromAddress.country,
        addressLine1: shipment.fromAddress.addressLine1,
        addressLine2: shipment.fromAddress.addressLine2,
        name: shipment.fromAddress.name,
        email: shipment.fromAddress.email,
        phone: shipment.fromAddress.phone
      };
      
      const recipientAddress = {
        postalCode: shipment.toAddress.postalCode,
        cityName: shipment.toAddress.city,
        countryCode: shipment.toAddress.country,
        addressLine1: shipment.toAddress.addressLine1,
        addressLine2: shipment.toAddress.addressLine2,
        name: shipment.toAddress.name,
        email: shipment.toAddress.email,
        phone: shipment.toAddress.phone
      };
      
      // Build DHL request payload
      const payload = {
        plannedShippingDateAndTime: new Date().toISOString(),
        pickup: {
          isRequested: true,
          pickupAddress: senderAddress,
          pickupTimeWindow: {
            startTime: new Date().toISOString(),
            endTime: new Date(new Date().getTime() + 3600000).toISOString()
          }
        },
        productCode: shipment.serviceType || 'EXPRESS',
        localServiceType: shipment.serviceType || 'EXPRESS',
        customerReference: `BELL24H-${shipment.id}`,
        sender: {
          address: senderAddress,
          contactInformation: {
            email: shipment.fromAddress.email,
            phone: shipment.fromAddress.phone,
            companyName: shipment.fromAddress.companyName
          }
        },
        receiver: {
          address: recipientAddress,
          contactInformation: {
            email: shipment.toAddress.email,
            phone: shipment.toAddress.phone,
            companyName: shipment.toAddress.companyName
          }
        },
        packages: packages,
        outputImageProperties: {
          printerDPI: 300,
          encodingFormat: 'pdf',
          imageOptions: [
            {
              typeCode: 'label',
              templateName: 'ECOM26_A6_001'
            }
          ]
        }
      };
      
      // Call DHL API
      const response = await axios.post(
        `${PROVIDERS.dhl.baseUrl}${PROVIDERS.dhl.endpoints.createShipment}`,
        payload,
        { headers: PROVIDERS.dhl.headers }
      );
      
      // Extract DHL tracking data
      return {
        ...response.data,
        tracking_number: response.data.shipmentTrackingNumber,
        label_url: response.data.documents[0].url,
        estimated_delivery_date: response.data.estimatedDeliveryDate
      };
    } catch (error) {
      console.error('Error creating DHL shipment:', error.response?.data || error.message);
      throw new Error(`DHL API error: ${error.response?.data?.message || error.message}`);
    }
  }
  
  /**
   * Track a shipment by ID or tracking number
   * 
   * @param idOrTrackingNumber The shipment ID or tracking number
   * @returns Updated shipment with tracking details
   */
  async trackShipment(idOrTrackingNumber: number | string): Promise<Shipment> {
    try {
      // Get the shipment
      let shipmentQuery = typeof idOrTrackingNumber === 'number' 
        ? eq(shipments.id, idOrTrackingNumber)
        : eq(shipments.trackingNumber, idOrTrackingNumber);
      
      const [shipment] = await db
        .select()
        .from(shipments)
        .where(shipmentQuery);
      
      if (!shipment) {
        throw new Error(`Shipment not found: ${idOrTrackingNumber}`);
      }
      
      // Get tracking data from provider
      let trackingData;
      
      if (shipment.serviceProvider === 'shiprocket') {
        trackingData = await this.trackShiprocketShipment(shipment.trackingNumber);
      } else if (shipment.serviceProvider === 'dhl') {
        trackingData = await this.trackDHLShipment(shipment.trackingNumber);
      } else {
        throw new Error(`Unsupported logistics provider: ${shipment.serviceProvider}`);
      }
      
      // Extract current status and events
      const currentStatus = this.mapProviderStatusToSystem(
        trackingData.current_status || trackingData.status || trackingData.shipmentStatus, 
        shipment.serviceProvider
      );
      
      // Record tracking events if new ones exist
      if (trackingData.tracking_data?.shipment_track || trackingData.events) {
        const events = trackingData.tracking_data?.shipment_track || trackingData.events || [];
        for (const event of events) {
          const eventTimestamp = new Date(event.date || event.timestamp);
          
          // Check if this event already exists to avoid duplicates
          const existingEvents = await db
            .select()
            .from(shipmentEvents)
            .where(
              and(
                eq(shipmentEvents.shipmentId, shipment.id),
                eq(shipmentEvents.eventType, this.mapProviderEventTypeToSystem(event.status || event.description, shipment.serviceProvider))
              )
            );
          
          if (existingEvents.length === 0) {
            await this.recordShipmentEvent(shipment.id, {
              eventType: this.mapProviderEventTypeToSystem(event.status || event.description, shipment.serviceProvider),
              location: event.location || 'Unknown',
              timestamp: eventTimestamp,
              description: event.status || event.description,
              eventData: event
            });
          }
        }
      }
      
      // Update shipment status
      await db
        .update(shipments)
        .set({
          status: currentStatus,
          updatedAt: new Date(),
          providerData: {
            ...shipment.providerData,
            latest_tracking: trackingData
          }
        })
        .where(eq(shipments.id, shipment.id));
      
      // If delivered, update the actual delivery date
      if (currentStatus === 'delivered' && !shipment.actualDeliveryDate) {
        await db
          .update(shipments)
          .set({
            actualDeliveryDate: new Date()
          })
          .where(eq(shipments.id, shipment.id));
      }
      
      // Return updated shipment
      const [updatedShipment] = await db
        .select()
        .from(shipments)
        .where(eq(shipments.id, shipment.id));
        
      return updatedShipment;
    } catch (error) {
      console.error('Error tracking shipment:', error);
      throw error;
    }
  }
  
  /**
   * Track a shipment with Shiprocket
   */
  private async trackShiprocketShipment(trackingNumber: string) {
    try {
      const response = await axios.get(
        `${PROVIDERS.shiprocket.baseUrl}${PROVIDERS.shiprocket.endpoints.tracking}/${trackingNumber}`,
        { headers: PROVIDERS.shiprocket.headers }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error tracking Shiprocket shipment:', error.response?.data || error.message);
      throw new Error(`Shiprocket tracking error: ${error.response?.data?.message || error.message}`);
    }
  }
  
  /**
   * Track a shipment with DHL
   */
  private async trackDHLShipment(trackingNumber: string) {
    try {
      const response = await axios.get(
        `${PROVIDERS.dhl.baseUrl}${PROVIDERS.dhl.endpoints.tracking}?trackingNumber=${trackingNumber}`,
        { headers: PROVIDERS.dhl.headers }
      );
      
      return response.data.shipments[0];
    } catch (error) {
      console.error('Error tracking DHL shipment:', error.response?.data || error.message);
      throw new Error(`DHL tracking error: ${error.response?.data?.message || error.message}`);
    }
  }
  
  /**
   * Generate the label for a shipment
   * 
   * @param shipmentId The shipment ID
   * @returns URL to the generated label
   */
  async generateLabel(shipmentId: number): Promise<string> {
    try {
      const [shipment] = await db
        .select()
        .from(shipments)
        .where(eq(shipments.id, shipmentId));
      
      if (!shipment) {
        throw new Error(`Shipment not found: ${shipmentId}`);
      }
      
      let labelUrl: string;
      
      if (shipment.serviceProvider === 'shiprocket') {
        labelUrl = await this.generateShiprocketLabel(shipment);
      } else if (shipment.serviceProvider === 'dhl') {
        labelUrl = await this.generateDHLLabel(shipment);
      } else {
        throw new Error(`Unsupported logistics provider: ${shipment.serviceProvider}`);
      }
      
      // Update shipment with label URL
      await db
        .update(shipments)
        .set({
          labelUrl,
          updatedAt: new Date()
        })
        .where(eq(shipments.id, shipment.id));
      
      // Record the document
      await db
        .insert(shipmentDocuments)
        .values({
          shipmentId: shipment.id,
          documentType: 'label',
          fileUrl: labelUrl,
          mimeType: 'application/pdf',
          filename: `label-${shipment.trackingNumber}.pdf`
        });
      
      return labelUrl;
    } catch (error) {
      console.error('Error generating label:', error);
      throw error;
    }
  }
  
  /**
   * Generate a Shiprocket label
   */
  private async generateShiprocketLabel(shipment: Shipment): Promise<string> {
    try {
      const response = await axios.post(
        `${PROVIDERS.shiprocket.baseUrl}${PROVIDERS.shiprocket.endpoints.generateLabel}`,
        {
          shipment_id: [shipment.trackingNumber]
        },
        { headers: PROVIDERS.shiprocket.headers }
      );
      
      return response.data.label_url;
    } catch (error) {
      console.error('Error generating Shiprocket label:', error.response?.data || error.message);
      throw new Error(`Shiprocket label error: ${error.response?.data?.message || error.message}`);
    }
  }
  
  /**
   * Generate a DHL label
   */
  private async generateDHLLabel(shipment: Shipment): Promise<string> {
    try {
      const response = await axios.get(
        `${PROVIDERS.dhl.baseUrl}${PROVIDERS.dhl.endpoints.labels.replace('{id}', shipment.trackingNumber)}`,
        { headers: PROVIDERS.dhl.headers }
      );
      
      return response.data.url;
    } catch (error) {
      console.error('Error generating DHL label:', error.response?.data || error.message);
      throw new Error(`DHL label error: ${error.response?.data?.message || error.message}`);
    }
  }
  
  /**
   * Cancel a shipment
   * 
   * @param shipmentId The shipment ID
   * @returns Boolean indicating success
   */
  async cancelShipment(shipmentId: number): Promise<boolean> {
    try {
      const [shipment] = await db
        .select()
        .from(shipments)
        .where(eq(shipments.id, shipmentId));
      
      if (!shipment) {
        throw new Error(`Shipment not found: ${shipmentId}`);
      }
      
      let cancelResult = false;
      
      if (shipment.serviceProvider === 'shiprocket') {
        cancelResult = await this.cancelShiprocketShipment(shipment);
      } else if (shipment.serviceProvider === 'dhl') {
        cancelResult = await this.cancelDHLShipment(shipment);
      } else {
        throw new Error(`Unsupported logistics provider: ${shipment.serviceProvider}`);
      }
      
      if (cancelResult) {
        // Update shipment status
        await db
          .update(shipments)
          .set({
            status: 'cancelled',
            updatedAt: new Date()
          })
          .where(eq(shipments.id, shipment.id));
        
        // Record cancellation event
        await this.recordShipmentEvent(shipment.id, {
          eventType: 'exception',
          location: 'System',
          timestamp: new Date(),
          description: 'Shipment cancelled',
          eventData: { cancelled: true }
        });
      }
      
      return cancelResult;
    } catch (error) {
      console.error('Error cancelling shipment:', error);
      throw error;
    }
  }
  
  /**
   * Cancel a Shiprocket shipment
   */
  private async cancelShiprocketShipment(shipment: Shipment): Promise<boolean> {
    try {
      const response = await axios.post(
        `${PROVIDERS.shiprocket.baseUrl}${PROVIDERS.shiprocket.endpoints.cancelShipment}`,
        {
          ids: [shipment.trackingNumber.toString()]
        },
        { headers: PROVIDERS.shiprocket.headers }
      );
      
      return response.data?.message?.includes('cancelled') || false;
    } catch (error) {
      console.error('Error cancelling Shiprocket shipment:', error.response?.data || error.message);
      throw new Error(`Shiprocket cancellation error: ${error.response?.data?.message || error.message}`);
    }
  }
  
  /**
   * Cancel a DHL shipment
   */
  private async cancelDHLShipment(shipment: Shipment): Promise<boolean> {
    try {
      const response = await axios.delete(
        `${PROVIDERS.dhl.baseUrl}${PROVIDERS.dhl.endpoints.cancelShipment.replace('{id}', shipment.trackingNumber)}`,
        { headers: PROVIDERS.dhl.headers }
      );
      
      return response.status === 200;
    } catch (error) {
      console.error('Error cancelling DHL shipment:', error.response?.data || error.message);
      throw new Error(`DHL cancellation error: ${error.response?.data?.message || error.message}`);
    }
  }
  
  /**
   * Records a shipment event
   * 
   * @param shipmentId The shipment ID
   * @param event The event data
   */
  async recordShipmentEvent(shipmentId: number, event: Omit<InsertShipmentEvent, 'shipmentId'>): Promise<void> {
    await db
      .insert(shipmentEvents)
      .values({
        ...event,
        shipmentId
      });
  }
  
  /**
   * Get all events for a shipment
   * 
   * @param shipmentId The shipment ID
   * @returns Array of shipment events
   */
  async getShipmentEvents(shipmentId: number): Promise<any[]> {
    const events = await db
      .select()
      .from(shipmentEvents)
      .where(eq(shipmentEvents.shipmentId, shipmentId))
      .orderBy(desc(shipmentEvents.timestamp));
    
    return events;
  }
  
  /**
   * Get all documents for a shipment
   * 
   * @param shipmentId The shipment ID
   * @returns Array of shipment documents
   */
  async getShipmentDocuments(shipmentId: number): Promise<any[]> {
    const documents = await db
      .select()
      .from(shipmentDocuments)
      .where(eq(shipmentDocuments.shipmentId, shipmentId));
    
    return documents;
  }
  
  /**
   * Maps provider-specific status to our system status
   */
  private mapProviderStatusToSystem(providerStatus: string, provider: string): string {
    const status = providerStatus.toLowerCase();
    
    if (provider === 'shiprocket') {
      if (status.includes('delivered')) return 'delivered';
      if (status.includes('out for delivery')) return 'out_for_delivery';
      if (status.includes('in transit')) return 'in_transit';
      if (status.includes('pickup')) return 'picked_up';
      if (status.includes('manifest')) return 'manifest_generated';
      if (status.includes('label')) return 'label_created';
      if (status.includes('cancelled') || status.includes('canceled')) return 'cancelled';
      if (status.includes('exception') || status.includes('failed')) return 'exception';
    } else if (provider === 'dhl') {
      if (status.includes('delivered')) return 'delivered';
      if (status.includes('out for delivery')) return 'out_for_delivery';
      if (status.includes('transit')) return 'in_transit';
      if (status.includes('pickup')) return 'picked_up';
      if (status.includes('shipment information received')) return 'label_created';
      if (status.includes('cancelled') || status.includes('canceled')) return 'cancelled';
      if (status.includes('exception') || status.includes('failed')) return 'exception';
    }
    
    return 'pending'; // Default status
  }
  
  /**
   * Maps provider-specific event types to our system event types
   */
  private mapProviderEventTypeToSystem(providerEventType: string, provider: string): string {
    const eventType = providerEventType.toLowerCase();
    
    if (provider === 'shiprocket') {
      if (eventType.includes('delivered')) return 'delivered';
      if (eventType.includes('out for delivery')) return 'out_for_delivery';
      if (eventType.includes('in transit')) return 'in_transit';
      if (eventType.includes('pickup')) return 'picked_up';
      if (eventType.includes('manifest')) return 'manifest_generated';
      if (eventType.includes('label')) return 'label_created';
      if (eventType.includes('cancelled') || eventType.includes('canceled')) return 'exception';
      if (eventType.includes('exception') || eventType.includes('failed')) return 'exception';
    } else if (provider === 'dhl') {
      if (eventType.includes('delivered')) return 'delivered';
      if (eventType.includes('out for delivery')) return 'out_for_delivery';
      if (eventType.includes('transit')) return 'in_transit';
      if (eventType.includes('pickup')) return 'picked_up';
      if (eventType.includes('shipment information received')) return 'label_created';
      if (eventType.includes('cancelled') || eventType.includes('canceled')) return 'exception';
      if (eventType.includes('exception') || eventType.includes('failed')) return 'exception';
    }
    
    return 'in_transit'; // Default event type
  }
}

export const shipmentTrackingService = new ShipmentTracking();