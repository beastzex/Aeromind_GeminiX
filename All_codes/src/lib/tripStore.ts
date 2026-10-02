import { Trip, Leg, TripEvent, RebookingProposal } from '@/types';
import { mockTrip, mockLegs, mockEvents, mockProposal } from './mockData';
import { db } from './firebase';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

export interface Identity {
  uid: string;
  email?: string | null;
}

const DEMO_EMAIL = 'alex.vance@aeromind.ai';

// Demo account keeps the original in-memory mock trip untouched — every
// other signed-in user's data lives in Firestore under users/{uid}/...
let demoLegs: Leg[] = [...mockLegs];
let demoProposal: RebookingProposal | null = { ...mockProposal };
let demoEvents: TripEvent[] = [...mockEvents];

export function isDemo(who?: Identity | null): boolean {
  return !who || !who.email || who.email.toLowerCase() === DEMO_EMAIL;
}

function legsCol(uid: string) {
  return collection(db, 'users', uid, 'legs');
}
function eventsCol(uid: string) {
  return collection(db, 'users', uid, 'events');
}
function proposalsCol(uid: string) {
  return collection(db, 'users', uid, 'proposals');
}

export class TripStore {
  static async getTrip(who?: Identity | null): Promise<Trip> {
    if (isDemo(who)) return mockTrip;
    const uid = who!.uid;
    return {
      id: `trip_${uid}`,
      ownerUid: uid,
      title: 'My Travel Itinerary',
      companions: [],
      status: 'active',
      createdAt: Date.now(),
      homeAirport: 'DEL',
    };
  }

  static async getLegs(who?: Identity | null): Promise<Leg[]> {
    if (isDemo(who)) return demoLegs;
    const snap = await getDocs(legsCol(who!.uid));
    return snap.docs.map((d) => d.data() as Leg);
  }

  static async addLeg(leg: Leg, who?: Identity | null): Promise<Leg> {
    if (isDemo(who)) {
      demoLegs = [leg, ...demoLegs];
    } else {
      await setDoc(doc(legsCol(who!.uid), leg.id), leg);
    }

    await this.addEvent(
      {
        id: `evt_${Date.now()}`,
        tripId: leg.tripId,
        legId: leg.id,
        eventType: 'LEG_ADDED',
        payload: { title: leg.title, flightNo: leg.flightNo, type: leg.type },
        ts: Date.now(),
      },
      who
    );

    return leg;
  }

  static async updateLeg(
    legId: string,
    updates: Partial<Leg>,
    who?: Identity | null
  ): Promise<Leg | null> {
    let updatedLeg: Leg | null = null;

    if (isDemo(who)) {
      demoLegs = demoLegs.map((leg) => {
        if (leg.id === legId) {
          updatedLeg = { ...leg, ...updates, updatedAt: Date.now() };
          return updatedLeg;
        }
        return leg;
      });
    } else {
      const uid = who!.uid;
      const existing = await this.getLegs(who);
      const found = existing.find((l) => l.id === legId);
      if (found) {
        updatedLeg = { ...found, ...updates, updatedAt: Date.now() };
        await updateDoc(doc(legsCol(uid), legId), { ...updates, updatedAt: Date.now() });
      }
    }

    if (updatedLeg) {
      await this.addEvent(
        {
          id: `evt_${Date.now()}`,
          tripId: (updatedLeg as Leg).tripId,
          legId,
          eventType: 'LEG_UPDATED',
          payload: updates,
          ts: Date.now(),
        },
        who
      );
    }

    return updatedLeg;
  }

  static async getEvents(who?: Identity | null): Promise<TripEvent[]> {
    if (isDemo(who)) {
      return [...demoEvents].sort((a, b) => b.ts - a.ts);
    }
    const q = query(eventsCol(who!.uid), orderBy('ts', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as TripEvent);
  }

  static async addEvent(event: TripEvent, who?: Identity | null): Promise<TripEvent> {
    if (isDemo(who)) {
      demoEvents = [event, ...demoEvents];
    } else {
      await setDoc(doc(eventsCol(who!.uid), event.id), event);
    }
    return event;
  }

  static async getLatestProposal(who?: Identity | null): Promise<RebookingProposal | null> {
    if (isDemo(who)) return demoProposal;
    const q = query(proposalsCol(who!.uid), orderBy('createdAt', 'desc'), limit(1));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as RebookingProposal;
  }

  static async createProposal(
    proposal: RebookingProposal,
    who?: Identity | null
  ): Promise<RebookingProposal> {
    if (isDemo(who)) {
      demoProposal = proposal;
    } else {
      await setDoc(doc(proposalsCol(who!.uid), proposal.id), proposal);
    }

    await this.addEvent(
      {
        id: `evt_${Date.now()}`,
        tripId: proposal.tripId,
        legId: proposal.legIds[0] || 'trip',
        eventType: 'REBOOKING_PROPOSED',
        payload: { summary: proposal.summary, optionsCount: proposal.options.length },
        ts: Date.now(),
      },
      who
    );

    return proposal;
  }

  static async approveProposal(
    proposalId: string,
    chosenOptionId: string,
    who?: Identity | null
  ): Promise<boolean> {
    const proposal = await this.getLatestProposal(who);
    if (!proposal || proposal.id !== proposalId) return false;

    const chosen = proposal.options.find((o) => o.id === chosenOptionId) || proposal.options[0];
    const updatedProposal: RebookingProposal = {
      ...proposal,
      status: 'approved',
      chosenOptionId: chosen.id,
    };

    if (isDemo(who)) {
      demoProposal = updatedProposal;
      demoLegs = demoLegs.map((leg) =>
        leg.type === 'flight' && proposal.legIds.includes(leg.id)
          ? {
              ...leg,
              flightNo: chosen.flightNo,
              dep: chosen.departure,
              arr: chosen.arrival,
              status: 'onTime' as const,
              disruptionScore: 12,
              details: { ...leg.details, carrier: chosen.carrier },
              updatedAt: Date.now(),
            }
          : leg
      );
    } else {
      const uid = who!.uid;
      await setDoc(doc(proposalsCol(uid), proposal.id), updatedProposal);
      const legs = await this.getLegs(who);
      for (const leg of legs) {
        if (leg.type === 'flight' && proposal.legIds.includes(leg.id)) {
          const updates = {
            flightNo: chosen.flightNo,
            dep: chosen.departure,
            arr: chosen.arrival,
            status: 'onTime' as const,
            disruptionScore: 12,
            details: { ...leg.details, carrier: chosen.carrier },
            updatedAt: Date.now(),
          };
          await updateDoc(doc(legsCol(uid), leg.id), updates);
        }
      }
    }

    await this.addEvent(
      {
        id: `evt_${Date.now()}`,
        tripId: proposal.tripId,
        legId: proposal.legIds[0] || 'trip',
        eventType: 'REBOOKING_APPROVED',
        payload: { chosenFlight: chosen.flightNo, carrier: chosen.carrier },
        ts: Date.now(),
      },
      who
    );

    return true;
  }

  static async findDownstreamImpactedLegs(
    startLegId: string,
    who?: Identity | null
  ): Promise<string[]> {
    const legs = await this.getLegs(who);
    const visited = new Set<string>();
    const queue = [startLegId];

    while (queue.length > 0) {
      const currId = queue.shift()!;
      if (visited.has(currId)) continue;
      visited.add(currId);

      const currLeg = legs.find((l) => l.id === currId);
      if (currLeg && currLeg.dependsOn) {
        for (const depId of currLeg.dependsOn) {
          queue.push(depId);
        }
      }
    }

    return Array.from(visited);
  }
}
