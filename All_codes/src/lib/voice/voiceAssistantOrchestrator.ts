import { getFlightStatus, searchFlights } from '@/lib/apiClient';
import { VoiceClient, VoiceClientEvent, VoiceProvider, VoiceSessionState, VoiceToolCall, VoiceTranscriptEntry } from '@/types/voice';
import { GeminiLiveClient } from './geminiLiveClient';
import { DeepgramAgentClient } from './deepgramAgentClient';
import { startMicCapture, MicCapture, PlaybackQueue } from './audioPipeline';

const CONNECT_TIMEOUT_MS = 8000;

export interface VoiceAssistantSnapshot {
  state: VoiceSessionState;
  provider: VoiceProvider | null;
  transcript: VoiceTranscriptEntry[];
  error: string | null;
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

async function runTool(call: VoiceToolCall): Promise<unknown> {
  if (call.name === 'get_flight_status') {
    const flightNo = String(call.arguments.flightNo ?? '').trim();
    if (!flightNo) return { error: 'No flight number given' };
    return getFlightStatus(flightNo, typeof call.arguments.date === 'string' ? call.arguments.date : undefined);
  }
  if (call.name === 'search_flights') {
    const query = String(call.arguments.query ?? '').trim();
    if (!query) return { error: 'No search query given' };
    return searchFlights(query);
  }
  return { error: `Unknown tool: ${call.name}` };
}

/** Gemini-Live-first, Deepgram-fallback voice session. Exposes a
 * subscribe/getSnapshot pair so React can consume it via useSyncExternalStore. */
export class VoiceAssistantOrchestrator {
  private client: VoiceClient | null = null;
  private mic: MicCapture | null = null;
  private playback: PlaybackQueue | null = null;
  private subscribers = new Set<() => void>();
  private snapshot: VoiceAssistantSnapshot = {
    state: 'idle',
    provider: null,
    transcript: [],
    error: null,
  };

  subscribe = (callback: () => void): (() => void) => {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  };

  getSnapshot = (): VoiceAssistantSnapshot => this.snapshot;

  private setSnapshot(patch: Partial<VoiceAssistantSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...patch };
    this.subscribers.forEach((callback) => callback());
  }

  private async connectWith(client: VoiceClient): Promise<void> {
    client.onEvent((event) => this.handleClientEvent(event));
    await withTimeout(client.connect(), CONNECT_TIMEOUT_MS, `${client.provider} connect timed out`);
    this.client = client;
    this.playback = new PlaybackQueue();
    this.setSnapshot({ provider: client.provider, error: null });
  }

  private async ensureConnected(): Promise<void> {
    if (this.client) return;
    this.setSnapshot({ state: 'connecting', error: null });

    try {
      await this.connectWith(new GeminiLiveClient());
    } catch (geminiErr) {
      const geminiMessage = geminiErr instanceof Error ? geminiErr.message : 'Gemini Live unavailable';
      try {
        await this.connectWith(new DeepgramAgentClient());
      } catch (deepgramErr) {
        const deepgramMessage = deepgramErr instanceof Error ? deepgramErr.message : 'Deepgram unavailable';
        this.setSnapshot({
          state: 'error',
          error: `Gemini Live failed (${geminiMessage}); Deepgram fallback also failed (${deepgramMessage}).`,
        });
        throw deepgramErr;
      }
    }
  }

  async startTalking(): Promise<void> {
    await this.ensureConnected();
    this.playback?.clear();
    this.setSnapshot({ state: 'listening' });
    this.mic = await startMicCapture((chunk) => this.client?.sendAudioChunk(chunk));
  }

  stopTalking(): void {
    this.mic?.stop();
    this.mic = null;
    if (this.snapshot.state === 'listening') {
      this.setSnapshot({ state: 'thinking' });
    }
  }

  private handleClientEvent(event: VoiceClientEvent): void {
    switch (event.type) {
      case 'audio':
        this.playback?.enqueue(event.chunk);
        this.setSnapshot({ state: 'speaking' });
        break;
      case 'transcript':
        this.setSnapshot({ transcript: [...this.snapshot.transcript, event.entry] });
        break;
      case 'interrupted':
        this.playback?.clear();
        break;
      case 'toolCall':
        void this.handleToolCall(event.call);
        break;
      case 'error':
        this.setSnapshot({ error: event.message });
        break;
      case 'close':
        this.client = null;
        this.setSnapshot({ state: 'idle' });
        break;
    }
  }

  private async handleToolCall(call: VoiceToolCall): Promise<void> {
    let result: unknown;
    try {
      result = await runTool(call);
    } catch (err) {
      result = { error: err instanceof Error ? err.message : 'Tool call failed' };
    }
    this.client?.sendToolResult(call.id, result);
  }

  close(): void {
    this.mic?.stop();
    this.mic = null;
    this.client?.close();
    this.client = null;
    this.playback?.close();
    this.playback = null;
    this.setSnapshot({ state: 'idle', provider: null, transcript: [], error: null });
  }
}
