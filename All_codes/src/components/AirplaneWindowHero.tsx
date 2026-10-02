'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Sparkles, Navigation, Radio, Eye, ShieldCheck, Activity, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AirplaneWindowHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax scroll hooks
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const cardScale = useTransform(scrollYProgress, [0, 0.6, 1], [1, 1.05, 1.1]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -60]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen bg-white dark:bg-black text-black dark:text-white pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden transition-colors duration-300"
    >

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center">
        {/* Top Header & Tagline */}
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="text-center space-y-6 max-w-3xl mx-auto mb-12"
        >
          {/* Status Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black dark:bg-white opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-black dark:bg-white" />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider font-manrope text-black/80 dark:text-white/90">
              Autonomous Physical AI Travel Concierge
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] font-manrope text-black dark:text-white">
            Travel Intelligence,{' '}
            <span className="underline decoration-1 underline-offset-8 decoration-black/30 dark:decoration-white/30">
              Defined by Precision.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto font-manrope leading-relaxed">
            Sees boarding passes, monitors real-time digital twin flight paths, listens to airport announcements, and manages disruptions automatically.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/work"
              className="px-8 py-3.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-manrope font-semibold text-sm shadow-lift hover:shadow-liftDark hover:scale-[1.02] transition-all duration-300 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Travel App</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#overview"
              className="px-7 py-3.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-black dark:text-white font-manrope font-semibold text-sm border border-black/10 dark:border-white/15 backdrop-blur-md transition-all"
            >
              Explore Architecture
            </a>
          </div>
        </motion.div>

        {/* Minimalist Dashboard Preview Container */}
        <motion.div
          style={{ scale: cardScale }}
          className="w-full max-w-4xl rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 p-6 sm:p-8 shadow-2xl transition-all"
        >
          {/* Top Control Header */}
          <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-black dark:bg-white" />
              <div className="w-3 h-3 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <div className="w-3 h-3 rounded-full bg-neutral-300 dark:bg-neutral-700" />
              <span className="text-xs font-mono font-medium text-neutral-500 dark:text-neutral-400 ml-2">
                AEROMIND // PHYSICAL_AI_ENGINE_V1
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/5 dark:bg-white/10 text-[11px] font-manrope font-medium text-neutral-700 dark:text-neutral-200">
                <Radio className="w-3 h-3 animate-pulse" />
                Live Multimodal Telemetry
              </span>
            </div>
          </div>

          {/* Interactive Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Flight Status */}
            <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-manrope uppercase font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider">
                  Active Flight Path
                </span>
                <Navigation className="w-4 h-4 text-black dark:text-white" />
              </div>
              <div>
                <div className="text-xl font-semibold font-manrope text-black dark:text-white">
                  DEL ➔ SFO
                </div>
                <div className="text-xs font-manrope text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Flight AI302 · Gate B22
                </div>
              </div>
              <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-manrope">
                <span className="text-neutral-500 dark:text-neutral-400">Digital Twin Sync</span>
                <span className="font-semibold text-black dark:text-white flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Real-time
                </span>
              </div>
            </div>

            {/* Card 2: Multimodal AI Perception */}
            <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-manrope uppercase font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider">
                  Multimodal Vision
                </span>
                <Eye className="w-4 h-4 text-black dark:text-white" />
              </div>
              <div>
                <div className="text-xl font-semibold font-manrope text-black dark:text-white">
                  Gemini 1.5 Pro
                </div>
                <div className="text-xs font-manrope text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Optical Boarding Pass Extraction
                </div>
              </div>
              <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-manrope">
                <span className="text-neutral-500 dark:text-neutral-400">OCR & Document</span>
                <span className="font-semibold text-black dark:text-white">Verified</span>
              </div>
            </div>

            {/* Card 3: Autonomous Rebooking */}
            <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-manrope uppercase font-semibold text-neutral-500 dark:text-neutral-400 tracking-wider">
                  Disruption Guard
                </span>
                <ShieldCheck className="w-4 h-4 text-black dark:text-white" />
              </div>
              <div>
                <div className="text-xl font-semibold font-manrope text-black dark:text-white">
                  Zero Delay Impact
                </div>
                <div className="text-xs font-manrope text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Auto-hotel & transfer rebooking
                </div>
              </div>
              <div className="pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs font-manrope">
                <span className="text-neutral-500 dark:text-neutral-400">Response Speed</span>
                <span className="font-semibold text-black dark:text-white">&lt; 1.2 Seconds</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
