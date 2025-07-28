import axios from 'axios';

export interface Location {
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface RoutePoint {
  location: Location;
  arrivalTime?: string;
  departureTime?: string;
  waitTime?: number;
  distanceFromPrevious?: number;
  durationFromPrevious?: number;
}

export interface OptimizedRoute {
  totalDistance: number;
  totalDuration: number;
  fuelConsumption: number;
  co2Emission: number;
  points: RoutePoint[];
  polyline: string;
}

// --- Google Maps API Interfaces ---
interface GoogleMapsLatLng {
  lat: number;
  lng: number;
}

interface GoogleMapsDistance {
  text: string;
  value: number; // in meters
}

interface GoogleMapsDuration {
  text: string;
  value: number; // in seconds
}

interface GoogleMapsStep {
  distance: GoogleMapsDistance;
  duration: GoogleMapsDuration;
  end_location: GoogleMapsLatLng;
  html_instructions: string;
  polyline: {
    points: string;
  };
  start_location: GoogleMapsLatLng;
  travel_mode: string;
  maneuver?: string;
}

interface GoogleMapsLeg {
  distance: GoogleMapsDistance;
  duration: GoogleMapsDuration;
  duration_in_traffic?: GoogleMapsDuration;
  end_address: string;
  end_location: GoogleMapsLatLng;
  start_address: string;
  start_location: GoogleMapsLatLng;
  steps: GoogleMapsStep[];
  traffic_speed_entry: any[]; // Consider defining a more specific type if known
  via_waypoint: any[]; // Consider defining a more specific type if known
}

interface GoogleMapsRoute {
  bounds: {
    northeast: GoogleMapsLatLng;
    southwest: GoogleMapsLatLng;
  };
  copyrights: string;
  legs: GoogleMapsLeg[];
  overview_polyline: {
    points: string;
  };
  summary: string;
  warnings: string[];
  waypoint_order: number[];
}

interface GoogleMapsDirectionsResponse {
  geocoded_waypoints: any[]; // Consider defining a more specific type if known
  routes: GoogleMapsRoute[];
  status: string;
  error_message?: string;
}
// --- End Google Maps API Interfaces ---

export interface RouteOptimizationOptions {
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  optimizeFor?: 'distance' | 'time' | 'fuel';
  departureTime?: string;
  vehicleType?: 'car' | 'truck' | 'van';
  trafficModel?: 'best_guess' | 'pessimistic' | 'optimistic';
}

export class RouteOptimizationService {
  private googleMapsApiKey: string;

  constructor() {
    // Get API key from environment variables
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key is required for route optimization');
    }
    this.googleMapsApiKey = apiKey;
  }

