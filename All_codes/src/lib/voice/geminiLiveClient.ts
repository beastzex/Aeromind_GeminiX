import { GoogleGenAI, Modality, Type, type FunctionDeclaration, type LiveServerMessage, type Session } from '@google/genai';
import { mintVoiceToken } from '@/lib/apiClient';
import { VoiceClient, VoiceClientEvent, VoiceToolCall } from '@/types/voice';
import { VOICE_TOOL_DECLARATIONS, VOICE_SYSTEM_PROMPT } from './toolDeclarations';
import { arrayBufferToBase64, base64ToArrayBuffer } from './base64';

const GEMINI_LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

function toGeminiFunctionDeclarations(): FunctionDeclaration[] {
  return VOICE_TOOL_DECLARATIONS.map((decl) => ({
    name: decl.name,
    description: decl.description,
    parameters: {
      type: Type.OBJECT,
      properties: Object.fromEntries(
        Object.entries(decl.parameters.properties).map(([key, prop]) => [
          key,
          { type: Type.STRING, description: prop.description },
        ])
      ),
      required: decl.parameters.required,
    },
  }));
}

export class GeminiLiveClient implements VoiceClient {
  readonly provider = 'gemini' as const;
  private session: Session | null = null;
  private listeners = new Set<(event: VoiceClientEvent) => void>();
  // Gemini's sendToolResponse requires both the original call id AND name —
  // the VoiceClient interface only carries callId, so we remember the name.
  private pendingCallNames = new Map<string, string>();

  onEvent(listener: (event: VoiceClientEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: VoiceClientEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }

  async connect(): Promise<void> {
    const tokenRes = await mintVoiceToken('gemini');
    const ai = new GoogleGenAI({ apiKey: tokenRes.token });

    this.session = await ai.live.connect({
      model: GEMINI_LIVE_MODEL,
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: VOICE_SYSTEM_PROMPT,
        tools: [{ functionDeclarations: toGeminiFunctionDeclarations() }],
        // Native-audio models forward thought summaries as regular output by
        // default — without this, the model's internal reasoning gets spoken
        // back as if it were the answer. 0 = fully disabled (also cuts latency,
        // which matters for a real-time voice turn).
        thinkingConfig: { thinkingBudget: 0 },
      },
      callbacks: {
        onopen: () => this.emit({ type: 'open' }),
        onmessage: (message: LiveServerMessage) => this.handleMessage(message),
        onerror: (e: ErrorEvent) => this.emit({ type: 'error', message: e.message || 'Gemini Live connection error' }),
        onclose: (e: CloseEvent) => this.emit({ type: 'close', reason: e.reason }),
      },
    });
  }

  private handleMessage(message: LiveServerMessage): void {
    const parts = message.serverContent?.modelTurn?.parts ?? [];

    for (const part of parts) {
      // Belt-and-suspenders: thinkingBudget: 0 should stop these outright,
      // but if the model ever emits a thought part anyway, never surface it.
      if (part.thought) continue;

      if (part.inlineData?.data) {
        this.emit({ type: 'audio', chunk: base64ToArrayBuffer(part.inlineData.data) });
      }
      if (part.text) {
        this.emit({
          type: 'transcript',
          entry: {
            id: `gemini_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            role: 'assistant',
            text: part.text,
            final: Boolean(message.serverContent?.turnComplete),
          },
        });
      }
    }

    if (message.serverContent?.interrupted) {
      this.emit({ type: 'interrupted' });
    }

    if (message.toolCall?.functionCalls) {
      for (const fc of message.toolCall.functionCalls) {
        const id = fc.id ?? fc.name ?? `call_${Date.now()}`;
        const name = fc.name as VoiceToolCall['name'];
        this.pendingCallNames.set(id, name);
        this.emit({
          type: 'toolCall',
          call: { id, name, arguments: (fc.args ?? {}) as Record<string, unknown> },
        });
      }
    }
  }

  sendAudioChunk(chunk: ArrayBuffer): void {
    this.session?.sendRealtimeInput({
      audio: { data: arrayBufferToBase64(chunk), mimeType: 'audio/pcm;rate=16000' },
    });
  }

  sendToolResult(callId: string, result: unknown): void {
    const name = this.pendingCallNames.get(callId) ?? callId;
    this.pendingCallNames.delete(callId);
    this.session?.sendToolResponse({
      functionResponses: [{ id: callId, name, response: { result } }],
    });
  }

  close(): void {
    this.session?.close();
    this.session = null;
    this.listeners.clear();
  }
}
