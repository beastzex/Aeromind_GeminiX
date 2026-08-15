'use client';

import { Header } from '@/components/Header';
import { TripJournal } from '@/components/TripJournal';
import { TripStore } from '@/lib/tripStore';
import { useState, useEffect } from 'react';
import { TripEvent, Trip } from '@/types';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function JournalPage() {
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [events, setEvents] = useState<TripEvent[]>([]);
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const who = user ? { uid: user.uid, email: user.email } : null;
      setEvents(await TripStore.getEvents(who));
      setTrip(await TripStore.getTrip(who));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-fg-light dark:text-fg-dark">
      <Header
        tripStatus="onTime"
        accessibilityMode={accessibilityMode}
        onToggleAccessibility={() => setAccessibilityMode(!accessibilityMode)}
      />
      <main>
        <TripJournal events={events} tripTitle={trip?.title || 'Loading trip…'} />
      </main>
    </div>
  );
}
