import React, { createContext, useContext, useState, useCallback } from 'react';
import { SimulationState, WeatherCondition, TrafficDensity, CrowdLevel } from '@/types/itinerary';

interface SimulationContextType {
  simulation: SimulationState;
  setWeather: (w: WeatherCondition) => void;
  setSafetyAlert: (v: boolean) => void;
  setTrafficDensity: (t: TrafficDensity) => void;
  setCrowdLevel: (c: CrowdLevel) => void;
  setTimeOverride: (d: Date | null) => void;
}

const SimulationContext = createContext<SimulationContextType | null>(null);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [simulation, setSimulation] = useState<SimulationState>({
    weather: 'clear',
    safetyAlert: false,
    trafficDensity: 'moderate',
    crowdLevel: 'medium',
    timeOverride: null,
  });

  const setWeather = useCallback((weather: WeatherCondition) => {
    setSimulation((prev) => ({ ...prev, weather }));
  }, []);

  const setSafetyAlert = useCallback((safetyAlert: boolean) => {
    setSimulation((prev) => ({ ...prev, safetyAlert }));
  }, []);

  const setTrafficDensity = useCallback((trafficDensity: TrafficDensity) => {
    setSimulation((prev) => ({ ...prev, trafficDensity }));
  }, []);

  const setCrowdLevel = useCallback((crowdLevel: CrowdLevel) => {
    setSimulation((prev) => ({ ...prev, crowdLevel }));
  }, []);

  const setTimeOverride = useCallback((timeOverride: Date | null) => {
    setSimulation((prev) => ({ ...prev, timeOverride }));
  }, []);

  return (
    <SimulationContext.Provider
      value={{ simulation, setWeather, setSafetyAlert, setTrafficDensity, setCrowdLevel, setTimeOverride }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
}
