import axios from 'axios';
import { DHLService } from './carriers/DHLService';
import { FedExService } from './carriers/FedExService';
import { UPSService } from './carriers/UPSService';

export interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: string;
  lastUpdate: Date;
  estimatedDelivery: Date;
  location: {
    city: string;
    country: string;
  };
  events: TrackingEvent[];
}

export interface TrackingEvent {
  timestamp: Date;
  status: string;
  location: string;
  description: string;
}

export class TrackingService {
  private dhlService: DHLService;
  private fedExService: FedExService;
  private upsService: UPSService;

  constructor() {
    this.dhlService = new DHLService();
    this.fedExService = new FedExService();
    this.upsService = new UPSService();
  }

  async trackShipment(trackingNumber: string, carrier: string): Promise<TrackingInfo> {
    try {
      let trackingInfo: TrackingInfo;

      switch (carrier.toUpperCase()) {
        case 'DHL':
          trackingInfo = await this.dhlService.trackShipment(trackingNumber);
          break;
        case 'FEDEX':
          trackingInfo = await this.fedExService.trackShipment(trackingNumber);
          break;
        case 'UPS':
          trackingInfo = await this.upsService.trackShipment(trackingNumber);
          break;
        default:
          throw new Error(`Unsupported carrier: ${carrier}`);
      }

      return this.normalizeTrackingInfo(trackingInfo);
    } catch (error) {
      console.error('Error tracking shipment:', error);
      throw new Error('Failed to track shipment');
    }
  }

  async trackMultipleShipments(trackingNumbers: { number: string; carrier: string }[]): Promise<TrackingInfo[]> {
    try {
      const trackingPromises = trackingNumbers.map(({ number, carrier }) =>
        this.trackShipment(number, carrier)
      );

      return await Promise.all(trackingPromises);
    } catch (error) {
      console.error('Error tracking multiple shipments:', error);
      throw new Error('Failed to track multiple shipments');
    }
  }

  private normalizeTrackingInfo(trackingInfo: TrackingInfo): TrackingInfo {
    // Normalize status codes across carriers
    const normalizedStatus = this.normalizeStatus(trackingInfo.status);
    
    // Sort events by timestamp
    const sortedEvents = [...trackingInfo.events].sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    return {
      ...trackingInfo,
      status: normalizedStatus,
      events: sortedEvents
    };
  }

  private normalizeStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'IN_TRANSIT': 'In Transit',
      'DELIVERED': 'Delivered',
      'EXCEPTION': 'Exception',
      'PICKUP': 'Pickup',
      'OUT_FOR_DELIVERY': 'Out for Delivery',
      'ARRIVED_AT_DESTINATION': 'Arrived at Destination',
      'DEPARTED_FACILITY': 'Departed Facility',
      'SCANNED': 'Scanned'
    };

    return statusMap[status] || status;
  }
} 