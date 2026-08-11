'use client';

import { motion } from 'framer-motion';
import { Compass, Shield, Zap, Sparkles, Database, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AboutUsSection() {
  const pillars = [
    {
      title: 'Multimodal Spatial Perception',
      desc: 'Combines camera feeds, microphone voice streams, and telemetry data to comprehend the physical airport environment.',
      icon: Compass,
    },
    {
      title: 'Event-Driven Disruption Engine',
      desc: 'Monitors real-time ATC holds, weather vectors, and flight delays to resolve downstream hotel & rental car bookings automatically.',
      icon: Zap,
    },
    {
      title: 'Stateful Digital Twin Graph',
      desc: 'Maintains connected travel nodes (Flight ➔ Car ➔ Hotel) so every disruption updates the entire itinerary state atomically.',
      icon: Database,
    },
    {
      title: 'Accessible & Hands-Free Interaction',
      desc: 'Built with Whisper voice alerts, high-contrast visual accessibility, and zero-click proactive notifications for busy travelers.',
      icon: Shield,
    },
  ];

  return (
    <section
      id="about"
      className="relative py-28 bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 border-t border-black/10 dark:border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 text-black dark:text-white text-xs font-manrope font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>About AeroMind & Our Vision</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight font-manrope leading-tight text-black dark:text-white">
              Reimagining Travel Through Physical AI
            </h2>

            <p className="text-neutral-600 dark:text-neutral-300 text-base font-manrope leading-relaxed">
              Air travel today is fragmented. Passengers juggle physical boarding passes, noisy terminal announcements, gate change alerts, and separate hotel vouchers.
            </p>

            <p className="text-neutral-500 dark:text-neutral-400 text-sm font-manrope leading-relaxed">
              <strong>AeroMind</strong> bridges the physical and digital divide. By utilizing <strong>Google Gemini Multimodal AI</strong>, AeroMind looks through your camera lens to recognize departure boards, listens to gate broadcasts, and handles flight disruptions autonomously so travelers never get stranded.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-manrope font-semibold text-black dark:text-white">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-black/10 dark:border-white/10">
                <CheckCircle className="w-4 h-4 text-black dark:text-white" />
                <span>Zero-Friction Travel</span>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-neutral-100 dark:bg-neutral-900 border border-black/10 dark:border-white/10">
                <CheckCircle className="w-4 h-4 text-black dark:text-white" />
                <span>Google Gemini Architecture</span>
              </div>
            </div>
          </div>

          {/* Graphical Representation Card */}
          <div className="relative p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 shadow-xl">
            <div className="flex items-center justify-between pb-6 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-black dark:bg-white" />
                <div className="w-3 h-3 rounded-full bg-neutral-400" />
                <div className="w-3 h-3 rounded-full bg-neutral-400" />
                <span className="text-xs text-neutral-500 font-mono ml-2">AeroMind Engine State</span>
              </div>
              <span className="text-[11px] font-manrope px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-black dark:text-white font-mono">
                v2.6 Autonomous
              </span>
            </div>

            <div className="py-6 space-y-4 font-mono text-xs text-black dark:text-white">
              <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 flex items-center justify-between">
                <span className="font-medium">VISION_FEED:</span>
                <span className="text-neutral-500 dark:text-neutral-400">Boarding Pass SFO_AI302.png (Scanned)</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 flex items-center justify-between">
                <span className="font-medium">VOICE_STREAM:</span>
                <span className="text-neutral-500 dark:text-neutral-400">Gate B22 Announcement Detected</span>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-black/10 dark:border-white/10 flex items-center justify-between">
                <span className="font-medium">DISRUPTION_STATE:</span>
                <span className="text-neutral-500 dark:text-neutral-400">Auto-Resolved UA868 + Hyatt Update</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-neutral-500 border-t border-black/10 dark:border-white/10 font-manrope">
              <span>Status: <strong className="text-black dark:text-white font-semibold">Active Monitoring</strong></span>
              <Link to="/work" className="text-black dark:text-white font-semibold hover:underline flex items-center gap-1">
                <span>Launch Operational App</span>
                <span>➔</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Core Architectural Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white space-y-3 transition-colors shadow-sm"
              >
                <div className="w-10 h-10 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold font-manrope text-black dark:text-white">{pillar.title}</h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-manrope leading-relaxed">{pillar.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
