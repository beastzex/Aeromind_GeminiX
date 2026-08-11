# AeroMind — Physical AI Travel Concierge

AeroMind is an autonomous, multimodal physical-AI travel concierge that perceives the physical world through camera, microphone, and location sensors, predicts flight disruptions before airlines announce them, and executes one-tap consolidated rebooking across flights, hotels, and car rentals.

Built with **Next.js 14 (App Router)**, **React 18**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **Firebase / Firestore**, and powered by **Groq `gpt-oss-120b`**.

---

## 🌟 Key Features

1. **Boarding Pass & Document Vision Scanner**: Reads boarding pass images/camera feeds using vision processing, extracting Flight Number, Date, PNR, Seat, Gate, and auto-populates the Digital-Twin itinerary graph.
2. **Real-Time Conversational Flight Advisor**: Persistent chat and voice surface (`/advisor`) grounded in live OpenSky Network ADS-B telemetry and AviationStack API data, featuring inline tool citations and timestamps.
3. **Predictive Disruption Score**: Computes a 0–100 risk score per leg based on live ATC congestion, weather, delay minutes, and historical OTP. Renders an animated monochrome SVG ring gauge that continuously pulses when risk $\ge 60$.
4. **Digital-Twin Itinerary Graph**: Models every trip as dependency nodes (`dependsOn`). On disruption, graph traversal recalculates downstream hotel, car, and meeting nodes, highlighting affected legs in real time.
5. **Autonomous Rebooking & Human Approval**: Generates a consolidated re-plan covering alternative flights (ranked by cost, time, carbon emissions, and comfort) + hotel & car adjustments. Executes atomically upon explicit one-tap human approval.
6. **Gate-Change Whisper Alerts & Walking ETA**: Ambient low-friction voice nudges with walking ETA vs boarding countdown bar.
7. **AR Gate Compass Wayfinding**: Camera overlay with 2D directional compass arrow powered by device orientation sensors.
8. **Post-Trip AI Journal**: Auto-compiled story timeline with scroll-linked reveal animations (`/journal/trip_sfo_2026`).

---

## 🎨 Monochrome Design System

AeroMind uses a strict **Black & White (#0A0A0A / #FFFFFF)** visual design system with zero accent colors:
- **Light Theme (DEFAULT)**: Pure `#FFFFFF` background, `#0A0A0A` text and icons.
- **Dark Theme**: Pure `#0A0A0A` background, `#FFFFFF` text and icons.
- **Typography**: Google Font **Poppins** loaded globally (`300`, `400`, `500`, `600`, `700`) with zero fallback font leaks.
- **State Communication**: Weight, icon shape, motion (Framer Motion pulse & hover-lift), and grayscale contrast instead of color badges.
- **Accessibility Mode**: High-contrast, large-text, and voice-first toggle.

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18+` or `v20+`
- npm / pnpm / yarn

### Installation

```bash
# Navigate to code directory
cd All_codes

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Environment Variables (`.env`)

```env
GROQ_API_KEY=your_groq_api_key_here
OPENSKY_USERNAME=your_opensky_username
OPENSKY_PASSWORD=your_opensky_password
AVIATIONSTACK_KEY=your_aviationstack_key
OPENWEATHER_KEY=your_openweather_key
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=aeromind-demo
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:demo
DEMO_MODE=false
```

> **Note:** If `GROQ_API_KEY` or external keys are missing, AeroMind's built-in multi-level fallback chain automatically switches to high-fidelity demo fixtures, guaranteeing 100% demo stability without crashing.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎬 Hackathon Demo Script (Step-by-Step)

1. **Home Screen**: View the connected Digital-Twin itinerary graph (`AI302` flight $\rightarrow$ Grand Hyatt hotel $\rightarrow$ Hertz Tesla rental car). Toggle between Light and Dark mode using the top nav theme button.
2. **Document Scanner**: Click **Scan Pass** in the top nav, upload/capture a boarding pass image, and observe the animated vision scanning shimmer parsing details into the timeline.
3. **Conversational Advisor**: Click **Flight Advisor** or navigate to `/advisor`. Ask natural-language questions like *"Will my connection be tight?"* or *"Is AI302 in the air?"*. Notice the inline citations (`via OpenSky Network · 2m ago`) and toggle **Voice Mode** to see the audio waveform visualizer.
4. **Trigger Disruption**: On the home screen, click **Simulate Disruption**.
   - The **Disruption Score** jumps to 74/100, and the SVG ring starts pulsing.
   - Downstream hotel and car nodes highlight as **Affected — Recalculating**.
   - A **Whisper Alert** toast slides in.
5. **One-Tap Rebooking**: The **Consolidated Rebooking Proposal** modal opens. Expand **Compare All Candidate Flights** to inspect rankings by Price, Arrival Time, CO₂ Impact, and Comfort Score. Click **One-Tap Approve Rebooking** to atomically update all flight, hotel, and car legs.
6. **AR Compass Wayfinding**: Click **AR Compass** to launch the camera overlay with live device orientation compass arrow and walking ETA countdown bar.
7. **Post-Trip Journal**: Click **Trip Journal** to view the auto-generated scroll-linked travel story timeline.
