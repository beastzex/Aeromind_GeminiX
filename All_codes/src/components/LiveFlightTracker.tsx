'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Navigation,
  Radio,
  Wind,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Zap,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
} from 'lucide-react';

interface FlightTrackerProps {
  flightNo?: string;
  onTriggerDisruption?: () => void;
}

export function LiveFlightTracker({
  flightNo = 'AI302',
  onTriggerDisruption,
}: FlightTrackerProps) {
  const [telemetry, setTelemetry] = useState({
    altitude: 36000,
    speed: 545,
    heading: 68,
    lat: 37.6213,
    lng: -122.379,
    distRemaining: 1840,
    timeRemaining: '3h 42m',
    status: 'In-Flight (En Route)',
    atcHold: false,
    turbulence: 'Light',
    origin: 'DEL (New Delhi)',
    destination: 'SFO (San Francisco)',
    scheduledDep: '14:30 IST',
    estDep: '15:55 IST (+85m ATC Delay)',
    gate: 'B22',
    terminal: 'T3',
    aircraft: 'Boeing 777-300ER (Tail #N78001)',
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [progressPercent, setProgressPercent] = useState(64);

  // Live telemetry pulse animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => ({
        ...prev,
        altitude: Math.min(38000, Math.max(34000, prev.altitude + Math.floor(Math.random() * 80) - 40)),
        speed: Math.min(570, Math.max(520, prev.speed + Math.floor(Math.random() * 6) - 3)),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setProgressPercent((prev) => Math.min(99, prev + 1));
    }, 800);
  };

  const handleToggleHold = () => {
    setTelemetry((prev) => ({
      ...prev,
      atcHold: !prev.atcHold,
      status: !prev.atcHold ? 'ATC Ground Hold (Elevated Delay Risk)' : 'In-Flight (En Route)',
    }));
    if (onTriggerDisruption) {
      onTriggerDisruption();
    }
  };

  return (
    <div className="space-y-6 font-manrope">
      {/* Header & Status Banner */}
      <div className="p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black dark:bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-black dark:bg-white" />
            </span>
            <span className="text-xs uppercase font-semibold text-neutral-500 tracking-wider">
              OpenSky ADS-B Telemetry Stream
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-black dark:text-white tracking-tight">
            Flight {flightNo} · {telemetry.origin} ➔ {telemetry.destination}
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {telemetry.aircraft} · Gate {telemetry.gate} (Terminal {telemetry.terminal})
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/10 dark:border-white/15 text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync ADS-B</span>
          </button>

          <button
            onClick={handleToggleHold}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all ${
              telemetry.atcHold
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'border border-black/10 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/10'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{telemetry.atcHold ? 'Clear ATC Hold' : 'Simulate ATC Hold'}</span>
          </button>
        </div>
      </div>

      {/* Live Flight Path Radar Visualizer */}
      <div className="relative rounded-2xl bg-neutral-900 text-white border border-black/10 dark:border-white/15 p-6 overflow-hidden shadow-xl">
        {/* Background Radar Grid Pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />

        {/* Top Radar Bar */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>LIVE RADAR TRACKING: {flightNo}</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-white/10 text-[10px]">
            LAT: {telemetry.lat.toFixed(4)} N / LNG: {telemetry.lng.toFixed(4)} W
          </span>
        </div>

        {/* Flight Trajectory Line & Plane Position */}
        <div className="relative z-10 my-10 py-4 px-2 sm:px-6">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-neutral-400" />
              <span>DEL</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
              <Navigation className="w-3.5 h-3.5 rotate-45 animate-pulse" />
              <span>{progressPercent}% Complete</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-neutral-400" />
              <span>SFO</span>
            </div>
          </div>

          {/* Progress Bar Container */}
          <div className="relative w-full h-3 rounded-full bg-white/10 overflow-visible">
            <div
              className="h-full rounded-full bg-white transition-all duration-700"
              style={{ width: `${progressPercent}%` }}
            />
            {/* Plane Icon Indicator */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg transition-all duration-700"
              style={{ left: `${progressPercent}%` }}
            >
              <Navigation className="w-4 h-4 rotate-90" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-3 font-mono">
            <span>Departed: 14:30 IST</span>
            <span>Distance Remaining: {telemetry.distRemaining} nm</span>
            <span>Est Arrival: 17:15 PST</span>
          </div>
        </div>

        {/* Telemetry Stats Grid */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 font-mono text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-neutral-400 text-[10px] uppercase">Altitude</div>
            <div className="text-lg font-semibold text-white mt-0.5">{telemetry.altitude.toLocaleString()} FT</div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-neutral-400 text-[10px] uppercase">Ground Speed</div>
            <div className="text-lg font-semibold text-white mt-0.5">{telemetry.speed} MPH</div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-neutral-400 text-[10px] uppercase">Bearing / Heading</div>
            <div className="text-lg font-semibold text-white mt-0.5">{telemetry.heading}° ENE</div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <div className="text-neutral-400 text-[10px] uppercase">Time To Touchdown</div>
            <div className="text-lg font-semibold text-white mt-0.5">{telemetry.timeRemaining}</div>
          </div>
        </div>
      </div>

      {/* Detailed Flight Conditions & Terminal Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-neutral-500">Air Traffic Control</span>
            <Wind className="w-4 h-4 text-black dark:text-white" />
          </div>
          <div className="text-lg font-semibold text-black dark:text-white">
            {telemetry.atcHold ? 'Ground Delay Program' : 'Standard Vectoring'}
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {telemetry.atcHold
              ? 'San Francisco International ATC holding flights due to low fog visibility. Disruption solver active.'
              : 'Smooth airspace vectoring across Pacific corridor AI-North.'}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-neutral-500">Cabin & Weather</span>
            <Zap className="w-4 h-4 text-black dark:text-white" />
          </div>
          <div className="text-lg font-semibold text-black dark:text-white">
            Turbulence: {telemetry.turbulence}
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Cabin altitude maintained at 6,200 ft. Outer temperature: -52°C. No severe convective weather detected.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-neutral-500">Gate & Terminal</span>
            <CheckCircle2 className="w-4 h-4 text-black dark:text-white" />
          </div>
          <div className="text-lg font-semibold text-black dark:text-white">
            Gate B22 · Carousel #4
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            Assigned gate verified. Walking ETA from terminal security is 8 minutes. Priority baggage tag active.
          </p>
        </div>
      </div>
    </div>
  );
}
