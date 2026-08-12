'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Eye,
  FileText,
  Camera,
  Mic,
  ShieldAlert,
  Compass,
  Activity,
  Zap,
  GitBranch,
  BellRing,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function FeaturesShowcase() {
  const [activeCategory, setActiveCategory] = useState<'vision' | 'rebooking' | 'voice' | 'twin'>('vision');

  const categories = [
    { id: 'vision', label: 'Multimodal Vision', icon: Eye },
    { id: 'rebooking', label: 'Disruption Guard', icon: ShieldAlert },
    { id: 'voice', label: 'Voice & Navigation', icon: Mic },
    { id: 'twin', label: 'Digital Twin Graph', icon: GitBranch },
  ];

  const featureDetails = {
    vision: {
      title: 'Multimodal Vision & Document Perception',
      subtitle: 'Extracts flight itineraries, PNR codes, and gate numbers in < 800ms directly from physical camera feeds or uploaded boarding passes.',
      image: '/images/Simple Planner Pages Minimal Design.jpg',
      points: [
        'Instant OCR extraction from physical paper or digital boarding passes',
        'Automatic validation of flight numbers (e.g. AI302) and gate assignments',
        'Direct integration with Gemini 1.5 Pro multimodal vision models',
      ],
      tag: 'Core Vision Intelligence',
    },
    rebooking: {
      title: 'Autonomous Multi-Leg Disruption Rebooking',
      subtitle: 'Predicts flight delays using OpenSky ADS-B telemetry and automatically reschedules connecting hotels and rental cars with 1 tap.',
      image: '/images/@luxurymedia1 _ Abstract Liquid High Quality Pack, 900+ _ Beacons.jpg',
      points: [
        'Real-time ATC congestion & weather disruption risk calculation',
        'Consolidated rebooking proposals for flights, Hyatt hotels, and Hertz car rentals',
        'Immutable audit log tracking all execution events',
      ],
      tag: 'Zero-Friction Protection',
    },
    voice: {
      title: 'Conversational Voice & Wayfinding Compass',
      subtitle: 'Hands-free voice concierge delivering quiet whisper alerts and live gate guidance directly inside airport terminals.',
      image: '/images/🛩️.jpg',
      points: [
        'Hands-free speech processing and contextual question answering',
        'Live terminal walking ETAs and directional guidance',
        'Whisper alerts for gate updates before PA system announcements',
      ],
      tag: 'Hands-Free Assistance',
    },
    twin: {
      title: 'Digital Twin Itinerary State Graph',
      subtitle: 'Maintains a dependency graph across flights, hotel check-ins, and car pickups to propagate delays automatically.',
      image: '/images/The Planet by Pixels.jpg',
      points: [
        'Graph representation of travel leg dependencies',
        'Automated propagation of schedule shifts downstream',
        'Real-time sync between OpenSky flight vectors and local client store',
      ],
      tag: 'Stateful Architecture',
    },
  };

  const activeData = featureDetails[activeCategory];

  return (
    <section id="features" className="relative py-28 bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 text-black dark:text-white text-xs font-manrope font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Operational Capabilities</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight font-manrope text-black dark:text-white">
            Designed for Precision. Built for Frictionless Travel.
          </h2>

          <p className="text-neutral-600 dark:text-neutral-300 text-base sm:text-lg font-manrope">
            Select a capability domain below to inspect how AeroMind monitors, understands, and executes travel actions autonomously.
          </p>
        </div>

        {/* Category Pill Switcher */}
        <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto p-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-manrope font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-md scale-105'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Smooth Tab Showcase Box */}
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="p-8 sm:p-12 rounded-3xl bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/15 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Left Text Column */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-neutral-800 dark:text-neutral-200 text-xs font-semibold font-manrope border border-black/10 dark:border-white/10">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  {activeData.tag}
                </span>

                <h3 className="text-2xl sm:text-3xl font-bold font-manrope text-black dark:text-white leading-tight">
                  {activeData.title}
                </h3>

                <p className="text-neutral-600 dark:text-neutral-300 text-sm sm:text-base font-manrope leading-relaxed">
                  {activeData.subtitle}
                </p>

                <div className="space-y-3 pt-2">
                  {activeData.points.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm font-manrope text-neutral-700 dark:text-neutral-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link
                    to="/work"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold font-manrope shadow-md hover:scale-105 transition-all"
                  >
                    <span>Launch Feature in App</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Image Showcase Column */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border border-black/10 dark:border-white/15 shadow-xl group">
                  <img
                    src={activeData.image}
                    alt={activeData.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs font-manrope font-medium">
                    Fully Operational in AeroMind Work App
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
