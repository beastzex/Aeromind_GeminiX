'use client';

import { motion } from 'framer-motion';
import { getDisruptionLevel } from '@/lib/utils';

interface DisruptionRingProps {
  score: number; // 0 - 100
  size?: number; // width & height in px, default 96
}

export function DisruptionRing({ score, size = 96 }: DisruptionRingProps) {
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const { label, riskBand } = getDisruptionLevel(score);
  const isHighRisk = score >= 60;

  return (
    <div
      className={`relative flex flex-col items-center justify-center ${
        isHighRisk ? 'animate-pulseRing' : ''
      }`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Ring Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-800 fill-none"
        />
        {/* Animated Score Progress Arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-fg-light dark:text-fg-dark fill-none"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>

      {/* Center Numerical Score & Text Band */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
        <span className="text-xl font-semibold tracking-tight text-fg-light dark:text-fg-dark leading-none">
          {score}
        </span>
        <span className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold mt-0.5">
          {label}
        </span>
      </div>
    </div>
  );
}
