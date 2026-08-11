'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Navigation, Clock, AlertTriangle, X, Camera } from 'lucide-react';
import { modalOverlay, modalContent } from '@/styles/animations';

interface ARWayfindingProps {
  isOpen: boolean;
  onClose: () => void;
  targetGate?: string;
  walkingEtaMinutes?: number;
  minutesToBoarding?: number;
}

export function ARWayfinding({
  isOpen,
  onClose,
  targetGate = 'B22',
  walkingEtaMinutes = 8,
  minutesToBoarding = 12,
}: ARWayfindingProps) {
  const [heading, setHeading] = useState(45); // simulated compass bearing angle

  useEffect(() => {
    if (!isOpen) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        setHeading(Math.round(e.alpha));
      }
    };

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isTight = walkingEtaMinutes >= minutesToBoarding;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          variants={modalOverlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          variants={modalContent}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-md p-6 rounded-card border border-gray-300 dark:border-gray-700 bg-bg-light dark:bg-bg-dark text-fg-light dark:text-fg-dark shadow-2xl z-10 text-center"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 stroke-[1.5]" />
              <h2 className="text-base font-semibold tracking-tight">AR Gate Compass Wayfinding</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-pill hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Viewfinder Camera Simulation Container */}
          <div className="relative w-full h-64 rounded-card border border-gray-300 dark:border-gray-700 bg-gray-900 overflow-hidden flex flex-col items-center justify-center mb-4">
            {/* Simulated Live Camera Feed Grid Pattern */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

            {/* Rotating 2D Compass Arrow */}
            <motion.div
              animate={{ rotate: heading }}
              transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              className="w-24 h-24 rounded-full border-2 border-white/60 flex items-center justify-center bg-black/40 backdrop-blur-sm shadow-xl z-10"
            >
              <Navigation className="w-12 h-12 text-white stroke-[1.5] transform -rotate-45" />
            </motion.div>

            {/* Target Gate Label Overlay */}
            <div className="absolute bottom-3 left-3 right-3 py-1.5 px-3 rounded-pill bg-black/75 border border-white/20 text-white text-xs font-mono flex items-center justify-between">
              <span>Target: Gate {targetGate}</span>
              <span>Heading: {heading}°</span>
            </div>
          </div>

          {/* Countdown & Walking Pace Bar */}
          <div
            className={`p-4 rounded-card border text-left text-xs font-medium space-y-2 ${
              isTight
                ? 'border-gray-900 dark:border-gray-100 bg-gray-100 dark:bg-gray-900'
                : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold">
                {isTight ? (
                  <AlertTriangle className="w-4 h-4 text-fg-light dark:text-fg-dark" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
                <span>Walking Pace Countdown</span>
              </div>
              <span className="font-mono text-[10px]">Gate {targetGate}</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span>Estimated Walking Time:</span>
              <span className="font-semibold">{walkingEtaMinutes} mins</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span>Boarding Commences In:</span>
              <span className="font-semibold">{minutesToBoarding} mins</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 rounded-pill bg-gray-300 dark:bg-gray-700 overflow-hidden mt-2">
              <div
                className="h-full bg-fg-light dark:bg-fg-dark transition-all duration-500"
                style={{ width: `${Math.min(100, (walkingEtaMinutes / minutesToBoarding) * 100)}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
