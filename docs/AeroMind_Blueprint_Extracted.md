AEROMIND
The Physical AI Travel Concierge
A Gemini-powered multimodal agent that sees, hears, reasons and acts across your entire journey

Project Overview · System Architecture (HLD & LLD) · Feature Specification · Tech Stack · UI Design System
Prepared for: Gemini X Prize Hackathon Submission
Document Version 1.0


Table of Contents
TOC \h \o "1-3"



1. Executive Summary
AeroMind is an autonomous, multimodal travel companion built on Gemini that perceives the physical world through a phone's camera, microphone, and location sensors, reasons about a traveler's live itinerary, and acts on their behalf — rebooking flights, updating hotels, guiding them to gates, and warning them before a disruption ever becomes visible on an airport board. It moves beyond the chatbot paradigm into a genuine physical-AI agent: an assistant that operates in the real world, not just in a text box.
This document refines the original concept into a hackathon-ready, judge-defensible solution: it defines the complete feature set (including entirely new capabilities such as predictive disruption scoring, cascading digital-twin rebooking, AR wayfinding, and a real-time conversational Flight Advisor built on open flight-tracking data), the full technology stack, a High-Level Design (HLD) and Low-Level Design (LLD), Firestore data models, API contracts, and a UI design system built around a strict black-and-white aesthetic with Poppins typography and motion-rich open-source React component libraries.
2. Problem Statement
Fragmented information: boarding passes, gate boards, emails, and hotel confirmations live in five different apps and none of them talk to each other.
Reactive, not proactive: travelers find out about a delay or gate change only when they physically look at a screen — by then it may be too late to act.
Disruption is a full-day problem, not a flight problem: a missed connection cascades into a missed hotel check-in, missed meeting, and a frantic scramble across three different customer-service lines.
Airports are physically confusing: unfamiliar terminals, foreign-language signage, and long unpredictable security queues cause avoidable stress and missed flights.
3. Solution Overview
AeroMind is delivered as a responsive React web application (installable as a PWA) that acts as a single pane of glass across a trip. It combines four perceptual channels — vision, voice, location, and structured data — with a Gemini-orchestrated agent layer that can call real tools: search flights, query live tracking data, rebook, message hotels, and push notifications. A background monitoring layer (Cloud Functions + Pub/Sub) watches every leg of a trip continuously, even while the app is closed, and wakes the agent the instant something changes.
3.1 Core Pillars
Perceive: Gemini Vision reads boarding passes, itineraries, emails, and physical gate/departure signage.
Converse: Gemini Live provides low-latency, proactive, natural voice interaction — including a real-time "Ask My Flight Anything" advisor.
Reason: Gemini function calling orchestrates flight search, weather, historical on-time data, and rebooking APIs to decide the best course of action.
Act: the agent autonomously (with one-tap human confirmation for anything irreversible) rebooks flights, updates hotel dates, and notifies the traveler and their companions.
4. Refined & Innovative Feature Set
Beyond the original scan-and-notify concept, the following features differentiate AeroMind and are designed specifically to stand out in hackathon judging.
4.1 Real-Time Conversational Flight Advisor (new)
A persistent chat/voice surface, always accessible, where a traveler can ask literally anything about their trip in natural language — "Will my connection be tight?", "Is this plane in the air yet?", "What's the on-time rate for this route?", "Why is my flight delayed?" — and get a grounded, cited answer synthesized from live open flight-tracking data.
Data sources: OpenSky Network (free, open ADS-B live position data), AviationStack / FlightAware AeroAPI (schedules, gate, status), OpenWeather (enroute and destination weather), and historical on-time-performance datasets.
Grounded answers: Gemini function calling fetches live data per question rather than hallucinating — every answer is traceable to a tool call and timestamp.
Proactive interjections: the advisor doesn't just wait to be asked; via Gemini Live it can interrupt with a short spoken alert when something the traveler cares about changes.
4.2 Predictive Disruption Score (new)
Rather than waiting for an airline to announce a delay, AeroMind continuously computes a 0–100 disruption-risk score per flight leg by combining live ATC/weather congestion at origin and destination, the aircraft's current live position versus scheduled departure, and that route/airline's historical on-time performance. When the score crosses a threshold, the agent proactively begins pre-computing rebooking alternatives — before the airline even announces the delay.
4.3 Digital-Twin Itinerary Graph & Cascading Re-Planning (new)
Every trip is modeled in Firestore as a dependency graph of nodes — flight legs, hotel stays, car rentals, ground transfers, meetings — with directed edges representing time dependencies. A single disruption event triggers a graph traversal: the agent recalculates every downstream node, not just the flight, and proposes a single consolidated re-plan (new flight + shifted hotel check-in + updated car rental) for one-tap approval, instead of forcing the traveler to fix each booking separately.
4.4 AR Wayfinding Overlay (new)
Using the phone camera combined with Gemini Vision (to read wall signage as a coordinate anchor) and Google Maps Platform indoor routing, AeroMind renders live AR directional arrows over the camera feed to guide travelers to their gate, restroom, or lounge — accounting for a real-time walking-pace-aware countdown against boarding time.
4.5 Gate-Change Whisper Alerts & Walking ETA
Ambient, low-friction Gemini Live voice nudges calculated against live indoor walking distance: "Gate changed to C14 — that's an 8-minute walk and boarding starts in 12. Leave now."
4.6 Autonomous Rebooking Negotiation Agent
Detect: Pub/Sub event fires on cancellation/severe delay.
Search: function calling queries multiple flight-search and hotel APIs in parallel.
Rank: options are scored against traveler preferences — cost, arrival time, loyalty program, layover comfort, and carbon emissions.
Confirm: a single push notification presents the top option with a one-tap Approve / See Alternatives action — the agent never spends money without explicit human confirmation.
Execute & notify: on approval, Cloud Functions call the booking APIs, update Firestore, and notify all trip companions.
4.7 Co-Traveler Sync
Trips can be shared with a group. All members see a merged itinerary and live map; the agent flags when members are diverging from each other (e.g., one is stuck at security) and can proactively suggest the group split or wait.
4.8 Carbon & Comfort-Aware Rebooking
Every alternative flight surfaced during rebooking is scored not only on price and time but also on estimated CO₂ emissions and layover comfort (seat pitch, lounge access, terminal quality), so disruption recovery aligns with traveler values, not just the airline's default choice.
4.9 Airport Crowd & Security-Wait Predictor
Crowdsourced check-ins combined with historical time-of-day security-line data feed a personalized "leave for the airport by" recommendation, delivered the night before and re-confirmed the morning of the flight.
4.10 Accessibility & Emergency Mode
A high-contrast, large-text, voice-first mode with haptic gate-proximity buzzes, designed for visually impaired or anxious travelers — demonstrating inclusive design, a strong judging signal.
4.11 Multimodal Inbox Ingestion
Travelers can forward any confirmation email or screenshot to a dedicated trip inbox; Gemini Vision + text extraction automatically parses and merges it into the Firestore itinerary graph with zero manual entry.
4.12 Post-Trip AI Travel Journal
At trip end, Gemini automatically compiles a shareable digital journal from scanned boarding passes, photos, and timeline events — turning operational data exhaust into a delightful keepsake, and giving the demo a strong emotional closing beat.
4.13 Offline-First Resilience
Firestore offline persistence caches the active itinerary, maps, and last-known flight status so the app remains usable in airport dead zones and airplane mode.
5. Google & Open-Source Technology Stack


