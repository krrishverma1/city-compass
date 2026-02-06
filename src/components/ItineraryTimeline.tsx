import React from 'react';
import { ItineraryStop } from '@/types/itinerary';
import TimelineCard from './TimelineCard';

interface ItineraryTimelineProps {
  stops: ItineraryStop[];
  selectedIndex: number | null;
  onSelectStop: (index: number) => void;
}

export default function ItineraryTimeline({
  stops,
  selectedIndex,
  onSelectStop,
}: ItineraryTimelineProps) {
  if (stops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground text-sm">
          No stops match your current filters. Try adjusting the simulation controls.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0 py-2">
      {stops.map((stop, index) => (
        <TimelineCard
          key={stop.location.id + index}
          stop={stop}
          index={index}
          isLast={index === stops.length - 1}
          onSelect={() => onSelectStop(index)}
          isSelected={selectedIndex === index}
        />
      ))}
    </div>
  );
}
