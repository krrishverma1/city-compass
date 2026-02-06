import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  Cloud,
  CloudRain,
  CloudLightning,
  AlertTriangle,
  Car,
  Users,
  Clock,
  Sliders,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useSimulation } from '@/contexts/SimulationContext';
import { WeatherCondition, TrafficDensity, CrowdLevel } from '@/types/itinerary';

const WEATHER_OPTIONS: { value: WeatherCondition; label: string; icon: React.ElementType }[] = [
  { value: 'clear', label: 'Clear', icon: Cloud },
  { value: 'rain', label: 'Rain', icon: CloudRain },
  { value: 'storm', label: 'Storm', icon: CloudLightning },
];

const TRAFFIC_OPTIONS: { value: TrafficDensity; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'heavy', label: 'Heavy' },
];

const CROWD_OPTIONS: { value: CrowdLevel; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export default function SimulatorPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    simulation,
    setWeather,
    setSafetyAlert,
    setTrafficDensity,
    setCrowdLevel,
    setTimeOverride,
  } = useSimulation();

  const handleTimeChange = (value: string) => {
    if (!value) {
      setTimeOverride(null);
      return;
    }
    const [hours, minutes] = value.split(':').map(Number);
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    setTimeOverride(d);
  };

  const currentTimeValue = simulation.timeOverride
    ? `${String(simulation.timeOverride.getHours()).padStart(2, '0')}:${String(simulation.timeOverride.getMinutes()).padStart(2, '0')}`
    : '';

  return (
    <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
      {/* Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Sliders className="w-4 h-4 text-primary" />
          Simulation Controls
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t pt-4">
              {/* Weather */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5" />
                  Weather
                </Label>
                <div className="flex gap-1.5">
                  {WEATHER_OPTIONS.map(({ value, label, icon: Icon }) => (
                    <Button
                      key={value}
                      variant={simulation.weather === value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setWeather(value)}
                      className="flex-1 text-xs gap-1"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Safety Alert */}
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Safety Alert
                </Label>
                <Switch
                  checked={simulation.safetyAlert}
                  onCheckedChange={setSafetyAlert}
                />
              </div>

              {/* Traffic */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5" />
                  Traffic Density
                </Label>
                <div className="flex gap-1.5">
                  {TRAFFIC_OPTIONS.map(({ value, label }) => (
                    <Button
                      key={value}
                      variant={simulation.trafficDensity === value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTrafficDensity(value)}
                      className="flex-1 text-xs"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Crowd Level */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Crowd Level
                </Label>
                <div className="flex gap-1.5">
                  {CROWD_OPTIONS.map(({ value, label }) => (
                    <Button
                      key={value}
                      variant={simulation.crowdLevel === value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCrowdLevel(value)}
                      className="flex-1 text-xs"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Time Override */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Time Override
                </Label>
                <Input
                  type="time"
                  value={currentTimeValue}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className="h-8 text-xs"
                />
                <p className="text-[10px] text-muted-foreground">
                  Leave empty for real time. Changes regenerate the itinerary instantly.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
