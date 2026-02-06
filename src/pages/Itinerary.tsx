import React, { useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Map, List, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserInput } from '@/types/itinerary';
import { useSimulation } from '@/contexts/SimulationContext';
import { generateItinerary } from '@/lib/itineraryEngine';
import { useIsMobile } from '@/hooks/use-mobile';
import ItineraryTimeline from '@/components/ItineraryTimeline';
import RouteSummary from '@/components/RouteSummary';
import SimulatorPanel from '@/components/SimulatorPanel';
import SafetyAlert from '@/components/SafetyAlert';
import LocationDetailModal from '@/components/LocationDetailModal';
import MapView from '@/components/MapView';

export default function ItineraryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { simulation, setSafetyAlert } = useSimulation();

  const userInput: UserInput = location.state?.userInput ?? {
    location: { lat: 28.6315, lng: 77.2167 },
    locationName: 'Connaught Place',
    currentTime: new Date(),
    luggageStatus: 'no-luggage',
    interests: ['History', 'Food', 'Nature'],
  };

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'timeline' | 'map'>('timeline');

  const itinerary = useMemo(
    () => generateItinerary(userInput, simulation),
    [userInput, simulation]
  );

  const handleSelectStop = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      if (!itinerary.stops[index]?.isLuggageStop) {
        setDetailOpen(true);
      }
    },
    [itinerary.stops]
  );

  const selectedStop =
    selectedIndex !== null ? itinerary.stops[selectedIndex] ?? null : null;

  return (
    <div className="min-h-screen bg-background">
      {/* Safety Alert Overlay */}
      <SafetyAlert
        active={simulation.safetyAlert}
        onDismiss={() => setSafetyAlert(false)}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-foreground flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-primary" />
              Your Delhi Itinerary
            </h1>
            <p className="text-xs text-muted-foreground truncate">
              From {userInput.locationName} · {userInput.interests.join(', ')}
            </p>
          </div>

          {/* Mobile view toggle */}
          {isMobile && (
            <div className="flex gap-1 bg-muted rounded-lg p-0.5">
              <Button
                variant={mobileView === 'timeline' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMobileView('timeline')}
                className="h-7 px-2 text-xs gap-1"
              >
                <List className="w-3.5 h-3.5" />
                List
              </Button>
              <Button
                variant={mobileView === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMobileView('map')}
                className="h-7 px-2 text-xs gap-1"
              >
                <Map className="w-3.5 h-3.5" />
                Map
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        {!simulation.safetyAlert && (
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-57px)]">
            {/* Left Panel: Timeline */}
            <div
              className={`lg:w-[55%] xl:w-[50%] lg:border-r overflow-y-auto px-4 py-4 space-y-4
                ${isMobile && mobileView !== 'timeline' ? 'hidden' : ''}`}
            >
              {/* Simulator */}
              <SimulatorPanel />

              {/* Route Summary */}
              {itinerary.totalStops > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <RouteSummary itinerary={itinerary} />
                </motion.div>
              )}

              {/* Timeline */}
              <ItineraryTimeline
                stops={itinerary.stops}
                selectedIndex={selectedIndex}
                onSelectStop={handleSelectStop}
              />
            </div>

            {/* Right Panel: Map */}
            <div
              className={`lg:w-[45%] xl:w-[50%] lg:sticky lg:top-[57px] lg:h-[calc(100vh-57px)]
                ${isMobile && mobileView !== 'map' ? 'hidden' : 'h-[calc(100vh-57px)]'}`}
            >
              <MapView
                stops={itinerary.stops}
                selectedIndex={selectedIndex}
                onSelectStop={handleSelectStop}
              />
            </div>
          </div>
        )}
      </main>

      {/* Location Detail Modal */}
      <LocationDetailModal
        stop={selectedStop}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
