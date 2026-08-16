import { FlightSearchResult, LegStatus } from './types';

// Small, honest fallback set used only when live AviationStack/OpenSky data
// is unavailable (no key, or the request fails). Mirrors the app's demo
// trip (see src/lib/mockData.ts / server/src/lib/demoData.ts) so testing and
// demos never hit a dead "no live data" answer for these known flights —
// but we never invent data for a flight number that isn't in this set.
export interface MockFlightFixture {
  flightNo: string;
  carrier: string;
  origin: string;
  originName: string;
  destination: string;
  destinationName: string;
  depTime: string;
  arrTime: string;
  depHour: number;
  aircraft: string;
  gate: string;
  terminal: string;
  delayMinutes: number;
  status: LegStatus;
}

export const MOCK_FLIGHT_FIXTURES: MockFlightFixture[] = [
  {
    flightNo: 'AI302',
    carrier: 'Air India',
    origin: 'DEL',
    originName: 'Indira Gandhi Intl (DEL)',
    destination: 'SFO',
    destinationName: 'San Francisco Intl (SFO)',
    depTime: '14:30',
    arrTime: '17:15',
    depHour: 14,
    aircraft: 'Boeing 777-300ER',
    gate: 'B22',
    terminal: 'T3',
    delayMinutes: 85,
    status: 'delayed',
  },
  {
    flightNo: 'UA868',
    carrier: 'United Airlines',
    origin: 'DEL',
    originName: 'Indira Gandhi Intl (DEL)',
    destination: 'SFO',
    destinationName: 'San Francisco Intl (SFO)',
    depTime: '15:10',
    arrTime: '17:45',
    depHour: 15,
    aircraft: 'Boeing 787-9',
    gate: 'C14',
    terminal: 'T2',
    delayMinutes: 0,
    status: 'onTime',
  },
  {
    flightNo: 'LH761',
    carrier: 'Lufthansa',
    origin: 'DEL',
    originName: 'Indira Gandhi Intl (DEL)',
    destination: 'MUC',
    destinationName: 'Munich Airport (MUC)',
    depTime: '16:30',
    arrTime: '21:15',
    depHour: 16,
    aircraft: 'Airbus A350-900',
    gate: 'A5',
    terminal: 'T1',
    delayMinutes: 0,
    status: 'onTime',
  },
];

export function findMockFlight(flightNo: string): MockFlightFixture | undefined {
  const normalized = flightNo.trim().toUpperCase();
  return MOCK_FLIGHT_FIXTURES.find((f) => f.flightNo === normalized);
}

function delayRiskFromMinutes(delayMinutes: number): { percent: number; level: FlightSearchResult['delayRiskLevel'] } {
  const percent = Math.min(95, Math.round((delayMinutes / 90) * 100) + 5);
  const level = percent >= 60 ? 'High' : percent >= 30 ? 'Moderate' : 'Low';
  return { percent, level };
}

export function searchMockFlights(filter: {
  origin?: string;
  destination?: string;
  startHour: number;
  endHour: number;
}): FlightSearchResult[] {
  return MOCK_FLIGHT_FIXTURES.filter((f) => {
    if (filter.origin && f.origin !== filter.origin) return false;
    if (filter.destination && f.destination !== filter.destination) return false;
    if (filter.startHour > 0 || filter.endHour < 23) {
      if (f.depHour < filter.startHour || f.depHour > filter.endHour) return false;
    }
    return true;
  }).map((f) => {
    const risk = delayRiskFromMinutes(f.delayMinutes);
    return {
      flightNo: f.flightNo,
      carrier: f.carrier,
      origin: f.origin,
      originName: f.originName,
      destination: f.destination,
      destinationName: f.destinationName,
      depTime: f.depTime,
      arrTime: f.arrTime,
      depHour: f.depHour,
      type: 'Direct Non-Stop',
      aircraft: f.aircraft,
      gate: f.gate,
      terminal: f.terminal,
      delayRiskPercent: risk.percent,
      delayRiskLevel: risk.level,
      delayReason:
        f.delayMinutes > 0
          ? `Currently running ${f.delayMinutes}m behind schedule (mock fixture)`
          : 'No reported delay (mock fixture)',
      duration: 'N/A',
      onTimeRate: f.delayMinutes > 0 ? 'Delayed today (mock)' : 'On schedule (mock)',
    };
  });
}
