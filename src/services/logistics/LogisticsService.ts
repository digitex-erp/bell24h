import { ShippingOptimizer, Location, PackageInfo, ShippingPriorities, ShippingRecommendation, Route, DeliveryHistory, DeliveryPrediction, InternationalShipment, CustomsDocumentation } from './ShippingOptimizer';
import { TrackingService, TrackingInfo } from './TrackingService';

export class LogisticsService {
  private shippingOptimizer: ShippingOptimizer;
  private trackingService: TrackingService;

  constructor() {
    this.shippingOptimizer = new ShippingOptimizer();
    this.trackingService = new TrackingService();
  }

  async getShippingRecommendation(
    origin: Location,
    destination: Location,
    packageDetails: PackageInfo,
    priorities: ShippingPriorities
  ): Promise<ShippingRecommendation> {
    try {
      return await this.shippingOptimizer.calculateOptimalShipping(
        origin,
        destination,
        packageDetails,
        priorities
      );
    } catch (error) {
      console.error('Error getting shipping recommendation:', error);
      throw new Error('Failed to get shipping recommendation');
    }
  }

  async predictDeliveryTime(
    carrier: string,
    route: Route,
    historical_data: DeliveryHistory[]
  ): Promise<DeliveryPrediction> {
    try {
      return await this.shippingOptimizer.predictDeliveryTime(
        carrier,
        route,
        historical_data
      );
    } catch (error) {
      console.error('Error predicting delivery time:', error);
      throw new Error('Failed to predict delivery time');
    }
  }

  async handleInternationalShipment(
    shipment: InternationalShipment
  ): Promise<CustomsDocumentation> {
    try {
      return await this.shippingOptimizer.handleInternationalShipping(shipment);
    } catch (error) {
      console.error('Error handling international shipment:', error);
      throw new Error('Failed to process international shipment');
    }
  }

  async trackShipment(trackingNumber: string, carrier: string): Promise<TrackingInfo> {
    try {
      return await this.trackingService.trackShipment(trackingNumber, carrier);
    } catch (error) {
      console.error('Error tracking shipment:', error);
      throw new Error('Failed to track shipment');
    }
  }

  async trackMultipleShipments(trackingNumbers: { number: string; carrier: string }[]): Promise<TrackingInfo[]> {
    try {
      return await this.trackingService.trackMultipleShipments(trackingNumbers);
    } catch (error) {
      console.error('Error tracking multiple shipments:', error);
      throw new Error('Failed to track multiple shipments');
    }
  }
} 