Layer

Technology

Purpose

Multimodal Perception

Gemini Vision (Vertex AI)

Reads boarding passes, itineraries, emails, gate/departure signage

Conversational AI

Gemini Live API

Low-latency proactive voice interaction, Flight Advisor voice mode

Agent Orchestration

Gemini 2.x Function Calling

Flight search, rebooking, notification tool invocation

Backend Compute

Firebase Cloud Functions

Event handlers, rebooking agent, disruption scoring

Eventing

Cloud Pub/Sub

Real-time flight-status change events, gate-change events

Database

Firestore

Trip graph, itinerary, user context, offline cache

Scheduling

Cloud Scheduler

Periodic flight-status polling per active leg

Push Notifications

Firebase Cloud Messaging (FCM)

Proactive alerts to traveler and companions

Maps & Wayfinding

Google Maps Platform (Directions, Places, Indoor Maps)

Gate navigation, walking ETA, indoor routing

AR

ARCore + Google Maps Platform

Camera-overlay wayfinding arrows

Live Flight Tracking

OpenSky Network API (open source)

Real-time ADS-B aircraft position data

Flight Schedule & Status

AviationStack / FlightAware AeroAPI

Gate, terminal, delay, and status data

Weather

OpenWeather API

Enroute & destination weather for disruption scoring

