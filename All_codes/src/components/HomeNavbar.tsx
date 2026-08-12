'use client';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Menu, X, Command, User as UserIcon } from 'lucide-react';
import { ToggleTheme } from './ToggleTheme';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { AuthModal } from './AuthModal';

export function HomeNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 dark:bg-black/85 backdrop-blur-xl border-b border-black/10 dark:border-white/10 py-3 shadow-md'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-semibold text-base shadow-sm group-hover:scale-105 transition-transform">
              <Command className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold tracking-wider text-base text-black dark:text-white font-manrope">
                  AEROMIND
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-black/80 dark:text-white/80 font-manrope font-semibold border border-black/10 dark:border-white/10">
                  PRO
                </span>
              </div>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-manrope font-medium tracking-tight">
                Physical AI Concierge
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-manrope font-medium text-neutral-600 dark:text-neutral-300">
            <a href="#overview" className="hover:text-black dark:hover:text-white transition-colors">
              Overview
            </a>
            <a href="#about" className="hover:text-black dark:hover:text-white transition-colors">
              About Us
            </a>
            <a href="#features" className="hover:text-black dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#techstack" className="hover:text-black dark:hover:text-white transition-colors">
              Tech Stack
            </a>
          </nav>

          {/* CTA Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => setAuthModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-black/15 dark:border-white/20 hover:bg-black/5 dark:hover:bg-white/10 text-black dark:text-white font-manrope font-semibold text-xs transition-all"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>{currentUser ? currentUser.email?.split('@')[0] : 'Sign In'}</span>
            </button>

            <ToggleTheme animationType="diag-down-right" />

            <Link
              to="/work"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-manrope font-semibold text-xs shadow-md hover:scale-105 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-3">
          <ToggleTheme animationType="diag-down-right" />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-black dark:text-white rounded-lg bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/10"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 dark:bg-black/95 border-b border-black/10 dark:border-white/10 px-6 py-6 space-y-4 backdrop-blur-2xl">
          <a
            href="#overview"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-black dark:text-white text-base font-manrope font-medium"
          >
            Overview
          </a>
          <a
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-black dark:text-white text-base font-manrope font-medium"
          >
            About Us
          </a>
          <a
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-black dark:text-white text-base font-manrope font-medium"
          >
            Features
          </a>
          <a
            href="#techstack"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-black dark:text-white text-base font-manrope font-medium"
          >
            Tech Stack
          </a>

          <div className="pt-4 border-t border-black/10 dark:border-white/10 space-y-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setAuthModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full border border-black/15 dark:border-white/20 text-black dark:text-white font-manrope font-semibold text-sm"
            >
              <UserIcon className="w-4 h-4" />
              <span>{currentUser ? currentUser.email : 'Sign In / Register'}</span>
            </button>

            <Link
              to="/work"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-manrope font-semibold text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Travel App</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>

    <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
