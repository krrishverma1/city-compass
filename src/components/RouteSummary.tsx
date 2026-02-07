import React from 'react';
import { MapPin, Clock, Route, Compass, User, Users, Heart, UserPlus } from 'lucide-react';
import { Itinerary, TravelCompanion } from '@/types/itinerary';

interface RouteSummaryProps {
  itinerary: Itinerary;
  companion?: TravelCompanion;
  locationName?: string;
}

const companionLabels: Record<TravelCompanion, { label: string; icon: React.ElementType }> = {
  solo: { label: 'Solo Adventure', icon: User },
  friends: { label: 'Friends Trip', icon: Users },
  family: { label: 'Family Outing', icon: UserPlus },
  partner: { label: 'Romantic Getaway', icon: Heart },
};

export default function RouteSummary({ itinerary, companion, locationName }: RouteSummaryProps) {
  const hours = Math.floor(itinerary.totalDurationMinutes / 60);
  const mins = itinerary.totalDurationMinutes % 60;
  const companionInfo = companion ? companionLabels[companion] : null;
  const CompanionIcon = companionInfo?.icon;

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
      {/* Title bar */}
      <div className="px-4 py-3 bg-primary/5 border-b flex items-center gap-2">
        <Compass className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Your Optimized Route</span>
        {companionInfo && CompanionIcon && (
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 px-2 py-0.5 rounded-full">
            <CompanionIcon className="w-3 h-3" />
            {companionInfo.label}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x">
        <div className="flex flex-col items-center py-3 gap-1">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-lg font-bold text-foreground">{itinerary.totalStops}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Stops</span>
        </div>
        <div className="flex flex-col items-center py-3 gap-1">
          <Clock className="w-4 h-4 text-primary" />
          <span className="text-lg font-bold text-foreground">
            {hours > 0 ? `${hours}h ${mins}m` : `${mins}m`}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Duration</span>
        </div>
        <div className="flex flex-col items-center py-3 gap-1">
          <Route className="w-4 h-4 text-primary" />
          <span className="text-lg font-bold text-foreground">{itinerary.totalDistanceKm}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Km</span>
        </div>
      </div>

      {locationName && (
        <div className="px-4 py-2 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            Starting from <span className="font-medium text-foreground">{locationName}</span>
          </p>
        </div>
      )}
    </div>
  );
}
