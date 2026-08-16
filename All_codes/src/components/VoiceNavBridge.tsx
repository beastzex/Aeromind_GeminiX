'use client';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setGlobalNavigate } from '@/lib/voiceNav/navigateBridge';

/** Renders nothing — mounted once alongside <Routes> (not inside any single
 * Route), so unlike Header it never remounts on navigation. Just registers
 * navigate() for the voice nav singleton to call from outside React. */
export function VoiceNavBridge() {
  const navigate = useNavigate();

  useEffect(() => {
    setGlobalNavigate(navigate);
    return () => setGlobalNavigate(null);
  }, [navigate]);

  return null;
}
