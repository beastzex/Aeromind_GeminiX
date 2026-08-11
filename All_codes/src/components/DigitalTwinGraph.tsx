'use client';

import { motion } from 'framer-motion';
import { Leg } from '@/types';
import { LegCard } from './LegCard';
import { staggerContainer, fadeInUp } from '@/styles/animations';

interface DigitalTwinGraphProps {
  legs: Leg[];
  impactedLegIds?: string[];
  onSelectLeg?: (leg: Leg) => void;
}

export function DigitalTwinGraph({ legs, impactedLegIds = [], onSelectLeg }: DigitalTwinGraphProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="relative w-full space-y-6"
    >
      {/* Central Connector Line */}
      <div className="absolute left-9 top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-800 -z-0" />

      {legs.map((leg, index) => {
        const isImpacted = impactedLegIds.includes(leg.id);

        return (
          <motion.div key={leg.id} variants={fadeInUp} className="relative z-10 pl-4">
            {/* Timeline Connector Node Dot */}
            <div
              className={`absolute left-3.5 top-7 w-3 h-3 rounded-full border-2 transform -translate-x-1/2 transition-colors ${
                isImpacted
                  ? 'border-gray-900 dark:border-gray-100 bg-fg-light dark:bg-fg-dark animate-pulse'
                  : 'border-gray-400 dark:border-gray-600 bg-bg-light dark:bg-bg-dark'
              }`}
            />

            <LegCard leg={leg} impacted={isImpacted} onSelect={() => onSelectLeg?.(leg)} />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
