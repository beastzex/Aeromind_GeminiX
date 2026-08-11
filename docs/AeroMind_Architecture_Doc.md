# AeroMind Architecture & Technical Specification

## 1. High-Level Architecture (HLD)

AeroMind is structured into four primary layers:

1. **Multimodal Client Layer**: Next.js 14 PWA app with React 18, Framer Motion, strict monochrome design tokens, Web Speech API audio synthesis, Canvas waveform visualization, and `DeviceOrientationEvent` AR compass.
2. **AI Agent & Gateway Layer**: Groq API orchestration (`gpt-oss-120b`) executing structured JSON tool schemas with inline data provenance citations.
3. **Data & Eventing Layer**: Firestore digital-twin itinerary graph with directed `dependsOn` edges, immutable `events` audit logs, and shared `flightCache`.
4. **Adapter & Resilience Layer**: Unified flight adapter (`flightAdapter.ts`) implementing a 3-tier fallback chain (Shared Cache $\rightarrow$ Live OpenSky/AviationStack $\rightarrow$ Mock Fixtures).

---

## 2. Low-Level Design (LLD) & Data Schemas

### Firestore Data Model

- `users/{uid}`: `name`, `email`, `prefs` (`costVsTime`, `loyaltyPrograms`, `accessibilityMode`, `homeAirport`)
- `trips/{tripId}`: `ownerUid`, `title`, `companions`, `status`, `createdAt`
- `trips/{tripId}/legs/{legId}`: `type` ('flight'|'hotel'|'car'|'meeting'), `flightNo`, `dep`, `arr`, `gate`, `status`, `disruptionScore`, `dependsOn[]`
- `trips/{tripId}/events/{eventId}`: `legId`, `eventType`, `payload`, `ts`
- `trips/{tripId}/rebookingProposals/{id}`: `options[]`, `rankScore`, `status` ('pending'|'approved'|'rejected')
- `flightCache/{flightNo_date}`: `lastPosition`, `lastStatus`, `delayMinutes`, `gate`, `terminal`, `fetchedAt`, `source`

---

## 3. Predictive Disruption Score Formula

$$Score = \text{clamp}\left(0.40 \cdot ATC + 0.25 \cdot Weather + 0.20 \cdot Delay + 0.15 \cdot HistoricalOTP,\, 0,\, 100\right)$$

- **ATC Congestion**: Average delay rate at origin and destination airports.
- **Weather Severity**: Highest OpenWeather severity code between origin and destination.
- **Delay Minutes**: Scaled linear ratio of current departure delay ($\ge 120\text{m} \rightarrow 100$).
- **Historical OTP**: Risk inverse of airline/route historical on-time percentage ($100 - OTP$).

When $Score \ge 60$, the system automatically triggers BFS graph traversal across `dependsOn` edges to flag downstream hotel and car nodes as affected, pre-generating a consolidated rebooking proposal.

---

## 4. Groq Function-Calling Tool Schemas

```json
[
  {
    "name": "get_live_flight_status",
    "description": "Get real-time position, gate, delay minutes, and disruption score for a flight.",
    "parameters": { "flightNo": "string", "date": "string" }
  },
  {
    "name": "search_alternative_flights",
    "description": "Search ranked alternative candidate flights during a disruption.",
    "parameters": { "origin": "string", "destination": "string", "notBefore": "string" }
  },
  {
    "name": "propose_rebooking",
    "description": "Write a pendingApproval rebooking document across flight, hotel, and car legs.",
    "parameters": { "tripId": "string", "legId": "string", "chosenOptionId": "string" }
  },
  {
    "name": "approve_rebooking",
    "description": "Human-confirmed approval step executing atomic updates across itinerary nodes.",
    "parameters": { "proposalId": "string", "chosenOptionId": "string" }
  },
  {
    "name": "get_walking_eta",
    "description": "Calculate walking distance and ETA between terminal gates.",
    "parameters": { "fromGate": "string", "toGate": "string" }
  }
]
```
