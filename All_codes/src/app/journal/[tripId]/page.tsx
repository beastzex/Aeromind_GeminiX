'use client';

import { Header } from '@/components/Header';
import { TripJournal } from '@/components/TripJournal';
import { TripStore } from '@/lib/tripStore';
import { useState, useEffect } from 'react';
import { TripEvent } from '@/types';

export default function JournalPage() {
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [events, setEvents] = useState<TripEvent[]>([]);

  useEffect(() => {
    setEvents(TripStore.getEvents());
  }, []);

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-fg-light dark:text-fg-dark">
      <Header
        tripStatus="onTime"
        accessibilityMode={accessibilityMode}
        onToggleAccessibility={() => setAccessibilityMode(!accessibilityMode)}
      />
      <main>
        <TripJournal events={events} tripTitle="SF Tech & AI Summit 2026" />
      </main>
    </div>
  );
}