  /**
   * Geocode an address to get coordinates
   */
  private async geocodeAddress(location: Location): Promise<{ lat: number; lng: number }> {
    // Format the address for the geocoding API
    const formattedAddress = `${location.address}, ${location.city}, ${location.state || ''}, ${location.postalCode}, ${location.country}`;
    
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: formattedAddress,
          key: this.googleMapsApiKey,
        },
      });
      
      if (response.data.status !== 'OK' || !response.data.results?.length) {
        throw new Error(`Geocoding failed: ${response.data.status}`);
      }
      
      return response.data.results[0].geometry.location;
    } catch (error) {
      console.error('Error geocoding address:', error);
      throw new Error('Failed to geocode address');
    }
  }

  /**
   * Get optimal route between two locations
   */
  public async getOptimalRoute(
    origin: Location,
    destination: Location,
    options: RouteOptimizationOptions = {}
  ): Promise<OptimizedRoute> {
    try {
      // First geocode the addresses if coordinates are not provided
      const originCoordinates = origin.coordinates || await this.geocodeAddress(origin);
      const destinationCoordinates = destination.coordinates || await this.geocodeAddress(destination);
      
      // Build the request parameters
      const params: any = {
        origin: `${'lat' in originCoordinates ? originCoordinates.lat : originCoordinates.latitude},${'lng' in originCoordinates ? originCoordinates.lng : originCoordinates.longitude}`,
        destination: `${'lat' in destinationCoordinates ? destinationCoordinates.lat : destinationCoordinates.latitude},${'lng' in destinationCoordinates ? destinationCoordinates.lng : destinationCoordinates.longitude}`,
        key: this.googleMapsApiKey,
        mode: options.vehicleType === 'truck' ? 'driving' : 'driving',
        departure_time: options.departureTime ? new Date(options.departureTime).getTime() / 1000 : 'now',
        traffic_model: options.trafficModel || 'best_guess',
        alternatives: true,
      };
      
      // Add avoidance parameters if specified
      if (options.avoidTolls || options.avoidHighways) {
        params.avoid = [];
        if (options.avoidTolls) params.avoid.push('tolls');
        if (options.avoidHighways) params.avoid.push('highways');
        params.avoid = params.avoid.join('|');
      }
      
      // Get directions from Google Maps API
      const response = await axios.get<GoogleMapsDirectionsResponse>('https://maps.googleapis.com/maps/api/directions/json', {
        params,
      });
      
      if (response.data.status !== 'OK' || !response.data.routes?.length) {
        throw new Error(`Directions request failed: ${response.data.status}`);
      }
      
      // Find the best route based on optimization criteria
      const routes: GoogleMapsRoute[] = response.data.routes;
      let bestRoute: GoogleMapsRoute = routes[0];
      
      if (options.optimizeFor === 'distance') {
        bestRoute = routes.reduce((prev, current) => {
          const prevDistance = prev.legs.reduce((sum: number, leg: GoogleMapsLeg) => sum + leg.distance.value, 0);
          const currentDistance = current.legs.reduce((sum: number, leg: GoogleMapsLeg) => sum + leg.distance.value, 0);
          return prevDistance < currentDistance ? prev : current;
        }, routes[0]);
      } else if (options.optimizeFor === 'time') {
        bestRoute = routes.reduce((prev, current) => {
          const prevDuration = prev.legs.reduce((sum: number, leg: GoogleMapsLeg) => sum + (leg.duration_in_traffic?.value || leg.duration.value), 0);
          const currentDuration = current.legs.reduce((sum: number, leg: GoogleMapsLeg) => sum + (leg.duration_in_traffic?.value || leg.duration.value), 0);
          return prevDuration < currentDuration ? prev : current;
        }, routes[0]);
      }
      
      // Calculate total distance and duration
      const totalDistance = bestRoute.legs.reduce((sum: number, leg: GoogleMapsLeg) => sum + leg.distance.value, 0) / 1000; // Convert to km
      const totalDuration = bestRoute.legs.reduce((sum: number, leg: GoogleMapsLeg) => sum + (leg.duration_in_traffic?.value || leg.duration.value), 0) / 60; // Convert to minutes
      
      // Estimate fuel consumption and CO2 emissions (simplified model)
      // Average fuel consumption: 8 liters per 100 km
      // Average CO2 emission: 2.3 kg per liter of fuel
      const fuelConsumption = (totalDistance / 100) * 8; // liters
      const co2Emission = fuelConsumption * 2.3; // kg
      
      // Build route points
      const points: RoutePoint[] = [];
      
      // Add origin point
      points.push({
        location: origin,
        departureTime: options.departureTime || new Date().toISOString(),
      });
      
      // Process each step in the route
      let currentTime = options.departureTime ? new Date(options.departureTime) : new Date();
      let cumulativeDistance = 0;
      
      bestRoute.legs.forEach((leg: GoogleMapsLeg) => {
        leg.steps.forEach((step: GoogleMapsStep) => {
          // Update the cumulative time and distance
          const stepDurationMs = (step.duration.value) * 1000;
          currentTime = new Date(currentTime.getTime() + stepDurationMs);
          cumulativeDistance += step.distance.value;
          
          // Skip intermediate points to keep the response size manageable
          // Only include significant waypoints
          if (step.distance.value > 500) { // Only include points that are more than 500 meters apart
            points.push({
              location: {
                address: step.end_location.lat.toString() + ',' + step.end_location.lng.toString(),
                city: '',
                country: '',
                postalCode: '',
                coordinates: {
                  latitude: step.end_location.lat,
                  longitude: step.end_location.lng
                }
              },
              arrivalTime: currentTime.toISOString(),
              distanceFromPrevious: step.distance.value / 1000, // km
              durationFromPrevious: step.duration.value / 60, // minutes
            });
          }
        });
      });
      
      // Add destination point
      points.push({
        location: destination,
        arrivalTime: currentTime.toISOString(),
        distanceFromPrevious: 0,
        durationFromPrevious: 0,
      });
      
      return {
        totalDistance,
        totalDuration,
        fuelConsumption,
        co2Emission,
        points,
        polyline: bestRoute.overview_polyline.points,
      };
    } catch (error) {
      console.error('Error getting optimal route:', error);
      throw new Error('Failed to calculate optimal route');
    }
  }

  /**
   * Get multiple route options between two locations
   */
  public async getRouteAlternatives(
    origin: Location,
    destination: Location,
    options: RouteOptimizationOptions = {}
  ): Promise<OptimizedRoute[]> {
    try {
      // First geocode the addresses if coordinates are not provided
      const originCoordinates = origin.coordinates || await this.geocodeAddress(origin);
      const destinationCoordinates = destination.coordinates || await this.geocodeAddress(destination);
      
      // Build the request parameters
      const params: any = {
        origin: `${'lat' in originCoordinates ? originCoordinates.lat : originCoordinates.latitude},${'lng' in originCoordinates ? originCoordinates.lng : originCoordinates.longitude}`,
        destination: `${'lat' in destinationCoordinates ? destinationCoordinates.lat : destinationCoordinates.latitude},${'lng' in destinationCoordinates ? destinationCoordinates.lng : destinationCoordinates.longitude}`,
        key: this.googleMapsApiKey,
        mode: options.vehicleType === 'truck' ? 'driving' : 'driving',
        departure_time: options.departureTime ? new Date(options.departureTime).getTime() / 1000 : 'now',
        traffic_model: options.trafficModel || 'best_guess',
        alternatives: true,
      };
      
      // Add avoidance parameters if specified
      if (options.avoidTolls || options.avoidHighways) {
        params.avoid = [];
        if (options.avoidTolls) params.avoid.push('tolls');
        if (options.avoidHighways) params.avoid.push('highways');
        params.avoid = params.avoid.join('|');
      }
      
      // Get directions from Google Maps API
      const response = await axios.get<GoogleMapsDirectionsResponse>('https://maps.googleapis.com/maps/api/directions/json', {
        params,
      });
      
      if (response.data.status !== 'OK' || !response.data.routes?.length) {
        throw new Error(`Directions request failed: ${response.data.status}`);
      }
      
      // Process all routes
      return response.data.routes.map((route: GoogleMapsRoute) => {
        // Calculate total distance and duration
        const totalDistance = route.legs.reduce((sum: number, leg: GoogleMapsLeg) => sum + leg.distance.value, 0) / 1000; // Convert to km
        const totalDuration = route.legs.reduce((sum: number, leg: GoogleMapsLeg) => sum + (leg.duration_in_traffic?.value || leg.duration.value), 0) / 60; // Convert to minutes
        
        // Estimate fuel consumption and CO2 emissions
        const fuelConsumption = (totalDistance / 100) * 8;
        const co2Emission = fuelConsumption * 2.3;
        
        // Build route points (simplified for alternatives)
        const points: RoutePoint[] = [
          {
            location: origin,
            departureTime: options.departureTime || new Date().toISOString(),
          },
          {
            location: destination,
            arrivalTime: new Date(
              (options.departureTime ? new Date(options.departureTime).getTime() : new Date().getTime()) +
              totalDuration * 60 * 1000
            ).toISOString(),
            distanceFromPrevious: totalDistance,
            durationFromPrevious: totalDuration,
          }
        ];
        
        return {
          totalDistance,
          totalDuration,
          fuelConsumption,
          co2Emission,
          points,
          polyline: route.overview_polyline.points,
        };
      });
    } catch (error) {
      console.error('Error getting route alternatives:', error);
      throw new Error('Failed to calculate route alternatives');
    }
  }

  /**
   * Estimate ETA for a shipment
   */
  public async estimateETA(
    origin: Location,
    destination: Location,
    departureTime?: string,
    trafficModel: 'best_guess' | 'pessimistic' | 'optimistic' = 'best_guess'
  ): Promise<{
    eta: string;
    duration: number; // in minutes
    durationInTraffic: number; // in minutes
    distance: number; // in km
  }> {
    try {
      const route = await this.getOptimalRoute(origin, destination, {
        departureTime,
        trafficModel,
        optimizeFor: 'time',
      });
      
      // Calculate ETA
      const departureDate = departureTime ? new Date(departureTime) : new Date();
      const etaDate = new Date(departureDate.getTime() + route.totalDuration * 60 * 1000);
      
      return {
        eta: etaDate.toISOString(),
        duration: route.totalDuration,
        durationInTraffic: route.totalDuration, // We're already using traffic info in getOptimalRoute
        distance: route.totalDistance,
      };
    } catch (error) {
      console.error('Error estimating ETA:', error);
      throw new Error('Failed to estimate ETA');
    }
  }
}
