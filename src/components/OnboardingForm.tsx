import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Clock,
  Luggage,
  Compass,
  Navigation,
  Sparkles,
  History,
  TreePine,
  UtensilsCrossed,
  Mountain,
  Building2,
  ShoppingBag,
  Church,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Interest, LuggageStatus, UserInput } from '@/types/itinerary';
import { DEFAULT_USER_LOCATION } from '@/data/delhiLocations';

const INTEREST_OPTIONS: { value: Interest; label: string; icon: React.ElementType }[] = [
  { value: 'History', label: 'History', icon: History },
  { value: 'Nature', label: 'Nature', icon: TreePine },
  { value: 'Food', label: 'Food', icon: UtensilsCrossed },
  { value: 'Adventure', label: 'Adventure', icon: Mountain },
  { value: 'Architecture', label: 'Architecture', icon: Building2 },
  { value: 'Shopping', label: 'Shopping', icon: ShoppingBag },
  { value: 'Spiritual', label: 'Spiritual', icon: Church },
];

export default function OnboardingForm() {
  const navigate = useNavigate();
  const [locationName, setLocationName] = useState('');
  const [luggageStatus, setLuggageStatus] = useState<LuggageStatus>('no-luggage');
  const [interests, setInterests] = useState<Interest[]>([]);
  const [timeOverride, setTimeOverride] = useState('');

  const toggleInterest = (interest: Interest) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setLocationName('Current Location (GPS)');
        },
        () => {
          setLocationName(DEFAULT_USER_LOCATION.name);
        }
      );
    } else {
      setLocationName(DEFAULT_USER_LOCATION.name);
    }
  };

  const handleGenerate = () => {
    const now = new Date();
    if (timeOverride) {
      const [hours, minutes] = timeOverride.split(':').map(Number);
      now.setHours(hours, minutes, 0, 0);
    }

    const userInput: UserInput = {
      location: DEFAULT_USER_LOCATION.coordinates,
      locationName: locationName || DEFAULT_USER_LOCATION.name,
      currentTime: now,
      luggageStatus,
      interests: interests.length > 0 ? interests : ['History', 'Food', 'Nature'],
    };

    navigate('/itinerary', { state: { userInput } });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4"
          >
            <Compass className="w-4 h-4" />
            Smart Itinerary Optimizer
          </motion.div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Explore <span className="text-gradient-teal">Delhi</span>
          </h1>
          <p className="text-muted-foreground text-base">
            Get a personalized, traffic-aware itinerary in seconds
          </p>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg border-border/50">
          <CardContent className="p-6 space-y-6">
            {/* Location */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <MapPin className="w-4 h-4 text-primary" />
                Current Location
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., Connaught Place"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleUseMyLocation}
                  title="Use my location"
                  className="shrink-0"
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Clock className="w-4 h-4 text-primary" />
                Current Time
              </Label>
              <Input
                type="time"
                value={timeOverride}
                onChange={(e) => setTimeOverride(e.target.value)}
                placeholder="Auto-detected"
              />
              <p className="text-xs text-muted-foreground">
                Leave empty to use current time ({new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
              </p>
            </div>

            {/* Luggage */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Luggage className="w-4 h-4 text-primary" />
                Luggage Status
              </Label>
              <Select value={luggageStatus} onValueChange={(v) => setLuggageStatus(v as LuggageStatus)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="no-luggage">No Luggage</SelectItem>
                  <SelectItem value="light-backpack">Light Backpack</SelectItem>
                  <SelectItem value="heavy-suitcase">Heavy Suitcase</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Interests */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Sparkles className="w-4 h-4 text-primary" />
                Your Interests
              </Label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map(({ value, label, icon: Icon }) => {
                  const selected = interests.includes(value);
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleInterest(value)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                        ${
                          selected
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {interests.length === 0
                  ? 'Select at least one, or we\'ll pick the best of everything'
                  : `${interests.length} selected`}
              </p>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              className="w-full h-12 text-base font-semibold gap-2"
              size="lg"
            >
              <Compass className="w-5 h-5" />
              Generate My Itinerary
            </Button>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Powered by smart logic — no backend needed
        </p>
      </motion.div>
    </div>
  );
}
