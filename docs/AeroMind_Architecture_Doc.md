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

---

## 5. Voice Navigation & Voice Assistant

Two independent voice features, kept deliberately separate:

- **Voice Navigation** (`src/lib/voiceNav/`): tap-to-speak browser command
  routing via the native Web Speech API (`SpeechRecognition`). Matches a
  fixed phrase grammar against `react-router-dom`'s `useNavigate()`. Fully
  client-side — no AI call, no server round-trip.
- **Voice Assistant** (`src/lib/voice/`): push-to-talk spoken conversation,
  grounded in the same live flight data as the text advisor. Primary
  provider is the **Gemini Live API**; on connect failure it falls back to
  the **Deepgram Voice Agent API**, transparently to the user.

### Ephemeral token flow

Provider API keys (`GEMINI_API_KEY`, `DEEPGRAM_API_KEY`) live only as plain
env vars on the native backend (`server/.env`) and never reach the browser
— same principle as the rest of `server/`, no Firebase involved. The
client `POST`s to `/api/voice/token` (`server/src/lib/mintVoiceToken.ts`,
routed in `server/src/index.ts`), which exchanges the real key for a
short-lived, single-use token:

- **Gemini**: `client.authTokens.create(...)` via `@google/genai`, `uses: 1`,
  a 60s window to open the session.
- **Deepgram**: `POST /v1/auth/grant` with `ttl_seconds: 60`, returning a
  short-lived JWT.

The browser then opens the provider WebSocket directly with that token —
`@google/genai`'s `ai.live.connect()` for Gemini, `@deepgram/sdk`'s
`client.agent.v1.connect()` for Deepgram.

### Fallback

`voiceAssistantOrchestrator.ts` tries Gemini Live first (8s connect
timeout). If it fails to connect, it tears the session down and retries
against Deepgram — same audio pipeline, same UI, different provider
underneath. The panel surfaces which provider is live and, if both fail,
a combined error instead of crashing.

### Tool calling stays grounded

Both providers support client-declared function schemas
(`src/lib/voice/toolDeclarations.ts`): `get_flight_status` and
`search_flights`. When the model wants live data mid-conversation, the
client executes the call against the **same** backend routes the text
advisor uses (`apiClient.ts`'s `getFlightStatus`, `searchFlights` →
`/api/flights/status`, `/api/flights/search`) and returns the result.
If live AviationStack/OpenSky data isn't available, those routes fall back
to a small known-flight fixture set (`server/src/lib/mockFlights.ts`,
`source: 'mock'` in the response) rather than an arbitrary invention — the
voice system prompt tells the model to disclose mock results as demo data
instead of presenting them as live, matching the grounding rule in
`advisorChat.ts`.
