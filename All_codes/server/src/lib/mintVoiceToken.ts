export interface MintedVoiceToken {
  provider: 'gemini' | 'deepgram';
  token: string;
  expiresAt: number; // epoch ms
}

const GEMINI_LIVE_MODEL = 'gemini-2.5-flash-native-audio-preview-12-2025';

// Single-use, short-lived token: the browser must open its Live session within
// `newSessionExpireTime`, after which the token can no longer start a session.
export async function mintGeminiLiveToken(apiKey: string): Promise<MintedVoiceToken> {
  const { GoogleGenAI, Modality } = await import('@google/genai');
  const client = new GoogleGenAI({ apiKey });

  const newSessionExpireTime = new Date(Date.now() + 60 * 1000);
  const expireTime = new Date(Date.now() + 30 * 60 * 1000);

  const token = await client.authTokens.create({
    config: {
      uses: 1,
      expireTime: expireTime.toISOString(),
      newSessionExpireTime: newSessionExpireTime.toISOString(),
      liveConnectConstraints: {
        model: GEMINI_LIVE_MODEL,
        config: { responseModalities: [Modality.AUDIO] },
      },
      httpOptions: { apiVersion: 'v1alpha' },
    },
  });

  if (!token.name) {
    throw new Error('Gemini did not return an ephemeral token');
  }

  return { provider: 'gemini', token: token.name, expiresAt: newSessionExpireTime.getTime() };
}

// Deepgram grant tokens carry `usage::write` and are meant to be minted fresh
// for every connect/reconnect attempt — the real API key never leaves the server.
export async function mintDeepgramAgentToken(apiKey: string): Promise<MintedVoiceToken> {
  const res = await fetch('https://api.deepgram.com/v1/auth/grant', {
    method: 'POST',
    headers: {
      Authorization: `Token ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ttl_seconds: 60 }),
  });

  if (!res.ok) {
    throw new Error(`Deepgram token grant failed: ${res.status} ${res.statusText}`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  return {
    provider: 'deepgram',
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}
