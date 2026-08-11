'use client';

import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Command } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative bg-white dark:bg-black text-black dark:text-white border-t border-black/10 dark:border-white/10 pt-16 pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Top Footer Banner */}
        <div className="p-8 sm:p-12 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-black/10 dark:border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-semibold font-manrope text-black dark:text-white tracking-tight">
              Ready to Experience Seamless Travel?
            </h3>
            <p className="text-neutral-600 dark:text-neutral-300 text-sm max-w-xl font-manrope">
              Launch the live interactive AeroMind Work App environment and test all 10 multimodal AI capabilities.
            </p>
          </div>

          <Link
            to="/work"
            className="px-8 py-4 rounded-full bg-black dark:bg-white text-white dark:text-black font-manrope font-semibold text-sm shadow-md hover:scale-105 transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Travel App</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-6 border-t border-black/10 dark:border-white/10 font-manrope">
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-semibold">
                <Command className="w-4 h-4" />
              </div>
              <span className="font-semibold text-lg tracking-wider font-manrope text-black dark:text-white">
                AEROMIND
              </span>
            </div>

            <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed max-w-md font-manrope">
              Autonomous Physical AI Travel Concierge. Seamlessly integrating multimodal vision, conversational voice, and stateful digital twin itineraries to eliminate travel friction.
            </p>

            <div className="text-xs text-neutral-500 font-mono">
              Designed for Google Gemini AI Competition 2026
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black dark:text-white font-manrope">Navigation</h4>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400 font-manrope">
              <li>
                <a href="#overview" className="hover:text-black dark:hover:text-white transition-colors">Overview</a>
              </li>
              <li>
                <a href="#about" className="hover:text-black dark:hover:text-white transition-colors">About Us</a>
              </li>
              <li>
                <a href="#features" className="hover:text-black dark:hover:text-white transition-colors">10 Core Features</a>
              </li>
              <li>
                <a href="#techstack" className="hover:text-black dark:hover:text-white transition-colors">Tech Stack</a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-black dark:text-white font-manrope">Application</h4>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400 font-manrope">
              <li>
                <Link to="/work" className="hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5">
                  <span>Interactive Work App</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-black dark:text-white font-mono">Live</span>
                </Link>
              </li>
              <li>
                <Link to="/journal/trip_sfo_2026" className="hover:text-black dark:hover:text-white transition-colors">
                  Trip Journal
                </Link>
              </li>
              <li>
                <Link to="/advisor" className="hover:text-black dark:hover:text-white transition-colors">
                  Voice Flight Advisor
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 border-t border-black/10 dark:border-white/10 text-center text-xs text-neutral-500 font-manrope">
          © {new Date().getFullYear()} AeroMind AI Concierge. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
