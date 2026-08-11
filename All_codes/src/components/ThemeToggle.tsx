'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9 rounded-pill border border-gray-300 dark:border-gray-700" />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-9 h-9 flex items-center justify-center rounded-pill border border-gray-300 dark:border-gray-700 bg-bg-light dark:bg-bg-dark text-fg-light dark:text-fg-dark hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500"
      aria-label="Toggle monochrome theme"
      title="Toggle light/dark theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <Moon className="w-4 h-4 stroke-[1.5]" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: 45, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -45, scale: 0.8 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <Sun className="w-4 h-4 stroke-[1.5]" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
