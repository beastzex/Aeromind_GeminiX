import { FlightCacheEntry, LegStatus } from '@/types';
import { mockLegs } from './mockData';

// Shared flight cache in memory / Firestore fallback
const inMemoryFlightCache = new Map<string, FlightCacheEntry>();

export async function getLiveFlightStatus(
  flightNo: string,
  dateString: string
): Promise<FlightCacheEntry> {
  const cacheKey = `${flightNo.toUpperCase()}_${dateString}`;
  const now = Date.now();

  // 1. Check Cache (< 90 seconds old)
  const cached = inMemoryFlightCache.get(cacheKey);
  if (cached && now - cached.fetchedAt < 90000) {
    return cached;
  }

  // 2. Attempt live API call if keys are present and not in DEMO_MODE
  const isDemoMode = process.env.DEMO_MODE === 'true' || !process.env.AVIATIONSTACK_KEY;

  if (!isDemoMode) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(
        `https://api.aviationstack.com/v1/flights?access_key=${process.env.AVIATIONSTACK_KEY}&flight_iata=${flightNo}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const flightData = data?.data?.[0];
        if (flightData) {
          const entry: FlightCacheEntry = {
            flightNo_date: cacheKey,
            lastStatus: (flightData.flight_status as LegStatus) || 'onTime',
            delayMinutes: flightData.departure?.delay || 0,
            gate: flightData.departure?.gate || 'B22',
            terminal: flightData.departure?.terminal || 'T3',
            fetchedAt: now,
            source: 'live',
            lastPosition: {
              latitude: 28.5562,
              longitude: 77.1000,
              altitude: 32000,
              speedKnots: 480,
              headingDegrees: 78,
            },
          };
          inMemoryFlightCache.set(cacheKey, entry);
          return entry;
        }
      }
    } catch {
      // Graceful fallback to mock data on network error, timeout, or 401
    }
  }

  // 3. Demo / Mock Fallback (Guaranteed zero-glitch safety)
  const mockLeg = mockLegs.find((l) => l.flightNo?.toUpperCase() === flightNo.toUpperCase()) || mockLegs[0];

  const mockEntry: FlightCacheEntry = {
    flightNo_date: cacheKey,
    lastStatus: mockLeg.status,
    delayMinutes: mockLeg.status === 'delayed' ? 85 : 0,
    gate: mockLeg.details?.gate || 'B22',
    terminal: mockLeg.details?.terminal || 'T3',
    fetchedAt: now,
    source: 'mock',
    lastPosition: {
      latitude: 37.6213,
      longitude: -122.379,
      altitude: 18000,
      speedKnots: 390,
      headingDegrees: 240,
    },
  };

  inMemoryFlightCache.set(cacheKey, mockEntry);
  return mockEntry;
}
