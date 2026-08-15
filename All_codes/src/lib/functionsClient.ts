import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';
import { FlightSearchResult } from '@/types';

export const searchFlightsCallable = httpsCallable<
  { query: string },
  { matchedFlights: FlightSearchResult[]; filterApplied: string; live: boolean }
>(functions, 'searchFlights');

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

export const parseBoardingPassCallable = httpsCallable<
  { imageBase64: string; mimeType: string },
  ParsedBoardingPass
>(functions, 'parseBoardingPass');
