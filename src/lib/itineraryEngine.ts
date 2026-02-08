import {
  UserInput,
  SimulationState,
  Itinerary,
  ItineraryStop,
  DelhiLocation,
  BadgeType,
  CrowdLevel,
  TravelCompanion,
} from '@/types/itinerary';
import { DELHI_LOCATIONS, LUGGAGE_STORAGE } from '@/data/delhiLocations';
import { haversineDistance, estimateTravelTimeMinutes, findNearestIndex } from './distance';

const MAX_STOPS = 7;
const VISIT_OVERHEAD_MINUTES = 10;

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

function isEarlyMorning(date: Date): boolean {
  const h = getHour(date);
  return h >= 5 && h < 9;
}

function isEvening(date: Date): boolean {
  const h = getHour(date);
  return h >= 18 && h <= 22;
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

// ══════════════ COMPANION SCORING ══════════════
function getCompanionScore(loc: DelhiLocation, companion: TravelCompanion): number {
  let multiplier = 1.0;

  // Direct companion fit bonus
  if (loc.companionFit.includes(companion)) {
    multiplier *= 1.3;
  } else {
    multiplier *= 0.6;
  }

  switch (companion) {
    case 'family':
      if (loc.kidFriendly) multiplier *= 1.4;
      if (loc.indoor) multiplier *= 1.2; // comfort
      if (!loc.kidFriendly) multiplier *= 0.5;
      // Avoid: nightlife, unsafe, overly crowded narrow lanes
      if (loc.tags.includes('nightlife') || loc.tags.includes('bustling')) multiplier *= 0.7;
      break;

    case 'partner':
      if (loc.romantic) multiplier *= 1.5;
      if (loc.scenic) multiplier *= 1.3;
      if (loc.rooftop) multiplier *= 1.3;
      if (loc.tags.includes('fairy-lights') || loc.tags.includes('cafes')) multiplier *= 1.2;
      // Deprioritize crowded/chaotic spots for couples
      if (loc.tags.includes('bustling')) multiplier *= 0.6;
      break;

    case 'friends':
      if (loc.groupFun) multiplier *= 1.4;
      if (loc.tags.includes('street-food') || loc.tags.includes('adventure')) multiplier *= 1.3;
      if (loc.tags.includes('nightlife') || loc.tags.includes('trendy')) multiplier *= 1.3;
      // Friends love unique/adventurous spots
      if (loc.categories.includes('Adventure')) multiplier *= 1.2;
      break;

    case 'solo':
      // Solo travelers love hidden gems, peaceful spots, and cultural immersion
      if (loc.tags.includes('peaceful') || loc.tags.includes('hidden-gem')) multiplier *= 1.3;
      if (loc.tags.includes('museum') || loc.tags.includes('heritage')) multiplier *= 1.2;
      if (loc.metroNearby) multiplier *= 1.2; // safety/convenience for solo
      break;
  }

  return multiplier;
}

// ══════════════ DELHI-SPECIFIC TIME INTELLIGENCE ══════════════
function getDelhiTimeScore(loc: DelhiLocation, date: Date): number {
  const h = getHour(date);
  let bonus = 1.0;

  // Old Delhi is best explored in the morning (less crowded, cooler)
  if (loc.area === 'old-delhi' && isEarlyMorning(date)) {
    bonus *= 1.4;
  }
  // Old Delhi gets extremely crowded and hot after noon
  if (loc.area === 'old-delhi' && isMiddayHeat(date)) {
    bonus *= 0.6;
  }

  // Gardens and outdoor nature spots are best in early morning or evening
  if (loc.categories.includes('Nature') && (isEarlyMorning(date) || (h >= 16 && h <= 18))) {
    bonus *= 1.3;
  }

  // Indoor/AC spots are perfect for midday heat (May-Sep temps hit 45°C)
  if (isMiddayHeat(date) && (loc.indoor || loc.shaded)) {
    bonus *= 1.3;
  }

  // Qawwali at Nizamuddin is specifically an evening thing (Thu)
  if (loc.id === 'nizamuddin-dargah' && isEvening(date)) {
    bonus *= 1.5;
  }

  // Akshardham water show is evening
  if (loc.id === 'akshardham' && h >= 16) {
    bonus *= 1.3;
  }

  // Champa Gali is an evening destination
  if (loc.id === 'champa-gali' && isEvening(date)) {
    bonus *= 1.5;
  }

  // Waste to Wonder Park is best at night
  if (loc.id === 'kingdom-of-dreams' && isEvening(date)) {
    bonus *= 1.4;
  }

  return bonus;
}

// ══════════════ AREA CLUSTERING BONUS ══════════════
function getAreaClusteringBonus(currentArea: string | null, loc: DelhiLocation): number {
  if (!currentArea) return 1.0;
  // Prefer staying in the same area to reduce transit
  if (currentArea === loc.area) return 1.3;
  // Adjacent areas get a small bonus
  const adjacencyMap: Record<string, string[]> = {
    'central': ['old-delhi', 'south', 'east'],
    'old-delhi': ['central', 'north'],
    'south': ['central', 'west'],
    'north': ['old-delhi', 'west'],
    'east': ['central', 'north'],
    'west': ['south', 'north'],
  };
  if (adjacencyMap[currentArea]?.includes(loc.area)) return 1.1;
  return 0.8;
}

export function generateItinerary(
  input: UserInput,
  simulation: SimulationState
): Itinerary {
  const effectiveTime = getEffectiveTime(input, simulation);
  const userPos = input.location ?? { lat: 28.6315, lng: 77.2167 };

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
  let currentArea: string | null = null;

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

  // ── Score each candidate (Steps C, D, E + Companion + Delhi Intelligence) ──
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

    // Delhi-specific time intelligence
    score *= getDelhiTimeScore(loc, currentTime);

    // Companion scoring
    score *= getCompanionScore(loc, input.companion);

    // Area clustering
    score *= getAreaClusteringBonus(currentArea, loc);

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

    // Metro bonus for solo/family travelers
    if (loc.metroNearby && (input.companion === 'solo' || input.companion === 'family')) {
      score *= 1.15;
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
  const chosen = scored.slice(0, Math.min(slotsRemaining + 3, scored.length));

  // Re-sort chosen by proximity using nearest-neighbor heuristic
  const ordered: typeof chosen = [];
  const remaining = [...chosen];
  let pos = currentPos;

  while (remaining.length > 0 && ordered.length < slotsRemaining) {
    let bestIdx = 0;
    let bestScore = -Infinity;
    remaining.forEach((item, idx) => {
      const d = haversineDistance(pos, item.location.coordinates);
      const proximityBonus = Math.max(0, 5 - d) * 10;
      const areaBonus = currentArea === item.location.area ? 15 : 0;
      const combinedScore = item.score + proximityBonus + areaBonus;
      if (combinedScore > bestScore) {
        bestScore = combinedScore;
        bestIdx = idx;
      }
    });
    ordered.push(remaining[bestIdx]);
    pos = remaining[bestIdx].location.coordinates;
    currentArea = remaining[bestIdx].location.area;
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

    if (!isOpenAt(item.location, startTime)) continue;

    const endTime = new Date(startTime);
    endTime.setMinutes(
      endTime.getMinutes() + item.location.estimatedVisitMinutes + VISIT_OVERHEAD_MINUTES
    );

    const badges = [...item.badges];
    if (isGoldenHour(startTime) && item.location.scenic && !badges.includes('best-view-now')) {
      badges.push('best-view-now');
    }
    if (item.location.underrated && !badges.includes('underrated-gem')) {
      badges.push('underrated-gem');
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
