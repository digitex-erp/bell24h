import axios from 'axios';
import { Location, DeliveryHistory } from '../ShippingOptimizer';

interface PredictionInput {
  carrier: string;
  origin: Location;
  destination: Location;
  historicalData: DeliveryHistory[];
}

interface PredictionOutput {
  estimatedTime: string;
  confidence: number;
}

export class DeliveryPredictor {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.ML_API_KEY || '';
    this.baseUrl = 'https://api.ml-service.com/v1';
  }

  async predict(input: PredictionInput): Promise<PredictionOutput> {
    try {
      // Prepare historical data for ML model
      const historicalFeatures = this.prepareHistoricalFeatures(input.historicalData);

      // Call ML service for prediction
      const response = await axios.post(
        `${this.baseUrl}/predict/delivery-time`,
        {
          carrier: input.carrier,
          origin: {
            country: input.origin.country,
            postalCode: input.origin.postalCode
          },
          destination: {
            country: input.destination.country,
            postalCode: input.destination.postalCode
          },
          historicalFeatures
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        estimatedTime: response.data.estimatedTime,
        confidence: response.data.confidence
      };
    } catch (error) {
      console.error('ML Service Error:', error);
      // Fallback to rule-based prediction if ML service fails
      return this.fallbackPrediction(input);
    }
  }

  private prepareHistoricalFeatures(historicalData: DeliveryHistory[]): any {
    // Transform historical data into features for ML model
    return historicalData.map(record => ({
      carrier: record.carrier,
      originCountry: record.route.origin.country,
      destinationCountry: record.route.destination.country,
      actualDeliveryTime: record.actualDeliveryTime
    }));
  }

  private fallbackPrediction(input: PredictionInput): PredictionOutput {
    // Simple rule-based prediction as fallback
    const baseDeliveryTimes: { [key: string]: number } = {
      'DHL': 3,
      'FedEx': 4,
      'UPS': 3
    };

    const isInternational = input.origin.country !== input.destination.country;
    const baseTime = baseDeliveryTimes[input.carrier] || 5;
    const adjustedTime = isInternational ? baseTime + 2 : baseTime;

    return {
      estimatedTime: `${adjustedTime} days`,
      confidence: 0.7 // Lower confidence for fallback predictions
    };
  }
} 