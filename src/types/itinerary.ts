export type Interest = 'History' | 'Nature' | 'Food' | 'Adventure' | 'Architecture' | 'Shopping' | 'Spiritual';

export type LuggageStatus = 'no-luggage' | 'light-backpack' | 'heavy-suitcase';

export type TravelCompanion = 'solo' | 'friends' | 'family' | 'partner';

export type WeatherCondition = 'clear' | 'rain' | 'storm';
export type TrafficDensity = 'light' | 'moderate' | 'heavy';
export type CrowdLevel = 'low' | 'medium' | 'high';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface DelhiLocation {
  id: string;
  name: string;
  coordinates: Coordinates;
  categories: Interest[];
  tags: string[];
  indoor: boolean;
  shaded: boolean;
  scenic: boolean;
  rooftop: boolean;
  superStar: boolean;
  openingHour: number;
  closingHour: number;
  popularityScore: number;
  estimatedVisitMinutes: number;
  significance: string;
  bestViewingTip: string;
  companionFit: TravelCompanion[];
  kidFriendly: boolean;
  romantic: boolean;
  groupFun: boolean;
  metroNearby: boolean;
  area: 'central' | 'north' | 'south' | 'east' | 'west' | 'old-delhi';
  underrated?: boolean;
  transportTip?: string;
  nearbyFood?: string;
}

export interface LuggageStorage {
  id: string;
  name: string;
  coordinates: Coordinates;
  type: 'storage' | 'hotel-cloakroom';
}

export interface UserInput {
  location: Coordinates | null;
  locationName: string;
  currentTime: Date;
  luggageStatus: LuggageStatus;
  interests: Interest[];
  companion: TravelCompanion;
}

export interface SimulationState {
  weather: WeatherCondition;
  safetyAlert: boolean;
  trafficDensity: TrafficDensity;
  crowdLevel: CrowdLevel;
  timeOverride: Date | null;
}

export type BadgeType = 'rain-safe' | 'avoids-traffic' | 'best-view-now' | 'low-crowd' | 'underrated-gem';

export interface ItineraryStop {
  location: DelhiLocation | LuggageStorage;
  startTime: Date;
  endTime: Date;
  transitTimeMinutes: number;
  distanceKm: number;
  badges: BadgeType[];
  isLuggageStop: boolean;
}

export interface Itinerary {
  stops: ItineraryStop[];
  totalDurationMinutes: number;
  totalDistanceKm: number;
  totalStops: number;
  safetyAlert: boolean;
}

// ══════════════ SHOPPING & DEALS ══════════════

export type ShoppingCategory = 'fashion' | 'electronics' | 'handicrafts' | 'jewelry' | 'spices' | 'textiles' | 'books' | 'home-decor';

export interface ShoppingDeal {
  id: string;
  shopName: string;
  area: string;
  category: ShoppingCategory;
  dealType: 'bogo' | 'discount' | 'combo' | 'seasonal';
  title: string;
  description: string;
  originalPrice: number;
  dealPrice: number;
  validUntil: string;
  isDemo: boolean; // clearly marks demo data
  coordinates: Coordinates;
  metroNearby: boolean;
}

export interface DealBuddyRequest {
  id: string;
  dealId: string;
  userName: string;
  itemWanted: string;
  lookingForPartner: boolean;
  createdAt: Date;
}
