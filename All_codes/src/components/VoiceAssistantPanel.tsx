'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, X, Mic, AlertTriangle } from 'lucide-react';
import { useVoiceAssistant } from '@/lib/voice/useVoiceAssistant';
import { VoiceWaveform } from './VoiceWaveform';

const STATE_LABEL: Record<string, string> = {
  idle: 'Hold to talk',
  connecting: 'Connecting…',
  listening: 'Listening…',
  thinking: 'Thinking…',
  speaking: 'Speaking…',
  error: 'Connection error',
};

/** Push-to-talk voice assistant: Gemini Live primary, Deepgram Agent fallback. */
export function VoiceAssistantPanel() {
  const [open, setOpen] = useState(false);
  const { state, provider, transcript, error, startTalking, stopTalking, close } = useVoiceAssistant();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return;
      const target = e.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      e.preventDefault();
      void startTalking();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      stopTalking();
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [open, startTalking, stopTalking]);

  const handleClose = () => {
    close();
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-full border text-xs transition-colors ${
          open
            ? 'border-black dark:border-white bg-black/10 dark:bg-white/20'
            : 'border-black/10 dark:border-white/15 text-neutral-500 hover:text-black dark:hover:text-white'
        }`}
        title="Voice AI (hold the mic to talk)"
        aria-label="Voice AI"
      >
        <Mic className="w-4 h-4 stroke-[1.5]" />
        <span className="text-[8px] font-semibold uppercase tracking-widest leading-none">Voice AI</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 rounded-card border border-black/10 dark:border-white/15 bg-white dark:bg-neutral-950 shadow-2xl z-50 font-manrope overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-black/10 dark:border-white/10 bg-neutral-50 dark:bg-neutral-900">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">Voice Assistant</span>
                  {provider && (
                    <span className="text-[9px] uppercase tracking-widest text-neutral-500">
                      {provider === 'gemini' ? 'Gemini Live' : 'Deepgram (fallback)'}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                aria-label="Close voice assistant"
              >
                <X className="w-4 h-4 stroke-[1.5]" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto px-4 py-3 space-y-2">
              {transcript.length === 0 && (
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Hold the mic button (or hold Space) and ask about a flight — e.g. "What's the
                  delay on AI302?"
                </p>
              )}
              {transcript.map((entry) => (
                <div
                  key={entry.id}
                  className={`text-[11px] leading-relaxed px-3 py-2 rounded-xl max-w-[90%] ${
                    entry.role === 'user'
                      ? 'ml-auto bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-neutral-100 dark:bg-neutral-900 border border-black/10 dark:border-white/10'
                  }`}
                >
                  {entry.text}
                </div>
              ))}
            </div>

            {error && (
              <div className="mx-4 mb-2 flex items-start gap-1.5 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-lg px-2.5 py-1.5">
                <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-col items-center gap-2 px-4 py-4 border-t border-black/10 dark:border-white/10">
              <VoiceWaveform isActive={state === 'listening' || state === 'speaking'} />
              <button
                onPointerDown={() => void startTalking()}
                onPointerUp={stopTalking}
                onPointerLeave={stopTalking}
                onPointerCancel={stopTalking}
                disabled={state === 'connecting'}
                className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-colors select-none ${
                  state === 'listening'
                    ? 'border-black dark:border-white bg-black/10 dark:bg-white/20'
                    : 'border-black/15 dark:border-white/20 hover:border-black dark:hover:border-white'
                } disabled:opacity-40`}
                title="Hold to talk"
              >
                <Mic className="w-5 h-5 stroke-[1.5]" />
              </button>
              <span className="text-[10px] uppercase tracking-widest text-neutral-500">
                {STATE_LABEL[state] ?? state}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