Auth

Firebase Authentication

Traveler and co-traveler group identity

Frontend Framework

React 18 + Next.js 14

Web application shell, SSR/PWA

Styling

Tailwind CSS

Utility-first styling engine

UI Component Libraries

ReactBits + Lightswind UI + shadcn/ui

Animated, accessible component primitives

Motion

Framer Motion

Page transitions, card and scroll animations

Icons

Lucide Icons

Iconography across the interface

Typography

Poppins (Google Fonts)

Sole typeface across the product

Deployment

Firebase Hosting + Cloud Run

Web app and backend function hosting
6. High-Level Design (HLD)
The system is organized into four layers: a multimodal client, a Gemini agent gateway, a tool/function layer of Cloud Functions, and a data/eventing layer backed by Firestore and Pub/Sub, sitting on top of external live-data sources.


Figure 1 — AeroMind High-Level Architecture
6.1 Layer Responsibilities
Client Layer: captures camera frames, microphone audio, and GPS/AR data; renders the React UI; maintains a local offline cache.
Agent Gateway: a Vertex AI–hosted Gemini endpoint that receives multimodal input, maintains conversation/agent state, and issues function calls to backend tools.
Tool Layer: stateless Cloud Functions, each wrapping one capability (flight lookup, rebooking, notification, maps, weather/OTP prediction) and exposed to Gemini as a callable function schema.
Data & Eventing Layer: Firestore stores the itinerary graph and trip context; Pub/Sub carries status-change events between the polling layer and the agent; Cloud Scheduler triggers periodic polling of active flight legs.
7. Low-Level Design (LLD)
7.1 Firestore Data Model


Collection

Document Fields

Notes

users/{uid}

name, email, prefs{costVsTime, loyaltyPrograms, accessibilityMode}, homeAirport

Traveler profile & preferences used for ranking

trips/{tripId}

ownerUid, companions[], status, createdAt

Root of the digital-twin itinerary graph

trips/{tripId}/legs/{legId}

type(flight|hotel|car|meeting), flightNo, dep, arr, gate, status, disruptionScore, dependsOn[]

Graph node; dependsOn links form the dependency edges

trips/{tripId}/events/{eventId}

legId, eventType, payload, ts

Immutable audit log of every status change and agent action

trips/{tripId}/rebookingProposals/{id}

options[], rankScore, status(pending|approved|rejected)

Human-in-loop approval queue for agent actions

flightCache/{flightNo_date}

lastPosition, lastStatus, fetchedAt

