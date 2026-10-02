export type LegType = 'flight' | 'hotel' | 'car' | 'meeting';

export type LegStatus = 'onTime' | 'delayed' | 'cancelled' | 'boarding' | 'completed';

export interface LegDetails {
  seat?: string;
  pnr?: string;
  terminal?: string;
  gate?: string;
  aircraft?: string;
  carrier?: string;
  hotelName?: string;
  address?: string;
  roomType?: string;
  checkInTime?: string;
  carCompany?: string;
  carModel?: string;
  pickupLocation?: string;
  meetingTopic?: string;
  meetingLocation?: string;
  notes?: string;
}

export interface Leg {
  id: string;
  tripId: string;
  type: LegType;
  title: string;
  flightNo?: string;
  dep?: string;
  arr?: string;
  gate?: string;
  status: LegStatus;
  disruptionScore?: number; // 0 - 100 (for flight legs)
  dependsOn: string[]; // Leg IDs that depend on this leg
  updatedAt: number; // epoch ms
  details?: LegDetails;
}

export interface Trip {
  id: string;
  ownerUid: string;
  title: string;
  companions: string[];
  status: 'active' | 'completed' | 'disrupted';
  createdAt: number;
  homeAirport?: string;
}

export interface TripEvent {
  id: string;
  tripId: string;
  legId: string;
  eventType: string; // e.g. 'GATE_CHANGE', 'DISRUPTION_SCORE_RISING', 'REBOOKING_PROPOSED', 'REBOOKING_APPROVED'
  payload: Record<string, unknown>;
  ts: number;
}

export interface RebookingOption {
  id: string;
  flightNo: string;
  carrier: string;
  departure: string;
  arrival: string;
  price: number;
  carbonKg: number;
  comfortScore: number; // 1 - 10 scale
  details: string;
}

export interface RebookingProposal {
  id: string;
  tripId: string;
  legIds: string[]; // downstream impacted leg IDs (e.g. flight leg, hotel leg, car leg)
  affectedLegNames: string[];
  summary: string;
  options: RebookingOption[];
  chosenOptionId?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
  rankScore?: number;
}

export interface UserPreferences {
  costVsTime: 'cost' | 'balanced' | 'time';
  loyaltyPrograms: string[];
  accessibilityMode: boolean;
  homeAirport: string;
  voiceAlerts: boolean;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  prefs: UserPreferences;
}

export interface FlightCacheEntry {
  flightNo_date: string;
  lastPosition?: {
    latitude: number;
    longitude: number;
    altitude: number;
    speedKnots: number;
    headingDegrees: number;
  };
  lastStatus: LegStatus;
  delayMinutes: number;
  gate?: string;
  terminal?: string;
  fetchedAt: number;
  source: 'live' | 'mock' | 'unavailable';
}

export interface FlightSearchResult {
  flightNo: string;
  carrier: string;
  origin: string;
  originName: string;
  destination: string;
  destinationName: string;
  depTime: string;
  arrTime: string;
  depHour: number;
  type: 'Direct Non-Stop' | '1-Stop Connecting';
  aircraft: string;
  gate: string;
  terminal: string;
  delayRiskPercent: number;
  delayRiskLevel: 'Low' | 'Moderate' | 'High';
  delayReason: string;
  duration: string;
  onTimeRate: string;
}
