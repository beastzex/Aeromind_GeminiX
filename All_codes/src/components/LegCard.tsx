'use client';

import { motion } from 'framer-motion';
import { Leg } from '@/types';
import { DisruptionRing } from './DisruptionRing';
import { Plane, Building, Car, Calendar, ArrowRight, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface LegCardProps {
  leg: Leg;
  impacted?: boolean;
  onSelect?: () => void;
}

export function LegCard({ leg, impacted = false, onSelect }: LegCardProps) {
  const renderIcon = () => {
    switch (leg.type) {
      case 'flight':
        return <Plane className="w-5 h-5 stroke-[1.5]" />;
      case 'hotel':
        return <Building className="w-5 h-5 stroke-[1.5]" />;
      case 'car':
        return <Car className="w-5 h-5 stroke-[1.5]" />;
      case 'meeting':
        return <Calendar className="w-5 h-5 stroke-[1.5]" />;
    }
  };

  const getStatusIcon = () => {
    if (leg.status === 'delayed' || leg.status === 'cancelled' || impacted) {
      return <AlertCircle className="w-3.5 h-3.5" />;
    }
    if (leg.status === 'completed') {
      return <CheckCircle2 className="w-3.5 h-3.5" />;
    }
    return <Clock className="w-3.5 h-3.5" />;
  };

  return (
    <motion.div
      onClick={onSelect}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className={`relative w-full p-5 rounded-card border transition-all cursor-pointer bg-bg-light dark:bg-bg-dark text-fg-light dark:text-fg-dark shadow-sm hover:shadow-lift dark:hover:shadow-liftDark ${
        impacted
          ? 'border-dashed border-gray-900 dark:border-gray-100 bg-gray-50/50 dark:bg-gray-900/30'
          : 'border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left Side: Type Icon + Info */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-700 flex items-center justify-center bg-gray-100 dark:bg-gray-900 flex-shrink-0 mt-0.5">
            {renderIcon()}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs uppercase tracking-widest font-semibold text-gray-500">
                {leg.type} {leg.flightNo ? `· ${leg.flightNo}` : ''}
              </span>

              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-pill text-[10px] font-semibold border ${
                  impacted
                    ? 'border-gray-900 dark:border-gray-100 animate-pulse'
                    : leg.status === 'delayed'
                    ? 'border-gray-900 dark:border-gray-100 bg-gray-100 dark:bg-gray-900'
                    : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {getStatusIcon()}
                <span>
                  {impacted
                    ? 'Affected — Recalculating'
                    : leg.status === 'delayed'
                    ? 'Schedule Delta (+85m)'
                    : leg.status === 'onTime'
                    ? 'On Schedule'
                    : leg.status}
                </span>
              </span>
            </div>

            <h3 className="text-base font-semibold text-fg-light dark:text-fg-dark mt-1 leading-snug">
              {leg.title}
            </h3>

            {/* Time & Location Details */}
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-2 flex-wrap font-medium">
              <span>{leg.dep}</span>
              {leg.arr && (
                <>
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <span>{leg.arr}</span>
                </>
              )}
            </div>

            {/* Additional Details Line (Gate, Seat, PNR) */}
            {leg.details && (
              <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 mt-2 font-medium flex-wrap">
                {leg.details.gate && (
                  <span className="px-1.5 py-0.5 border border-gray-300 dark:border-gray-700 rounded-md">
                    Gate {leg.details.gate}
                  </span>
                )}
                {leg.details.seat && (
                  <span className="px-1.5 py-0.5 border border-gray-300 dark:border-gray-700 rounded-md">
                    Seat {leg.details.seat}
                  </span>
                )}
                {leg.details.pnr && <span>PNR: {leg.details.pnr}</span>}
                {leg.details.roomType && <span>{leg.details.roomType}</span>}
                {leg.details.carModel && <span>{leg.details.carModel}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Mini Disruption Ring for Flights */}
        {leg.type === 'flight' && typeof leg.disruptionScore === 'number' && (
          <div className="flex-shrink-0">
            <DisruptionRing score={leg.disruptionScore} size={64} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
