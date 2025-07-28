import React, { useEffect, useRef } from 'react';
import { Box, Spinner, Center, Text } from '@chakra-ui/react';
import { ShipmentStatus, LogisticsProvider } from '../../services/logistics/logistics-tracking-service';

// Import types from the service
interface Shipment {
  id: number;
  orderId: string;
  provider: LogisticsProvider;
  providerShipmentId: string;
  status: ShipmentStatus;
  createdAt: string;
  updatedAt: string;
  senderDetails: {
    contactName: string;
    city: string;
    country: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
  };
  receiverDetails: {
    contactName: string;
    city: string;
    country: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
  };
}

interface TrackingDetails {
  trackingNumber: string;
  trackingUrl: string;
  status: ShipmentStatus;
  estimatedDelivery: string | null;
  currentLocation: {
    name: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
    timestamp: string;
  } | null;
  trackingHistory: Array<{
    status: ShipmentStatus;
    location: {
      name: string;
      city: string;
      country: string;
      latitude?: number;
      longitude?: number;
      timestamp: string;
    };
    description: string;
  }>;
  isFinal: boolean;
}

interface OptimalRoute {
  totalDistance: string;
  estimatedDuration: string;
  co2Emissions: string;
  waypoints: Array<{
    name: string;
    city: string;
    country: string;
    latitude?: number;
    longitude?: number;
    timestamp: string;
  }>;
}

interface ShipmentTrackingMapProps {
  shipment: Shipment;
  tracking: TrackingDetails | null;
  routeData: OptimalRoute | null;
}

declare global {
  interface Window {
    google: any;
  }
}

