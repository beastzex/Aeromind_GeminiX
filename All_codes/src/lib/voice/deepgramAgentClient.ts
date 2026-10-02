import { DeepgramClient } from '@deepgram/sdk';
import { mintVoiceToken } from '@/lib/apiClient';
import { VoiceClient, VoiceClientEvent, VoiceToolCall } from '@/types/voice';
import { VOICE_TOOL_DECLARATIONS, VOICE_SYSTEM_PROMPT } from './toolDeclarations';

type AgentSocket = Awaited<ReturnType<DeepgramClient['agent']['v1']['connect']>>;

export class DeepgramAgentClient implements VoiceClient {
  readonly provider = 'deepgram' as const;
  private connection: AgentSocket | null = null;
  private listeners = new Set<(event: VoiceClientEvent) => void>();
  // FunctionCallResponse requires both id and name — the VoiceClient
  // interface only carries callId, so remember the name from the request.
  private pendingCallNames = new Map<string, string>();

  onEvent(listener: (event: VoiceClientEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: VoiceClientEvent): void {
    this.listeners.forEach((listener) => listener(event));
  }

  async connect(): Promise<void> {
    const tokenRes = await mintVoiceToken('deepgram');
    const client = new DeepgramClient({ accessToken: tokenRes.token });

    const connection = await client.agent.v1.connect();
    this.connection = connection;

    connection.on('open', () => this.emit({ type: 'open' }));
    connection.on('close', (event) => this.emit({ type: 'close', reason: event?.reason }));
    connection.on('error', (err) => this.emit({ type: 'error', message: err.message || 'Deepgram Agent error' }));
    connection.on('message', (data) => this.handleControlMessage(data));

    // Binary audio-out frames don't go through the SDK's typed `message`
    // handler (that path assumes JSON text frames) — read them directly off
    // the underlying socket, which V1Socket exposes as a public property.
    connection.socket.binaryType = 'arraybuffer';
    connection.socket.addEventListener('message', (event: MessageEvent) => {
      if (event.data instanceof ArrayBuffer) {
        this.emit({ type: 'audio', chunk: event.data });
      }
    });

    connection.connect();
    await connection.waitForOpen();

    connection.sendSettings({
      type: 'Settings',
      audio: {
        input: { encoding: 'linear16', sample_rate: 16000 },
        output: { encoding: 'linear16', sample_rate: 24000 },
      },
      agent: {
        listen: { provider: { type: 'deepgram', version: 'v1', model: 'nova-3' } },
        think: {
          provider: { type: 'open_ai', model: 'gpt-4o-mini' },
          prompt: VOICE_SYSTEM_PROMPT,
          functions: VOICE_TOOL_DECLARATIONS.map((decl) => ({
            name: decl.name,
            description: decl.description,
            parameters: decl.parameters,
          })),
        },
        speak: { provider: { type: 'deepgram', model: 'aura-2-thalia-en' } },
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private handleControlMessage(data: any): void {
    if (!data || typeof data !== 'object') return;

    if (data.type === 'ConversationText') {
      this.emit({
        type: 'transcript',
        entry: {
          id: `deepgram_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          role: data.role === 'user' ? 'user' : 'assistant',
          text: data.content ?? '',
          final: true,
        },
      });
      return;
    }

    if (data.type === 'UserStartedSpeaking') {
      this.emit({ type: 'interrupted' });
      return;
    }

    if (data.type === 'FunctionCallRequest' && Array.isArray(data.functions)) {
      for (const fn of data.functions) {
        let args: Record<string, unknown> = {};
        try {
          args = fn.arguments ? JSON.parse(fn.arguments) : {};
        } catch {
          // leave args empty if the model sent malformed JSON
        }
        this.pendingCallNames.set(fn.id, fn.name);
        this.emit({
          type: 'toolCall',
          call: { id: fn.id, name: fn.name as VoiceToolCall['name'], arguments: args },
        });
      }
      return;
    }

    if (data.type === 'Error') {
      this.emit({ type: 'error', message: data.description || data.message || 'Deepgram Agent error' });
    }
  }

  sendAudioChunk(chunk: ArrayBuffer): void {
    this.connection?.sendMedia(chunk);
  }

  sendToolResult(callId: string, result: unknown): void {
    const name = this.pendingCallNames.get(callId) ?? callId;
    this.pendingCallNames.delete(callId);
    this.connection?.sendFunctionCallResponse({
      type: 'FunctionCallResponse',
      id: callId,
      name,
      content: typeof result === 'string' ? result : JSON.stringify(result),
    });
  }

  close(): void {
    this.connection?.close();
    this.connection = null;
    this.listeners.clear();
  }
}
