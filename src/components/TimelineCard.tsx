import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, ArrowDown, Luggage, Star, ChevronRight } from 'lucide-react';
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

function getDurationLabel(minutes: number): string {
  if (minutes >= 60) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }
  return `${minutes}m`;
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
  const visitDuration = Math.round(
    (stop.endTime.getTime() - stop.startTime.getTime()) / 60000
  );

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
            <div className="w-px h-3 bg-border" />
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
              <ArrowDown className="w-3 h-3 text-muted-foreground" />
            </div>
            <div className="w-px h-3 bg-border" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1">
            <span>{stop.transitTimeMinutes} min</span>
            <span>·</span>
            <span>{stop.distanceKm} km</span>
          </div>
        </div>
      )}

      {/* Card */}
      <div className="flex gap-3">
        {/* Timeline dot */}
        <div className="flex flex-col items-center pt-4">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm
              ${
                isLuggage
                  ? 'bg-accent text-accent-foreground'
                  : isSelected
                  ? 'bg-primary text-primary-foreground shadow-md'
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
            !isLuggage ? 'cursor-pointer hover:shadow-md group' : ''
          } ${isSelected ? 'ring-2 ring-primary shadow-md' : 'hover:border-primary/30'}`}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  {!isLuggage && location.superStar && (
                    <Star className="w-3.5 h-3.5 text-accent fill-accent shrink-0" />
                  )}
                  <h3 className="font-semibold text-foreground text-sm leading-tight">
                    {isLuggage ? '🧳 ' : ''}
                    {stop.location.name}
                  </h3>
                </div>
                {!isLuggage && location.categories && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {location.categories.join(' · ')}
                  </p>
                )}
                {!isLuggage && location.significance && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
                    {location.significance.split('.')[0]}.
                  </p>
                )}
                {!isLuggage && location.underrated && (
                  <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-primary">
                    💎 Underrated Gem
                  </span>
                )}
                {!isLuggage && location.transportTip && (
                  <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                    🚇 {location.transportTip}
                  </p>
                )}
                {!isLuggage && location.nearbyFood && (
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    🍽️ {location.nearbyFood}
                  </p>
                )}
              </div>
              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 text-xs font-medium text-foreground bg-muted rounded-md px-2 py-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(stop.startTime)}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {getDurationLabel(visitDuration)} visit
                </p>
                {!isLuggage && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                )}
              </div>
            </div>

            {/* Badges */}
            {stop.badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t">
                {stop.badges.map((badge) => (
                  <BadgeIcon key={badge} badge={badge} />
                ))}
              </div>
            )}

            {isLuggage && (
              <p className="text-xs text-muted-foreground mt-2 bg-accent/10 rounded-md p-2">
                📍 Drop off your luggage here before exploring. ~20 min stop.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
