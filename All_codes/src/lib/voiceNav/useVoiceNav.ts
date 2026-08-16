import { useSyncExternalStore } from 'react';
import { voiceNavController } from './voiceNavController';

/** Thin React binding over the module-level voiceNavController singleton —
 * see that file for why this can't just be component-local state. */
export function useVoiceNav() {
  const snapshot = useSyncExternalStore(voiceNavController.subscribe, voiceNavController.getSnapshot);

  return {
    supported: voiceNavController.isSupported(),
    ...snapshot,
    toggle: voiceNavController.toggle,
  };
}
