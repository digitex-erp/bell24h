import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import GoogleMap, { MapMarker } from './GoogleMap';
import mapsService, { DistanceResult } from '../../services/maps.service';

interface ShippingRouteMapProps {
  origin: string;
  destination: string;
  className?: string;
  height?: string;
  width?: string;
  showDistance?: boolean;
  showDuration?: boolean;
}

const ShippingRouteMap: React.FC<ShippingRouteMapProps> = ({
  origin,
  destination,
  className = '',
  height = '400px',
  width = '100%',
  showDistance = true,
  showDuration = true,
}) => {
  const { t } = useTranslation();
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 20, lng: 0 });
  const [zoom, setZoom] = useState(2);
  const [distanceInfo, setDistanceInfo] = useState<DistanceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoordinates = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Get coordinates for origin and destination
        const [originResult, destinationResult] = await Promise.all([
          mapsService.geocodeAddress(origin),
          mapsService.geocodeAddress(destination)
        ]);

        setOriginCoords({ lat: originResult.lat, lng: originResult.lng });
        setDestinationCoords({ lat: destinationResult.lat, lng: destinationResult.lng });

        // Calculate the center point between origin and destination
        const centerLat = (originResult.lat + destinationResult.lat) / 2;
        const centerLng = (originResult.lng + destinationResult.lng) / 2;
        setMapCenter({ lat: centerLat, lng: centerLng });

        // Set appropriate zoom level based on distance
        const latDiff = Math.abs(originResult.lat - destinationResult.lat);
        const lngDiff = Math.abs(originResult.lng - destinationResult.lng);
        const maxDiff = Math.max(latDiff, lngDiff);
        
        // Adjust zoom based on distance
        if (maxDiff > 100) setZoom(2);
        else if (maxDiff > 50) setZoom(3);
        else if (maxDiff > 25) setZoom(4);
        else if (maxDiff > 10) setZoom(5);
        else if (maxDiff > 5) setZoom(6);
        else if (maxDiff > 1) setZoom(8);
        else setZoom(10);

        // Create markers
        const newMarkers: MapMarker[] = [
          {
            id: 'origin',
            position: { lat: originResult.lat, lng: originResult.lng },
            title: t('shipping.origin', 'Origin: {{address}}', { address: originResult.formattedAddress }),
            infoContent: `<div><strong>${t('shipping.origin', 'Origin')}</strong><p>${originResult.formattedAddress}</p></div>`,
            icon: '/assets/images/origin-marker.png'
          },
          {
            id: 'destination',
            position: { lat: destinationResult.lat, lng: destinationResult.lng },
            title: t('shipping.destination', 'Destination: {{address}}', { address: destinationResult.formattedAddress }),
            infoContent: `<div><strong>${t('shipping.destination', 'Destination')}</strong><p>${destinationResult.formattedAddress}</p></div>`,
            icon: '/assets/images/destination-marker.png'
          }
        ];
        setMarkers(newMarkers);

        // Calculate distance and duration
        if (showDistance || showDuration) {
          const distanceResult = await mapsService.calculateDistance(origin, destination);
          setDistanceInfo(distanceResult);
        }
      } catch (err) {
        console.error('Error setting up shipping route map:', err);
        setError(t('shipping.mapError', 'Error loading shipping route map. Please check the addresses and try again.'));
      } finally {
        setLoading(false);
      }
    };

    if (origin && destination) {
      fetchCoordinates();
    }
  }, [origin, destination, t, showDistance, showDuration]);

  if (loading) {
    return (
      <div 
        className={`shipping-route-map-loading ${className}`} 
        style={{ 
          height, 
          width, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px'
        }}
      >
        <p>{t('shipping.loadingMap', 'Loading shipping route map...')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className={`shipping-route-map-error ${className}`} 
        style={{ 
          height, 
          width, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px'
        }}
      >
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={`shipping-route-container ${className}`}>
      <GoogleMap
        center={mapCenter}
        zoom={zoom}
        markers={markers}
        height={height}
        width={width}
        className="shipping-route-map"
        showTraffic={true}
      />
      
      {distanceInfo && (
        <div className="shipping-route-info mt-3 p-3 border rounded bg-light">
          <h5>{t('shipping.routeInformation', 'Shipping Route Information')}</h5>
          {showDistance && distanceInfo.distance && (
            <p>
              <strong>{t('shipping.distance', 'Distance')}:</strong> {distanceInfo.distance.text} 
              ({Math.round(distanceInfo.distance.value / 1000)} km)
            </p>
          )}
          {showDuration && distanceInfo.duration && (
            <p>
              <strong>{t('shipping.estimatedTime', 'Estimated Transit Time')}:</strong> {distanceInfo.duration.text}
            </p>
          )}
          <p className="text-muted small">
            {t('shipping.disclaimer', 'Note: Actual shipping times may vary based on customs clearance and carrier schedules.')}
          </p>
        </div>
      )}
    </div>
  );
};

export default ShippingRouteMap;
