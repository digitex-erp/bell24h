import fetch from 'node-fetch';
import { Rfq, Quote } from '../../shared/schema';

// Environment variables for logistics service API keys
const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY;
const EASYPOST_API_KEY = process.env.EASYPOST_API_KEY;
const FEDEX_API_KEY = process.env.FEDEX_API_KEY;
const FEDEX_API_SECRET = process.env.FEDEX_API_SECRET;
const UPS_API_KEY = process.env.UPS_API_KEY;
const UPS_API_SECRET = process.env.UPS_API_SECRET;

// Logistics service endpoints
const SHIPPO_API_URL = 'https://api.goshippo.com/v1';
const EASYPOST_API_URL = 'https://api.easypost.com/v2';
const FEDEX_API_URL = 'https://apis.fedex.com';
const UPS_API_URL = 'https://onlinetools.ups.com/api';

// Types for logistics services
export interface Address {
  name: string;
  company?: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  email?: string;
}

export interface Parcel {
  length: number;
  width: number;
  height: number;
  weight: number;
  distance_unit: 'cm' | 'in'; 
  mass_unit: 'g' | 'oz' | 'lb' | 'kg';
}

export interface ShippingRate {
  service: string;
  carrier: string;
  rate: number;
  currency: string;
  delivery_days: number;
  delivery_date?: string;
  trackable: boolean;
}

export interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
  status: string;
  eta?: string;
  lastUpdate?: string;
  location?: string;
  trackingUrl?: string;
  trackingEvents?: TrackingEvent[];
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  location?: string;
  description?: string;
}

export interface ShipmentCreationResult {
  shipmentId: string;
  trackingNumber?: string;
  carrier: string;
  service: string;
  shippingLabel: {
    url: string;
    fileType: string;
  };
  trackingUrl?: string;
  estimatedDelivery?: string;
  cost: {
    amount: number;
    currency: string;
  };
}

/**
 * Create a shipment using Shippo API
 */