Shared cache to reduce external API calls across users on the same flight
7.2 Gemini Function-Calling Schema (excerpt)
Each tool exposed to the Gemini agent is declared with a strict JSON schema. Representative examples:
get_live_flight_status(flightNo, date): returns live position, gate, delay minutes, and disruption score — backed by OpenSky + AeroAPI.
search_alternative_flights(origin, destination, notBefore, prefs): returns ranked candidate flights (cost, time, carbon, comfort).
propose_rebooking(tripId, legId, chosenOptionId): writes a pendingapproval document; never books without a subsequent approve_rebooking call.
approve_rebooking(proposalId): human-confirmed action; triggers the actual booking-API call and cascades updates to dependent legs.
get_walking_eta(fromGate, toGate): Maps Platform indoor-directions wrapper used for whisper alerts and AR overlay.
7.3 Key Sequence — Disruption Detection to Resolution
1. Cloud Scheduler triggers a polling Cloud Function every N minutes for each active leg.
2. The function calls AeroAPI/OpenSky; if status or ETA changed materially, it publishes a flight.status.changed event to Pub/Sub.
3. A subscriber Cloud Function updates Firestore and, if the change is disruptive, invokes the Gemini agent with trip context.
4. The agent calls search_alternative_flights and, for the digital-twin graph, walks dependsOn edges to identify affected hotel/car/meeting nodes.
5. A single consolidated rebookingProposals document is created; FCM pushes a rich notification to the traveler and companions.
6. On approval, the agent executes booking calls, updates Firestore, appends an events record, and confirms via Gemini Live voice if the app is in foreground.
7.4 API Rate & Cost Controls
Shared flightCache collection de-duplicates external API calls across all users tracking the same flight number/date.
Adaptive polling interval tightens automatically as departure approaches (e.g., every 30 min → every 2 min inside the final hour).
Disruption-score gating avoids invoking the (costlier) Gemini agent call unless the computed risk score or a real status delta crosses a threshold.
8. UI / UX Design System
The interface is deliberately monochrome, letting motion, typography, and iconography carry the personality rather than color — a distinctive, premium aesthetic that stands out against typical hackathon UIs.
8.1 Visual Language
Palette: strict black & white system — pure black (#0A0A0A) and white (#FFFFFF) as primary surfaces, with a neutral grayscale ramp (5–7 steps) for depth, borders, and disabled states. No accent color; state is communicated via weight, motion, and icon shape, not hue.
Themes: Light theme is primary/default (white surface, black text/icons); Dark theme is a full inversion (near-black surface, white text) — both share identical component geometry so switching is seamless.
Typography: Poppins exclusively, across all weights (Light–SemiBold for body, Bold for display/headings), loaded via Google Fonts with `font-display: swap`.
Component libraries: ReactBits and Lightswind UI supply animated primitives (cards, buttons, marquees, spotlight/hover effects); shadcn/ui supplies accessible base primitives (dialogs, sheets, forms) styled to match the monochrome system.
Motion: Framer Motion drives page transitions (fade + slight vertical slide), scroll-triggered reveal animations, card hover-lift with soft shadow, and a live "pulse" animation on the disruption-score ring.
Icons: Lucide, stroke-based, 1.5px weight, consistent with the linear monochrome aesthetic.
8.2 Key Screens
Home / Trip Timeline: vertical digital-twin graph rendered as a connected timeline of cards (flight → hotel → car), each with live status chip and disruption-score ring.
Flight Advisor: full-screen chat + voice interface with a live waveform indicator during Gemini Live sessions and inline citations back to data source and timestamp.
Scan: camera viewfinder with animated corner-brackets and a Gemini Vision parsing shimmer while a boarding pass/sign is analyzed.
AR Wayfinding: camera passthrough with animated directional arrow overlay and a walking-ETA vs boarding-time countdown bar.
Rebooking Approval: a single card presenting the consolidated proposal (flight + hotel + car) with a prominent Approve action and a collapsible "See alternatives" comparison table.
Trip Journal: auto-generated scrollable story layout with scroll-linked fade/parallax animations, shareable as a link or PDF.
9. Hackathon Demo Script (Suggested)
1. Scan a boarding pass on camera → itinerary auto-populates in Firestore in real time (Gemini Vision).
2. Ask the Flight Advisor aloud, "Is my flight going to be on time?" → live grounded answer with citation to OpenSky/AeroAPI data (Gemini Live + function calling).
3. Trigger a simulated delay event → watch the disruption score rise, the digital-twin graph highlight affected downstream legs, and a consolidated rebooking proposal arrive as a push notification within seconds.
4. Approve the rebooking with one tap → hotel and car legs update automatically; companion's phone receives a sync notification.
5. Walk the AR wayfinding view to the new gate with a live whisper alert countdown.
6. Close with the auto-generated Trip Journal — a strong emotional and visual closing beat for judges.
10. Risks & Mitigations


Risk

Mitigation

Free flight-tracking APIs (OpenSky) have rate limits / coverage gaps

Shared flightCache + fallback to AviationStack/AeroAPI; graceful degrade to last-known-good data with a clear "last updated" timestamp

Autonomous booking actions could be irreversible/costly if wrong

Strict human-in-loop approval gate before any booking API is called; full audit trail in events collection

Gemini Live latency in noisy airport environments

On-device VAD/noise suppression + fallback to text chat mode automatically

AR wayfinding accuracy indoors (no GPS)

Hybrid anchoring: Gemini Vision reads static wall signage as ground-truth waypoints to correct drift

Demo-day network reliability

Offline-first Firestore cache + a pre-seeded demo trip as fallback path
11. Why This Wins — Judging Alignment
Technical depth: genuine multimodal fusion (vision + voice + location) with real agentic function calling and human-in-loop safety, not a UI wrapped around a single prompt.
Novelty: predictive disruption scoring, cascading digital-twin re-planning, and AR wayfinding are not present in any existing consumer travel app.
Real-world grounding: live open flight-tracking data (OpenSky) makes the demo verifiably real, not simulated.
Polish: a distinctive, consistent monochrome design system with motion and Poppins typography signals product craft, not just a prototype.
Inclusivity: the accessibility/emergency mode broadens impact beyond the average hackathon submission.