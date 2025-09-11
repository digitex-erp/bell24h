import axios from 'axios';
import { Location, PackageInfo } from '../ShippingOptimizer';

export class DHLService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.DHL_API_KEY || '';
    this.baseUrl = 'https://api.dhl.com/v1';
  }

  async getQuote(
    origin: Location,
    destination: Location,
    packageDetails: PackageInfo
  ) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/shipping/quote`,
        {
          origin: {
            address: origin.address,
            city: origin.city,
            country: origin.country,
            postalCode: origin.postalCode
          },
          destination: {
            address: destination.address,
            city: destination.city,
            country: destination.country,
            postalCode: destination.postalCode
          },
          package: {
            weight: packageDetails.weight,
            dimensions: packageDetails.dimensions,
            fragile: packageDetails.fragile
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        cost: response.data.cost,
        estimatedDeliveryTime: response.data.estimatedDeliveryTime,
        reliability: response.data.reliability
      };
    } catch (error) {
      console.error('DHL API Error:', error);
      throw new Error('Failed to get DHL shipping quote');
    }
  }
} 