import { auth } from './firebase';
import { FlightSearchResult } from '@/types';

// Base URL for the native backend (server/). Empty means same-origin, which is
// what the Vite dev proxy provides — see vite.config.ts. Set
// NEXT_PUBLIC_API_BASE_URL when the API is deployed to another host.
const env = typeof process !== 'undefined' && process.env ? process.env : {};
const API_BASE = (env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

/**
 * POSTs JSON to the backend, attaching the current user's Firebase ID token so
 * the server can verify it. Firebase still owns auth — the token is minted by
 * the client SDK and verified server-side with the Admin SDK.
 */
export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  const token = await auth.currentUser?.getIdToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const message = await res
      .json()
      .then((d) => d?.error)
      .catch(() => null);
    throw new Error(message || `Request to ${path} failed (${res.status})`);
  }

  return res.json() as Promise<T>;
}

export interface ParsedBoardingPass {
  flightNo: string;
  carrier: string;
  origin: string;
  destination: string;
  dep: string;
  arr: string;
  gate?: string;
  terminal?: string;
  seat?: string;
  pnr?: string;
  aircraft?: string;
}

export interface FlightSearchResponse {
  matchedFlights: FlightSearchResult[];
  filterApplied: string;
  live: boolean;
}

export const searchFlights = (query: string) =>
  apiPost<FlightSearchResponse>('/api/flights/search', { query });

export const parseBoardingPass = (imageBase64: string, mimeType: string) =>
  apiPost<ParsedBoardingPass>('/api/boarding-pass/parse', { imageBase64, mimeType });
