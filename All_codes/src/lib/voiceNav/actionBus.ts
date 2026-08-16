export type VoiceAction =
  | { type: 'openScanner' }
  | { type: 'setTab'; tab: 'itinerary' | 'tracker' | 'pass' | 'disruption' | 'tester' }
  | { type: 'cycleTab'; direction: 'next' | 'prev' }
  | { type: 'simulateDisruption' }
  | { type: 'openArCompass' }
  | { type: 'openAiChat' }
  | { type: 'closeOverlay' }
  | { type: 'scrollToSection'; id: 'overview' | 'about' | 'features' | 'techstack' };

type Listener = (action: VoiceAction) => void;

// Voice nav is mounted globally (in Header), but the actions it triggers
// belong to whichever page is currently mounted (e.g. WorkPage's tabs and
// modals). If a command needs to navigate there first, the target page
// hasn't subscribed yet at dispatch time — so an unclaimed action is held
// briefly and replayed to the next subscriber instead of being dropped.
let pending: VoiceAction | null = null;
let pendingTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<Listener>();

export function dispatchVoiceAction(action: VoiceAction): void {
  if (listeners.size > 0) {
    listeners.forEach((listener) => listener(action));
    return;
  }
  pending = action;
  if (pendingTimer) clearTimeout(pendingTimer);
  pendingTimer = setTimeout(() => {
    pending = null;
  }, 3000);
}

export function subscribeVoiceAction(listener: Listener): () => void {
  listeners.add(listener);
  if (pending) {
    const action = pending;
    pending = null;
    if (pendingTimer) clearTimeout(pendingTimer);
    // Defer so the newly-mounted page finishes its own render first.
    setTimeout(() => listener(action), 0);
  }
  return () => listeners.delete(listener);
}
