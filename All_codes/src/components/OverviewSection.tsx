'use client';

import { motion } from 'framer-motion';
import { Eye, Mic, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

export function OverviewSection() {
  const cards = [
    {
      icon: Eye,
      title: 'Multimodal Vision Intelligence',
      description:
        'Point your phone camera at physical boarding passes or airport departure monitors. AeroMind extracts gate, seat, and flight metadata instantly.',
    },
    {
      icon: Mic,
      title: 'Voice & Conversational AI',
      description:
        'Hands-free assistant that listens to ambient context, delivers whisper alerts for gate updates, and handles voice queries during airport rush.',
    },
    {
      icon: ShieldAlert,
      title: 'Autonomous Disruption Guard',
      description:
        'Detects ATC holds or flight delays automatically. Calculates downstream impacts across hotels and car rentals with 1-click rebooking.',
    },
  ];

  return (
    <section
      id="overview"
      className="relative py-28 bg-white dark:bg-black text-black dark:text-white transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 text-black dark:text-white text-xs font-manrope font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Platform Overview</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight font-manrope text-black dark:text-white">
            Next-Gen Physical AI For Air Travel
          </h2>

          <p className="text-neutral-600 dark:text-neutral-300 text-base sm:text-lg font-manrope leading-relaxed">
            Legacy travel apps are static schedules. AeroMind is a living Digital Twin that continuously observes, comprehends, and acts in real time.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative group p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 shadow-lg hover:border-black dark:hover:border-white transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-semibold font-manrope text-black dark:text-white mb-3">
                  {card.title}
                </h3>

                <p className="text-neutral-600 dark:text-neutral-400 text-sm font-manrope leading-relaxed mb-6">
                  {card.description}
                </p>

                <div className="flex items-center gap-2 text-xs font-manrope font-semibold text-black dark:text-white group-hover:translate-x-1 transition-transform">
                  <span>Explore Feature</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Metrics Banner */}
        <div className="p-8 sm:p-10 rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-black/10 dark:border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-semibold font-manrope text-black dark:text-white">&lt; 800ms</div>
            <div className="text-xs font-manrope text-neutral-500 uppercase tracking-wider">Vision Scan Latency</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-semibold font-manrope text-black dark:text-white">100%</div>
            <div className="text-xs font-manrope text-neutral-500 uppercase tracking-wider">Disruption Resolution</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-semibold font-manrope text-black dark:text-white">2D / AR</div>
            <div className="text-xs font-manrope text-neutral-500 uppercase tracking-wider">Wayfinding Precision</div>
          </div>
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl font-semibold font-manrope text-black dark:text-white">Real-Time</div>
            <div className="text-xs font-manrope text-neutral-500 uppercase tracking-wider">Digital Twin Sync</div>
          </div>
        </div>
      </div>
    </section>
  );
}
