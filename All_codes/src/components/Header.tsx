'use client';

import { useState, useEffect } from 'react';
import { ToggleTheme } from './ToggleTheme';
import { Eye, Camera, MessageSquare, Command, User as UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { AuthModal } from './AuthModal';
import { VoiceNavButton } from './VoiceNavButton';
import { subscribeVoiceAction } from '@/lib/voiceNav/actionBus';

interface HeaderProps {
  tripStatus?: 'onTime' | 'atRisk' | 'disrupted';
  accessibilityMode: boolean;
  onToggleAccessibility: () => void;
  onOpenScanner?: () => void;
}

export function Header({
  tripStatus = 'onTime',
  accessibilityMode,
  onToggleAccessibility,
  onOpenScanner,
}: HeaderProps) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    return subscribeVoiceAction((action) => {
      if (action.type === 'closeOverlay') {
        setAuthModalOpen(false);
      }
    });
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-black/10 dark:border-white/10 bg-white/90 dark:bg-black/90 backdrop-blur-md transition-colors">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-semibold text-xs">
              <Command className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold tracking-wider text-sm font-manrope text-black dark:text-white">
                AEROMIND
              </span>
              <span className="text-[9px] text-neutral-500 font-manrope uppercase tracking-widest -mt-0.5">
                Physical AI Concierge
              </span>
            </div>
          </Link>

          {/* Live Trip Status Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-black/10 dark:border-white/15 text-xs font-manrope font-medium">
            {tripStatus === 'onTime' && (
              <>
                <span className="w-2 h-2 rounded-full bg-black dark:bg-white" />
                <span>On Schedule</span>
              </>
            )}
            {tripStatus === 'atRisk' && (
              <>
                <span className="w-2 h-2 rounded-full bg-neutral-500" />
                <span>Watching Conditions</span>
              </>
            )}
            {tripStatus === 'disrupted' && (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black dark:bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-black dark:bg-white" />
                </span>
                <span className="font-semibold">Elevated Disruption Risk</span>
              </>
            )}
          </div>

          {/* Header Action Controls */}
          <div className="flex items-center gap-2 font-manrope">
            {onOpenScanner && (
              <button
                onClick={onOpenScanner}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/15 text-xs font-medium text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                title="Scan Boarding Pass or Document"
              >
                <Camera className="w-3.5 h-3.5 stroke-[1.5]" />
                <span className="hidden sm:inline">Scan Pass</span>
              </button>
            )}

            <Link
              to="/advisor"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black text-xs font-semibold hover:scale-105 transition-transform"
              title="Open Conversational Flight Advisor"
            >
              <MessageSquare className="w-3.5 h-3.5 stroke-[1.5]" />
              <span className="hidden sm:inline">Flight Advisor</span>
            </Link>

            {/* Auth Sign In / User Profile Button */}
            <button
              onClick={() => setAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-black/10 dark:border-white/15 text-xs font-medium text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title={currentUser ? `Logged in as ${currentUser.email}` : 'Sign In / Sign Up'}
            >
              <UserIcon className="w-3.5 h-3.5 stroke-[1.5]" />
              <span className="hidden sm:inline">
                {currentUser ? currentUser.email?.split('@')[0] : 'Sign In'}
              </span>
            </button>

            <button
              onClick={onToggleAccessibility}
              className={`p-2 rounded-full border text-xs transition-colors ${
                accessibilityMode
                  ? 'border-black dark:border-white bg-black/10 dark:bg-white/20'
                  : 'border-black/10 dark:border-white/15 text-neutral-500 hover:text-black dark:hover:text-white'
              }`}
              title="Toggle Accessibility / High-Contrast Mode"
            >
              <Eye className="w-4 h-4 stroke-[1.5]" />
            </button>

            <VoiceNavButton />

            <ToggleTheme animationType="diag-down-right" />
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
