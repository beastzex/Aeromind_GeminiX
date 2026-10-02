'use client';

import { Mic, MicOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useVoiceNav } from '@/lib/voiceNav/useVoiceNav';

/** Toggle-to-listen navigation: click once to start, it keeps listening for
 * commands ("open advisor", "scan my pass", ...) until clicked again. */
export function VoiceNavButton() {
  const { supported, status, alwaysOn, lastError, toggle } = useVoiceNav();

  if (!supported) return null;

  const capturing = status === 'listening';

  return (
    <div className="relative">
      <button
        onClick={toggle}
        className={`relative p-2 rounded-full border text-xs transition-colors ${
          alwaysOn
            ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
            : 'border-black/10 dark:border-white/15 text-neutral-500 hover:text-black dark:hover:text-white'
        }`}
        title={alwaysOn ? 'Voice navigation is on — click to stop' : 'Voice navigation (click to start, stays on for repeated commands)'}
        aria-label="Voice navigation"
        aria-pressed={alwaysOn}
      >
        {capturing && (
          <span className="animate-ping absolute inset-0 rounded-full bg-black/40 dark:bg-white/40" />
        )}
        {alwaysOn ? (
          <Mic className="w-4 h-4 stroke-[1.5] relative" />
        ) : (
          <Mic className="w-4 h-4 stroke-[1.5]" />
        )}
        {alwaysOn && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-black" />
        )}
      </button>

      <AnimatePresence>
        {status === 'error' && lastError && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute right-0 top-full mt-2 w-56 p-2.5 rounded-card border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-950 shadow-lg text-[11px] text-neutral-600 dark:text-neutral-300 font-manrope z-50 flex items-start gap-1.5"
          >
            <MicOff className="w-3.5 h-3.5 stroke-[1.5] flex-shrink-0 mt-0.5" />
            <span>{lastError}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
