/**
 * Logistics Tracking Service
 * 
 * Provides integration with Shiprocket and DHL APIs for real-time
 * shipment tracking, route optimization, and customs documentation.
 */

import axios from 'axios';
import { format } from 'date-fns';
import { db } from '../../lib/db';
import { shipments, shipmentUpdates, shipmentDocuments } from '../../lib/db/schema';
import { trackEvent } from '../../lib/analytics';
import { getCachedData, setCachedData } from '../../lib/redis-client';

// API configuration
const SHIPROCKET_API_URL = process.env.SHIPROCKET_API_URL || 'https://apiv2.shiprocket.in/v1';
const DHL_API_URL = process.env.DHL_API_URL || 'https://api-mock.dhl.com/mydhl/v1';

// Cache duration (5 minutes)
const CACHE_DURATION = 300;

/**
 * LogisticsProvider enum - supported logistics providers
 */
export enum LogisticsProvider {
  SHIPROCKET = 'shiprocket',
  DHL = 'dhl',
  OTHER = 'other'
}

/**
 * ShipmentStatus enum - standardized shipment statuses
 */
export enum ShipmentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  FAILED_DELIVERY = 'failed_delivery',
  RETURNED = 'returned',
  EXCEPTION = 'exception',
  CUSTOMS_HOLD = 'customs_hold'
}

/**
 * DocumentType enum - types of shipping documents
 */
export enum DocumentType {
  INVOICE = 'invoice',
  PACKING_LIST = 'packing_list',
  BILL_OF_LADING = 'bill_of_lading',
  CUSTOMS_DECLARATION = 'customs_declaration',
  CERTIFICATE_OF_ORIGIN = 'certificate_of_origin',
  DANGEROUS_GOODS = 'dangerous_goods',
  INSURANCE = 'insurance'
}

/**
 * ShipmentLocation interface - represents a location in a shipment journey
 */
interface ShipmentLocation {
  name: string;
  address?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  timestamp: Date;
}

/**
 * OptimalRoute interface - represents an optimized shipping route
 */
interface OptimalRoute {
  totalDistance: number;
  estimatedDuration: number;
  co2Emissions: number;
  waypoints: ShipmentLocation[];
  alternativeRoutes?: OptimalRoute[];
}

/**
 * CustomsInfo interface - represents customs information for international shipments
 */
interface CustomsInfo {
  declarationType: string;
  declarationValue: number;
  currency: string;
  contentDescription: string;
  hsCode?: string;
  originCountry: string;
  documentRefs?: string[];
}

/**
 * LogisticsTrackingService class - provides methods for tracking and managing shipments
 */
export class LogisticsTrackingService {
  private authTokens: Record<LogisticsProvider, string | null> = {
    [LogisticsProvider.SHIPROCKET]: null,
    [LogisticsProvider.DHL]: null,
    [LogisticsProvider.OTHER]: null
  };

