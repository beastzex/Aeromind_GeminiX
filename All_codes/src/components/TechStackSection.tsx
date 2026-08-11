'use client';

import { motion } from 'framer-motion';
import { Cpu, Layers, Sparkles, Code2, Database, Zap, Eye } from 'lucide-react';

export function TechStackSection() {
  const stackItems = [
    {
      category: 'Multimodal AI Foundation',
      title: 'Google Gemini Pro & Flash',
      description: 'Powers real-world visual understanding, boarding pass parsing, and natural language travel reasoning.',
      icon: Cpu,
      badge: 'Core Engine',
    },
    {
      category: 'Real-Time Voice API',
      title: 'Gemini Multimodal Live API',
      description: 'Enables sub-100ms voice interactions, ambient gate listening, and hands-free whisper alerts.',
      icon: Eye,
      badge: 'WebSockets & WebRTC',
    },
    {
      category: 'Frontend Framework',
      title: 'Next.js 14 & React 18',
      description: 'Built with App Router, server-rendered components, strict TypeScript, and modular architecture.',
      icon: Code2,
      badge: 'App Router',
    },
    {
      category: 'Styling & Design System',
      title: 'Tailwind CSS & Framer Motion',
      description: 'Light and dark mode themes, fluid motion effects, and high-contrast typography.',
      icon: Layers,
      badge: 'Monochrome UI',
    },
    {
      category: 'State & Event Engine',
      title: 'Stateful Digital Twin Graph',
      description: 'Custom state management engine syncing multi-leg flights, car rentals, and hotel bookings atomically.',
      icon: Database,
      badge: 'Trip Store',
    },
    {
      category: 'Speech & Audio Web APIs',
      title: 'WebSpeech & Audio API',
      description: 'Provides client-side voice speech synthesis and real-time audio waveform visualization.',
      icon: Zap,
      badge: 'Browser Native',
    },
  ];

  return (
    <section
      id="techstack"
      className="relative py-28 bg-white dark:bg-black text-black dark:text-white transition-colors duration-300 border-t border-black/10 dark:border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 text-black dark:text-white text-xs font-manrope font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Architecture & Technology</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight font-manrope text-black dark:text-white">
            Powered By Cutting-Edge AI & Web Stack
          </h2>

          <p className="text-neutral-600 dark:text-neutral-300 text-base sm:text-lg font-manrope">
            Engineered for high availability, sub-second visual latency, and robust event-driven travel management.
          </p>
        </div>

        {/* Tech Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stackItems.map((tech, idx) => {
            const Icon = tech.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-8 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white transition-all duration-300 shadow-md space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>

                  <span className="text-[10px] font-manrope uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 text-neutral-700 dark:text-neutral-300 border border-black/10 dark:border-white/10">
                    {tech.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-manrope text-neutral-500 uppercase tracking-widest font-semibold">
                    {tech.category}
                  </span>
                  <h3 className="text-xl font-semibold font-manrope text-black dark:text-white">{tech.title}</h3>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-manrope leading-relaxed">
                  {tech.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
