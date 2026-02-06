import { Coordinates, TrafficDensity } from '@/types/itinerary';

const EARTH_RADIUS_KM = 6371;

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function haversineDistance(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const calc =
    sinDLat * sinDLat +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(calc), Math.sqrt(1 - calc));
  return EARTH_RADIUS_KM * c;
}

const SPEED_KMH: Record<TrafficDensity, number> = {
  light: 30,
  moderate: 18,
  heavy: 8,
};

export function estimateTravelTimeMinutes(
  distanceKm: number,
  traffic: TrafficDensity
): number {
  const speed = SPEED_KMH[traffic];
  return Math.round((distanceKm / speed) * 60);
}

export function findNearestIndex<T extends { coordinates: Coordinates }>(
  from: Coordinates,
  locations: T[]
): number {
  let minDist = Infinity;
  let minIdx = 0;
  locations.forEach((loc, idx) => {
    const d = haversineDistance(from, loc.coordinates);
    if (d < minDist) {
      minDist = d;
      minIdx = idx;
    }
  });
  return minIdx;
}
