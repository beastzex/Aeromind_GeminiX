export type VoiceProvider = 'gemini' | 'deepgram';

export interface VoiceTokenResponse {
  provider: VoiceProvider;
  token: string;
  expiresAt: number; // epoch ms
}

export type VoiceSessionState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'error';

export interface VoiceToolCall {
  id: string;
  name: 'get_flight_status' | 'search_flights';
  arguments: Record<string, unknown>;
}

export interface VoiceTranscriptEntry {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  final: boolean;
}

/** Provider-agnostic events emitted by both geminiLiveClient and deepgramAgentClient. */
export type VoiceClientEvent =
  | { type: 'open' }
  | { type: 'close'; reason?: string }
  | { type: 'error'; message: string }
  | { type: 'transcript'; entry: VoiceTranscriptEntry }
  | { type: 'audio'; chunk: ArrayBuffer }
  | { type: 'toolCall'; call: VoiceToolCall }
  | { type: 'interrupted' };

export interface VoiceClient {
  readonly provider: VoiceProvider;
  connect(): Promise<void>;
  sendAudioChunk(chunk: ArrayBuffer): void;
  sendToolResult(callId: string, result: unknown): void;
  close(): void;
  onEvent(listener: (event: VoiceClientEvent) => void): () => void;
}
