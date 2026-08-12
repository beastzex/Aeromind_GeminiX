import { TripStore } from '@/lib/tripStore';
import { calculateDisruptionScore } from '@/lib/disruptionScore';
import { mockProposal } from '@/lib/mockData';
import { processAdvisorMessage } from '@/lib/groqClient';
import { Leg } from '@/types';

export async function simulateDisruptionApi(userEmail?: string | null) {
  const legs = TripStore.getLegs(userEmail);
  const flightLeg = legs.find((l) => l.type === 'flight');

  if (!flightLeg) {
    return { success: false, message: 'No active flight legs to evaluate' };
  }

  // Compute updated disruption score
  const newScore = calculateDisruptionScore({
    atcCongestionOrigin: 45,
    weatherOriginCode: 50,
    delayMinutesSoFar: 85,
    historicalOtpRate: 72,
  });

  // Update flight leg disruption score
  TripStore.updateLeg(flightLeg.id, {
    disruptionScore: newScore,
    status: newScore >= 60 ? 'delayed' : 'onTime',
  }, userEmail);

  let proposalCreated = false;
  let impactedLegIds: string[] = [];

  if (newScore >= 60) {
    impactedLegIds = TripStore.findDownstreamImpactedLegs(flightLeg.id, userEmail);

    TripStore.createProposal({
      ...mockProposal,
      id: `prop_${Date.now()}`,
      status: 'pending',
      createdAt: Date.now(),
    }, userEmail);
    proposalCreated = true;
  }

  return {
    success: true,
    flightNo: flightLeg.flightNo,
    disruptionScore: newScore,
    proposalCreated,
    impactedLegIds,
  };
}

export async function processRebookingApi(
  action: 'get' | 'approve',
  proposalId?: string,
  chosenOptionId?: string,
  userEmail?: string | null
) {
  if (action === 'get') {
    const proposal = TripStore.getLatestProposal(userEmail);
    return { proposal };
  }

  if (action === 'approve') {
    if (!proposalId || !chosenOptionId) {
      throw new Error('proposalId and chosenOptionId are required for approval');
    }

    const success = TripStore.approveProposal(proposalId, chosenOptionId, userEmail);
    if (!success) {
      throw new Error('Proposal not found or already executed');
    }

    const updatedLegs = TripStore.getLegs(userEmail);
    return {
      success: true,
      message: 'Rebooking approved and executed across flight, hotel, and car legs.',
      updatedLegs,
    };
  }

  throw new Error('Invalid action parameter');
}

export async function scanBoardingPassApi(fileName?: string, userEmail?: string | null) {
  const parsedLeg = {
    flightNo: 'AI302',
    title: 'Delhi (DEL) → San Francisco (SFO)',
    dep: '14:30 IST',
    arr: '17:15 PST',
    gate: 'B22',
    pnr: 'AM987X',
    seat: '14A (Window)',
    carrier: 'Air India',
    terminal: 'T3',
  };

  const newLeg: Leg = TripStore.addLeg({
    id: `leg_scanned_${Date.now()}`,
    tripId: 'trip_user_active',
    type: 'flight',
    title: parsedLeg.title,
    flightNo: parsedLeg.flightNo,
    dep: parsedLeg.dep,
    arr: parsedLeg.arr,
    gate: parsedLeg.gate,
    status: 'onTime',
    disruptionScore: 18,
    dependsOn: [],
    updatedAt: Date.now(),
    details: {
      seat: parsedLeg.seat,
      pnr: parsedLeg.pnr,
      terminal: parsedLeg.terminal,
      carrier: parsedLeg.carrier,
      gate: parsedLeg.gate,
    },
  }, userEmail);

  return {
    success: true,
    leg: newLeg,
    message: 'Boarding pass scanned and added to Digital-Twin graph successfully.',
  };
}

export async function sendAdvisorChatApi(message: string, userEmail?: string | null) {
  return await processAdvisorMessage(message, userEmail);
}
