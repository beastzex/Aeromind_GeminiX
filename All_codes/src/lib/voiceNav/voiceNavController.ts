import { matchVoiceNavCommand } from './commands';
import { dispatchVoiceAction } from './actionBus';
import { getGlobalNavigate } from './navigateBridge';

export type VoiceNavStatus = 'idle' | 'listening' | 'resolving' | 'error';

export interface VoiceNavSnapshot {
  status: VoiceNavStatus;
  /** True once toggled on — stays true across commands AND page navigation
   * until toggled off, since this controller lives outside the React tree. */
  alwaysOn: boolean;
  lastTranscript: string;
  lastError: string | null;
}

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

/** Module-level singleton (not a React hook) — deliberately outside the
 * component tree. Header (and the mic button inside it) is re-created on
 * every page navigation, so any toggle/session state stored in a component
 * hook gets destroyed the instant a voice command navigates anywhere. This
 * survives that by construction. */
class VoiceNavController {
  private recognition: SpeechRecognition | null = null;
  private alwaysOn = false;
  private subscribers = new Set<() => void>();
  private snapshot: VoiceNavSnapshot = {
    status: 'idle',
    alwaysOn: false,
    lastTranscript: '',
    lastError: null,
  };

  subscribe = (callback: () => void): (() => void) => {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  };

  getSnapshot = (): VoiceNavSnapshot => this.snapshot;

  private setSnapshot(patch: Partial<VoiceNavSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...patch };
    this.subscribers.forEach((callback) => callback());
  }

  isSupported(): boolean {
    return getSpeechRecognitionCtor() !== null;
  }

  toggle = (): void => {
    if (this.alwaysOn) {
      this.stop();
    } else {
      this.alwaysOn = true;
      this.setSnapshot({ alwaysOn: true });
      this.startOnce();
    }
  };

  stop = (): void => {
    this.alwaysOn = false;
    this.setSnapshot({ alwaysOn: false });
    this.recognition?.stop();
  };

  private startOnce = (): void => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      this.setSnapshot({ status: 'error', lastError: 'Voice navigation is not supported in this browser.' });
      return;
    }
    if (this.recognition) return;

    const recognition = new Ctor();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      this.setSnapshot({ status: 'listening', lastError: null });
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.results.length - 1]?.[0]?.transcript ?? '';
      this.setSnapshot({ lastTranscript: transcript, status: 'resolving' });

      const command = matchVoiceNavCommand(transcript);
      if (!command) {
        this.setSnapshot({ status: 'error', lastError: `No matching command for "${transcript}".` });
        return;
      }

      void (async () => {
        if (command.route) {
          const route = typeof command.route === 'string' ? command.route : await command.route();
          if (!route) {
            this.setSnapshot({ status: 'error', lastError: `Couldn't find "${command.label}" right now.` });
            return;
          }
          getGlobalNavigate()?.(route);
        }

        if (command.action) {
          dispatchVoiceAction(command.action);
        }

        this.setSnapshot({ status: 'idle' });
      })();
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // Benign — onend follows right after; if always-on, it restarts.
        return;
      }
      // A real error (e.g. mic revoked) — don't keep retrying in a loop.
      this.alwaysOn = false;
      this.setSnapshot({
        alwaysOn: false,
        status: 'error',
        lastError: event.message || event.error || 'Voice navigation error',
      });
    };

    recognition.onend = () => {
      this.recognition = null;
      if (this.alwaysOn) {
        // Small delay avoids hammering the recognition API back-to-back,
        // and gives a just-navigated page a moment to finish mounting.
        setTimeout(() => {
          if (this.alwaysOn) this.startOnce();
        }, 300);
      } else if (this.snapshot.status === 'listening') {
        this.setSnapshot({ status: 'idle' });
      }
    };

    this.recognition = recognition;
    recognition.start();
  };
}

export const voiceNavController = new VoiceNavController();
