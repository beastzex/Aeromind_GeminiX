import { FlightCacheEntry, LegStatus } from './types';
import { findMockFlight } from './mockFlights';

const cache = new Map<string, FlightCacheEntry>();

async function fetchJson(url: string, timeoutMs: number): Promise<any | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// OpenSky's icao24 filter is precise (unlike scanning /states/all for "any" aircraft,
// which is what the earlier client-side implementation did) — only used when
// AviationStack has told us exactly which airframe (icao24 hex) is flying this route.
async function refreshPositionFromOpenSky(
  icao24: string,
  clientId?: string,
  clientSecret?: string
): Promise<FlightCacheEntry['lastPosition'] | null> {
  if (!clientId || !clientSecret) return null;
  try {
    const authHeader = `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`https://opensky-network.org/api/states/all?icao24=${icao24.toLowerCase()}`, {
      headers: { Authorization: authHeader },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const data = (await res.json()) as { states?: number[][] };
    const state = data?.states?.[0];
    if (!state) return null;
    return {
      latitude: state[6] ?? 0,
      longitude: state[5] ?? 0,
      altitude: state[7] ?? 0,
      speedKnots: Math.round((state[9] ?? 0) * 1.94384),
      headingDegrees: Math.round(state[10] ?? 0),
    };
  } catch {
    return null;
  }
}

export async function getRealFlightStatus(
  flightNo: string,
  dateString: string,
  keys: { aviationStackKey?: string; openSkyClientId?: string; openSkyClientSecret?: string }
): Promise<FlightCacheEntry> {
  const cacheKey = `${flightNo.toUpperCase()}_${dateString}`;
  const now = Date.now();

  const cached = cache.get(cacheKey);
  if (cached && now - cached.fetchedAt < 90000) {
    return cached;
  }

  if (keys.aviationStackKey) {
    const json = await fetchJson(
      `https://api.aviationstack.com/v1/flights?access_key=${keys.aviationStackKey}&flight_iata=${flightNo}`,
      4000
    );
    const flightData = json?.data?.[0];

    if (flightData) {
      const dep = flightData.departure ?? {};
      const live = flightData.live ?? null;
      const icao24: string | undefined = flightData.aircraft?.icao24;

      let lastPosition: FlightCacheEntry['lastPosition'] | undefined = live
        ? {
            latitude: live.latitude ?? 0,
            longitude: live.longitude ?? 0,
            altitude: live.altitude ?? 0,
            speedKnots: Math.round((live.speed_horizontal ?? 0) * 0.539957),
            headingDegrees: Math.round(live.direction ?? 0),
          }
        : undefined;

      if (icao24) {
        const fresher = await refreshPositionFromOpenSky(
          icao24,
          keys.openSkyClientId,
          keys.openSkyClientSecret
        );
        if (fresher) lastPosition = fresher;
      }

      const entry: FlightCacheEntry = {
        flightNo_date: cacheKey,
        lastStatus: (flightData.flight_status as LegStatus) || 'onTime',
        delayMinutes: dep.delay || 0,
        gate: dep.gate || undefined,
        terminal: dep.terminal || undefined,
        fetchedAt: now,
        source: 'live',
        lastPosition,
      };
      cache.set(cacheKey, entry);
      return entry;
    }
  }

  // Live data unavailable (no key, or no match) — fall back to the known
  // demo fixture set rather than leaving the caller with nothing. Only
  // recognized flight numbers get mock data; anything else stays honestly
  // "unavailable" instead of inventing a gate or delay.
  const mock = findMockFlight(flightNo);
  const entry: FlightCacheEntry = mock
    ? {
        flightNo_date: cacheKey,
        lastStatus: mock.status,
        delayMinutes: mock.delayMinutes,
        gate: mock.gate,
        terminal: mock.terminal,
        fetchedAt: now,
        source: 'mock',
      }
    : {
        flightNo_date: cacheKey,
        lastStatus: 'onTime',
        delayMinutes: 0,
        fetchedAt: now,
        source: 'unavailable',
      };
  cache.set(cacheKey, entry);
  return entry;
}
