# AeroMind — Project Description

## Inspiration

Every frequent flyer knows the same story: a boarding pass in one app, a hotel confirmation in an email, a gate change buried in a push notification you didn't see, and a car rental you have to fix yourself when the flight above it slips. Airports are one of the last places where "smart" technology still means five disconnected apps and a stressed-out human doing the integration work in their head. We wanted to know what travel looks like if an AI agent actually *owns* the itinerary end-to-end — reading your documents, watching your flight before the airline says anything is wrong, and fixing the whole day (not just the one leg) with a single tap of approval. That question became AeroMind, built for the Gemini X Prize Hackathon as a "physical AI" concierge rather than another chatbot bolted onto a booking site.

## What it does

AeroMind is a multimodal travel concierge that turns a trip into a living, connected graph instead of a pile of separate bookings:

- **Boarding Pass & Document Vision Scanner** — snap or upload a boarding pass and Gemini Vision extracts flight number, date, PNR, seat, and gate, auto-populating the itinerary.
- **Real-Time Conversational Flight Advisor** — a persistent chat/voice surface (`/advisor`) that answers questions like *"Will my connection be tight?"* or *"Is AI302 in the air?"* with grounded, cited answers pulled live from OpenSky ADS-B data and AviationStack, not hallucinated guesses.
- **Predictive Disruption Score** — a 0–100 risk score per flight leg, computed from live ATC congestion, weather severity, current delay minutes, and historical on-time performance, shown as an animated ring gauge that pulses once risk crosses 60.
- **Digital-Twin Itinerary Graph** — every trip is modeled in Firestore as dependency nodes (`dependsOn`: flight → hotel → car → meeting). One disruption triggers a graph traversal that flags every downstream node as affected, not just the flight.
- **Autonomous Rebooking with Human Approval** — the agent ranks alternative flights by cost, time, carbon footprint, and comfort, and proposes one consolidated re-plan across flight + hotel + car. Nothing is booked until the traveler taps "Approve."
- **Gate-Change Whisper Alerts & Walking ETA** — ambient voice nudges paired with a walking-ETA-vs-boarding-time countdown.
- **AR Gate Compass** — a camera overlay with a device-orientation-driven directional arrow for wayfinding through unfamiliar terminals.
- **Post-Trip AI Journal** — an auto-compiled, scroll-animated story of the trip generated from scanned documents and timeline events.
- **Voice Navigation** — tap-to-speak browser commands ("open the advisor", "scan my pass", "go to dashboard") routed instantly through the native Web Speech API against a fixed phrase grammar. Fully client-side: no AI call, no network round-trip, no latency.
- **Voice Assistant** — a push-to-talk spoken conversation, grounded in the same live flight data as the text advisor. **Gemini Live** is the primary provider; if the session fails to connect, it transparently falls back to the **Deepgram Voice Agent API** with the same audio pipeline and UI. Both providers can invoke live tool calls (`get_flight_status`, `search_flights`) mid-conversation, and the panel shows which provider is currently live.

## How we built it

The frontend is a React 18 + Vite + TypeScript single-page app styled with Tailwind CSS and Framer Motion, deliberately built around a strict monochrome (`#0A0A0A` / `#FFFFFF`) design system with Poppins typography — letting motion, weight, and iconography (Lucide) carry state instead of color badges. Firebase/Firestore backs authentication and the itinerary data model (users, trips, legs, events, rebooking proposals, and a shared flight-status cache).

On the AI side we run a dual-provider model: **Gemini** (`gemini-3.1-flash-lite`, via `@google/genai`) is the primary engine for both text reasoning and vision (boarding-pass parsing), with **Groq** (`gpt-oss-120b` for text, a Qwen vision model for fallback OCR) as an automatic failover so a single provider outage never breaks the demo. A small Express/TypeScript API server (`server/`) wraps flight search, live flight status, boarding-pass parsing, and the advisor chat endpoint behind this provider-abstraction layer, with request logging middleware for observability. The disruption score is a weighted formula — `0.40·ATC + 0.25·Weather + 0.20·Delay + 0.15·HistoricalOTP` — computed independently in both the server and a Firebase Cloud Functions layer intended for background polling. A unified flight adapter implements a three-tier fallback chain (shared cache → live API → mock fixtures) so the app degrades gracefully instead of crashing when external flight APIs are rate-limited or unreachable.

Voice is split into two deliberately independent systems. **Voice Navigation** (`src/lib/voiceNav/`) is pure client-side command routing — the browser's native `SpeechRecognition` transcript is matched against a keyword grammar (`commands.ts`) and dispatched either as a `react-router-dom` navigation or an in-page action via a small action bus, with zero AI involvement. **Voice Assistant** (`src/lib/voice/`) is a real spoken conversation: `voiceAssistantOrchestrator.ts` first tries the **Gemini Live API** (`ai.live.connect()` from `@google/genai`, 8s connect timeout) and, on failure, transparently retries against the **Deepgram Voice Agent API** (`@deepgram/sdk`) over the same audio pipeline and UI. Provider API keys never reach the browser — the client calls `POST /api/voice/token` (`server/src/lib/mintVoiceToken.ts`), which exchanges the real `GEMINI_API_KEY`/`DEEPGRAM_API_KEY` for a short-lived, single-use token (a 60s-window `authTokens.create()` for Gemini, a 60s-TTL JWT via Deepgram's `/v1/auth/grant`) before the browser opens the provider WebSocket directly. Both voice providers share the same function-calling tool declarations and the same flight-status/search backend routes as the text advisor, and are instructed to disclose mock-fixture data as demo data rather than presenting it as live.

