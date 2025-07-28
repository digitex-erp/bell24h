import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

// Add TypeScript declarations for Google Maps API
declare global {
  interface Window {
    google: any;
  }
}

/**
 * GoogleMap Component
 * A component to render a Google Map with markers and interactive functionality
 */
interface GoogleMapProps {
  apiKey: string;
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: Array<{ lat: number; lng: number; title?: string }>;
  onMapClick?: (location: { lat: number; lng: number }) => void;
  height?: string | number;
  width?: string | number;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  apiKey,
  center = { lat: 40.7128, lng: -74.006 },
  zoom = 12,
  markers = [],
  onMapClick,
  height = '400px',
  width = '100%'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const markersRef = useRef<any[]>([]);
  
  // Load the Google Maps script dynamically
  const loadGoogleMapsScript = () => {
    return new Promise<void>((resolve, reject) => {
      // Check if script is already loaded
      if (window.google?.maps) {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps script'));
      document.head.appendChild(script);
    });
  };
  
  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      if (!apiKey) {
        setLoadError('Google Maps API key is required');
        return;
      }
      
      try {
        await loadGoogleMapsScript();
        setIsLoaded(true);
      } catch (error) {
        setLoadError('Failed to load Google Maps');
        console.error('Error loading Google Maps:', error);
      }
    };
    
    initMap();
    
    // Cleanup function for script
    return () => {
      // We don't remove the script on unmount as it might be used by other components
      // Instead, we'll just cleanup our markers and event listeners
      if (map) {
        window.google?.maps.event.clearInstanceListeners(map);
      }
      
      // Clear all markers
      if (markersRef.current) {
        markersRef.current.forEach(marker => {
          if (marker) marker.setMap(null);
        });
        markersRef.current = [];
      }
    };
  }, [apiKey, map]);

  // Initialize the map once the script is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current) return;

    try {
      const newMap = new window.google.maps.Map(mapRef.current, {
        center,
        zoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: false
      });

      setMap(newMap);

      if (onMapClick) {
        window.google.maps.event.addListener(newMap, 'click', (event: any) => {
          const clickedLocation = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          };
          onMapClick(clickedLocation);
        });
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [isLoaded, center, zoom, onMapClick]);

  // Update map center and zoom when props change
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
  }, [map, center]);

  // Add or update markers when they change or map is initialized
  useEffect(() => {
    if (!map || !isLoaded) return;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    // Add new markers
    markers.forEach(markerData => {
      const marker = new window.google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map,
        title: markerData.title || ''
      });
      markersRef.current.push(marker);
    });
  }, [map, markers, isLoaded]);
  
  // Update map center when it changes
  useEffect(() => {
    if (map && center) {
      map.panTo(center);
    }
  }, [map, center]);
  
  // Update zoom level when it changes
  useEffect(() => {
    if (map && zoom) {
      map.setZoom(zoom);
    }
  }, [map, zoom]);
  
  // If there's an error loading the maps API, show an error message
  if (loadError) {
    return (
      <Box sx={{ 
        width, 
        height, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        borderRadius: 1
      }}>
        <Typography color="error" align="center" gutterBottom>
          {loadError}
        </Typography>
      </Box>
    );
  }
  
  // Show loading indicator while the maps API is loading
  if (!isLoaded) {
    return (
      <Box sx={{ 
        width, 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        borderRadius: 1
      }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Render the map container
  return (
    <Box
      ref={mapRef}
      sx={{
        width,
        height,
        borderRadius: 1,
        overflow: 'hidden'
      }}
    />
  );
};

export default GoogleMap;
