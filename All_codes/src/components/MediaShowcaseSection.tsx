'use client';

import { motion } from 'framer-motion';
import { Sparkles, Play, ShieldCheck, Eye, Plane } from 'lucide-react';

export function MediaShowcaseSection() {
  return (
    <section className="relative py-24 bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 text-black dark:text-white text-xs font-manrope font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Physical AI In Action</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight font-manrope text-black dark:text-white">
            Real-Time Flight Telemetry &amp; Terminal Perception
          </h2>

          <p className="text-neutral-600 dark:text-neutral-300 text-base sm:text-lg font-manrope leading-relaxed">
            Experience how ambient vision, live radar tracking, and spatial airport perception converge to guide travelers through physical terminals.
          </p>
        </div>

        {/* Visual Media Showcase Cards (No Background Overlay, No Phone Frame) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Card 1: Aircraft Flight Path Tracking */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="group rounded-3xl overflow-hidden border border-black/10 dark:border-white/15 bg-neutral-50 dark:bg-neutral-950 p-6 flex flex-col justify-between shadow-lg hover:border-black dark:hover:border-white transition-all"
          >
            <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden mb-6">
              <img
                src="/images/A-380 Perfect shot.jpg"
                alt="Airbus A380 Live Tracking"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-sm text-xs font-mono text-emerald-400 flex items-center gap-1.5">
                <Plane className="w-3.5 h-3.5" /> OpenSky ADS-B Live
              </span>
            </div>
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 font-manrope">
                <ShieldCheck className="w-4 h-4" />
                <span>Real-Time Flight Telemetry</span>
              </div>
              <h3 className="text-xl font-bold font-manrope text-black dark:text-white">
                OpenSky Radar &amp; Altitude Trajectories
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm font-manrope leading-relaxed">
                Continuously calculates ground speeds, wind velocity vectors, and air traffic congestion to predict delays before gate arrival.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Airport Terminal Intelligence */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="group rounded-3xl overflow-hidden border border-black/10 dark:border-white/15 bg-neutral-50 dark:bg-neutral-950 p-6 flex flex-col justify-between shadow-lg hover:border-black dark:hover:border-white transition-all"
          >
            <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden mb-6">
              <img
                src="/images/airport.jpg"
                alt="Airport Terminal Ambient Perception"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-sm text-xs font-mono text-white flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-white" /> Terminal Perception
              </span>
            </div>
            <div className="space-y-2 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-sky-600 dark:text-sky-400 font-manrope">
                <Eye className="w-4 h-4" />
                <span>Ambient Terminal Awareness</span>
              </div>
              <h3 className="text-xl font-bold font-manrope text-black dark:text-white">
                Gate Signs, Monitors &amp; Speech Perception
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm font-manrope leading-relaxed">
                Extracts gate updates from airport announcements and physical display monitors to notify travelers before official push alerts arrive.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
