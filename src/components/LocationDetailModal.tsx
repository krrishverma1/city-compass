import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ItineraryStop, DelhiLocation } from '@/types/itinerary';
import { useSimulation } from '@/contexts/SimulationContext';
import BadgeIcon from './BadgeIcon';
import {
  MapPin,
  Clock,
  Users,
  Car,
  Cloud,
  Eye,
  Star,
} from 'lucide-react';

interface LocationDetailModalProps {
  stop: ItineraryStop | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function LocationDetailModal({
  stop,
  open,
  onOpenChange,
}: LocationDetailModalProps) {
  const { simulation } = useSimulation();

  if (!stop || stop.isLuggageStop) return null;

  const location = stop.location as DelhiLocation;

  const crowdLabel =
    simulation.crowdLevel === 'low'
      ? 'Low 🟢'
      : simulation.crowdLevel === 'medium'
      ? 'Moderate 🟡'
      : 'High 🔴';

  const trafficColor =
    stop.transitTimeMinutes <= 15
      ? '🟢'
      : stop.transitTimeMinutes <= 30
      ? '🟡'
      : '🔴';

  const weatherLabel =
    simulation.weather === 'clear'
      ? 'Clear ☀️'
      : simulation.weather === 'rain'
      ? 'Rain 🌧️'
      : 'Storm ⛈️';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            {location.superStar && <Star className="w-4 h-4 text-travel-amber fill-travel-amber" />}
            {location.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {formatTime(stop.startTime)} — {formatTime(stop.endTime)} · {location.categories.join(', ')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Significance */}
          <div>
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-1.5 mb-1">
              <Eye className="w-4 h-4 text-primary" />
              Why Visit
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {location.significance}
            </p>
          </div>

          {/* Best Viewing Tip */}
          <div className="bg-travel-amber-light rounded-lg p-3">
            <h4 className="text-sm font-semibold text-accent-foreground flex items-center gap-1.5 mb-1">
              <MapPin className="w-4 h-4 text-travel-amber" />
              Best Viewing Spot
            </h4>
            <p className="text-sm text-accent-foreground/80">{location.bestViewingTip}</p>
          </div>

          {/* Live Context */}
          <div className="bg-muted rounded-lg p-3 space-y-2">
            <h4 className="text-sm font-semibold text-foreground mb-2">Live Context</h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="space-y-1">
                <Users className="w-4 h-4 mx-auto text-muted-foreground" />
                <p className="text-xs font-medium">Crowd</p>
                <p className="text-xs text-muted-foreground">{crowdLabel}</p>
              </div>
              <div className="space-y-1">
                <Car className="w-4 h-4 mx-auto text-muted-foreground" />
                <p className="text-xs font-medium">Traffic</p>
                <p className="text-xs text-muted-foreground">
                  {stop.transitTimeMinutes} min {trafficColor}
                </p>
              </div>
              <div className="space-y-1">
                <Cloud className="w-4 h-4 mx-auto text-muted-foreground" />
                <p className="text-xs font-medium">Weather</p>
                <p className="text-xs text-muted-foreground">{weatherLabel}</p>
              </div>
            </div>
          </div>

          {/* Tags & Badges */}
          <div className="flex flex-wrap gap-1.5">
            {stop.badges.map((badge) => (
              <BadgeIcon key={badge} badge={badge} />
            ))}
            {location.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Hours */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t">
            <Clock className="w-3.5 h-3.5" />
            Open {location.openingHour === 0 && location.closingHour === 24
              ? '24 hours'
              : `${location.openingHour}:00 — ${location.closingHour}:00`}
            {' · '}~{location.estimatedVisitMinutes} min visit
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
