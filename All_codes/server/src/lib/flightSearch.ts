import { FlightSearchResult } from './types';
import { searchMockFlights } from './mockFlights';

const AIRPORT_KEYWORDS: Record<string, string> = {
  sfo: 'SFO',
  'san francisco': 'SFO',
  jfk: 'JFK',
  'new york': 'JFK',
  del: 'DEL',
  delhi: 'DEL',
  lax: 'LAX',
  'los angeles': 'LAX',
  lhr: 'LHR',
  london: 'LHR',
  fra: 'FRA',
  frankfurt: 'FRA',
  sin: 'SIN',
  singapore: 'SIN',
  dxb: 'DXB',
  dubai: 'DXB',
};

interface ParsedQuery {
  startHour: number;
  endHour: number;
  nonStopOnly: boolean;
  origin?: string;
  destination?: string;
}

export function parseFlightQuery(queryText: string): ParsedQuery {
  const lower = queryText.toLowerCase();

  let startHour = 0;
  let endHour = 23;
  if (lower.includes('9 am') || lower.includes('9am') || lower.includes('9:00')) {
    startHour = 9;
    endHour = 10;
  } else if (lower.includes('morning')) {
    startHour = 6;
    endHour = 12;
  } else if (lower.includes('afternoon')) {
    startHour = 12;
    endHour = 17;
  } else if (lower.includes('evening') || lower.includes('night')) {
    startHour = 17;
    endHour = 23;
  }

  const nonStopOnly =
    lower.includes('direct') || lower.includes('non stop') || lower.includes('non-stop');

  const mentioned = Object.keys(AIRPORT_KEYWORDS).filter((kw) => lower.includes(kw));
  const codes = Array.from(new Set(mentioned.map((kw) => AIRPORT_KEYWORDS[kw])));

  return {
    startHour,
    endHour,
    nonStopOnly,
    origin: codes[0],
    destination: codes[1],
  };
}

function delayRiskFromMinutes(delayMinutes: number | null | undefined): {
  percent: number;
  level: FlightSearchResult['delayRiskLevel'];
} {
  if (delayMinutes === null || delayMinutes === undefined) {
    return { percent: 15, level: 'Low' };
  }
  const percent = Math.min(95, Math.round((delayMinutes / 90) * 100) + 5);
  const level = percent >= 60 ? 'High' : percent >= 30 ? 'Moderate' : 'Low';
  return { percent, level };
}

function formatTime(iso?: string | null): string {
  if (!iso) return 'TBD';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'TBD';
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export async function searchRealFlights(
  queryText: string,
  aviationStackKey: string
): Promise<{ matchedFlights: FlightSearchResult[]; filterApplied: string; live: boolean }> {
  const { startHour, endHour, nonStopOnly, origin, destination } = parseFlightQuery(queryText);
  const filterApplied = `Filter: ${nonStopOnly ? 'Direct Non-Stop' : 'All Flights'} | Departure Window: ${
    startHour > 0 ? `${startHour}:00 - ${endHour}:00` : '24-Hour Range'
  }${origin ? ` | Origin: ${origin}` : ''}${destination ? ` | Destination: ${destination}` : ''}`;

  const params = new URLSearchParams({ access_key: aviationStackKey, limit: '15' });
  if (origin) params.set('dep_iata', origin);
  if (destination) params.set('arr_iata', destination);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const res = await fetch(`https://api.aviationstack.com/v1/flights?${params.toString()}`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { matchedFlights: searchMockFlights({ origin, destination, startHour, endHour }), filterApplied, live: false };
    }

    const json = (await res.json()) as { data?: unknown[] };
    const rows = Array.isArray(json.data) ? json.data : [];

    let results: FlightSearchResult[] = rows.map((row) => {
      const r = row as Record<string, any>;
      const dep = r.departure ?? {};
      const arr = r.arrival ?? {};
      const airline = r.airline ?? {};
      const flight = r.flight ?? {};
      const depTimeIso: string | null = dep.scheduled ?? null;
      const depHour = depTimeIso ? new Date(depTimeIso).getUTCHours() : 0;
      const risk = delayRiskFromMinutes(dep.delay ?? null);

      return {
        flightNo: flight.iata || flight.icao || 'N/A',
        carrier: airline.name || 'Unknown Carrier',
        origin: dep.iata || origin || '???',
        originName: dep.airport || dep.iata || 'Unknown Origin',
        destination: arr.iata || destination || '???',
        destinationName: arr.airport || arr.iata || 'Unknown Destination',
        depTime: formatTime(dep.scheduled),
        arrTime: formatTime(arr.scheduled),
        depHour,
        type: 'Direct Non-Stop',
        aircraft: r.aircraft?.iata || 'Not reported',
        gate: dep.gate || 'TBD',
        terminal: dep.terminal || 'TBD',
        delayRiskPercent: risk.percent,
        delayRiskLevel: risk.level,
        delayReason:
          dep.delay > 0
            ? `Currently running ${dep.delay}m behind schedule`
            : 'No reported delay at origin',
        duration: 'N/A',
        onTimeRate: dep.delay ? 'Delayed today' : 'On schedule',
      };
    });

    if (startHour > 0 || endHour < 23) {
      results = results.filter((f) => f.depHour >= startHour && f.depHour <= endHour);
    }

    if (results.length === 0) {
      return { matchedFlights: searchMockFlights({ origin, destination, startHour, endHour }), filterApplied, live: false };
    }

    return { matchedFlights: results.slice(0, 8), filterApplied, live: true };
  } catch {
    return { matchedFlights: searchMockFlights({ origin, destination, startHour, endHour }), filterApplied, live: false };
  }
}
