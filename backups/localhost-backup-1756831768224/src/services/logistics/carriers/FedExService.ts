import axios from 'axios';
import { Location, PackageInfo } from '../ShippingOptimizer';

export class FedExService {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.FEDEX_API_KEY || '';
    this.secretKey = process.env.FEDEX_SECRET_KEY || '';
    this.baseUrl = 'https://apis.fedex.com/shipping/v1';
  }

  async getQuote(
    origin: Location,
    destination: Location,
    packageDetails: PackageInfo
  ) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/rates`,
        {
          accountNumber: {
            value: process.env.FEDEX_ACCOUNT_NUMBER
          },
          requestedShipment: {
            shipper: {
              address: {
                streetLines: [origin.address],
                city: origin.city,
                stateOrProvinceCode: origin.country,
                postalCode: origin.postalCode,
                countryCode: origin.country
              }
            },
            recipient: {
              address: {
                streetLines: [destination.address],
                city: destination.city,
                stateOrProvinceCode: destination.country,
                postalCode: destination.postalCode,
                countryCode: destination.country
              }
            },
            pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
            rateRequestType: ['ACCOUNT'],
            requestedPackageLineItems: [{
              weight: {
                units: 'KG',
                value: packageDetails.weight
              },
              dimensions: {
                length: packageDetails.dimensions.length,
                width: packageDetails.dimensions.width,
                height: packageDetails.dimensions.height,
                units: 'CM'
              }
            }]
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-locale': 'en_US',
            'Content-Type': 'application/json'
          }
        }
      );

      const rate = response.data.output.rateReplyDetails[0];
      return {
        cost: rate.ratedShipmentDetails[0].totalNetCharge.amount,
        estimatedDeliveryTime: rate.commitDetails[0].commitTimeStamp,
        reliability: this.calculateReliability(rate)
      };
    } catch (error) {
      console.error('FedEx API Error:', error);
      throw new Error('Failed to get FedEx shipping quote');
    }
  }

  private calculateReliability(rate: any): number {
    // Calculate reliability based on service type and historical data
    const serviceType = rate.serviceType;
    const reliabilityMap: { [key: string]: number } = {
      'PRIORITY_OVERNIGHT': 0.98,
      'FIRST_OVERNIGHT': 0.99,
      'STANDARD_OVERNIGHT': 0.97,
      'GROUND': 0.95
    };
    return reliabilityMap[serviceType] || 0.90;
  }
} 