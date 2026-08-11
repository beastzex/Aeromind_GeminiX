import { Trip, Leg, TripEvent, RebookingProposal } from '@/types';
import { mockTrip, mockLegs, mockEvents, mockProposal } from './mockData';

// Safe In-Memory State for guaranteed demo stability
let memoryTrip: Trip = { ...mockTrip };
let memoryLegs: Leg[] = [...mockLegs];
let memoryEvents: TripEvent[] = [...mockEvents];
let memoryProposal: RebookingProposal | null = { ...mockProposal };

export class TripStore {
  static getTrip(_tripId?: string): Trip {
    return memoryTrip;
  }

  static getLegs(_tripId?: string): Leg[] {
    return memoryLegs;
  }

  static addLeg(leg: Leg): Leg {
    memoryLegs = [leg, ...memoryLegs];
    // Record immutable audit event
    this.addEvent({
      id: `evt_${Date.now()}`,
      tripId: leg.tripId,
      legId: leg.id,
      eventType: 'LEG_ADDED',
      payload: { title: leg.title, flightNo: leg.flightNo, type: leg.type },
      ts: Date.now(),
    });
    return leg;
  }

  static updateLeg(legId: string, updates: Partial<Leg>): Leg | null {
    let updatedLeg: Leg | null = null;
    memoryLegs = memoryLegs.map((leg) => {
      if (leg.id === legId) {
        updatedLeg = { ...leg, ...updates, updatedAt: Date.now() };
        return updatedLeg;
      }
      return leg;
    });

    if (updatedLeg) {
      this.addEvent({
        id: `evt_${Date.now()}`,
        tripId: (updatedLeg as Leg).tripId,
        legId: legId,
        eventType: 'LEG_UPDATED',
        payload: updates,
        ts: Date.now(),
      });
    }

    return updatedLeg;
  }

  static getEvents(_tripId?: string): TripEvent[] {
    return memoryEvents.sort((a, b) => b.ts - a.ts);
  }

  static addEvent(event: TripEvent): TripEvent {
    memoryEvents = [event, ...memoryEvents];
    return event;
  }

  static getLatestProposal(_tripId?: string): RebookingProposal | null {
    return memoryProposal;
  }

  static createProposal(proposal: RebookingProposal): RebookingProposal {
    memoryProposal = proposal;
    this.addEvent({
      id: `evt_${Date.now()}`,
      tripId: proposal.tripId,
      legId: proposal.legIds[0] || 'trip',
      eventType: 'REBOOKING_PROPOSED',
      payload: { summary: proposal.summary, optionsCount: proposal.options.length },
      ts: Date.now(),
    });
    return proposal;
  }

  static approveProposal(proposalId: string, chosenOptionId: string): boolean {
    if (!memoryProposal || memoryProposal.id !== proposalId) return false;

    const chosen = memoryProposal.options.find((o) => o.id === chosenOptionId) || memoryProposal.options[0];
    memoryProposal.status = 'approved';
    memoryProposal.chosenOptionId = chosen.id;

    // Traverse Digital-Twin Graph & atomic update across flight, hotel, and car
    memoryLegs = memoryLegs.map((leg) => {
      if (leg.type === 'flight' && memoryProposal?.legIds.includes(leg.id)) {
        return {
          ...leg,
          flightNo: chosen.flightNo,
          dep: chosen.departure,
          arr: chosen.arrival,
          status: 'onTime',
          disruptionScore: 12, // Risk resolved
          details: {
            ...leg.details,
            carrier: chosen.carrier,
          },
          updatedAt: Date.now(),
        };
      }
      if (leg.type === 'hotel') {
        return {
          ...leg,
          dep: 'Check-in: 19:30 PST (Shifted +1h)',
          status: 'onTime',
          updatedAt: Date.now(),
        };
      }
      if (leg.type === 'car') {
        return {
          ...leg,
          dep: 'Pickup: 20:15 PST (Shifted +1h)',
          status: 'onTime',
          updatedAt: Date.now(),
        };
      }
      return leg;
    });

    memoryTrip.status = 'active';

    this.addEvent({
      id: `evt_${Date.now()}`,
      tripId: memoryTrip.id,
      legId: memoryProposal.legIds[0] || 'trip',
      eventType: 'REBOOKING_APPROVED',
      payload: { chosenFlight: chosen.flightNo, carrier: chosen.carrier },
      ts: Date.now(),
    });

    return true;
  }

  // Traverse graph using BFS to find all affected downstream nodes
  static findDownstreamImpactedLegs(startLegId: string): string[] {
    const visited = new Set<string>();
    const queue = [startLegId];

    while (queue.length > 0) {
      const currId = queue.shift()!;
      if (visited.has(currId)) continue;
      visited.add(currId);

      const currLeg = memoryLegs.find((l) => l.id === currId);
      if (currLeg && currLeg.dependsOn) {
        for (const depId of currLeg.dependsOn) {
          queue.push(depId);
        }
      }
    }

    return Array.from(visited);
  }
}
