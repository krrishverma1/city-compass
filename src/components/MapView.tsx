import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
import { ItineraryStop, DelhiLocation } from '@/types/itinerary';
import { MapPin, Navigation, Route } from 'lucide-react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAMlWw9bpIN8scy_KCnz50BQCdO9ENYJ14';

interface MapViewProps {
  stops: ItineraryStop[];
  selectedIndex: number | null;
  onSelectStop: (index: number) => void;
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
    { featureType: 'transit', stylers: [{ visibility: 'simplified' }] },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#dadada' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#c9e8f5' }],
    },
    {
      featureType: 'landscape.natural',
      elementType: 'geometry',
      stylers: [{ color: '#e8f5e9' }],
    },
  ],
};

const MARKER_COLORS = {
  default: '#0e7490',
  selected: '#d97706',
  luggage: '#ef4444',
  underrated: '#7c3aed',
};

export default function MapView({ stops, selectedIndex, onSelectStop }: MapViewProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const center = useMemo(() => {
    if (stops.length === 0) return DELHI_CENTER;
    const coords = stops.map((s) => s.location.coordinates);
    const avgLat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
    const avgLng = coords.reduce((sum, c) => sum + c.lng, 0) / coords.length;
    return { lat: avgLat, lng: avgLng };
  }, [stops]);

  // Calculate directions using Google Directions API for best route
  useEffect(() => {
    if (!isLoaded || stops.length < 2 || !window.google) return;

    const directionsService = new google.maps.DirectionsService();

    const origin = stops[0].location.coordinates;
    const destination = stops[stops.length - 1].location.coordinates;
    const waypoints = stops.slice(1, -1).map((stop) => ({
      location: new google.maps.LatLng(stop.location.coordinates.lat, stop.location.coordinates.lng),
      stopover: true,
    }));

    directionsService.route(
      {
        origin: new google.maps.LatLng(origin.lat, origin.lng),
        destination: new google.maps.LatLng(destination.lat, destination.lng),
        waypoints: waypoints.slice(0, 23), // Google max 23 waypoints
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);
        }
      }
    );
  }, [isLoaded, stops]);

  // Fit bounds when stops change
  useEffect(() => {
    if (!map || stops.length === 0 || !window.google) return;
    const bounds = new google.maps.LatLngBounds();
    stops.forEach((s) => {
      bounds.extend(new google.maps.LatLng(s.location.coordinates.lat, s.location.coordinates.lng));
    });
    map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
  }, [map, stops]);

  // Pan to selected stop
  useEffect(() => {
    if (!map || selectedIndex === null || !stops[selectedIndex]) return;
    const coords = stops[selectedIndex].location.coordinates;
    map.panTo({ lat: coords.lat, lng: coords.lng });
    map.setZoom(15);
  }, [map, selectedIndex, stops]);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!isLoaded) {
    return (
      <div className="w-full h-full min-h-[400px] bg-muted rounded-lg flex flex-col items-center justify-center gap-3 p-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">Loading Map...</h3>
        <p className="text-sm text-muted-foreground">Initializing Google Maps</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        center={center}
        zoom={12}
        options={MAP_OPTIONS}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* Numbered markers for each stop */}
        {stops.map((stop, index) => {
          const loc = stop.location as DelhiLocation;
          const isUnderrated = !stop.isLuggageStop && loc.underrated;
          const isSelected = selectedIndex === index;

          let markerColor = MARKER_COLORS.default;
          if (stop.isLuggageStop) markerColor = MARKER_COLORS.luggage;
          else if (isSelected) markerColor = MARKER_COLORS.selected;
          else if (isUnderrated) markerColor = MARKER_COLORS.underrated;

          return (
            <Marker
              key={stop.location.id + index}
              position={stop.location.coordinates}
              label={{
                text: stop.isLuggageStop ? '🧳' : String(index + 1),
                color: '#ffffff',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: isSelected ? 18 : 14,
                fillColor: markerColor,
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 3,
              }}
              onClick={() => onSelectStop(index)}
              animation={isSelected ? google.maps.Animation.BOUNCE : undefined}
              title={stop.location.name}
            />
          );
        })}

        {/* Route directions */}
        {directions && (
          <DirectionsRenderer
            directions={directions}
            options={{
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#0e7490',
                strokeOpacity: 0.8,
                strokeWeight: 4,
                geodesic: true,
              },
            }}
          />
        )}
      </GoogleMap>

      {/* Route info overlay */}
      {directions && directions.routes[0] && (
        <div className="absolute bottom-4 left-4 right-4 bg-card/95 backdrop-blur-sm rounded-lg border shadow-lg p-3">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <Route className="w-4 h-4 text-primary" />
              <span className="font-medium text-foreground">Best Route</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Navigation className="w-3.5 h-3.5" />
              {directions.routes[0].legs.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0) > 1000
                ? `${(directions.routes[0].legs.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0) / 1000).toFixed(1)} km`
                : `${directions.routes[0].legs.reduce((sum, leg) => sum + (leg.distance?.value || 0), 0)} m`}
            </div>
            <div className="text-muted-foreground">
              ~{Math.round(directions.routes[0].legs.reduce((sum, leg) => sum + (leg.duration?.value || 0), 0) / 60)} min drive
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
