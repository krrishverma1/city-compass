import {
  UserInput,
  SimulationState,
  Itinerary,
  ItineraryStop,
  DelhiLocation,
  BadgeType,
  CrowdLevel,
} from '@/types/itinerary';
import { DELHI_LOCATIONS, LUGGAGE_STORAGE } from '@/data/delhiLocations';
import { haversineDistance, estimateTravelTimeMinutes, findNearestIndex } from './distance';

const MAX_STOPS = 7;
const VISIT_OVERHEAD_MINUTES = 10; // buffer per stop

function getEffectiveTime(input: UserInput, sim: SimulationState): Date {
  return sim.timeOverride ?? input.currentTime;
}

function getHour(date: Date): number {
  return date.getHours() + date.getMinutes() / 60;
}

function isGoldenHour(date: Date): boolean {
  const h = getHour(date);
  return h >= 17 && h <= 18.5;
}

function isMiddayHeat(date: Date): boolean {
  const h = getHour(date);
  return h >= 12 && h <= 15;
}

function isOpenAt(loc: DelhiLocation, date: Date): boolean {
  const h = getHour(date);
  if (loc.openingHour === 0 && loc.closingHour === 24) return true;
  return h >= loc.openingHour && h < loc.closingHour;
}

function closingSoon(loc: DelhiLocation, date: Date): boolean {
  const h = getHour(date);
  if (loc.closingHour === 24) return false;
  return loc.closingHour - h <= 1;
}

function getCrowdScore(level: CrowdLevel): number {
  const base: Record<CrowdLevel, [number, number]> = {
    low: [10, 30],
    medium: [35, 60],
    high: [65, 90],
  };
  const [min, max] = base[level];
  return min + Math.random() * (max - min);
}

export function generateItinerary(
  input: UserInput,
  simulation: SimulationState
): Itinerary {
  const effectiveTime = getEffectiveTime(input, simulation);
  const userPos = input.location ?? { lat: 28.6315, lng: 77.2167 }; // default CP

  // Safety alert → block all tourism
  if (simulation.safetyAlert) {
    return {
      stops: [],
      totalDurationMinutes: 0,
      totalDistanceKm: 0,
      totalStops: 0,
      safetyAlert: true,
    };
  }

  const stops: ItineraryStop[] = [];
  let currentPos = userPos;
  let currentTime = new Date(effectiveTime);
  let totalDistance = 0;

  // ── Step A: Luggage Filter ──
  if (input.luggageStatus === 'heavy-suitcase') {
    const nearestIdx = findNearestIndex(currentPos, LUGGAGE_STORAGE);
    const storage = LUGGAGE_STORAGE[nearestIdx];
    const dist = haversineDistance(currentPos, storage.coordinates);
    const transit = estimateTravelTimeMinutes(dist, simulation.trafficDensity);

    const startTime = new Date(currentTime);
    startTime.setMinutes(startTime.getMinutes() + transit);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 20);

    stops.push({
      location: storage,
      startTime,
      endTime,
      transitTimeMinutes: transit,
      distanceKm: Math.round(dist * 10) / 10,
      badges: [],
      isLuggageStop: true,
    });

    currentPos = storage.coordinates;
    currentTime = endTime;
    totalDistance += dist;
  }

  // ── Step B: Weather Filter ──
  let candidates = [...DELHI_LOCATIONS];
  const isRainy = simulation.weather === 'rain' || simulation.weather === 'storm';
  if (isRainy) {
    candidates = candidates.filter((loc) => loc.indoor);
  }

  // Filter by user interests
  if (input.interests.length > 0) {
    candidates = candidates.filter((loc) =>
      loc.categories.some((cat) => input.interests.includes(cat))
    );
  }

  // Filter by opening hours
  candidates = candidates.filter((loc) => isOpenAt(loc, currentTime));

  // Remove places closing soon
  candidates = candidates.filter((loc) => !closingSoon(loc, currentTime));

  // ── Score each candidate (Steps C, D, E) ──
  const scored = candidates.map((loc) => {
    let score = loc.popularityScore;
    const badges: BadgeType[] = [];

    // Step C: Time & Vibe
    if (isGoldenHour(currentTime) && loc.scenic) {
      score *= 1.5;
      badges.push('best-view-now');
    }
    if (isMiddayHeat(currentTime) && (loc.indoor || loc.shaded)) {
      score *= 1.3;
    }

    // Rain badge
    if (isRainy && loc.indoor) {
      badges.push('rain-safe');
    }

    // Step D: Traffic & Proximity
    const dist = haversineDistance(currentPos, loc.coordinates);
    const travelTime = estimateTravelTimeMinutes(dist, simulation.trafficDensity);

    if (travelTime > 40 && !loc.superStar) {
      score *= 0.3;
    }

    if (dist < 2) {
      score *= 1.4;
      badges.push('avoids-traffic');
    }

    // Step E: Crowd Optimization
    const crowdDensity = getCrowdScore(simulation.crowdLevel);
    score = score / (crowdDensity / 50);

    if (crowdDensity < 35) {
      badges.push('low-crowd');
    }

    return { location: loc, score, dist, travelTime, badges };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Build itinerary from top candidates
  const slotsRemaining = MAX_STOPS - stops.length;
  const chosen = scored.slice(0, slotsRemaining);

  // Re-sort chosen by proximity using nearest-neighbor heuristic
  const ordered: typeof chosen = [];
  const remaining = [...chosen];
  let pos = currentPos;

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestScore = -Infinity;
    remaining.forEach((item, idx) => {
      const d = haversineDistance(pos, item.location.coordinates);
      // Balance: prefer nearby but also high-scoring
      const proximityBonus = Math.max(0, 5 - d) * 10;
      const combinedScore = item.score + proximityBonus;
      if (combinedScore > bestScore) {
        bestScore = combinedScore;
        bestIdx = idx;
      }
    });
    ordered.push(remaining[bestIdx]);
    pos = remaining[bestIdx].location.coordinates;
    remaining.splice(bestIdx, 1);
  }

  // Add ordered stops with calculated times
  let runningTime = new Date(currentTime);
  let runningPos = currentPos;

  for (const item of ordered) {
    const dist = haversineDistance(runningPos, item.location.coordinates);
    const transit = estimateTravelTimeMinutes(dist, simulation.trafficDensity);

    const startTime = new Date(runningTime);
    startTime.setMinutes(startTime.getMinutes() + transit);

    // Check if the place is still open when we'd arrive
    if (!isOpenAt(item.location, startTime)) continue;

    const endTime = new Date(startTime);
    endTime.setMinutes(
      endTime.getMinutes() + item.location.estimatedVisitMinutes + VISIT_OVERHEAD_MINUTES
    );

    // Re-evaluate golden hour for arrival time
    const badges = [...item.badges];
    if (isGoldenHour(startTime) && item.location.scenic && !badges.includes('best-view-now')) {
      badges.push('best-view-now');
    }

    stops.push({
      location: item.location,
      startTime,
      endTime,
      transitTimeMinutes: transit,
      distanceKm: Math.round(dist * 10) / 10,
      badges,
      isLuggageStop: false,
    });

    totalDistance += dist;
    runningTime = endTime;
    runningPos = item.location.coordinates;
  }

  const totalDuration = stops.length > 0
    ? Math.round(
        (stops[stops.length - 1].endTime.getTime() - stops[0].startTime.getTime()) / 60000
      )
    : 0;

  return {
    stops,
    totalDurationMinutes: totalDuration,
    totalDistanceKm: Math.round(totalDistance * 10) / 10,
    totalStops: stops.length,
    safetyAlert: false,
  };
}
