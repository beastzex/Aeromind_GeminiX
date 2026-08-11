'use client';

import { motion } from 'framer-motion';

interface VoiceWaveformProps {
  isActive: boolean;
}

export function VoiceWaveform({ isActive }: VoiceWaveformProps) {
  const bars = [0.4, 0.8, 1.2, 0.6, 1.4, 0.9, 0.5, 1.1, 0.7];

  return (
    <div className="flex items-center justify-center gap-1.5 h-12 py-2">
      {bars.map((scale, i) => (
        <motion.div
          key={i}
          className="w-1.5 bg-fg-light dark:bg-fg-dark rounded-pill"
          initial={{ height: 8 }}
          animate={{
            height: isActive ? [8, 32 * scale, 12, 40 * scale, 8] : 8,
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            repeatType: 'mirror',
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
