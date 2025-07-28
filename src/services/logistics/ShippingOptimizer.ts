import axios from 'axios';
import { DHLService } from './carriers/DHLService';
import { FedExService } from './carriers/FedExService';
import { UPSService } from './carriers/UPSService';
import { CustomsService } from './customs/CustomsService';
import { DeliveryPredictor } from './ml/DeliveryPredictor';

export interface Location {
  address: string;
  city: string;
  country: string;
  postalCode: string;
}

export interface PackageInfo {
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  fragile: boolean;
}

export interface ShippingPriorities {
  cost: number;
  speed: number;
  reliability: number;
}

export interface ShippingRecommendation {
  carrier: string;
  cost: number;
  estimatedDeliveryTime: string;
  reliability: number;
}

export interface DeliveryHistory {
  carrier: string;
  route: Route;
  actualDeliveryTime: string;
}

export interface Route {
  origin: Location;
  destination: Location;
}

export interface DeliveryPrediction {
  estimatedDeliveryTime: string;
  confidence: number;
}

export interface InternationalShipment {
  origin: Location;
  destination: Location;
  packageDetails: PackageInfo;
  customsValue: number;
}

export interface CustomsDocumentation {
  documents: string[];
  duties: number;
  restrictions: string[];
}

export class ShippingOptimizer {
  private dhlService: DHLService;
  private fedExService: FedExService;
  private upsService: UPSService;
  private customsService: CustomsService;
  private deliveryPredictor: DeliveryPredictor;

  constructor() {
    this.dhlService = new DHLService();
    this.fedExService = new FedExService();
    this.upsService = new UPSService();
    this.customsService = new CustomsService();
    this.deliveryPredictor = new DeliveryPredictor();
  }

  async calculateOptimalShipping(
    origin: Location,
    destination: Location,
    packageDetails: PackageInfo,
    priorities: ShippingPriorities
  ): Promise<ShippingRecommendation> {
    try {
      // Get quotes from all carriers
      const [dhlQuote, fedExQuote, upsQuote] = await Promise.all([
        this.dhlService.getQuote(origin, destination, packageDetails),
        this.fedExService.getQuote(origin, destination, packageDetails),
        this.upsService.getQuote(origin, destination, packageDetails)
      ]);

      // Get delivery predictions
      const [dhlPrediction, fedExPrediction, upsPrediction] = await Promise.all([
        this.deliveryPredictor.predict({
          carrier: 'DHL',
          origin,
          destination,
          historicalData: []
        }),
        this.deliveryPredictor.predict({
          carrier: 'FedEx',
          origin,
          destination,
          historicalData: []
        }),
        this.deliveryPredictor.predict({
          carrier: 'UPS',
          origin,
          destination,
          historicalData: []
        })
      ]);

      // Calculate scores based on priorities
      const carriers = [
        {
          name: 'DHL',
          quote: dhlQuote,
          prediction: dhlPrediction,
          reliability: 0.95
        },
        {
          name: 'FedEx',
          quote: fedExQuote,
          prediction: fedExPrediction,
          reliability: 0.92
        },
        {
          name: 'UPS',
          quote: upsQuote,
          prediction: upsPrediction,
          reliability: 0.90
        }
      ];

      const scores = carriers.map(carrier => ({
        carrier: carrier.name,
        score: this.calculateScore(carrier, priorities),
        cost: carrier.quote.cost,
        estimatedDeliveryTime: carrier.prediction.estimatedTime,
        reliability: carrier.reliability
      }));

      // Return the best option
      const bestOption = scores.reduce((best, current) => 
        current.score > best.score ? current : best
      );

      return {
        carrier: bestOption.carrier,
        cost: bestOption.cost,
        estimatedDeliveryTime: bestOption.estimatedDeliveryTime,
        reliability: bestOption.reliability
      };
    } catch (error) {
      console.error('Error calculating optimal shipping:', error);
      throw new Error('Failed to calculate optimal shipping option');
    }
  }

  private calculateScore(
    carrier: { quote: any; prediction: DeliveryPrediction; reliability: number },
    priorities: ShippingPriorities
  ): number {
    // Normalize cost (lower is better)
    const normalizedCost = 1 - (carrier.quote.cost / 1000); // Assuming max cost of 1000

    // Normalize delivery time (lower is better)
    const deliveryDays = parseInt(carrier.prediction.estimatedTime);
    const normalizedTime = 1 - (deliveryDays / 10); // Assuming max 10 days

    // Calculate weighted score
    return (
      normalizedCost * priorities.cost +
      normalizedTime * priorities.speed +
      carrier.reliability * priorities.reliability
    );
  }

  async predictDeliveryTime(
    carrier: string,
    route: Route,
    historical_data: DeliveryHistory[]
  ): Promise<DeliveryPrediction> {
    try {
      const prediction = await this.deliveryPredictor.predict({
        carrier,
        origin: route.origin,
        destination: route.destination,
        historicalData: historical_data
      });

      return {
        estimatedDeliveryTime: prediction.estimatedTime,
        confidence: prediction.confidence
      };
    } catch (error) {
      console.error('Error predicting delivery time:', error);
      throw new Error('Failed to predict delivery time');
    }
  }

  async handleInternationalShipping(
    shipment: InternationalShipment
  ): Promise<CustomsDocumentation> {
    try {
      // Check for shipping restrictions
      const restrictions = await this.customsService.checkRestrictions(
        shipment.origin,
        shipment.destination,
        shipment.packageDetails
      );

      // Calculate duties
      const duties = await this.customsService.calculateDuties(
        shipment.origin,
        shipment.destination,
        shipment.customsValue
      );

      // Generate required documentation
      const documentation = await this.customsService.generateDocumentation(
        shipment.origin,
        shipment.destination,
        shipment.packageDetails,
        shipment.customsValue
      );

      return {
        documents: documentation.documents,
        duties: duties.amount,
        restrictions: restrictions.restrictions
      };
    } catch (error) {
      console.error('Error handling international shipping:', error);
      throw new Error('Failed to process international shipment');
    }
  }
} 