## Challenges we ran into

- **Grounding an LLM in real-time data without letting it hallucinate.** The Flight Advisor needed every answer to be traceable to an actual tool call and timestamp, not a plausible-sounding guess — this shaped the function-calling schema (`get_live_flight_status`, `search_alternative_flights`, `propose_rebooking`, `approve_rebooking`, `get_walking_eta`) from the start.
- **Making disruption cascade correctly.** A delay on one flight leg has to propagate through the `dependsOn` graph to hotel and car nodes without over- or under-triggering — tuning the graph traversal and the 60-point alert threshold took iteration.
- **Free-tier API reliability.** OpenSky and other open flight-tracking sources have rate limits and coverage gaps, which pushed us toward the shared Firestore flight cache and the multi-tier fallback-to-mock-fixtures design so a hackathon demo never dies on a flaky third-party API.
- **Keeping "autonomous" actually safe.** An agent that can rebook flights is powerful and risky — we had to draw a hard line so the agent can *search and propose* on its own but never *execute* a booking without an explicit one-tap human approval.
- **Provider failover under time pressure.** Wiring Gemini as primary with Groq as a silent fallback for both text and vision meant handling partial failures (empty responses, bad keys, timeouts) without surfacing broken UI mid-demo.
- **Real-time voice without leaking secrets.** A spoken conversation needs the browser to hold a live WebSocket to Gemini Live or Deepgram directly (no server relay for audio latency reasons), but the raw provider API keys can never touch client code. That forced an ephemeral-token minting flow — the server exchanges a real key for a single-use, 60-second token per session — adding real security-engineering surface to what looked like a "just add voice" feature.
- **Two voice systems that must never be confused.** Tap-to-speak navigation ("open the advisor") and push-to-talk conversation ("will my connection be tight?") both live in the mic UI, so keeping Voice Navigation (instant, client-only, zero AI) cleanly separate from the Voice Assistant (AI-grounded, provider-backed) — in code, in UX, and in latency expectations — took a deliberate architectural split rather than one blended "voice mode."

## Accomplishments that we're proud of

- A genuinely multimodal agent — vision (document scanning), conversational reasoning grounded in live data, and physical-world context (AR wayfinding, walking ETA) — rather than a single chat window wrapped around a prompt.
- The **digital-twin itinerary graph**, which reframes disruption recovery as a whole-day re-plan (flight + hotel + car in one approval) instead of three separate broken bookings the traveler has to fix manually.
- A resilient architecture with automatic AI-provider failover and a tiered data-fallback chain, so the demo stays stable even when external services aren't.
- A working spoken-conversation Voice Assistant with Gemini Live as primary and automatic Deepgram fallback — including a proper ephemeral-token flow so no provider key is ever exposed to the browser — alongside a completely separate, zero-latency Voice Navigation layer for instant browser commands.
- A distinctive, consistent monochrome design system with real motion and typographic craft, executed across every screen instead of a handful of hero shots.
- Shipping a working end-to-end slice — scan → live status → predictive risk → proposed rebooking → approval — in hackathon time.

## What we learned

- Human-in-the-loop approval isn't a UX afterthought for an agentic system — it's the core trust mechanism that makes autonomous booking acceptable at all.
- Designing for graceful degradation (cache → live → mock) early made every other feature easier to demo and debug, because no downstream component ever had to special-case "the API is down."
- A strict, opinionated design system (no accent colors, one typeface) is a force multiplier for a small team — it removes an entire category of decisions and still reads as polished.
- Grounding matters more than model choice: citing the data source and timestamp behind every AI answer builds more user trust than a marginally better model would.

## What's next for AeroMind

- Move from push-to-talk to proactive voice: let the Gemini Live session interject unprompted ("your gate just changed") instead of only responding when the mic is held.
- Expand the voice tool-calling surface beyond `get_flight_status`/`search_flights` to cover rebooking proposals and approval, so a trip can be re-planned entirely by voice.
- Move disruption polling into Cloud Scheduler + Pub/Sub for true background monitoring even when the app is closed, rather than client-triggered checks.
- Real AR indoor wayfinding using Gemini Vision to read wall signage as anchor points, paired with Google Maps Platform indoor routing.
- Co-traveler sync for group trips, with shared live maps and divergence alerts ("your companion is stuck at security").
- Carbon- and comfort-aware ranking refinements, plus an airport crowd/security-wait predictor for personalized "leave by" recommendations.
- Offline-first Firestore persistence so the itinerary and last-known flight status stay usable in airport dead zones.
- Real payment/booking-API integration behind the existing approval gate, moving from proposal-only to fully executed rebooking.
