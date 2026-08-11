'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, X, AlertCircle } from 'lucide-react';

interface WhisperAlertProps {
  message: string;
  voiceEnabled?: boolean;
  onDismiss?: () => void;
}

export function WhisperAlert({ message, voiceEnabled = false, onDismiss }: WhisperAlertProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (voiceEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  }, [message, voiceEnabled]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 p-4 rounded-card border border-gray-300 dark:border-gray-700 bg-bg-light/95 dark:bg-bg-dark/95 text-fg-light dark:text-fg-dark shadow-2xl backdrop-blur-md"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-full border border-gray-900 dark:border-gray-100 flex items-center justify-center bg-fg-light dark:bg-fg-dark text-bg-light dark:text-bg-dark flex-shrink-0 mt-0.5">
              <Volume2 className="w-3.5 h-3.5 stroke-[1.5]" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">
                Whisper Voice Alert
              </span>
              <p className="text-xs font-medium leading-snug mt-0.5">{message}</p>
            </div>
          </div>

          <button
            onClick={() => {
              setVisible(false);
              onDismiss?.();
            }}
            className="p-1 rounded-pill hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
