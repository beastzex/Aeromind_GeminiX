import * as admin from 'firebase-admin';
import { Leg } from './types';
import { calculateDisruptionScore } from './disruptionScore';
import { searchRealFlights } from './flightSearch';
import { getRealFlightStatus } from './flightStatus';
import { DEMO_FLIGHT_CONTEXT, isDemoAccount } from './demoData';
import { generateText, ProviderKeys } from './aiProviders';

export interface AdvisorChatCitation {
  toolName: string;
  source: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface AdvisorChatResult {
  reply: string;
  citations: AdvisorChatCitation[];
}

interface Keys extends ProviderKeys {
  aviationStackKey?: string;
  openSkyClientId?: string;
  openSkyClientSecret?: string;
}

async function loadRealUserLegs(uid: string): Promise<Leg[]> {
  const snap = await admin.firestore().collection('users').doc(uid).collection('legs').get();
  return snap.docs.map((d) => d.data() as Leg);
}

export async function processAdvisorChat(
  message: string,
  auth: { uid: string; email?: string | null } | undefined,
  keys: Keys
): Promise<AdvisorChatResult> {
  const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const citations: AdvisorChatCitation[] = [];
  const demo = isDemoAccount(auth?.email);

  const userLegs = demo || !auth ? [] : await loadRealUserLegs(auth.uid);
  const primaryFlightLeg = userLegs.find((l) => l.type === 'flight');

  const { matchedFlights, filterApplied, live } = keys.aviationStackKey
    ? await searchRealFlights(message, keys.aviationStackKey)
    : { matchedFlights: [], filterApplied: 'No live flight search key configured', live: false };

  let primaryFlightStatusLine = '';
  let primaryDisruptionScore: number | null = null;

  if (primaryFlightLeg?.flightNo && keys.aviationStackKey) {
    const status = await getRealFlightStatus(primaryFlightLeg.flightNo, new Date().toISOString().slice(0, 10), {
      aviationStackKey: keys.aviationStackKey,
      openSkyClientId: keys.openSkyClientId,
      openSkyClientSecret: keys.openSkyClientSecret,
    });
    primaryDisruptionScore = calculateDisruptionScore({ delayMinutesSoFar: status.delayMinutes });
    primaryFlightStatusLine = `Flight ${primaryFlightLeg.flightNo} (${primaryFlightLeg.title}): Gate ${
      status.gate || 'TBD'
    }, Terminal ${status.terminal || 'TBD'}, Delay ${status.delayMinutes}m, Disruption Risk ${primaryDisruptionScore}/100 (${
      status.source === 'unavailable' ? 'no live telemetry yet' : 'live'
    }).`;
  }

  citations.push({
    toolName: demo ? 'demo_flight_context' : 'query_realtime_flight_schedule',
    source: live
      ? 'AeroMind Live Flight Schedules & AviationStack/OpenSky Telemetry'
      : 'AeroMind Flight Schedule Engine (live search temporarily unavailable)',
    timestamp: nowStr,
    data: {
      filter: filterApplied,
      matchedCount: matchedFlights.length,
      userLegCount: userLegs.length,
    },
  });

  const formatFlightsTable = () => {
    if (matchedFlights.length === 0) {
      return 'No live flight matches were returned for this query.';
    }
    let table = `| Flight | Carrier | Route | Dep - Arr | Delay Risk % | Status |\n`;
    table += `|---|---|---|---|---|---|\n`;
    matchedFlights.forEach((f) => {
      const riskBadge =
        f.delayRiskLevel === 'High' ? '🔴 High Risk' : f.delayRiskLevel === 'Moderate' ? '🟡 Moderate' : '🟢 Low Risk';
      table += `| **${f.flightNo}** | ${f.carrier} | ${f.origin} ➔ ${f.destination} | ${f.depTime} - ${f.arrTime} | **${f.delayRiskPercent}%** (${riskBadge}) | ${f.onTimeRate} |\n`;
    });
    return table;
  };

  if (keys.geminiApiKey || keys.groqApiKey) {
    const tripContext = demo
      ? `DEMO ACCOUNT ACTIVE TRIP: Flight ${DEMO_FLIGHT_CONTEXT.flightNo} (${DEMO_FLIGHT_CONTEXT.route}), Gate ${DEMO_FLIGHT_CONTEXT.gate}, Terminal ${DEMO_FLIGHT_CONTEXT.terminal}, Delay ${DEMO_FLIGHT_CONTEXT.delayMinutes}m.`
      : userLegs.length > 0
        ? `USER'S ACTUAL ITINERARY (${userLegs.length} legs):\n${userLegs
            .map((l) => `- ${l.type.toUpperCase()}: ${l.title}${l.flightNo ? ` (${l.flightNo})` : ''} — ${l.status}`)
            .join('\n')}\n${primaryFlightStatusLine}`
        : `USER HAS NO ACTIVE TRIP LEGS YET. Do not invent a flight for them — invite them to scan a boarding pass or add a flight.`;

    const systemPrompt = `You are AeroMind Real-Time General Flight & Travel AI Assistant.
Answer EVERY user query about flights, delay predictions, non-stop schedules, aircraft specs, gates, weather, and travel rebooking using ONLY the live data provided below. Never invent flight numbers, gates, or delay figures that are not present in this context.

LIVE FLIGHT SEARCH RESULTS (${filterApplied}):
${formatFlightsTable()}

${tripContext}

GUIDELINES:
1. Use exact flight numbers, times, and risk percentages only from the data above.
2. If no matching live data is available for what the user asked, say so plainly instead of fabricating it.
3. Be professional, concise, reassuring, and articulate. Respond in GitHub Markdown.`;

    const generated = await generateText(systemPrompt, message, keys);
    if (generated) {
      citations.push({
        toolName: 'ai_model',
        source: generated.provider === 'gemini' ? 'Gemini' : 'Groq (Gemini fallback)',
        timestamp: nowStr,
        data: { provider: generated.provider },
      });
      return { reply: generated.text, citations };
    }
  }

  // Grounded fallback (no Groq key, or Groq call failed) — still uses only real data.
  let reply = '';
  const lower = message.toLowerCase();

  if (demo) {
    if (lower.includes('delay') || lower.includes('risk') || lower.includes('chance')) {
      reply = `### ⏱️ Delay Prediction & Risk Probability\n\n* **Flight ${DEMO_FLIGHT_CONTEXT.flightNo} (${DEMO_FLIGHT_CONTEXT.route})**: Disruption Risk **${DEMO_FLIGHT_CONTEXT.disruptionScore}/100**. Current Departure Delay: **${DEMO_FLIGHT_CONTEXT.delayMinutes} minutes**.`;
    } else {
      reply = `### 🌐 AeroMind Demo Telemetry\n\nYour demo trip's active flight is **${DEMO_FLIGHT_CONTEXT.flightNo}** (${DEMO_FLIGHT_CONTEXT.route}), Gate ${DEMO_FLIGHT_CONTEXT.gate}.\n\n${formatFlightsTable()}`;
    }
  } else if (userLegs.length === 0 && matchedFlights.length === 0) {
    reply = `You don't have any active trip legs yet, and live flight search is temporarily unavailable for this query. Scan a boarding pass to add a real flight, or try a more specific route (e.g. "flights DEL to SFO").`;
  } else if (primaryFlightLeg && (lower.includes('delay') || lower.includes('risk') || lower.includes('chance'))) {
    reply = primaryFlightStatusLine
      ? `### ⏱️ Delay Prediction & Risk Probability\n\n${primaryFlightStatusLine}`
      : `I found your flight ${primaryFlightLeg.flightNo}, but live delay telemetry isn't available for it right now.`;
  } else {
    reply = `### ✈️ Live Flight Search Results\n\n${formatFlightsTable()}`;
  }

  return { reply, citations };
}
