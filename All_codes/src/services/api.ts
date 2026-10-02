import { TripStore, Identity, isDemo } from '@/lib/tripStore';
import { calculateDisruptionScore } from '@/lib/disruptionScore';
import { mockProposal } from '@/lib/mockData';
import { processAdvisorMessage } from '@/lib/groqClient';
import { searchFlights, parseBoardingPass } from '@/lib/apiClient';
import { Leg, RebookingProposal } from '@/types';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function simulateDisruptionApi(who?: Identity | null) {
  const legs = await TripStore.getLegs(who);
  const flightLeg = legs.find((l) => l.type === 'flight');

  if (!flightLeg) {
    return { success: false, message: 'No active flight legs to evaluate' };
  }

  const newScore = calculateDisruptionScore({
    atcCongestionOrigin: 45,
    weatherOriginCode: 50,
    delayMinutesSoFar: 85,
    historicalOtpRate: 72,
  });

  await TripStore.updateLeg(
    flightLeg.id,
    { disruptionScore: newScore, status: newScore >= 60 ? 'delayed' : 'onTime' },
    who
  );

  let proposalCreated = false;
  let impactedLegIds: string[] = [];

  if (newScore >= 60) {
    impactedLegIds = await TripStore.findDownstreamImpactedLegs(flightLeg.id, who);

    let proposal: RebookingProposal;

    if (isDemo(who)) {
      proposal = { ...mockProposal, id: `prop_${Date.now()}`, status: 'pending', createdAt: Date.now() };
    } else {
      const routeMatch = flightLeg.title.match(/\(([A-Z]{3})\).*\(([A-Z]{3})\)/);
      const query = routeMatch ? `direct flights ${routeMatch[1]} to ${routeMatch[2]}` : flightLeg.title;
      const searchRes = await searchFlights(query);
      const alternatives = searchRes.matchedFlights
        .filter((f) => f.flightNo !== flightLeg.flightNo)
        .slice(0, 2);

      const impactedLegs = legs.filter((l) => impactedLegIds.includes(l.id) && l.id !== flightLeg.id);

      proposal = {
        id: `prop_${Date.now()}`,
        tripId: flightLeg.tripId,
        legIds: [flightLeg.id, ...impactedLegs.map((l) => l.id)],
        affectedLegNames: [
          `Flight ${flightLeg.flightNo || flightLeg.title} (Delayed ${85}m)`,
          ...impactedLegs.map((l) => l.title),
        ],
        summary:
          alternatives.length > 0
            ? `Consolidated one-tap re-plan: ${alternatives.length} live alternative${alternatives.length > 1 ? 's' : ''} found for your route.`
            : `Your flight ${flightLeg.flightNo || ''} is showing an elevated disruption risk. No live alternatives were found automatically — review manually.`,
        status: 'pending',
        createdAt: Date.now(),
        rankScore: alternatives.length > 0 ? 88 : 0,
        options: alternatives.map((f, i) => ({
          id: `opt_${i}_${f.flightNo}`,
          flightNo: f.flightNo,
          carrier: f.carrier,
          departure: f.depTime,
          arrival: f.arrTime,
          price: 0,
          carbonKg: 0,
          comfortScore: 0,
          details: `${f.aircraft !== 'Not reported' ? f.aircraft : 'Aircraft not reported'} · Delay risk ${f.delayRiskPercent}% (${f.delayRiskLevel})`,
        })),
      };
    }

    await TripStore.createProposal(proposal, who);
    proposalCreated = true;
  }

  return { success: true, flightNo: flightLeg.flightNo, disruptionScore: newScore, proposalCreated, impactedLegIds };
}

export async function processRebookingApi(
  action: 'get' | 'approve',
  proposalId?: string,
  chosenOptionId?: string,
  who?: Identity | null
) {
  if (action === 'get') {
    const proposal = await TripStore.getLatestProposal(who);
    return { proposal };
  }

  if (action === 'approve') {
    if (!proposalId || !chosenOptionId) {
      throw new Error('proposalId and chosenOptionId are required for approval');
    }

    const success = await TripStore.approveProposal(proposalId, chosenOptionId, who);
    if (!success) {
      throw new Error('Proposal not found or already executed');
    }

    const updatedLegs = await TripStore.getLegs(who);
    return {
      success: true,
      message: 'Rebooking approved and executed across flight, hotel, and car legs.',
      updatedLegs,
    };
  }

  throw new Error('Invalid action parameter');
}

export async function scanBoardingPassApi(file: File | null, who?: Identity | null) {
  if (!file) {
    return { success: false, message: 'No image selected' };
  }

  const imageBase64 = await fileToBase64(file);
  const parsed = await parseBoardingPass(imageBase64, file.type);

  const newLeg: Leg = await TripStore.addLeg(
    {
      id: `leg_scanned_${Date.now()}`,
      tripId: (await TripStore.getTrip(who)).id,
      type: 'flight',
      title: `${parsed.origin} → ${parsed.destination}`,
      flightNo: parsed.flightNo,
      dep: parsed.dep,
      arr: parsed.arr,
      gate: parsed.gate,
      status: 'onTime',
      disruptionScore: 15,
      dependsOn: [],
      updatedAt: Date.now(),
      details: {
        seat: parsed.seat,
        pnr: parsed.pnr,
        terminal: parsed.terminal,
        carrier: parsed.carrier,
        gate: parsed.gate,
        aircraft: parsed.aircraft,
      },
    },
    who
  );

  return {
    success: true,
    leg: newLeg,
    message: 'Boarding pass scanned and added to Digital-Twin graph successfully.',
  };
}

export async function sendAdvisorChatApi(message: string) {
  return await processAdvisorMessage(message);
}
