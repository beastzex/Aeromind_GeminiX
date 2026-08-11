'use client';

import { motion } from 'framer-motion';
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
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function FeaturesShowcase() {
  const features = [
    {
      id: 1,
      title: 'Multimodal AI Assistant',
      desc: 'Sees, listens, understands, and responds using real-time vision, voice, and contextual airport awareness.',
      icon: Eye,
      tag: 'Core Intelligence',
    },
    {
      id: 2,
      title: 'Document & Screen Intelligence',
      desc: 'Instantly parses boarding passes, flight itineraries, airport displays, and digital travel documents in under 1 second.',
      icon: FileText,
      tag: 'OCR & Vision',
    },
    {
      id: 3,
      title: 'Real-World Visual Understanding',
      desc: 'Recognizes gate numbers, baggage carousels, departure boards, and airport signage directly through your camera feed.',
      icon: Camera,
      tag: 'Spatial Perception',
    },
    {
      id: 4,
      title: 'Natural Voice Interaction',
      desc: 'Provides hands-free, conversational assistance with whisper alerts and real-time speech synthesis throughout the journey.',
      icon: Mic,
      tag: 'Hands-Free Voice',
    },
    {
      id: 5,
      title: 'Autonomous Travel Management',
      desc: 'Detects flight disruptions and executes automated multi-leg actions like rebooking alternate flights, hotels, and rentals.',
      icon: ShieldAlert,
      tag: 'Auto-Rebooking',
    },
    {
      id: 6,
      title: 'Context-Aware Navigation',
      desc: 'Uses live terminal location and trip context with 2D compass overlay to guide travelers directly to their departing gate.',
      icon: Compass,
      tag: 'Airport Compass',
    },
    {
      id: 7,
      title: 'Real-Time Trip Monitoring',
      desc: 'Continuously tracks flight status, air traffic control delays, and live weather conditions to provide proactive guidance.',
      icon: Activity,
      tag: 'Live Monitoring',
    },
    {
      id: 8,
      title: 'Event-Driven Automation',
      desc: 'Automatically reacts to travel plan changes in real time with zero or minimal user intervention required.',
      icon: Zap,
      tag: 'Event Pipeline',
    },
    {
      id: 9,
      title: 'Persistent Trip Context',
      desc: 'Maintains stateful itinerary graphs across flights, hotels, and ground transit for continuous personalized assistance.',
      icon: GitBranch,
      tag: 'Digital Twin Graph',
    },
    {
      id: 10,
      title: 'Smart Notifications & Recommendations',
      desc: 'Delivers timely, actionable whisper alerts and gate change recommendations based on real-time physical events.',
      icon: BellRing,
      tag: 'Whisper Alerts',
    },
  ];

  return (
    <section id="features" className="relative py-28 bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 text-black dark:text-white text-xs font-manrope font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Complete Feature Suite</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight font-manrope text-black dark:text-white">
            10 Autonomous Capabilities Built For Frictionless Travel
          </h2>

          <p className="text-neutral-600 dark:text-neutral-300 text-base sm:text-lg font-manrope">
            Every feature is fully implemented and operational inside our live interactive Work App environment.
          </p>
        </div>

        {/* 10 Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="group relative p-7 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition-all duration-300 hover:-translate-y-1.5 shadow-md flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Top Badge & Icon */}
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>

                    <span className="text-[11px] font-manrope font-semibold px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 border border-black/10 dark:border-white/10">
                      {feature.tag}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold font-manrope text-black dark:text-white">
                    {feature.id}. {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm font-manrope leading-relaxed">
                    {feature.desc}
                  </p>
                </div>

                {/* Bottom CTA link */}
                <div className="pt-6 mt-6 border-t border-black/10 dark:border-white/10 flex items-center justify-between font-manrope">
                  <span className="text-xs text-neutral-500 font-medium">Operational in App</span>
                  <Link
                    to="/work"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white hover:underline transition-all"
                  >
                    <span>Test Feature</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
