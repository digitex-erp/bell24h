/**
 * Google Maps Service
 * 
 * This service provides methods for interacting with the Google Maps API,
 * including geocoding, distance calculation, and location autocomplete.
 */

import axios from 'axios';

export interface GeocodingResult {
  lat: number;
  lng: number;
  formattedAddress: string;
  placeId: string;
}

export interface DistanceResult {
  distance: {
    text: string;
    value: number; // in meters
  };
  duration: {
    text: string;
    value: number; // in seconds
  };
  status: string;
}

export interface PlacePrediction {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
}

class MapsService {
  private apiKey: string;
  private baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor() {
    this.apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
    
    if (!this.apiKey) {
      console.warn('Google Maps API key is not set. Maps functionality will be limited.');
    }
  }

  /**
   * Geocode an address to get its coordinates
   * @param address The address to geocode
   * @returns Promise with geocoding result
   */
  async geocodeAddress(address: string): Promise<GeocodingResult> {
    try {
      const response = await axios.get(`${this.baseUrl}/geocode/json`, {
        params: {
          address,
          key: this.apiKey
        }
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Geocoding failed: ${response.data.status}`);
      }

      const result = response.data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formattedAddress: result.formatted_address,
        placeId: result.place_id
      };
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw error;
    }
  }

  /**
   * Calculate distance between two addresses
   * @param origin Starting address
   * @param destination Ending address
   * @returns Promise with distance and duration
   */
  async calculateDistance(origin: string, destination: string): Promise<DistanceResult> {
    try {
      const response = await axios.get(`${this.baseUrl}/distancematrix/json`, {
        params: {
          origins: origin,
          destinations: destination,
          key: this.apiKey
        }
      });

      if (response.data.status !== 'OK') {
        throw new Error(`Distance calculation failed: ${response.data.status}`);
      }

      const result = response.data.rows[0].elements[0];
      return {
        distance: result.distance,
        duration: result.duration,
        status: result.status
      };
    } catch (error) {
      console.error('Error calculating distance:', error);
      throw error;
    }
  }

  /**
   * Get place predictions for autocomplete
   * @param input User input for place search
   * @param countryRestrictions Optional array of country codes to restrict results
   * @returns Promise with place predictions
   */
  async getPlacePredictions(
    input: string, 
    countryRestrictions?: string[]
  ): Promise<PlacePrediction[]> {
    try {
      const params: any = {
        input,
        key: this.apiKey,
        types: 'address'
      };

      if (countryRestrictions && countryRestrictions.length > 0) {
        params.components = `country:${countryRestrictions.join('|')}`;
      }

      const response = await axios.get(`${this.baseUrl}/place/autocomplete/json`, {
        params
      });

      if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        throw new Error(`Place autocomplete failed: ${response.data.status}`);
      }

      return (response.data.predictions || []).map((prediction: any) => ({
        description: prediction.description,
        placeId: prediction.place_id,
        mainText: prediction.structured_formatting.main_text,
        secondaryText: prediction.structured_formatting.secondary_text
      }));
    } catch (error) {
      console.error('Error getting place predictions:', error);
      throw error;
    }
  }

  /**
   * Get static map URL for a location
   * @param center Center coordinates or address
   * @param zoom Zoom level (1-20)
   * @param width Map width in pixels
   * @param height Map height in pixels
   * @param markers Optional array of marker positions
   * @returns URL for static map image
   */
  getStaticMapUrl(
    center: string,
    zoom: number = 13,
    width: number = 600,
    height: number = 300,
    markers?: string[]
  ): string {
    let url = `${this.baseUrl}/staticmap?center=${encodeURIComponent(center)}&zoom=${zoom}&size=${width}x${height}&key=${this.apiKey}`;
    
    if (markers && markers.length > 0) {
      markers.forEach(marker => {
        url += `&markers=${encodeURIComponent(marker)}`;
      });
    }
    
    return url;
  }
}

export const mapsService = new MapsService();
export default mapsService;
