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
  disruptionScore?: number;
  dependsOn: string[];
  updatedAt: number;
  details?: LegDetails;
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
