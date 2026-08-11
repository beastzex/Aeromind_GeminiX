'use client';

import { Header } from '@/components/Header';
import { FlightAdvisor } from '@/components/FlightAdvisor';
import { useState } from 'react';

export default function AdvisorPage() {
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-fg-light dark:text-fg-dark">
      <Header
        tripStatus="onTime"
        accessibilityMode={accessibilityMode}
        onToggleAccessibility={() => setAccessibilityMode(!accessibilityMode)}
      />
      <main className="p-4">
        <FlightAdvisor />
      </main>
    </div>
  );
}
