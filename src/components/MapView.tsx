import React, { useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import { ItineraryStop, DelhiLocation } from '@/types/itinerary';
import { MapPin } from 'lucide-react';

interface MapViewProps {
  stops: ItineraryStop[];
  selectedIndex: number | null;
  onSelectStop: (index: number) => void;
  apiKey?: string;
}

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
  minHeight: '400px',
};

const DELHI_CENTER = { lat: 28.6139, lng: 77.2090 };

const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  styles: [
    { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  ],
};

function MapPlaceholder({ stopCount }: { stopCount: number }) {
  return (
    <div className="w-full h-full min-h-[400px] bg-muted rounded-lg flex flex-col items-center justify-center gap-3 p-6">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <MapPin className="w-8 h-8 text-primary" />
      </div>
      <h3 className="font-semibold text-foreground">Map View</h3>
      <p className="text-sm text-muted-foreground text-center max-w-xs">
        {stopCount > 0
          ? `${stopCount} stops plotted. Add a Google Maps API key to see the interactive map.`
          : 'Generate an itinerary to see your route on the map.'}
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        To enable: provide your Google Maps JavaScript API key
      </p>
    </div>
  );
}

export default function MapView({ stops, selectedIndex, onSelectStop, apiKey }: MapViewProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey || '',
  });

  const routePath = useMemo(
    () => stops.map((s) => (s.location as DelhiLocation).coordinates || s.location.coordinates),
    [stops]
  );

  const center = useMemo(() => {
    if (stops.length === 0) return DELHI_CENTER;
    const coords = stops.map((s) => s.location.coordinates);
    const avgLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
    const avgLng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;
    return { lat: avgLat, lng: avgLng };
  }, [stops]);

  if (!apiKey || !isLoaded) {
    return <MapPlaceholder stopCount={stops.length} />;
  }

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={center}
      zoom={12}
      options={MAP_OPTIONS}
    >
      {stops.map((stop, index) => (
        <Marker
          key={stop.location.id + index}
          position={stop.location.coordinates}
          label={{
            text: stop.isLuggageStop ? '🧳' : String(index + 1),
            color: '#ffffff',
            fontWeight: 'bold',
            fontSize: '12px',
          }}
          onClick={() => onSelectStop(index)}
          animation={selectedIndex === index ? google.maps.Animation.BOUNCE : undefined}
        />
      ))}

      {routePath.length > 1 && (
        <Polyline
          path={routePath}
          options={{
            strokeColor: '#0e7490',
            strokeOpacity: 0.7,
            strokeWeight: 3,
            geodesic: true,
          }}
        />
      )}
    </GoogleMap>
  );
}