export async function createShippoShipment(
  fromAddress: Address,
  toAddress: Address,
  parcel: Parcel,
  carrierAccount?: string
): Promise<ShipmentCreationResult | null> {
  if (!SHIPPO_API_KEY) {
    console.error('SHIPPO_API_KEY not found in environment variables');
    return null;
  }

  try {
    // Create the shipment
    const shipmentResponse = await fetch(`${SHIPPO_API_URL}/shipments`, {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address_from: fromAddress,
        address_to: toAddress,
        parcels: [parcel],
        async: false
      })
    });

    const shipment = await shipmentResponse.json();
    
    if (!shipment || !shipment.rates || shipment.rates.length === 0) {
      console.error('No shipping rates returned from Shippo API', shipment);
      return null;
    }

    // Select the first rate if no carrier account specified, or find matching carrier
    let selectedRate = shipment.rates[0];
    if (carrierAccount) {
      const matchingRate = shipment.rates.find((rate: any) => rate.carrier_account === carrierAccount);
      if (matchingRate) {
        selectedRate = matchingRate;
      }
    }

    // Create a shipping label
    const transactionResponse = await fetch(`${SHIPPO_API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        rate: selectedRate.object_id,
        label_file_type: 'PDF',
        async: false
      })
    });

    const transaction = await transactionResponse.json();
    
    if (!transaction || transaction.status !== 'SUCCESS') {
      console.error('Failed to create shipping label', transaction);
      return null;
    }

    return {
      shipmentId: shipment.object_id,
      trackingNumber: transaction.tracking_number,
      carrier: selectedRate.provider,
      service: selectedRate.servicelevel.name,
      shippingLabel: {
        url: transaction.label_url,
        fileType: 'PDF'
      },
      trackingUrl: transaction.tracking_url_provider,
      estimatedDelivery: selectedRate.estimated_days ? 
        new Date(Date.now() + selectedRate.estimated_days * 24 * 60 * 60 * 1000).toISOString() : 
        undefined,
      cost: {
        amount: parseFloat(selectedRate.amount),
        currency: selectedRate.currency
      }
    };
  } catch (error) {
    console.error('Error creating Shippo shipment:', error);
    return null;
  }
}

/**
 * Get shipping rates from Shippo API
 */
export async function getShippingRates(
  fromAddress: Address,
  toAddress: Address,
  parcel: Parcel
): Promise<ShippingRate[]> {
  if (!SHIPPO_API_KEY) {
    console.error('SHIPPO_API_KEY not found in environment variables');
    return [];
  }

  try {
    const response = await fetch(`${SHIPPO_API_URL}/shipments`, {
      method: 'POST',
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address_from: fromAddress,
        address_to: toAddress,
        parcels: [parcel],
        async: false
      })
    });

    const data = await response.json();
    
    if (!data || !data.rates || data.rates.length === 0) {
      console.error('No shipping rates returned from Shippo API');
      return [];
    }

    // Transform the response to our ShippingRate format
    return data.rates.map((rate: any) => ({
      service: rate.servicelevel.name,
      carrier: rate.provider,
      rate: parseFloat(rate.amount),
      currency: rate.currency,
      delivery_days: rate.estimated_days || 0,
      delivery_date: rate.estimated_days ? 
        new Date(Date.now() + rate.estimated_days * 24 * 60 * 60 * 1000).toISOString() : 
        undefined,
      trackable: !!rate.attributes.find((attr: string) => attr === 'TRACKING'),
    }));
  } catch (error) {
    console.error('Error getting shipping rates from Shippo:', error);
    return [];
  }
}

/**
 * Track a shipment using Shippo API
 */
export async function trackShipment(trackingNumber: string, carrier: string): Promise<TrackingInfo | null> {
  if (!SHIPPO_API_KEY) {
    console.error('SHIPPO_API_KEY not found in environment variables');
    return null;
  }

  try {
    const response = await fetch(`${SHIPPO_API_URL}/tracks/${carrier}/${trackingNumber}`, {
      method: 'GET',
      headers: {
        'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!data || data.tracking_status === null) {
      console.error('No tracking info returned from Shippo API');
      return null;
    }

    // Transform the response to our TrackingInfo format
    return {
      carrier: data.carrier,
      trackingNumber: data.tracking_number,
      status: data.tracking_status.status,
      eta: data.eta || undefined,
      lastUpdate: data.tracking_status.status_date,
      location: data.tracking_status.location?.city || undefined,
      trackingUrl: data.tracking_url,
      trackingEvents: data.tracking_history.map((event: any) => ({
        timestamp: event.status_date,
        status: event.status,
        location: event.location?.city || undefined,
        description: event.status_details || undefined
      }))
    };
  } catch (error) {
    console.error('Error tracking shipment with Shippo:', error);
    return null;
  }
}

/**
 * Get shipping rates from multiple carriers (Shippo, FedEx, UPS)
 * Falls back to available carriers if some are not configured
 */
export async function getAllShippingRates(
  fromAddress: Address,
  toAddress: Address,
  parcel: Parcel
): Promise<ShippingRate[]> {
  const allRates: ShippingRate[] = [];
  
  // Try Shippo first (aggregates multiple carriers)
  const shippoRates = await getShippingRates(fromAddress, toAddress, parcel);
  allRates.push(...shippoRates);

  // If FedEx is configured, try getting rates directly
  if (FEDEX_API_KEY && FEDEX_API_SECRET) {
    try {
      // First get an auth token
      const tokenResponse = await fetch(`${FEDEX_API_URL}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `grant_type=client_credentials&client_id=${FEDEX_API_KEY}&client_secret=${FEDEX_API_SECRET}`
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.access_token) {
        // Now get rates
        const ratesResponse = await fetch(`${FEDEX_API_URL}/rate/v1/rates/quotes`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            accountNumber: {
              value: "Your FedEx Account Number" // Would normally be stored in env vars
            },
            requestedShipment: {
              shipper: {
                address: {
                  streetLines: [fromAddress.street1],
                  city: fromAddress.city,
                  stateOrProvinceCode: fromAddress.state,
                  postalCode: fromAddress.zip,
                  countryCode: fromAddress.country
                }
              },
              recipient: {
                address: {
                  streetLines: [toAddress.street1],
                  city: toAddress.city,
                  stateOrProvinceCode: toAddress.state,
                  postalCode: toAddress.zip,
                  countryCode: toAddress.country
                }
              },
              packagingType: "YOUR_PACKAGING",
              rateRequestType: ["LIST", "ACCOUNT"],
              requestedPackageLineItems: [{
                weight: {
                  units: parcel.mass_unit === 'kg' ? 'KG' : 'LB',
                  value: parcel.weight
                },
                dimensions: {
                  length: parcel.length,
                  width: parcel.width,
                  height: parcel.height,
                  units: parcel.distance_unit === 'cm' ? 'CM' : 'IN'
                }
              }]
            }
          })
        });

        const ratesData = await ratesResponse.json();
        
        if (ratesData.output && ratesData.output.rateReplyDetails) {
          // Transform FedEx rates to our format
          const fedexRates = ratesData.output.rateReplyDetails.map((rate: any) => ({
            service: rate.serviceName,
            carrier: 'FEDEX',
            rate: rate.ratedShipmentDetails[0].totalNetFedExCharge,
            currency: rate.ratedShipmentDetails[0].currency,
            delivery_days: rate.transitTime ? parseInt(rate.transitTime.replace(/[^0-9]/g, '')) : 0,
            delivery_date: rate.deliveryDate,
            trackable: true
          }));
          allRates.push(...fedexRates);
        }
      }
    } catch (error) {
      console.error('Error getting FedEx rates:', error);
      // Continue with other carriers
    }
  }

  // If UPS is configured, try getting rates directly
  if (UPS_API_KEY && UPS_API_SECRET) {
    try {
      // First get an auth token
      const tokenResponse = await fetch(`${UPS_API_URL}/security/v1/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-merchant-id': 'YOUR_UPS_MERCHANT_ID' // Would normally be stored in env vars
        },
        body: `grant_type=client_credentials&client_id=${UPS_API_KEY}&client_secret=${UPS_API_SECRET}`
      });

      const tokenData = await tokenResponse.json();
      
      if (tokenData.access_token) {
        // Now get rates
        const ratesResponse = await fetch(`${UPS_API_URL}/rating/v1/Shop`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            RateRequest: {
              Request: {
                RequestOption: "Shop",
                TransactionReference: {
                  CustomerContext: "Rating and Service"
                }
              },
              Shipment: {
                Shipper: {
                  Name: fromAddress.name,
                  ShipperNumber: "Your UPS Account Number", // Would normally be stored in env vars
                  Address: {
                    AddressLine: [fromAddress.street1],
                    City: fromAddress.city,
                    StateProvinceCode: fromAddress.state,
                    PostalCode: fromAddress.zip,
                    CountryCode: fromAddress.country
                  }
                },
                ShipTo: {
                  Name: toAddress.name,
                  Address: {
                    AddressLine: [toAddress.street1],
                    City: toAddress.city,
                    StateProvinceCode: toAddress.state,
                    PostalCode: toAddress.zip,
                    CountryCode: toAddress.country
                  }
                },
                Package: {
                  PackagingType: {
                    Code: "02",
                    Description: "Package"
                  },
                  Dimensions: {
                    UnitOfMeasurement: {
                      Code: parcel.distance_unit === 'cm' ? 'CM' : 'IN'
                    },
                    Length: parcel.length.toString(),
                    Width: parcel.width.toString(),
                    Height: parcel.height.toString()
                  },
                  PackageWeight: {
                    UnitOfMeasurement: {
                      Code: parcel.mass_unit === 'kg' ? 'KGS' : (parcel.mass_unit === 'lb' ? 'LBS' : 'OZS')
                    },
                    Weight: parcel.weight.toString()
                  }
                }
              }
            }
          })
        });

        const ratesData = await ratesResponse.json();
        
        if (ratesData.RateResponse && ratesData.RateResponse.RatedShipment) {
          // Transform UPS rates to our format
          const upsRates = ratesData.RateResponse.RatedShipment.map((rate: any) => ({
            service: rate.Service.Description,
            carrier: 'UPS',
            rate: parseFloat(rate.TotalCharges.MonetaryValue),
            currency: rate.TotalCharges.CurrencyCode,
            delivery_days: rate.GuaranteedDelivery ? parseInt(rate.GuaranteedDelivery.BusinessDaysInTransit) : 0,
            delivery_date: rate.GuaranteedDelivery ? rate.GuaranteedDelivery.DeliveryByTime : undefined,
            trackable: true
          }));
          allRates.push(...upsRates);
        }
      }
    } catch (error) {
      console.error('Error getting UPS rates:', error);
      // Continue with other carriers
    }
  }

  // Sort by rate (lowest first)
  return allRates.sort((a, b) => a.rate - b.rate);
}

/**
 * Estimate shipping dimensions and weight for an RFQ
 * This is a simple estimation - would be refined with real product data
 */
export function estimateParcelFromRfq(rfq: Rfq): Parcel {
  // Default dimensions based on industry
  const defaultDimensions: Record<string, { length: number, width: number, height: number, weight: number }> = {
    'manufacturing': { length: 30, width: 20, height: 15, weight: 5 },
    'electronics': { length: 25, width: 20, height: 10, weight: 2 },
    'chemicals': { length: 30, width: 25, height: 25, weight: 10 },
    'automotive': { length: 40, width: 30, height: 20, weight: 15 },
    'textiles': { length: 35, width: 25, height: 10, weight: 3 }
  };

  // Get default dimensions for the RFQ's industry or use manufacturing as fallback
  const dimensions = defaultDimensions[rfq.industry] || defaultDimensions['manufacturing'];
  
  // Scale by quantity - this is very simplified
  const quantity = rfq.quantity || 1;
  const scaleFactor = Math.max(1, Math.log10(quantity) * 1.5); // Logarithmic scaling
  
  return {
    length: Math.round(dimensions.length * scaleFactor),
    width: Math.round(dimensions.width),
    height: Math.round(dimensions.height),
    weight: Math.round(dimensions.weight * scaleFactor),
    distance_unit: 'cm',
    mass_unit: 'kg'
  };
}

/**
 * Calculate shipping estimates for an RFQ
 */
export async function getShippingEstimatesForRfq(
  rfq: Rfq,
  fromAddress: Address,
  toAddress: Address
): Promise<ShippingRate[]> {
  // Estimate parcel dimensions based on RFQ
  const parcel = estimateParcelFromRfq(rfq);
  
  // Get shipping rates from multiple carriers
  return await getAllShippingRates(fromAddress, toAddress, parcel);
}

/**
 * Calculate shipping estimates for a quote
 */
export async function getShippingEstimatesForQuote(
  quote: Quote,
  rfq: Rfq,
  fromAddress: Address,
  toAddress: Address
): Promise<ShippingRate[]> {
  // Estimate parcel dimensions based on RFQ
  const parcel = estimateParcelFromRfq(rfq);
  
  // Get shipping rates from multiple carriers
  return await getAllShippingRates(fromAddress, toAddress, parcel);
}

/**
 * Convert address from our format to logistics provider format
 */
export function formatAddressForLogistics(
  name: string,
  company: string,
  street1: string,
  street2: string | undefined,
  city: string,
  state: string,
  zipCode: string,
  country: string,
  phone: string | undefined,
  email: string | undefined
): Address {
  return {
    name,
    company,
    street1,
    street2,
    city,
    state,
    zip: zipCode,
    country,
    phone,
    email
  };
}