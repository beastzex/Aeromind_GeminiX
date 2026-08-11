import { Leg, Trip, TripEvent, RebookingProposal, UserProfile } from '@/types';

export const mockUser: UserProfile = {
  uid: 'usr_demo_77',
  name: 'Alex Vance',
  email: 'alex.vance@aeromind.ai',
  prefs: {
    costVsTime: 'time',
    loyaltyPrograms: ['AirIndia-StarAlliance-Gold', 'Hyatt-Globalist'],
    accessibilityMode: false,
    homeAirport: 'DEL',
    voiceAlerts: true,
  },
};

export const mockTrip: Trip = {
  id: 'trip_sfo_2026',
  ownerUid: 'usr_demo_77',
  title: 'SF Tech & AI Summit 2026',
  companions: ['usr_colleague_99'],
  status: 'active',
  createdAt: Date.now() - 86400000 * 2,
  homeAirport: 'DEL',
};

export const mockLegs: Leg[] = [
  {
    id: 'leg_flight_del_sfo',
    tripId: 'trip_sfo_2026',
    type: 'flight',
    title: 'Delhi (DEL) → San Francisco (SFO)',
    flightNo: 'AI302',
    dep: '14:30 IST',
    arr: '17:15 PST',
    gate: 'B22',
    status: 'delayed',
    disruptionScore: 74, // Elevated risk trigger for pulse ring demo
    dependsOn: ['leg_hotel_hyatt', 'leg_car_hertz'],
    updatedAt: Date.now() - 180000,
    details: {
      seat: '14A (Window)',
      pnr: 'AM987X',
      terminal: 'T3',
      gate: 'B22',
      aircraft: 'Boeing 777-300ER',
      carrier: 'Air India',
    },
  },
  {
    id: 'leg_hotel_hyatt',
    tripId: 'trip_sfo_2026',
    type: 'hotel',
    title: 'Grand Hyatt at SFO Airport',
    dep: 'Check-in: 18:30 PST',
    arr: 'Check-out: +2 Days',
    status: 'onTime',
    dependsOn: [],
    updatedAt: Date.now() - 180000,
    details: {
      hotelName: 'Grand Hyatt SFO',
      address: '55 S Airport Blvd, San Francisco, CA',
      roomType: 'King Executive Suite',
      checkInTime: '18:30 PST',
      notes: 'Confirmation #HY-992014',
    },
  },
  {
    id: 'leg_car_hertz',
    tripId: 'trip_sfo_2026',
    type: 'car',
    title: 'Hertz Express — Tesla Model 3',
    dep: 'Pickup: 19:15 PST',
    arr: 'Return: +2 Days',
    status: 'onTime',
    dependsOn: [],
    updatedAt: Date.now() - 180000,
    details: {
      carCompany: 'Hertz',
      carModel: 'Tesla Model 3 Long Range',
      pickupLocation: 'SFO Airport Rental Car Center, Desk 4',
      notes: 'Confirmation #HZ-77821',
    },
  },
  {
    id: 'leg_meeting_keynote',
    tripId: 'trip_sfo_2026',
    type: 'meeting',
    title: 'Keynote: Physical AI Architecture',
    dep: '09:30 PST (Tomorrow)',
    arr: '11:00 PST',
    status: 'onTime',
    dependsOn: [],
    updatedAt: Date.now() - 180000,
    details: {
      meetingTopic: 'Physical AI Architecture in Aviation & Logistics',
      meetingLocation: 'Moscone Center West, Main Stage B',
      notes: 'Speaker Check-in at 09:00 PST',
    },
  },
];

export const mockEvents: TripEvent[] = [
  {
    id: 'evt_01',
    tripId: 'trip_sfo_2026',
    legId: 'leg_flight_del_sfo',
    eventType: 'BOARDING_PASS_SCANNED',
    payload: { source: 'Gemini Vision Parser', pnr: 'AM987X', seat: '14A' },
    ts: Date.now() - 3600000 * 4,
  },
  {
    id: 'evt_02',
    tripId: 'trip_sfo_2026',
    legId: 'leg_flight_del_sfo',
    eventType: 'WEATHER_CONGESTION_DETECTED',
    payload: { location: 'DEL Airport', detail: 'High ground ATC hold due to heavy fog' },
    ts: Date.now() - 3600000 * 1.5,
  },
  {
    id: 'evt_03',
    tripId: 'trip_sfo_2026',
    legId: 'leg_flight_del_sfo',
    eventType: 'DISRUPTION_SCORE_RISING',
    payload: { previousScore: 28, newScore: 74, trigger: 'ATC delay + Enroute wind shift' },
    ts: Date.now() - 180000,
  },
];

export const mockProposal: RebookingProposal = {
  id: 'prop_opt_902',
  tripId: 'trip_sfo_2026',
  legIds: ['leg_flight_del_sfo', 'leg_hotel_hyatt', 'leg_car_hertz'],
  affectedLegNames: ['Flight AI302 (Delayed 85m)', 'Grand Hyatt SFO Check-in', 'Hertz Pickup'],
  summary: 'Consolidated one-tap re-plan: earlier non-stop connection + 2h hotel & car reservation shift.',
  status: 'pending',
  createdAt: Date.now() - 60000,
  rankScore: 94,
  options: [
    {
      id: 'opt_1_ua868',
      flightNo: 'UA868',
      carrier: 'United Airlines (Star Alliance)',
      departure: '15:10 IST',
      arrival: '17:45 PST',
      price: 0, // covered by airline disruption policy
      carbonKg: 420,
      comfortScore: 9.2,
      details: 'Direct replacement. Seat 12C assigned. Priority baggage transfer included.',
    },
    {
      id: 'opt_2_lh761',
      flightNo: 'LH761 + LH454',
      carrier: 'Lufthansa (via MUC)',
      departure: '16:30 IST',
      arrival: '20:15 PST',
      price: 120,
      carbonKg: 510,
      comfortScore: 8.5,
      details: 'Single connection in Munich (2h 10m layover). First class lounge access included.',
    },
  ],
};
