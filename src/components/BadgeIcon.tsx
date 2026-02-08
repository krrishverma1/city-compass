import React from 'react';
import { BadgeType } from '@/types/itinerary';
import { CloudRain, Car, Sunset, Users, Gem } from 'lucide-react';

const BADGE_CONFIG: Record<BadgeType, { label: string; icon: React.ElementType; className: string }> = {
  'rain-safe': {
    label: 'Rain Safe',
    icon: CloudRain,
    className: 'bg-travel-teal-light text-travel-teal',
  },
  'avoids-traffic': {
    label: 'Avoids Traffic',
    icon: Car,
    className: 'bg-travel-green-light text-travel-green',
  },
  'best-view-now': {
    label: 'Best View Now',
    icon: Sunset,
    className: 'bg-travel-amber-light text-travel-amber',
  },
  'low-crowd': {
    label: 'Low Crowd',
    icon: Users,
    className: 'bg-secondary text-secondary-foreground',
  },
  'underrated-gem': {
    label: 'Underrated Gem',
    icon: Gem,
    className: 'bg-secondary text-primary',
  },
};

interface BadgeIconProps {
  badge: BadgeType;
}

export default function BadgeIcon({ badge }: BadgeIconProps) {
  const config = BADGE_CONFIG[badge];
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}
