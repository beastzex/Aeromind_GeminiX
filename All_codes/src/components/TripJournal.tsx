'use client';

import { motion } from 'framer-motion';
import { TripEvent } from '@/types';
import { Sparkles, Calendar, FileText, MapPin, Share2 } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/styles/animations';

interface TripJournalProps {
  events: TripEvent[];
  tripTitle?: string;
}

export function TripJournal({ events, tripTitle = 'SF Tech & AI Summit 2026' }: TripJournalProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className="max-w-3xl mx-auto space-y-8 py-8 px-4"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="text-center space-y-2 border-b border-gray-200 dark:border-gray-800 pb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill border border-gray-300 dark:border-gray-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Auto-Compiled AI Travel Story</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-fg-light dark:text-fg-dark">
          {tripTitle}
        </h1>
        <p className="text-xs text-gray-500 font-medium">
          Captured by AeroMind Multimodal Sensors · Aug 2026
        </p>
      </motion.div>

      {/* Story Timeline Cards */}
      <div className="space-y-6">
        {events.map((evt, idx) => (
          <motion.div
            key={evt.id}
            variants={fadeInUp}
            className="p-6 rounded-card border border-gray-200 dark:border-gray-800 bg-bg-light dark:bg-bg-dark text-fg-light dark:text-fg-dark shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span className="font-mono uppercase text-[10px] font-semibold">Chapter {idx + 1}</span>
              <span>{new Date(evt.ts).toLocaleString()}</span>
            </div>

            <h3 className="text-base font-semibold capitalize">
              {evt.eventType.replace(/_/g, ' ').toLowerCase()}
            </h3>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {JSON.stringify(evt.payload, null, 2)}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Footer Share Action */}
      <motion.div variants={fadeInUp} className="flex justify-center pt-4">
        <button className="flex items-center gap-2 px-6 py-3 rounded-pill bg-fg-light dark:bg-fg-dark text-bg-light dark:text-bg-dark text-xs font-semibold hover:opacity-90 transition-opacity">
          <Share2 className="w-4 h-4 stroke-[1.5]" />
          <span>Share Travel Journal Keepsake</span>
        </button>
      </motion.div>
    </motion.div>
  );
}
