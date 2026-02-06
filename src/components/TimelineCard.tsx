import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, ArrowDown, Luggage } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ItineraryStop, DelhiLocation } from '@/types/itinerary';
import BadgeIcon from './BadgeIcon';

interface TimelineCardProps {
  stop: ItineraryStop;
  index: number;
  isLast: boolean;
  onSelect: () => void;
  isSelected: boolean;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function TimelineCard({
  stop,
  index,
  isLast,
  onSelect,
  isSelected,
}: TimelineCardProps) {
  const isLuggage = stop.isLuggageStop;
  const location = stop.location as DelhiLocation;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
    >
      {/* Transit indicator */}
      {index > 0 && (
        <div className="flex items-center gap-3 py-2 pl-5">
          <div className="flex flex-col items-center">
            <div className="w-px h-4 bg-border" />
            <ArrowDown className="w-3 h-3 text-muted-foreground" />
            <div className="w-px h-4 bg-border" />
          </div>
          <span className="text-xs text-muted-foreground">
            {stop.transitTimeMinutes} min · {stop.distanceKm} km
          </span>
        </div>
      )}

      {/* Card */}
      <div className="flex gap-3">
        {/* Timeline dot */}
        <div className="flex flex-col items-center pt-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0
              ${
                isLuggage
                  ? 'bg-travel-amber text-white'
                  : isSelected
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-primary/15 text-primary'
              }`}
          >
            {isLuggage ? <Luggage className="w-4 h-4" /> : index + 1}
          </div>
          {!isLast && <div className="w-px flex-1 bg-border mt-2" />}
        </div>

        {/* Content */}
        <Card
          onClick={!isLuggage ? onSelect : undefined}
          className={`flex-1 mb-1 transition-all duration-200 ${
            !isLuggage ? 'cursor-pointer hover:shadow-md' : ''
          } ${isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:border-primary/30'}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-sm leading-tight">
                  {isLuggage ? '🧳 ' : ''}
                  {stop.location.name}
                </h3>
                {!isLuggage && location.categories && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {location.categories.join(' · ')}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatTime(stop.startTime)}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  to {formatTime(stop.endTime)}
                </p>
              </div>
            </div>

            {/* Badges */}
            {stop.badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {stop.badges.map((badge) => (
                  <BadgeIcon key={badge} badge={badge} />
                ))}
              </div>
            )}

            {isLuggage && (
              <p className="text-xs text-muted-foreground mt-2">
                Drop off your luggage here before exploring. ~20 min stop.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
