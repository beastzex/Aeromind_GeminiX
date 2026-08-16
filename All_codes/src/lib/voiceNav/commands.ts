import { VoiceAction } from './actionBus';

export interface VoiceNavCommand {
  id: string;
  /** Matched as whole words anywhere in the transcript — "open the advisor
   * please" still matches "advisor". Order matters: first match wins, so
   * more specific commands should come before more generic ones. */
  keywords: string[];
  /** Route to navigate to first, if any (static, or resolved dynamically —
   * e.g. the journal needs the active trip id). */
  route?: string | (() => Promise<string | null>);
  /** In-page action dispatched once the target page has mounted — see
   * actionBus.ts. Pairs with `route` when the action lives on a page other
   * than the current one (e.g. "scan my pass" while on /advisor). */
  action?: VoiceAction;
  /** Shown in the error message if a dynamic route resolves to nothing. */
  label: string;
}

export const VOICE_NAV_COMMANDS: VoiceNavCommand[] = [
  {
    id: 'closeOverlay',
    keywords: ['close', 'cancel', 'dismiss'],
    label: 'Close',
    // No route — acts on whatever modal/drawer is open on the current page,
    // wherever that happens to be, instead of navigating anywhere.
    action: { type: 'closeOverlay' },
  },
  {
    id: 'journal',
    keywords: ['journal'],
    label: 'Trip Journal',
    route: async () => {
      const { auth } = await import('@/lib/firebase');
      const { TripStore } = await import('@/lib/tripStore');
      const user = auth.currentUser;
      const trip = await TripStore.getTrip(
        user ? { uid: user.uid, email: user.email } : undefined
      );
      return trip ? `/journal/${trip.id}` : null;
    },
  },
  {
    id: 'advisor',
    keywords: ['advisor'],
    label: 'Flight Advisor',
    route: '/advisor',
  },
  {
    id: 'aiChat',
    keywords: ['assistant', 'chat'],
    label: 'AI Assistant',
    route: '/work',
    action: { type: 'openAiChat' },
  },
  {
    id: 'scanner',
    keywords: ['scan'],
    label: 'Scanner',
    route: '/work',
    action: { type: 'openScanner' },
  },
  {
    id: 'simulateDisruption',
    keywords: ['simulate'],
    label: 'Simulate Disruption',
    route: '/work',
    action: { type: 'simulateDisruption' },
  },
  {
    id: 'arCompass',
    keywords: ['compass', 'wayfinding'],
    label: 'AR Compass',
    route: '/work',
    action: { type: 'openArCompass' },
  },
  {
    id: 'nextTab',
    keywords: ['next'],
    label: 'Next Tab',
    route: '/work',
    action: { type: 'cycleTab', direction: 'next' },
  },
  {
    id: 'prevTab',
    keywords: ['previous', 'prior', 'back'],
    label: 'Previous Tab',
    route: '/work',
    action: { type: 'cycleTab', direction: 'prev' },
  },
  {
    id: 'tabTracker',
    keywords: ['tracker', 'radar'],
    label: 'Live Flight Tracker',
    route: '/work',
    action: { type: 'setTab', tab: 'tracker' },
  },
  {
    id: 'tabPass',
    keywords: ['intel', 'manifest'],
    label: 'Boarding Pass Intel',
    route: '/work',
    action: { type: 'setTab', tab: 'pass' },
  },
  {
    id: 'tabDisruption',
    keywords: ['disruption', 'solver'],
    label: 'Disruption Solver',
    route: '/work',
    action: { type: 'setTab', tab: 'disruption' },
  },
  {
    id: 'tabTester',
    keywords: ['tester'],
    label: 'Features Tester',
    route: '/work',
    action: { type: 'setTab', tab: 'tester' },
  },
  {
    id: 'tabItinerary',
    keywords: ['itinerary', 'timeline'],
    label: 'Digital Twin Timeline',
    route: '/work',
    action: { type: 'setTab', tab: 'itinerary' },
  },
  {
    id: 'sectionOverview',
    keywords: ['overview'],
    label: 'Overview',
    route: '/',
    action: { type: 'scrollToSection', id: 'overview' },
  },
  {
    id: 'sectionAbout',
    keywords: ['about'],
    label: 'About Us',
    route: '/',
    action: { type: 'scrollToSection', id: 'about' },
  },
  {
    id: 'sectionFeatures',
    keywords: ['features'],
    label: 'Features',
    route: '/',
    action: { type: 'scrollToSection', id: 'features' },
  },
  {
    id: 'sectionTechStack',
    keywords: ['tech stack', 'techstack', 'technology'],
    label: 'Tech Stack',
    route: '/',
    action: { type: 'scrollToSection', id: 'techstack' },
  },
  {
    id: 'dashboard',
    keywords: ['dashboard', 'work', 'trips'],
    label: 'Dashboard',
    route: '/work',
  },
  {
    id: 'home',
    keywords: ['home', 'landing'],
    label: 'Home',
    route: '/',
  },
];

function hasKeyword(transcript: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(transcript);
}

export function matchVoiceNavCommand(transcript: string): VoiceNavCommand | null {
  const trimmed = transcript.trim();
  if (!trimmed) return null;
  for (const command of VOICE_NAV_COMMANDS) {
    if (command.keywords.some((keyword) => hasKeyword(trimmed, keyword))) {
      return command;
    }
  }
  return null;
}