const ShipmentTrackingMap: React.FC<ShipmentTrackingMapProps> = ({ shipment, tracking, routeData }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);

  // Function to get location coordinates (either from provided data or geocode based on address)
  const getLocationCoordinates = async (
    location: { 
      city: string; 
      country: string; 
      latitude?: number; 
      longitude?: number; 
      postalCode?: string;
    }
  ) => {
    // If we already have coordinates, use them
    if (location.latitude && location.longitude) {
      return { lat: location.latitude, lng: location.longitude };
    }
    
    // Otherwise, try to get coordinates from the Google Maps Geocoding API
    try {
      const address = `${location.city}, ${location.postalCode || ''} ${location.country}`.trim();
      const geocoder = new window.google.maps.Geocoder();
      
      return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
        geocoder.geocode({ address }, (results: any[], status: string) => {
          if (status === 'OK' && results[0]) {
            const { lat, lng } = results[0].geometry.location;
            resolve({ lat: lat(), lng: lng() });
          } else {
            reject(new Error(`Geocoding failed: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('Geocoding error:', error);
      // Return default coordinates for India as fallback
      return { lat: 20.5937, lng: 78.9629 };
    }
  };

  // Initialize map when component mounts
  useEffect(() => {
    // Load Google Maps JS API dynamically
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initMap;
      document.head.appendChild(script);
      
      return () => {
        // Safe removal of script element
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    } else {
      initMap();
    }
    
    async function initMap() {
      if (!mapRef.current || !window.google) return;
      
      try {
        // Create map instance
        googleMapRef.current = new window.google.maps.Map(mapRef.current, {
          zoom: 4,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });
        
        // Initial bounds
        const bounds = new window.google.maps.LatLngBounds();
        
        // Origin marker (sender)
        const originCoords = await getLocationCoordinates(shipment.senderDetails);
        const originMarker = new window.google.maps.Marker({
          position: originCoords,
          map: googleMapRef.current,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
            scaledSize: new window.google.maps.Size(32, 32)
          },
          label: 'O',
          title: `Origin: ${shipment.senderDetails.city}, ${shipment.senderDetails.country}`
        });
        markersRef.current.push(originMarker);
        bounds.extend(originCoords);
        
        // Destination marker (receiver)
        const destCoords = await getLocationCoordinates(shipment.receiverDetails);
        const destinationMarker = new window.google.maps.Marker({
          position: destCoords,
          map: googleMapRef.current,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(32, 32)
          },
          label: 'D',
          title: `Destination: ${shipment.receiverDetails.city}, ${shipment.receiverDetails.country}`
        });
        markersRef.current.push(destinationMarker);
        bounds.extend(destCoords);
        
        // Current position marker (if available)
        if (tracking?.currentLocation && tracking.status !== ShipmentStatus.DELIVERED) {
          try {
            const currentLocationCoords = await getLocationCoordinates({
              city: tracking.currentLocation.city,
              country: tracking.currentLocation.country,
              latitude: tracking.currentLocation.latitude,
              longitude: tracking.currentLocation.longitude
            });
            
            const currentPositionMarker = new window.google.maps.Marker({
              position: currentLocationCoords,
              map: googleMapRef.current,
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new window.google.maps.Size(36, 36)
              },
              animation: window.google.maps.Animation.BOUNCE,
              title: `Current Position: ${tracking.currentLocation.name}, ${tracking.currentLocation.city}`
            });
            markersRef.current.push(currentPositionMarker);
            bounds.extend(currentLocationCoords);
          } catch (error) {
            console.error('Error adding current position marker:', error);
          }
        }
        
        // Add route path points if available
        if (routeData?.waypoints && routeData.waypoints.length > 0) {
          const routePoints = [];
          
          for (const waypoint of routeData.waypoints) {
            try {
              const waypointCoords = await getLocationCoordinates({
                city: waypoint.city,
                country: waypoint.country,
                latitude: waypoint.latitude,
                longitude: waypoint.longitude
              });
              
              routePoints.push(waypointCoords);
              bounds.extend(waypointCoords);
              
              // Add small markers for each waypoint (except origin and destination)
              if (waypoint.name !== 'Origin' && waypoint.name !== 'Destination') {
                const waypointMarker = new window.google.maps.Marker({
                  position: waypointCoords,
                  map: googleMapRef.current,
                  icon: {
                    url: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
                    scaledSize: new window.google.maps.Size(16, 16)
                  },
                  title: `${waypoint.name}, ${waypoint.city}`
                });
                markersRef.current.push(waypointMarker);
              }
            } catch (error) {
              console.error('Error adding waypoint:', error);
            }
          }
          
          // Draw route line
          if (routePoints.length > 1) {
            polylineRef.current = new window.google.maps.Polyline({
              path: routePoints,
              geodesic: true,
              strokeColor: '#4285F4',
              strokeOpacity: 0.8,
              strokeWeight: 3
            });
            polylineRef.current.setMap(googleMapRef.current);
          }
        }
        
        // Fit map to all markers
        googleMapRef.current.fitBounds(bounds);
        
        // If only origin and destination, add some padding to the zoom
        if (markersRef.current.length <= 2) {
          const zoomChangeListener = window.google.maps.event.addListenerOnce(
            googleMapRef.current, 
            'bounds_changed', 
            () => {
              googleMapRef.current.setZoom(Math.max(4, googleMapRef.current.getZoom() - 1));
            }
          );
        }
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    }
    
    // Clean up
    return () => {
      // Remove markers and polyline
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
      }
      
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [shipment, tracking, routeData]);
  
  // Handle missing Google Maps API key
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <Center height="100%" p={4} borderWidth="1px" borderRadius="md">
        <Text color="red.500">
          Google Maps API key is missing. Please configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment.
        </Text>
      </Center>
    );
  }
  
  return (
    <Box 
      ref={mapRef} 
      height="100%" 
      width="100%" 
      borderRadius="md" 
      overflow="hidden" 
      position="relative"
    >
      {!window.google && (
        <Center position="absolute" top={0} left={0} right={0} bottom={0} bg="whiteAlpha.700">
          <Spinner size="xl" thickness="4px" color="blue.500" />
        </Center>
      )}
    </Box>
  );
};

export default ShipmentTrackingMap;
