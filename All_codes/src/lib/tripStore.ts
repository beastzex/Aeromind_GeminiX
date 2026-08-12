import { Trip, Leg, TripEvent, RebookingProposal } from '@/types';
import { mockTrip, mockLegs, mockEvents, mockProposal } from './mockData';

// User-scoped in-memory storage maps
const userLegsStore = new Map<string, Leg[]>();
const userProposalsStore = new Map<string, RebookingProposal | null>();
const userEventsStore = new Map<string, TripEvent[]>();

// Initialize Demo Account defaults
const DEMO_EMAIL = 'alex.vance@aeromind.ai';
userLegsStore.set(DEMO_EMAIL, [...mockLegs]);
userProposalsStore.set(DEMO_EMAIL, { ...mockProposal });
userEventsStore.set(DEMO_EMAIL, [...mockEvents]);

export class TripStore {
  private static getUserKey(userEmail?: string | null): string {
    if (!userEmail || userEmail === DEMO_EMAIL) {
      return DEMO_EMAIL;
    }
    return userEmail.toLowerCase();
  }

  static getTrip(userEmail?: string | null): Trip {
    const key = this.getUserKey(userEmail);
    if (key === DEMO_EMAIL) {
      return mockTrip;
    }
    return {
      id: `trip_${key.replace(/[^a-z0-9]/g, '_')}`,
      ownerUid: key,
      title: 'My Travel Itinerary',
      companions: [],
      status: 'active',
      createdAt: Date.now(),
      homeAirport: 'DEL',
    };
  }

  static getLegs(userEmail?: string | null): Leg[] {
    const key = this.getUserKey(userEmail);
    if (!userLegsStore.has(key)) {
      if (key === DEMO_EMAIL) {
        userLegsStore.set(DEMO_EMAIL, [...mockLegs]);
      } else {
        userLegsStore.set(key, []); // New production user starts with clean 0 legs state
      }
    }
    return userLegsStore.get(key) || [];
  }

  static addLeg(leg: Leg, userEmail?: string | null): Leg {
    const key = this.getUserKey(userEmail);
    const existing = this.getLegs(key);
    const updated = [leg, ...existing];
    userLegsStore.set(key, updated);

    this.addEvent({
      id: `evt_${Date.now()}`,
      tripId: leg.tripId,
      legId: leg.id,
      eventType: 'LEG_ADDED',
      payload: { title: leg.title, flightNo: leg.flightNo, type: leg.type },
      ts: Date.now(),
    }, key);

    return leg;
  }

  static updateLeg(legId: string, updates: Partial<Leg>, userEmail?: string | null): Leg | null {
    const key = this.getUserKey(userEmail);
    const existing = this.getLegs(key);
    let updatedLeg: Leg | null = null;

    const updated = existing.map((leg) => {
      if (leg.id === legId) {
        updatedLeg = { ...leg, ...updates, updatedAt: Date.now() };
        return updatedLeg;
      }
      return leg;
    });

    userLegsStore.set(key, updated);

    if (updatedLeg) {
      this.addEvent({
        id: `evt_${Date.now()}`,
        tripId: (updatedLeg as Leg).tripId,
        legId: legId,
        eventType: 'LEG_UPDATED',
        payload: updates,
        ts: Date.now(),
      }, key);
    }

    return updatedLeg;
  }

  static getEvents(userEmail?: string | null): TripEvent[] {
    const key = this.getUserKey(userEmail);
    const events = userEventsStore.get(key) || [];
    return events.sort((a, b) => b.ts - a.ts);
  }

  static addEvent(event: TripEvent, userEmail?: string | null): TripEvent {
    const key = this.getUserKey(userEmail);
    const existing = userEventsStore.get(key) || [];
    userEventsStore.set(key, [event, ...existing]);
    return event;
  }

  static getLatestProposal(userEmail?: string | null): RebookingProposal | null {
    const key = this.getUserKey(userEmail);
    if (!userProposalsStore.has(key)) {
      return key === DEMO_EMAIL ? { ...mockProposal } : null;
    }
    return userProposalsStore.get(key) || null;
  }

  static createProposal(proposal: RebookingProposal, userEmail?: string | null): RebookingProposal {
    const key = this.getUserKey(userEmail);
    userProposalsStore.set(key, proposal);

    this.addEvent({
      id: `evt_${Date.now()}`,
      tripId: proposal.tripId,
      legId: proposal.legIds[0] || 'trip',
      eventType: 'REBOOKING_PROPOSED',
      payload: { summary: proposal.summary, optionsCount: proposal.options.length },
      ts: Date.now(),
    }, key);

    return proposal;
  }

  static approveProposal(proposalId: string, chosenOptionId: string, userEmail?: string | null): boolean {
    const key = this.getUserKey(userEmail);
    const proposal = this.getLatestProposal(key);
    if (!proposal || proposal.id !== proposalId) return false;

    const chosen = proposal.options.find((o) => o.id === chosenOptionId) || proposal.options[0];
    proposal.status = 'approved';
    proposal.chosenOptionId = chosen.id;
    userProposalsStore.set(key, proposal);

    const legs = this.getLegs(key);
    const updatedLegs = legs.map((leg) => {
      if (leg.type === 'flight' && proposal.legIds.includes(leg.id)) {
        return {
          ...leg,
          flightNo: chosen.flightNo,
          dep: chosen.departure,
          arr: chosen.arrival,
          status: 'onTime' as const,
          disruptionScore: 12,
          details: { ...leg.details, carrier: chosen.carrier },
          updatedAt: Date.now(),
        };
      }
      return leg;
    });

    userLegsStore.set(key, updatedLegs);

    this.addEvent({
      id: `evt_${Date.now()}`,
      tripId: proposal.tripId,
      legId: proposal.legIds[0] || 'trip',
      eventType: 'REBOOKING_APPROVED',
      payload: { chosenFlight: chosen.flightNo, carrier: chosen.carrier },
      ts: Date.now(),
    }, key);

    return true;
  }

  static findDownstreamImpactedLegs(startLegId: string, userEmail?: string | null): string[] {
    const key = this.getUserKey(userEmail);
    const legs = this.getLegs(key);
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