  /**
   * Authenticate with the logistics provider API
   * @param provider Logistics provider
   * @returns Authentication token
   */
  async authenticate(provider: LogisticsProvider): Promise<string> {
    try {
      if (this.authTokens[provider]) {
        return this.authTokens[provider]!;
      }

      switch (provider) {
        case LogisticsProvider.SHIPROCKET:
          const shiprocketResponse = await axios.post(`${SHIPROCKET_API_URL}/external/auth/login`, {
            email: process.env.SHIPROCKET_EMAIL,
            password: process.env.SHIPROCKET_PASSWORD
          });
          this.authTokens[provider] = shiprocketResponse.data.token;
          return shiprocketResponse.data.token;

        case LogisticsProvider.DHL:
          const dhlResponse = await axios.post(`${DHL_API_URL}/auth/token`, {
            client_id: process.env.DHL_CLIENT_ID,
            client_secret: process.env.DHL_CLIENT_SECRET,
            grant_type: 'client_credentials'
          });
          this.authTokens[provider] = dhlResponse.data.access_token;
          return dhlResponse.data.access_token;

        default:
          throw new Error(`Authentication not supported for provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Authentication failed for ${provider}:`, error);
      throw new Error(`Failed to authenticate with ${provider}`);
    }
  }

  /**
   * Create a new shipment
   * @param data Shipment data
   * @returns Created shipment details
   */
  async createShipment(data: {
    provider: LogisticsProvider;
    orderId: string;
    pickup: {
      address: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
      contactName: string;
      contactPhone: string;
    };
    delivery: {
      address: string;
      city: string;
      state: string;
      country: string;
      postalCode: string;
      contactName: string;
      contactPhone: string;
    };
    packages: Array<{
      weight: number;
      length: number;
      width: number;
      height: number;
      description: string;
      value: number;
      currency: string;
    }>;
    customsInfo?: CustomsInfo;
    serviceType?: string;
    isExpress?: boolean;
  }) {
    try {
      const token = await this.authenticate(data.provider);
      let response;

      switch (data.provider) {
        case LogisticsProvider.SHIPROCKET:
          response = await axios.post(
            `${SHIPROCKET_API_URL}/external/shipments/create/adhoc`, 
            {
              order_id: data.orderId,
              pickup_location: {
                address: data.pickup.address,
                city: data.pickup.city,
                state: data.pickup.state,
                country: data.pickup.country,
                pin_code: data.pickup.postalCode,
                name: data.pickup.contactName,
                phone: data.pickup.contactPhone
              },
              shipping_customer_name: data.delivery.contactName,
              shipping_phone: data.delivery.contactPhone,
              shipping_address: data.delivery.address,
              shipping_city: data.delivery.city,
              shipping_state: data.delivery.state,
              shipping_country: data.delivery.country,
              shipping_pincode: data.delivery.postalCode,
              order_items: data.packages.map(pkg => ({
                name: pkg.description,
                sku: `PKG-${Date.now()}`,
                units: 1,
                selling_price: pkg.value,
                weight: pkg.weight,
                dimensions: {
                  length: pkg.length,
                  width: pkg.width,
                  height: pkg.height
                }
              })),
              payment_method: "Prepaid",
              sub_total: data.packages.reduce((sum, pkg) => sum + pkg.value, 0),
              courier_id: data.isExpress ? "Express" : "Standard",
              service_type: data.serviceType || "Standard"
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          break;

        case LogisticsProvider.DHL:
          response = await axios.post(
            `${DHL_API_URL}/shipments`,
            {
              plannedShippingDateTime: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'"),
              pickup: {
                isRequested: true,
                address: {
                  addressLine1: data.pickup.address,
                  city: data.pickup.city,
                  postalCode: data.pickup.postalCode,
                  countryCode: data.pickup.country,
                  contact: {
                    personName: data.pickup.contactName,
                    phoneNumber: data.pickup.contactPhone
                  }
                }
              },
              accounts: [
                {
                  typeCode: "shipper",
                  number: process.env.DHL_ACCOUNT_NUMBER
                }
              ],
              outputImageProperties: {
                printerDPI: 300,
                encodingFormat: "pdf"
              },
              customerDetails: {
                shipperDetails: {
                  postalAddress: {
                    addressLine1: data.pickup.address,
                    city: data.pickup.city,
                    postalCode: data.pickup.postalCode,
                    countryCode: data.pickup.country
                  },
                  contactInformation: {
                    phone: data.pickup.contactPhone,
                    companyName: "Bell24H",
                    fullName: data.pickup.contactName
                  }
                },
                receiverDetails: {
                  postalAddress: {
                    addressLine1: data.delivery.address,
                    city: data.delivery.city,
                    postalCode: data.delivery.postalCode,
                    countryCode: data.delivery.country
                  },
                  contactInformation: {
                    phone: data.delivery.contactPhone,
                    fullName: data.delivery.contactName
                  }
                }
              },
              content: {
                packages: data.packages.map(pkg => ({
                  weight: pkg.weight,
                  dimensions: {
                    length: pkg.length,
                    width: pkg.width,
                    height: pkg.height
                  },
                  description: pkg.description,
                  monetaryValue: pkg.value,
                  currency: pkg.currency
                }))
              },
              ...(data.customsInfo && {
                customsDetails: {
                  exportDeclaration: {
                    lineItems: data.packages.map(pkg => ({
                      description: pkg.description,
                      value: pkg.value,
                      countryOfOrigin: data.customsInfo?.originCountry,
                      hsCode: data.customsInfo?.hsCode
                    })),
                    exportReason: data.customsInfo.declarationType,
                    destinationCountry: data.delivery.country
                  }
                }
              }),
              valueAddedServices: [
                {
                  serviceCode: data.isExpress ? "TD" : "BP",
                  localServiceCode: data.serviceType || "Standard"
                }
              ]
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          break;

        default:
          throw new Error(`Unsupported logistics provider: ${data.provider}`);
      }

      // Save shipment to database
      const [shipmentId] = await db.insert(shipments).values({
        orderId: data.orderId,
        provider: data.provider,
        providerShipmentId: response.data.shipment_id || response.data.shipmentTrackingNumber,
        senderDetails: JSON.stringify(data.pickup),
        receiverDetails: JSON.stringify(data.delivery),
        packageDetails: JSON.stringify(data.packages),
        customsInfo: data.customsInfo ? JSON.stringify(data.customsInfo) : null,
        status: ShipmentStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning({ id: shipments.id });

      // Track event
      trackEvent('shipment_created', {
        shipmentId: shipmentId.id,
        provider: data.provider,
        orderId: data.orderId
      });

      return {
        id: shipmentId.id,
        trackingNumber: response.data.shipment_id || response.data.shipmentTrackingNumber,
        trackingUrl: response.data.tracking_url || `https://track.dhl.com/track/${response.data.shipmentTrackingNumber}`,
        ...response.data
      };
    } catch (error) {
      console.error('Failed to create shipment:', error);
      throw new Error('Failed to create shipment: ' + (error as Error).message);
    }
  }

  /**
   * Track a shipment by ID or tracking number
   * @param identifier Shipment ID or tracking number
   * @param provider Logistics provider
   * @returns Tracking information
   */
  async trackShipment(identifier: string, provider: LogisticsProvider) {
    try {
      // Check cache first
      const cacheKey = `shipment:track:${provider}:${identifier}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const token = await this.authenticate(provider);
      let response;

      switch (provider) {
        case LogisticsProvider.SHIPROCKET:
          response = await axios.get(
            `${SHIPROCKET_API_URL}/external/courier/track?order_id=${identifier}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          break;

        case LogisticsProvider.DHL:
          response = await axios.get(
            `${DHL_API_URL}/shipments/${identifier}/tracking`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          break;

        default:
          throw new Error(`Tracking not supported for provider: ${provider}`);
      }

      // Normalize the tracking data
      const normalizedData = this.normalizeTrackingData(response.data, provider);
      
      // Update shipment status in database
      const shipmentData = await db.select().from(shipments).where(
        provider === LogisticsProvider.SHIPROCKET
          ? { orderId: identifier }
          : { providerShipmentId: identifier }
      ).limit(1);

      if (shipmentData.length > 0) {
        const shipment = shipmentData[0];
        
        // Update shipment
        await db.update(shipments)
          .set({ 
            status: normalizedData.status,
            updatedAt: new Date()
          })
          .where({ id: shipment.id });
        
        // Add tracking update
        await db.insert(shipmentUpdates).values({
          shipmentId: shipment.id,
          status: normalizedData.status,
          location: normalizedData.currentLocation ? JSON.stringify(normalizedData.currentLocation) : null,
          details: JSON.stringify(normalizedData),
          createdAt: new Date()
        });

        // Track event
        trackEvent('shipment_status_updated', {
          shipmentId: shipment.id,
          provider,
          status: normalizedData.status
        });
      }

      // Cache the data
      await setCachedData(cacheKey, JSON.stringify(normalizedData), CACHE_DURATION);

      return normalizedData;
    } catch (error) {
      console.error('Failed to track shipment:', error);
      throw new Error('Failed to track shipment: ' + (error as Error).message);
    }
  }

  /**
   * Get optimized shipping route
   * @param originPostalCode Origin postal code
   * @param destinationPostalCode Destination postal code
   * @param originCountry Origin country code
   * @param destinationCountry Destination country code
   * @returns Optimized route information
   */
  async getOptimalRoute(
    originPostalCode: string,
    destinationPostalCode: string,
    originCountry: string,
    destinationCountry: string
  ): Promise<OptimalRoute> {
    try {
      // Check cache first
      const cacheKey = `route:${originCountry}:${originPostalCode}:${destinationCountry}:${destinationPostalCode}`;
      const cachedData = await getCachedData(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }

      const token = await this.authenticate(LogisticsProvider.DHL);
      
      const response = await axios.post(
        `${DHL_API_URL}/routes/optimize`,
        {
          origin: {
            postalCode: originPostalCode,
            countryCode: originCountry
          },
          destination: {
            postalCode: destinationPostalCode,
            countryCode: destinationCountry
          },
          optimizationCriteria: "FASTEST"
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Normalize the route data
      const route: OptimalRoute = {
        totalDistance: response.data.totalDistance,
        estimatedDuration: response.data.estimatedDuration,
        co2Emissions: response.data.co2Emissions || 0,
        waypoints: response.data.waypoints.map((wp: any) => ({
          name: wp.name,
          address: wp.address,
          city: wp.city,
          state: wp.state,
          country: wp.country,
          postalCode: wp.postalCode,
          latitude: wp.coordinates?.latitude,
          longitude: wp.coordinates?.longitude,
          timestamp: new Date(wp.estimatedArrival)
        }))
      };

      // Cache the data
      await setCachedData(cacheKey, JSON.stringify(route), CACHE_DURATION * 12); // Cache for 1 hour

      return route;
    } catch (error) {
      console.error('Failed to get optimal route:', error);
      throw new Error('Failed to get optimal route: ' + (error as Error).message);
    }
  }

  /**
   * Generate and upload customs documentation
   * @param shipmentId Shipment ID
   * @param documentType Type of document to generate
   * @param customData Additional data for document generation
   * @returns Document URL
   */
  async generateCustomsDocument(
    shipmentId: number,
    documentType: DocumentType,
    customData?: Record<string, any>
  ): Promise<string> {
    try {
      // Get shipment data
      const shipmentData = await db.select().from(shipments).where({ id: shipmentId }).limit(1);
      
      if (shipmentData.length === 0) {
        throw new Error(`Shipment with ID ${shipmentId} not found`);
      }

      const shipment = shipmentData[0];
      const token = await this.authenticate(shipment.provider as LogisticsProvider);
      
      // Generate document based on provider and document type
      let response;
      
      switch (shipment.provider) {
        case LogisticsProvider.DHL:
          response = await axios.post(
            `${DHL_API_URL}/shipments/${shipment.providerShipmentId}/documents`,
            {
              documentType: this.mapDocumentTypeToDHL(documentType),
              customData
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          break;

        case LogisticsProvider.SHIPROCKET:
          response = await axios.post(
            `${SHIPROCKET_API_URL}/external/orders/print/${documentType}`,
            {
              ids: [shipment.orderId]
            },
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );
          break;

        default:
          throw new Error(`Document generation not supported for provider: ${shipment.provider}`);
      }

      // Save document to database
      const [docId] = await db.insert(shipmentDocuments).values({
        shipmentId,
        documentType,
        documentUrl: response.data.documentUrl || response.data.download_url,
        createdAt: new Date()
      }).returning({ id: shipmentDocuments.id });

      return response.data.documentUrl || response.data.download_url;
    } catch (error) {
      console.error('Failed to generate customs document:', error);
      throw new Error('Failed to generate customs document: ' + (error as Error).message);
    }
  }

  /**
   * Normalize tracking data from different providers into a standard format
   * @param data Raw tracking data from provider
   * @param provider Logistics provider
   * @returns Normalized tracking data
   */
  private normalizeTrackingData(data: any, provider: LogisticsProvider) {
    try {
      switch (provider) {
        case LogisticsProvider.SHIPROCKET:
          const srTrackingData = data.tracking_data || {};
          
          return {
            trackingNumber: srTrackingData.shipment_id || data.tracking_id,
            trackingUrl: srTrackingData.track_url || data.tracking_url,
            status: this.mapShiprocketStatus(srTrackingData.shipment_status),
            estimatedDelivery: srTrackingData.expected_delivery_date ? new Date(srTrackingData.expected_delivery_date) : null,
            currentLocation: srTrackingData.current_status_location ? {
              name: srTrackingData.current_status_location,
              city: srTrackingData.current_status_location.split(',')?.[0] || '',
              country: 'India', // Default for Shiprocket
              timestamp: srTrackingData.current_status_time ? new Date(srTrackingData.current_status_time) : new Date()
            } : null,
            trackingHistory: (srTrackingData.shipment_track || []).map((track: any) => ({
              status: this.mapShiprocketStatus(track.status),
              location: {
                name: track.location || 'Unknown',
                city: track.location?.split(',')?.[0] || 'Unknown',
                country: 'India',
                timestamp: track.date ? new Date(track.date) : new Date()
              },
              description: track.status_body || track.activity
            })),
            isFinal: ['delivered', 'returned', 'cancelled'].includes(srTrackingData.shipment_status?.toLowerCase())
          };

        case LogisticsProvider.DHL:
          const shipmentInfo = data.shipmentInfo || {};
          const shipmentEvents = data.shipmentEvents || [];
          
          return {
            trackingNumber: shipmentInfo.shipmentTrackingNumber,
            trackingUrl: `https://track.dhl.com/track/${shipmentInfo.shipmentTrackingNumber}`,
            status: this.mapDHLStatus(shipmentInfo.status),
            estimatedDelivery: shipmentInfo.estimatedDeliveryDate ? new Date(shipmentInfo.estimatedDeliveryDate) : null,
            currentLocation: shipmentEvents.length > 0 ? {
              name: shipmentEvents[0].location?.name || 'Unknown',
              address: shipmentEvents[0].location?.address || null,
              city: shipmentEvents[0].location?.city || 'Unknown',
              state: shipmentEvents[0].location?.state || null,
              country: shipmentEvents[0].location?.countryCode || 'Unknown',
              postalCode: shipmentEvents[0].location?.postalCode || null,
              timestamp: shipmentEvents[0].timestamp ? new Date(shipmentEvents[0].timestamp) : new Date()
            } : null,
            trackingHistory: shipmentEvents.map((event: any) => ({
              status: this.mapDHLStatus(event.statusCode),
              location: {
                name: event.location?.name || 'Unknown',
                address: event.location?.address || null,
                city: event.location?.city || 'Unknown',
                state: event.location?.state || null,
                country: event.location?.countryCode || 'Unknown',
                postalCode: event.location?.postalCode || null,
                timestamp: event.timestamp ? new Date(event.timestamp) : new Date()
              },
              description: event.description
            })),
            isFinal: ['delivered', 'returned'].includes(shipmentInfo.status?.toLowerCase())
          };

        default:
          throw new Error(`Normalization not supported for provider: ${provider}`);
      }
    } catch (error) {
      console.error('Failed to normalize tracking data:', error);
      return {
        status: ShipmentStatus.EXCEPTION,
        error: (error as Error).message,
        rawData: data
      };
    }
  }

  /**
   * Map Shiprocket status to standardized shipment status
   * @param status Shiprocket status
   * @returns Standardized status
   */
  private mapShiprocketStatus(status: string): ShipmentStatus {
    const statusLower = (status || '').toLowerCase();
    
    if (statusLower.includes('pick up pending') || statusLower.includes('pickup scheduled')) {
      return ShipmentStatus.PENDING;
    } else if (statusLower.includes('picked up') || statusLower.includes('shipment picked up')) {
      return ShipmentStatus.PICKED_UP;
    } else if (statusLower.includes('in transit') || statusLower.includes('shipped')) {
      return ShipmentStatus.IN_TRANSIT;
    } else if (statusLower.includes('out for delivery')) {
      return ShipmentStatus.OUT_FOR_DELIVERY;
    } else if (statusLower.includes('delivered')) {
      return ShipmentStatus.DELIVERED;
    } else if (statusLower.includes('failed delivery')) {
      return ShipmentStatus.FAILED_DELIVERY;
    } else if (statusLower.includes('return') || statusLower.includes('rto')) {
      return ShipmentStatus.RETURNED;
    } else if (statusLower.includes('exception') || statusLower.includes('undelivered')) {
      return ShipmentStatus.EXCEPTION;
    } else if (statusLower.includes('customs') || statusLower.includes('held')) {
      return ShipmentStatus.CUSTOMS_HOLD;
    }
    
    return ShipmentStatus.PROCESSING;
  }

  /**
   * Map DHL status to standardized shipment status
   * @param status DHL status
   * @returns Standardized status
   */
  private mapDHLStatus(status: string): ShipmentStatus {
    const statusLower = (status || '').toLowerCase();
    
    if (statusLower.includes('pre-transit') || statusLower === 'shipment information received') {
      return ShipmentStatus.PENDING;
    } else if (statusLower.includes('pickup') || statusLower === 'picked up') {
      return ShipmentStatus.PICKED_UP;
    } else if (statusLower.includes('transit') || statusLower === 'in transit') {
      return ShipmentStatus.IN_TRANSIT;
    } else if (statusLower.includes('out for delivery')) {
      return ShipmentStatus.OUT_FOR_DELIVERY;
    } else if (statusLower.includes('delivered')) {
      return ShipmentStatus.DELIVERED;
    } else if (statusLower.includes('delivery attempt unsuccessful')) {
      return ShipmentStatus.FAILED_DELIVERY;
    } else if (statusLower.includes('return')) {
      return ShipmentStatus.RETURNED;
    } else if (statusLower.includes('exception') || statusLower.includes('failure')) {
      return ShipmentStatus.EXCEPTION;
    } else if (statusLower.includes('customs') || statusLower.includes('clearance')) {
      return ShipmentStatus.CUSTOMS_HOLD;
    }
    
    return ShipmentStatus.PROCESSING;
  }

  /**
   * Map document type to DHL document type
   * @param docType Document type
   * @returns DHL document type
   */
  private mapDocumentTypeToDHL(docType: DocumentType): string {
    switch (docType) {
      case DocumentType.INVOICE:
        return 'INV';
      case DocumentType.PACKING_LIST:
        return 'PNL';
      case DocumentType.BILL_OF_LADING:
        return 'BOL';
      case DocumentType.CUSTOMS_DECLARATION:
        return 'CUS';
      case DocumentType.CERTIFICATE_OF_ORIGIN:
        return 'COO';
      case DocumentType.DANGEROUS_GOODS:
        return 'DGD';
      case DocumentType.INSURANCE:
        return 'INS';
      default:
        return 'DOC';
    }
  }
}

export default new LogisticsTrackingService();
