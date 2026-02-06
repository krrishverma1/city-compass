import React from 'react';
import { MapPin, Clock, Route } from 'lucide-react';
import { Itinerary } from '@/types/itinerary';

interface RouteSummaryProps {
  itinerary: Itinerary;
}

export default function RouteSummary({ itinerary }: RouteSummaryProps) {
  const hours = Math.floor(itinerary.totalDurationMinutes / 60);
  const mins = itinerary.totalDurationMinutes % 60;

  return (
    <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-card rounded-lg border shadow-sm">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{itinerary.totalStops} stops</span>
      </div>
      <div className="w-px h-4 bg-border" />
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">
          {hours > 0 ? `${hours}h ` : ''}{mins}min
        </span>
      </div>
      <div className="w-px h-4 bg-border" />
      <div className="flex items-center gap-2">
        <Route className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{itinerary.totalDistanceKm} km</span>
      </div>
    </div>
  );
}
