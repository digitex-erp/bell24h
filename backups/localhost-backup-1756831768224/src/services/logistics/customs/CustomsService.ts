import axios from 'axios';
import { Location, PackageInfo } from '../ShippingOptimizer';

export class CustomsService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.CUSTOMS_API_KEY || '';
    this.baseUrl = 'https://api.customs.com/v1';
  }

  async checkRestrictions(
    originCountry: string,
    destinationCountry: string,
    packageDetails: PackageInfo
  ): Promise<string[]> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/restrictions/check`,
        {
          originCountry,
          destinationCountry,
          packageDetails: {
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

      return response.data.restrictions || [];
    } catch (error) {
      console.error('Customs API Error:', error);
      throw new Error('Failed to check shipping restrictions');
    }
  }

  async calculateDuties(
    originCountry: string,
    destinationCountry: string,
    customsValue: number
  ): Promise<number> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/duties/calculate`,
        {
          originCountry,
          destinationCountry,
          customsValue
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.duties || 0;
    } catch (error) {
      console.error('Customs API Error:', error);
      throw new Error('Failed to calculate duties');
    }
  }

  async generateDocumentation(
    origin: Location,
    destination: Location,
    packageDetails: PackageInfo,
    customsValue: number
  ): Promise<string[]> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/documentation/generate`,
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
          packageDetails: {
            weight: packageDetails.weight,
            dimensions: packageDetails.dimensions,
            fragile: packageDetails.fragile
          },
          customsValue
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.documents || [];
    } catch (error) {
      console.error('Customs API Error:', error);
      throw new Error('Failed to generate customs documentation');
    }
  }
} 