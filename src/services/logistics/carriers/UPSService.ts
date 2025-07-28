import axios from 'axios';
import { Location, PackageInfo } from '../ShippingOptimizer';

export class UPSService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.UPS_API_KEY || '';
    this.baseUrl = 'https://onlinetools.ups.com/api/shipments/v1';
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
          RateRequest: {
            Shipment: {
              Shipper: {
                Address: {
                  AddressLine: origin.address,
                  City: origin.city,
                  StateProvinceCode: origin.country,
                  PostalCode: origin.postalCode,
                  CountryCode: origin.country
                }
              },
              ShipTo: {
                Address: {
                  AddressLine: destination.address,
                  City: destination.city,
                  StateProvinceCode: destination.country,
                  PostalCode: destination.postalCode,
                  CountryCode: destination.country
                }
              },
              ShipFrom: {
                Address: {
                  AddressLine: origin.address,
                  City: origin.city,
                  StateProvinceCode: origin.country,
                  PostalCode: origin.postalCode,
                  CountryCode: origin.country
                }
              },
              Package: {
                PackagingType: {
                  Code: '02',
                  Description: 'Customer Supplied Package'
                },
                Dimensions: {
                  UnitOfMeasurement: {
                    Code: 'CM',
                    Description: 'Centimeters'
                  },
                  Length: packageDetails.dimensions.length,
                  Width: packageDetails.dimensions.width,
                  Height: packageDetails.dimensions.height
                },
                PackageWeight: {
                  UnitOfMeasurement: {
                    Code: 'KGS',
                    Description: 'Kilograms'
                  },
                  Weight: packageDetails.weight
                }
              }
            }
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const rate = response.data.RateResponse.RatedShipment[0];
      return {
        cost: rate.TotalCharges.MonetaryValue,
        estimatedDeliveryTime: rate.GuaranteedDaysToDelivery || '3-5 days',
        reliability: this.calculateReliability(rate)
      };
    } catch (error) {
      console.error('UPS API Error:', error);
      throw new Error('Failed to get UPS shipping quote');
    }
  }

  private calculateReliability(rate: any): number {
    // Calculate reliability based on service type and historical data
    const serviceType = rate.Service.Code;
    const reliabilityMap: { [key: string]: number } = {
      '01': 0.99, // Next Day Air
      '02': 0.98, // 2nd Day Air
      '03': 0.97, // Ground
      '12': 0.96  // 3 Day Select
    };
    return reliabilityMap[serviceType] || 0.90;
  }
} 